const { User, UserNameType, Ticket } = require('@digitalpersona/core');
const { AuthService, EnrollService, AdminService, SearchScope, ServiceError } = require('@digitalpersona/services');
const { PasswordAuth } = require('@digitalpersona/authentication');
const { site, endpoints } = require('./config');

const express = require('express');

const authService = new AuthService(endpoints.auth);
const enrollService = new EnrollService(endpoints.enroll);
const adminService = new AdminService(endpoints.admin)

const api = express.Router();

api.get('/settings', getSettings);
api.get('/user', asSecurityOfficer, getUsers);
api.post('/user', asSecurityOfficer, createUser);
api.delete('/user', withBearerToken, asSecurityOfficer, deleteUser);
api.post('/user/clean', asSecurityOfficer, deleteOldUsers);
api.use(handleError);

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    OK_NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
}

const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;

async function asSecurityOfficer(req, res, next)
{
    try {
        console.debug('> asSecurityOfficer')
        req.token = await GetToken();
        next();
    } catch (e) {
        console.debug(e);
        next(e);
    } finally {
        console.debug('< asSecurityOfficer')
    }
}

async function withBearerToken(req, res, next) {
    try {
        console.debug('> withBearerToken')
        const { authorization } = req.headers;
        if (!authorization) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
        const token = authorization.match(/Bearer (.+)/)[1];
        req.bearer = token;
        next();
    } catch (e) {
        console.debug(e);
        return res.sendStatus(HTTP_STATUS.BAD_REQUEST);
    } finally {
        console.debug('< withBearerToken')
    }
}

function handleError(err, req, res, next) {
    if (res.headersSent) return next(err);
    console.log(err);
    if (err instanceof ServiceError) {
        res.status(HTTP_STATUS.BAD_REQUEST).send(err.message)
    } else
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(err.message);
}

function getSettings(req, res)
{
    console.debug('> getSettings')
    res.json({
        endpoints,
    });
    console.debug('< getSettings')
}

async function createUser(req, res, next)
{
    console.debug('> createUser')
    try {
        const { token } = req;
        const { username, password } = req.body;
        console.debug(`user: ${username}, token: ${token}`)
        await enrollService.CreateUser(
            new Ticket(token),
            new User(username, UserNameType.DP),
            password);
        res.sendStatus(HTTP_STATUS.CREATED);
    } catch (e) {
        console.debug(e);
        next(e);
    } finally {
        console.debug('< createUser')
    }
}

async function getUsers(req, res)
{
    console.debug('> getUsers')
    try {
        const { token } = req;
        const query = {
            scope: SearchScope.Subtree,
            filter: `(&(objectClass=user)(objectCategory=person))`,
            attributes: [ "cn" ]
        }

        const records = await adminService.ExecuteSearch(new Ticket(token), query);
        console.log(`${records.length} records were found`)
        const users = records
            .map(rec => rec && rec[0] && rec[0].data && rec[0].data.values && rec[0].data.values[0])
            .filter(name => name)
            .map(name => new User(name, UserNameType.DP));

        res.json({ users });

    } catch (e) {
        console.debug(e);
        res.sendStatus(HTTP_STATUS.OK_NO_CONTENT);
    } finally {
        console.debug('< getUsers')
    }
}

async function deleteUser(req, res)
{
    console.debug('> deleteUser')
    try {
        const { token, bearer } = req;
        const { username } = req.query;

        // verify the token bearer is the same user as the one we about to delete.
        // we allow only self-deletion
        if (!bearer) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
        const user = User.fromJWT(bearer);
        if (user.name !== username) return res.sendStatus(HTTP_STATUS.FORBIDDEN);

        await enrollService.DeleteUser(
            new Ticket(token),
            new User(username, UserNameType.DP),
        );
        res.sendStatus(HTTP_STATUS.OK);
    } catch (e) {
        console.debug(e);
        res.sendStatus(HTTP_STATUS.OK_NO_CONTENT);
    } finally {
        console.debug('< deleteUser')
    }
}

async function deleteOldUsers(req, res, next) {
    console.debug('> users/clean')
    try {
        const { token } = req;
        await DeleteOldUsers(token);
        res.sendStatus(HTTP_STATUS.OK);
    } catch (e) {
        console.debug(e);
        next(e);
    }
    finally{
        console.debug('< users/clean')
    }
}

module.exports = api;

function GetToken()
{
    return new PasswordAuth(authService)
        .authenticate(
            new User(site.serviceIdentity.username),
            site.serviceIdentity.password);
}

async function DeleteOldUsers(token)
{
    // NOTE: LDAP lastLogonTimestamp is a number of a 100-ns interval since midnight of Jan 1, 1601
    // Javascript uses midnight of Jan 1, 1970 as a base. We need to convert JS time to LDAP time.
    const now = new Date().getTime();
    const ldapBase = new Date(1601, 0, 1).getTime();        // offset of the LDAP base from the JS base
    const ldapNow = now - ldapBase;                         // transpose the current date to the LDAP base
    const age = 30 * DAYS;                                  // account age is 30 days, in milliseconds
    const lastLogonThreshold = (ldapNow - age) * 1000 * 10  // threshold (in 100ns intervals since Jan1, 1601)
    const filter = `(&(objectClass=user)(objectCategory=person)(lastLogonTimestamp<=${lastLogonThreshold}))`;

    const query = {
        scope: SearchScope.Subtree,
        filter,
        attributes: [ "cn" ]
    }

    const records = await adminService.ExecuteSearch(new Ticket(token), query);
    console.log(`${records.length} records were found`)
    const users = records
        .map(rec => rec && rec[0] && rec[0].data && rec[0].data.values && rec[0].data.values[0])
        .filter(name => name)
        .map(name => new User(name, UserNameType.DP));

    users.map(user => console.log(`Deleting ${user.name}`));
    const deletes = users.map(user => enrollService.DeleteUser(new Ticket(token), user));
    await Promise.all(deletes);
}

async function Cleanup()
{
    console.log("> Cleanup")
    try {
        const token = await GetToken();
        await DeleteOldUsers(token);
    } catch (e) {
        console.error(e);
    } finally {
        console.log("< Cleanup")
    }
}

// Cleanup old users periodically.
const cleanup_period = 6 * HOURS;
setInterval(Cleanup, cleanup_period);
