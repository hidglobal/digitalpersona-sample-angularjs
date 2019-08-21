const { User, UserNameType, Ticket } = require('@digitalpersona/core');
const { AuthService, EnrollService, AdminService, SearchScope, ServiceError } = require('@digitalpersona/services');
const { PasswordAuth } = require('@digitalpersona/authentication');
const { site, endpoints, accounts, notifications, mail } = require('./config');

const express = require('express');
const nodemailer = require("nodemailer");

const debug = require('debug');
const app = debug('app');
const log = app.extend('log');
const trace = app.extend('trace');

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
        trace('> asSecurityOfficer')
        req.token = await GetToken();
        next();
    } catch (e) {
        log(e);
        next(e);
    } finally {
        trace('< asSecurityOfficer')
    }
}

async function withBearerToken(req, res, next) {
    try {
        trace('> withBearerToken')
        const { authorization } = req.headers;
        if (!authorization) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
        const token = authorization.match(/Bearer (.+)/)[1];
        req.bearer = token;
        next();
    } catch (e) {
        log(e);
        return res.sendStatus(HTTP_STATUS.BAD_REQUEST);
    } finally {
        trace('< withBearerToken')
    }
}

function handleError(err, req, res, next) {
    if (res.headersSent) return next(err);
    debug(err);
    if (err instanceof ServiceError) {
        res.status(HTTP_STATUS.BAD_REQUEST).send(err.message)
    } else
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(err.message);
}

function getSettings(req, res)
{
    trace('> getSettings')
    res.json({
        endpoints,
    });
    trace('< getSettings')
}

async function createUser(req, res, next)
{
    trace('> createUser')
    try {
        const { token } = req;
        const { username, password } = req.body;
        log(`user: ${username}, token: ${token}`)
        await enrollService.CreateUser(
            new Ticket(token),
            new User(username, UserNameType.DP),
            password);
        res.sendStatus(HTTP_STATUS.CREATED);
    } catch (e) {
        log(e);
        next(e);
    } finally {
        trace('< createUser')
    }
}

async function getUsers(req, res)
{
    trace('> getUsers')
    try {
        const { token } = req;
        const query = {
            scope: SearchScope.Subtree,
            filter: `(&(objectClass=user)(objectCategory=person))`,
            attributes: [ "cn" ]
        }

        const records = await adminService.ExecuteSearch(new Ticket(token), query);
        log(`${records.length} records were found`)
        const users = records
            .map(rec => rec && rec[0] && rec[0].data && rec[0].data.values && rec[0].data.values[0])
            .filter(name => name)
            .map(name => new User(name, UserNameType.DP));

        res.json({ users });

    } catch (e) {
        log(e);
        res.sendStatus(HTTP_STATUS.OK_NO_CONTENT);
    } finally {
        trace('< getUsers')
    }
}

async function deleteUser(req, res)
{
    trace('> deleteUser')
    try {
        const { token, bearer } = req;
        const { username } = req.query;

        // verify the token bearer is the same user as the one we about to delete.
        // we allow only self-deletion
        if (!bearer) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
        const user = User.fromJWT(bearer);
        if (user.name !== username) return res.sendStatus(HTTP_STATUS.FORBIDDEN);

        const ticket = new Ticket(token);

        await DeleteUser(ticket, user, "a user's request");
        res.sendStatus(HTTP_STATUS.OK);
    } catch (e) {
        log(e);
        res.sendStatus(HTTP_STATUS.OK_NO_CONTENT);
    } finally {
        trace('< deleteUser')
    }
}

async function deleteOldUsers(req, res, next) {
    trace('> users/clean')
    try {
        const { token } = req;
        const ticket = new Ticket(token);
        await DeleteOldUsers(ticket);
        res.sendStatus(HTTP_STATUS.OK);
    } catch (e) {
        log(e);
        next(e);
    }
    finally{
        trace('< users/clean')
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

async function SendMail(from, to, subject, html) {
    trace(`> SendMail(from:${from}, to:${to}, subject: ${subject}, ...)`)
    try {
        const transport = nodemailer.createTransport(mail.smtp);
        const res = await transport.sendMail({
            from,
            to,
            subject,
            html
        });
        log(`Message sent: ${res.messageId}`)
    } catch (e) {
        log(e);
    }
    finally{
        trace('< SendMail')
    }
}

async function DeleteUser(ticket, user, reason)
{
    // try to get a user's notification email and personal name
    let email, displayName;
    if (notifications.onDelete.sendMail) {
        try {
            email = await enrollService.GetUserAttribute(ticket, user, "mail");
            log(email);
            displayName = await enrollService.GetUserAttribute(ticket, user, "displayName");
            log(displayName);
        } catch (e) {
            log("No personal data");
        }
    }

    // delete the account
    await enrollService.DeleteUser(ticket, user);

    // notify about deletion
    if (notifications.onDelete.sendMail && email) {
        const html = `
            <p>Hello ${displayName.data.values[0] || "user"},</p>
            <p>Your account "${user.name}" and all associated data were deleted.</p>
            <p>Reason for deletion: ${reason}.</p>
        `;
        await SendMail(mail.from
            , email.data.values[0]
            , 'Account deleted'
            , html
        );
    }

}

async function DeleteOldUsers(ticket)
{
    // NOTE: LDAP lastLogonTimestamp is a number of a 100-ns interval since midnight of Jan 1, 1601
    // Javascript uses midnight of Jan 1, 1970 as a base. We need to convert JS time to LDAP time.
    const now = new Date().getTime();
    const ldapBase = new Date(1601, 0, 1).getTime();        // offset of the LDAP base from the JS base
    const ldapNow = now - ldapBase;                         // transpose the current date to the LDAP base
    const age = cleanup.maxAccountAge * DAYS;               // max account age, in milliseconds
    const lastLogonThreshold = (ldapNow - age) * 1000 * 10  // threshold (in 100ns intervals since Jan1, 1601)
    const filter = `(&(objectClass=user)(objectCategory=person)(lastLogonTimestamp<=${lastLogonThreshold}))`;

    const query = {
        scope: SearchScope.Subtree,
        filter,
        attributes: [ "cn" ]
    }

    const records = await adminService.ExecuteSearch(ticket, query);
    log(`${records.length} records were found`)
    const users = records
        .map(rec => rec && rec[0] && rec[0].data && rec[0].data.values && rec[0].data.values[0])
        .filter(name => name)
        .map(name => new User(name, UserNameType.DP));

    users.map(user => console.log(`Deleting ${user.name}`));
    const deletes = users.map(user => DeleteUser(ticket, user, "inactivity for more than 30 days"));
    await Promise.all(deletes);
}

async function Cleanup()
{
    trace("> Cleanup")
    try {
        const token = await GetToken();
        await DeleteOldUsers(new Ticket(token));
    } catch (e) {
        log(e);
    } finally {
        trace("< Cleanup")
    }
}

// Cleanup old users periodically.
const cleanup_period = 6 * HOURS;
setInterval(Cleanup, cleanup_period);
