import crypto from "node:crypto";

const intercept = (provider) => {
  return async (ctx, next) => {
    const { path } = ctx.request;

    if (/^\/(users)/.test(path)) {
      const session = await provider.Session.get(ctx);
      const signedIn = !!session.accountId;

      if (!signedIn) {
        const client_id = process.env.FIRST_PARTY_CLIENT_ID;
        const redirect_uris = process.env.FIRST_PARTY_REDIRECT_URIS;

        const verifier = crypto
            .randomBytes(32)
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 128);

        const challenge = crypto
            .createHash('sha256')
            .update(verifier)
            .digest('base64')
            .replace(/[^a-zA-Z0-9]/g, '');

        return ctx.redirect(`/auth?client_id=${client_id}&redirect_uri=${redirect_uris}&response_type=code&response_mode=query&code_challenge=${challenge}&code_challenge_method=S256&scope=openid`);
      }
    }

    await next();
  };
};

export default intercept;