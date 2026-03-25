export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.authentikClientId) {
    throw createError({ statusCode: 500, message: 'Authentik not configured' });
  }

  const state = crypto.randomUUID();
  setCookie(event, 'authentik_oauth_state', state, { maxAge: 600, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  const authUrl = new URL(`${config.authentikBaseUrl}/application/o/authorize/`);
  authUrl.searchParams.set('client_id', config.authentikClientId);
  authUrl.searchParams.set('redirect_uri', config.authentikCallbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);

  return sendRedirect(event, authUrl.toString());
});
