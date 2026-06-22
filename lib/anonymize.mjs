// Anonimisatielaag — verwijdert klant-PII uit hub-payloads VOORDAT iets de server
// verlaat. Contract: geen klantnamen, gebruikers, domeinen, IP's, bedragen of
// secrets richting de browser/kandidaat. Fail closed: bij twijfel weglaten.
//
// Defense-in-depth, geen sluitende garantie: persoonsnamen en vrije tekst zijn
// niet betrouwbaar met regex te vangen. Daarom belandt al het hub-bronmateriaal
// in `draftQuestions[]` (NIET in `testQuestions[]`) en wordt het pas na verplichte
// senior-review aan kandidaten getoond. Die reviewgate is de uiteindelijke
// controle op namen/vrije tekst; deze scrubbers verkleinen het restrisico.

const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const URL = /\bhttps?:\/\/[^\s)]+/gi;
const UNC = /\\\\[^\s\\]+(?:\\[^\s\\]+)*/g;
const GUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const MAC = /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g;
// IPv6: ≥4 hex-groepen (≥3 dubbele punten) of een ingekorte `::`-vorm. ≥3 colons
// onderscheidt het van een tijd (HH:MM:SS, 2 colons).
const IPV6 = /\b(?:[0-9A-Fa-f]{1,4}:){3,}[0-9A-Fa-f]{1,4}\b|\b[0-9A-Fa-f]{0,4}::[0-9A-Fa-f:]*\b/g;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
// NL/internationale telefoonnummers: +31.../0031.../0... gevolgd door 8-9 cijfers
// met optionele spaties/streepjes.
const PHONE = /(?:\+31|0031|\+\d{1,3}|0)[\s-]?\d(?:[\s-]?\d){7,9}\b/g;
const MONEY = /(?:EUR|USD|€|\$)\s?\d[\d.,]*/gi;
// Hostnaam-achtig: een segment met een streepje waar ná het streepje een cijfer
// staat (KLANT-DC01, srv-db01). Generieke termen zonder cijfer (AZURE-VM) blijven.
const HOSTNAME = /\b[a-z0-9]+-[a-z0-9]*\d[a-z0-9]*\b/gi;
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
    .replace(MAC, '[mac]')
    .replace(IPV6, '[ip]')
    .replace(IPV4, '[ip]')
    .replace(PHONE, '[telefoon]')
    .replace(MONEY, '[bedrag]')
    .replace(HOSTNAME, '[host]')
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
  // os/type/category zijn vrije tekst in RMM-inventories en kunnen PII bevatten
  // (bv. "Laptop van Jan, KLANT-LT07") — scrub ze.
  return {
    os: d.os == null ? null : scrubText(d.os),
    type: d.type == null ? (d.category == null ? null : scrubText(d.category)) : scrubText(d.type),
    category: d.category == null ? null : scrubText(d.category),
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
