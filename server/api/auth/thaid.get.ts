export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  
  if (!config.thaidClientId) {
    console.error('THAID_CLIENT_ID is not configured');
    return sendRedirect(event, '/login?error=not_configured');
  }

  const clientId = config.thaidClientId;
  const callbackUrl = config.thaidCallbackUrl;
  
  // Generate a random state for security (CSRF protection)
  const state = Math.random().toString(36).substring(7);
  setCookie(event, 'thaid_oauth_state', state, { maxAge: 60 * 10 });
  
  // ThaiD Authorization Endpoint
  const authUrl = `https://imauth.bora.dopa.go.th/api/v2/oauth2/auth/?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=pid%20name_en%20birthdate&state=${state}`;
  
  return sendRedirect(event, authUrl);
});
