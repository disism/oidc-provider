import {UserDatabase} from "../controllers/UserController.mjs";
import {database} from "./database.mjs";

export default {
    interactions: {
        url(ctx, interaction) {
            return `/interaction/${interaction.uid}`;
        },
    },
    jwks: {
        keys: [
            {
                "p": "-w2NMatKuUwLmKpyx0SV4flMfixnINVFG4JKVYzrY3WBQ_v-ugr7UbkL_dfXyVR-PZa0WyBbIayP3TVE4QbzZt2MPTWm8mNseG1gvcRN8MLrXrGOLSlcU0KUSQdgmM2hw3IxldcK1PUETMvIJopITwBlyzFos43sT1ZiGBSzU68",
                "kty": "RSA",
                "q": "xGSUA9mXvJ0rYWaG2stJTvAsZUYhcmEtJz0tFDkUSt1MB_xN1wiK3YXn-chVfEpcMWA5Ip1x4Ozj0K94UsKORIHfj7BVnjEph549Ep5vgme8heHKEJv8bMbMCvU50qE8CxhhDydN4FKjSo1fiVfilNGcy5nUBwFskC0AD3Thnn8",
                "d": "TkwmGDy14GGarDf7L708d7-GBjCtqHhR-_wQO3lvueiEoXam1Y_ifZCmDXBgkddD42y3YAOBCSb-LMV-fpxdtxZcfZe1kAylODQNoO7zzoD0R9tHfBCKv-HBwtgTxE9fZcI4QB-jCaJ1YPk0AOTBBe9ceo8QrTSIWc20-vqYUoYvaxLNUyiTr0susSjnpVMciWNOikk-DsVEwy9lUS9ynSvQYGJ25gvdGUrjh3XbJMSci81i90bc9ZUY_jH7Kxav7Nvrv0XGb8ONvS2kJc3WmvrjmdnR_5c9mx9T84ApQ4ubsttFG-ke8YiHRZA77bBTe-8XogtE57tXRKS3ebqVLQ",
                "e": "AQAB",
                "use": "sig",
                "kid": "8wOopij_BqfOtcE02DtsOAULtLb1OOX1hvGaZ2Pcr6s",
                "qi": "QKefZqiSBzNFWIYu_GHxcrspvKf1A-F-4Hdv9mK55UXcRcwJI66iXFZhq8mQSdSnBmldOirSOvycYJJVIEGbg8Tw1xS8nbU2FJV7Sn2-DdjOC38dJuR2Hht0CYfLVaWPb0O86UECgv9C8g_dmMfEmSEekfHvDzmI6V6_ljIrWDk",
                "dp": "QhNqAxWjYCu8rZzHAt1xWX2E_XxwVDrtqnTbXbLuTUojEKKlg4_aX8MFffUuTUYYx9r_czCL68wAPWeEznlG3N8Yxw909jzm0rdvC-M75E9ZJZ4z3n0RWLSgVKxFZ1JP7iIDHP3xUuV-ETxdXI9uwqRHJnjFpuSGusbwoIfqPu8",
                "alg": "RS256",
                "dq": "p69M5iCiu0vjH03gNO4_0KOm9G213yhz2j4UwGCgH-_lnCfj-odzsgNEd3SC8RW4s_v5rMGL20XImoVIEjnGKV5OmSwxXlmRoRcOBFi80zZptFJ-KkJVfDcdPvn0_g_m6X5OWRbxGmjUvbIJ8YXVk8WJwBm-_KBNpqiVlZzxi1c",
                "n": "wJkCjMq4yFBHnsmGBtN8VY3jDm3cyUKQCOXgYi0_nJya3rzs_J13DdGCoPdXwbwzGtK97d4XjBU_YpvweT-o3VfAKRaGHQ7lU0UmpTbwZm8osyzztFLQabyyzR8ND8w5-DG28KdzCTDF5Etqx86Xlzt4nXXNhPb-F1R-zPv3odQz7rdMT2SbSXPWTAtjQ0taWUj_tjbAi7wZCDRcLtXLoqmbORQIaNONxq7VDEbHXtbBo-tCgGkJIzNE7FRd_QuXIgB9EpWz4yefS2bKAooRQQUGON2AIZ6ihdDQ2Q_1YT_6vrfPWYOx_Y7nr6CE3Ydw4EPdfqgEX2cpNeGBy2uF0Q"
            }
        ]
    },
    cookies: {
        keys: ['disism.oidc.provider.1234567890']
    },
    features: {
        devInteractions: {
            enabled: false
        },
        clientCredentials: {
            enabled: true
        },
        introspection: {
            enabled: true
        }
    },
    clients: [
        {
            client_id: 'fpc',
            client_secret: 'fpc',
            grant_types: ['authorization_code'],
            redirect_uris: ['http://localhost:3033'],
            response_types: ['code']
        },
        {
            client_id: 'disism_client',
            client_secret: 'disism_client_secret',
            grant_types: ['authorization_code', "refresh_token"],
            response_types: ['code'],
            redirect_uris: ['http://localhost:3000/authz'],
            scope: 'openid email profile'
        }
    ],
    claims: {
        openid: ['sub', 'name', 'picture', 'preferred_username', 'profile', 'email', 'email_verified'],
        profile: ['name', 'picture', 'preferred_username', 'profile'],
        email: ['email', 'email_verified']
    },
    ttl: {
        AccessToken: function AccessTokenTTL(ctx, token, client) {
            return token.resourceServer?.accessTokenTTL || 60 * 60; // 1 hour in seconds
        },
        AuthorizationCode: 60 /* 1 minute in seconds */,
        BackchannelAuthenticationRequest: function BackchannelAuthenticationRequestTTL(ctx, request, client) {
            if (ctx?.oidc && ctx.oidc.params.requested_expiry) {
                return Math.min(10 * 60, +ctx.oidc.params.requested_expiry); // 10 minutes in seconds or requested_expiry, whichever is shorter
            }

            return 10 * 60; // 10 minutes in seconds
        },
        ClientCredentials: function ClientCredentialsTTL(ctx, token, client) {
            return token.resourceServer?.accessTokenTTL || 10 * 60; // 10 minutes in seconds
        },
        DeviceCode: 600 /* 10 minutes in seconds */,
        Grant: 1209600 /* 14 days in seconds */,
        IdToken: 3600 /* 1 hour in seconds */,
        Interaction: 3600 /* 1 hour in seconds */,
        RefreshToken: function RefreshTokenTTL(ctx, token, client) {
            if (
                ctx && ctx.oidc.entities.RotatedRefreshToken
                && client.applicationType === 'web'
                && client.clientAuthMethod === 'none'
                && !token.isSenderConstrained()
            ) {
                // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
                return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
            }

            return 14 * 24 * 60 * 60; // 14 days in seconds
        },
        Session: 1209600 /* 14 days in seconds */
    },
    loadExistingGrant: async (ctx) => {
        const grantId = ctx.oidc.result?.consent?.grantId
            || ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);

        if (grantId) {
            // keep grant expiry aligned with session expiry
            // to prevent consent prompt being requested when grant expires
            const grant = await ctx.oidc.provider.Grant.find(grantId);

            // this aligns the Grant ttl with that of the current session
            // if the same Grant is used for multiple sessions, or is set
            // to never expire, you probably do not want this in your code
            if (ctx.oidc.account && grant.exp < ctx.oidc.session.exp) {
                grant.exp = ctx.oidc.session.exp;

                await grant.save();
            }

            return grant;
        } else if (ctx.oidc.client.clientId === "fpc") {
            const grant = new ctx.oidc.provider.Grant({
                clientId: ctx.oidc.client.clientId,
                accountId: ctx.oidc.session.accountId,
            });

            grant.addOIDCScope('openid email profile');
            grant.addResourceScope('urn:example:resource-indicator', 'api:read api:write');
            await grant.save();
            return grant;
        }
    },
    findAccount: async (ctx, id, token) => {
        const userDatabase = new UserDatabase(database);
        const user = await userDatabase.getUserByUsername(id)
        return {
            accountId: id,
            async claims(use, scope) {
                console.log("use", use)
                console.log("scope", scope)
                return {
                    sub: this.accountId,
                    email: user.email,
                    name: user.name,
                };
            }
        }
    },
    renderError: async (ctx, out, error) =>{
        ctx.type = 'html';
        ctx.body = `<!DOCTYPE html>
    <head>
      <title>Error!</title>
      <style>/* css and html classes omitted for brevity, see lib/helpers/defaults.js */</style>
    </head>
    <body>
      <div>
        <h1>😅</h1>
        <h2>oops! something went wrong...</h2>
        
      </div>
    </body>
    </html>`;
    }
}