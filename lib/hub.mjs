// Hub-gateway client (Hub & Spoke laag 3). SERVER-ONLY: gebruikt het geheime
// HUB_APP_TOKEN — importeer dit nooit in browser-code. Lees klantdata UITSLUITEND
// hierlangs; bouw geen eigen Autotask/Datto/IT Glue-client.
// Zelfde API/endpoints als Rolands lib/hub.ts (later te vervangen door @cmp/hub-sdk).

export class HubError extends Error {
  constructor(status, message) { super(message); this.name = 'HubError'; this.status = status; }
}

export function createHubClient(opts = {}) {
  const baseUrl = (opts.baseUrl ?? process.env.HUB_BASE_URL ?? '').replace(/\/$/, '');
  const appToken = opts.appToken ?? process.env.HUB_APP_TOKEN ?? '';
  const doFetch = opts.fetchImpl ?? fetch;
  if (!baseUrl) throw new Error('HUB_BASE_URL ontbreekt (.env).');
  if (!appToken) throw new Error('HUB_APP_TOKEN ontbreekt (.env).');

  async function get(path) {
    const headers = { 'x-hub-app-token': appToken };
    if (opts.userToken) headers['authorization'] = `Bearer ${opts.userToken}`;
    const res = await doFetch(`${baseUrl}/hub/v1${path}`, { headers, cache: 'no-store' });
    if (!res.ok) throw new HubError(res.status, `Hub ${res.status}: ${await res.text().catch(() => '')}`);
    return res.json();
  }

  const qs = (p) => (p?.companyId ? `?companyId=${encodeURIComponent(p.companyId)}` : '');
  const enc = encodeURIComponent;

  return {
    companies: {
      list: () => get('/companies'),
      get: (id) => get(`/companies/${enc(id)}`),
      sources: (id) => get(`/companies/${enc(id)}/sources`),
      summary: (id) => get(`/companies/${enc(id)}/summary`),
    },
    contacts: { list: (p) => get(`/contacts${qs(p)}`) },
    devices: {
      list: (p) => get(`/devices${qs(p)}`),
      get: (id) => get(`/devices/${enc(id)}`),
    },
    contracts: { list: (p) => get(`/contracts${qs(p)}`) },
    tickets: { list: (p) => get(`/tickets${qs(p)}`) },
    invoices: { list: (p) => get(`/invoices${qs(p)}`) },
    opportunities: { list: (p) => get(`/opportunities${qs(p)}`) },
    live: {
      rmmAlerts: (companyId) => get(`/live/rmm/alerts?companyId=${enc(companyId)}`),
      itglue: (resource, companyId) => get(`/live/itglue/${resource}?companyId=${enc(companyId)}`),
      autotask: (entity, companyId) => get(`/live/autotask/${enc(entity)}?companyId=${enc(companyId)}`),
      roboshadow: (resource, companyId) => get(`/live/roboshadow/${enc(resource)}?companyId=${enc(companyId)}`),
      inforcerCompliance: (companyId) => get(`/live/inforcer/compliance?companyId=${enc(companyId)}`),
      custom: (key, resource, companyId) => get(`/live/custom/${enc(key)}/${enc(resource)}?companyId=${enc(companyId)}`),
    },
    catalog: () => get('/catalog'),
  };
}
