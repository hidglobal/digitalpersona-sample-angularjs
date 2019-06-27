const { User, UserNameType, Ticket } = require('@digitalpersona/core');
const { AuthService, EnrollService, ServiceError } = require('@digitalpersona/services');
const { PasswordAuth } = require('@digitalpersona/authentication');
const { site, endpoints } = require('./config');

const express = require('express');

const authService = new AuthService(endpoints.auth);
const enrollService = new EnrollService(endpoints.enroll);

const userApi = express.Router();

userApi.post('/', asSecurityOfficer, createUser);
userApi.delete('/', withBearerToken, asSecurityOfficer, deleteUser);
userApi.use(handleError);

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

async function asSecurityOfficer(req, res, next)
{
    try {
        console.debug('> asSecurityOfficer')
        req.token = await new PasswordAuth(authService).authenticate(
            new User(site.serviceIdentity.username),
            site.serviceIdentity.password);
        console.debug('< asSecurityOfficer')
        next();
    } catch (e) {
        console.debug('? asSecurityOfficer')
        console.debug(e);
        next(e);
    }
}

async function withBearerToken(req, res, next) {
    try {
        console.debug('> withBearerToken')
        const { authorization } = req.headers;
        if (!authorization) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED);
        const token = authorization.match(/Bearer (.+)/)[1];
        req.bearer = token;
        console.debug('< withBearerToken')
        next();
    } catch (e) {
        console.debug('? withBearerToken')
        console.debug(e);
        return res.sendStatus(HTTP_STATUS.BAD_REQUEST);
    }
}

function handleError(err, req, res, next) {
    if (err instanceof ServiceError) {
        switch(err.code) {
            case -2147023501: return res.sendStatus(HTTP_STATUS.PAYMENT_REQUIRED);    // license is expired or user quota is exceeded
            case -2147023580: return res.sendStatus(HTTP_STATUS.CONFLICT);            // the account already exists
            case -2147023579: return res.sendStatus(HTTP_STATUS.NOT_FOUND);           // account does not exist
            default: return res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    } else
        res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR);
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
        console.debug('< createUser')
        res.sendStatus(HTTP_STATUS.CREATED);
    } catch (e) {
        console.debug(e);
        next(e);
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
        console.debug('< deleteUser')
        res.sendStatus(HTTP_STATUS.OK);
    } catch (e) {
        console.debug(e);
        res.sendStatus(HTTP_STATUS.OK_NO_CONTENT);
    }
}

module.exports = userApi;
