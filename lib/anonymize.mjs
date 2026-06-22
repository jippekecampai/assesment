// Anonimisatielaag — verwijdert klant-PII uit hub-payloads VOORDAT iets de server
// verlaat. Contract: geen klantnamen, gebruikers, domeinen, IP's, bedragen of
// secrets richting de browser/kandidaat. Fail closed: bij twijfel weglaten.

const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const URL = /\bhttps?:\/\/[^\s)]+/gi;
const UNC = /\\\\[^\s\\]+(?:\\[^\s\\]+)*/g;
const GUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const MONEY = /(?:EUR|USD|€|\$)\s?\d[\d.,]*/gi;
// Domeinnaam met TLD (na e-mail/URL-scrub). Vangt 2-label (klant.nl) én meer
// (klant.sharepoint.com). Het middendeel is optioneel zodat klant.nl ook valt.
const DOMAIN = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\b/gi;

export function scrubText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(EMAIL, '[gebruiker]')
    .replace(URL, '[link]')
    .replace(UNC, '[pad]')
    .replace(GUID, '[id]')
    .replace(IPV4, '[ip]')
    .replace(MONEY, '[bedrag]')
    .replace(DOMAIN, '[host]');
}

export function anonymizeTicket(t = {}) {
  return {
    title: scrubText(t.title ?? ''),
    status: t.status ?? null,
    priority: t.priority ?? null,
    category: t.category ?? null,
  };
}

export function anonymizeDevice(d = {}) {
  return {
    os: d.os ?? null,
    type: d.type ?? d.category ?? null,
    category: d.category ?? null,
    eolStatus: d.eolStatus ?? null,
    warrantyDate: d.warrantyDate ?? null,
  };
}

export function anonymizeLive(payload) {
  if (Array.isArray(payload)) return payload.map(anonymizeLive);
  if (payload && typeof payload === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(payload)) out[k] = anonymizeLive(v);
    return out;
  }
  return scrubText(payload);
}
