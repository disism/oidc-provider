/* eslint-disable no-console, camelcase, no-unused-vars */
import { strict as assert } from 'node:assert';
import * as querystring from 'node:querystring';
import { inspect } from 'node:util';

import isEmpty from 'lodash/isEmpty.js';
import bodyparser from 'koa-bodyparser';
import Router from 'koa-router';

import { defaults } from 'oidc-provider/lib/helpers/defaults.js';
import { errors } from 'oidc-provider/lib/index.js';
import {validateUserParams} from "../helpers/validate.mjs";

import HmacSHA256 from "crypto-js/hmac-sha256.js";
import {database} from "../conf/database.mjs";
import {UserDatabase} from "../controllers/UserController.mjs";

const keys = new Set();
const debug = (obj) => querystring.stringify(Object.entries(obj).reduce((acc, [key, value]) => {
    keys.add(key);
    if (isEmpty(value)) return acc;
    acc[key] = inspect(value, { depth: null });
    return acc;
}, {}), '<br/>', ': ', {
    encodeURIComponent(value) { return keys.has(value) ? `<strong>${value}</strong>` : value; },
});

const { SessionNotFound } = errors;

export default (provider) => {
    const router = new Router();

    router.use(async (ctx, next) => {
        ctx.set('cache-control', 'no-store');
        try {
            await next();
        } catch (err) {
            if (err instanceof SessionNotFound) {
                ctx.status = err.status;
                const { message: error, error_description } = err;
                await defaults.renderError(ctx, { error, error_description }, err);
            } else {
                throw err;
            }
        }
    });

    router.get('/interaction/:uid', async (ctx, next) => {
        const {
            uid, prompt, params, session,
        } = await provider.interactionDetails(ctx.req, ctx.res);
        const client = await provider.Client.find(params.client_id);

        switch (prompt.name) {
            case 'login': {
                return ctx.render('login', {
                    client,
                    uid,
                    details: prompt.details,
                    params,
                    title: 'Sign in to your account',
                    session: session ? debug(session) : undefined,
                });
            }
            case 'consent': {
                return ctx.render('interaction', {
                    client,
                    uid,
                    details: prompt.details,
                    params,
                    title: 'Authorize',
                    session: session ? debug(session) : undefined,
                });
            }
            default:
                return next();
        }
    });

    const body = bodyparser({
        text: false, json: false, patchNode: true, patchKoa: true,
    });

    router.post('/interaction/:uid/login', body, async (ctx) => {
        const { prompt: { name }, client, params, session } = await provider.interactionDetails(ctx.req, ctx.res);
        assert.equal(name, 'login');

        const uid = ctx.params.uid;
        const {login, password} = ctx.request.body;

        const validationError = validateUserParams(login, password)
        if (validationError) {
            return ctx.render('login', {
                client,
                uid,
                params,
                title: 'Sign in to your account',
                session: session ? debug(session) : undefined,
                error: validationError
            });
        }

        const userDatabase = new UserDatabase(database);
        const user = await userDatabase.getUserByUsername(login)
        if (user) {
            const isPasswordMatch = await HmacSHA256(password, user.password);
            if (!isPasswordMatch) {
                return ctx.render('login', {
                    client,
                    uid,
                    params,
                    title: 'Sign in to your account',
                    session: session ? debug(session) : undefined,
                    error: validationError
                });
            }
            const result = {
                login: {
                    accountId: user.username,
                },
            };

            return provider.interactionFinished(ctx.req, ctx.res, result, {
                mergeWithLastSubmission: false,
            });
        } else {
            return ctx.render('login', {
                client,
                uid,
                params,
                title: 'Sign in to your account',
                session: session ? debug(session) : undefined,
                error: "Incorrect password, login failed"
            });
        }
    });

    router.post('/interaction/:uid/confirm', body, async (ctx) => {
        const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res);
        const { prompt: { name, details }, params, session: { accountId } } = interactionDetails;
        assert.equal(name, 'consent');

        let { grantId } = interactionDetails;
        let grant;

        if (grantId) {
            // we'll be modifying existing grant in existing session
            grant = await provider.Grant.find(grantId);
        } else {
            // we're establishing a new grant
            grant = new provider.Grant({
                accountId,
                clientId: params.client_id,
            });
        }

        if (details.missingOIDCScope) {
            grant.addOIDCScope(details.missingOIDCScope.join(' '));
        }
        if (details.missingOIDCClaims) {
            grant.addOIDCClaims(details.missingOIDCClaims);
        }
        if (details.missingResourceScopes) {
            for (const [indicator, scope] of Object.entries(details.missingResourceScopes)) {
                grant.addResourceScope(indicator, scope.join(' '));
            }
        }

        grantId = await grant.save();

        const consent = {};
        if (!interactionDetails.grantId) {
            // we don't have to pass grantId to consent, we're just modifying existing one
            consent.grantId = grantId;
        }

        const result = { consent };
        return provider.interactionFinished(ctx.req, ctx.res, result, {
            mergeWithLastSubmission: true,
        });
    });

    router.get('/interaction/:uid/abort', async (ctx) => {
        const result = {
            error: 'access_denied',
            error_description: 'End-User aborted interaction',
        };

        return provider.interactionFinished(ctx.req, ctx.res, result, {
            mergeWithLastSubmission: false,
        });
    });

    return router;
};