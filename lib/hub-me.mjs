// lib/hub-me.mjs
// Haalt het profiel van de ingelogde gebruiker op via de hub. /auth/me valt
// BUITEN /hub/v1, daarom een aparte helper (niet via lib/hub.mjs).
export async function getMe(userToken, { fetchImpl = fetch } = {}) {
  if (!userToken) return null;
  const baseUrl = (process.env.HUB_BASE_URL ?? '').replace(/\/$/, '');
  if (!baseUrl) return null;
  let res;
  try {
    res = await fetchImpl(`${baseUrl}/auth/me`, {
      headers: { authorization: `Bearer ${userToken}` },
      cache: 'no-store',
    });
  } catch { return null; }
  if (!res.ok) return null;
  const d = await res.json().catch(() => null);
  if (!d) return null;
  const department = Array.isArray(d.departments) && d.departments[0]
    ? (d.departments[0].name ?? d.departments[0].key ?? null)
    : (d.department ?? null);
  return {
    name: d.name ?? null,
    email: d.email ?? null,
    jobTitle: d.jobTitle ?? null,
    entraOid: d.entraOid ?? null,
    department,
  };
}
