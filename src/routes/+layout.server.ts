export const load = ({ locals, cookies }) => {
  const { user, isUSRegion, apiURL, fastifyURL, wsURL, apiKey } = locals;

  return {
    user: user || undefined,
    isUSRegion,
    cookieConsent: cookies?.get("cookie-consent"),
    apiURL,
    fastifyURL,
    wsURL,
    apiKey,
  };
};
