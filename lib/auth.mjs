// Identiteit komt van de hub (Entra SSO) — bouw GEEN eigen user-store/login.
// Productie (Azure): haal via de On-Behalf-Of-flow een hub-access-token voor de
// ingelogde gebruiker en geef dat aan createHubClient({ userToken }).
// Lokaal/dev: de hub draait in AUTH_DEV_MODE en negeert het user-token.

export async function getUserToken() {
  if (process.env.HUB_USER_TOKEN) return process.env.HUB_USER_TOKEN;
  // TODO (Azure): OBO-token van de ingelogde gebruiker uit de App Service-sessie.
  return undefined;
}
