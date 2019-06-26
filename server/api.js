const { User, UserNameType, Ticket } = require('@digitalpersona/core');
const { AuthService, EnrollService, ServiceError } = require('@digitalpersona/services');
const { PasswordAuth } = require('@digitalpersona/authentication');
const { site, endpoints } = require('./config');

const express = require('express');

const authService = new AuthService(endpoints.auth);
const enrollService = new EnrollService(endpoints.enroll);

const userApi = express.Router();

userApi.use(asSecurityOfficer);
userApi.post('/', createUser);
userApi.delete('/', deleteUser);
userApi.use(handleError);

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

function handleError(err, req, res, next) {
    if (err instanceof ServiceError) {
        switch(err.code) {
            // TODO: map error code to HTTP code
            case -2147023501: return res.sendStatus(402);    // license is expired or user quota is exceeded
            default: return res.sendStatus(400);
        }
    } else
        res.sendStatus(500);
}

async function createUser(req, res, next)
{
    console.debug('> createUser')
    const { body, token } = req;
    try {
        const { username, password } = body;
        console.debug(`user: ${username}, pass: ${password}, token: ${token}`)
        await enrollService.CreateUser(
            new Ticket(token),
            new User(username, UserNameType.DP),
            password);
        console.debug('< createUser')
        res.sendStatus(201);
    } catch (e) {
        console.debug(e);
        next(e);
    }
}

async function deleteUser(req, res)
{
    console.debug('> deleteUser')
    const { body, token } = req;
    try {
        const { identity } = body;
        await enrollService.DeleteUser(
            new Ticket(token),
            User.fromJWT(identity),
        );
        console.debug('< deleteUser')
        res.sendStatus(200);
    } catch (e) {
        console.debug(e);
        res.sendStatus(204);
    }
}

module.exports = userApi;
