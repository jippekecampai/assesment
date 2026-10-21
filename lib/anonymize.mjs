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

// DOMEIN\gebruiker (na UNC-scrub, zodat \\server\share al weg is).
const ACCOUNT = /\b[\w.-]+\\[\w.$-]+/g;
// Wat géén PII is maar wel op HOSTNAME/IPV6 lijkt: CVE-nummers, datums en tijden. Die zetten we
// vóór het scrubben opzij en daarna terug, anders wordt CVE-2024-1234 een [host].
const KEEP = /\bCVE-\d{4}-\d{4,}\b|\b\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?\b|\b\d{1,2}:\d{2}(?::\d{2})?\b/g;
// Vrije tekst uit tickets: ondertekening (alles vanaf de groet) en aanhef dragen namen.
const SIGNATURE = /\n\s*(met vriendelijke groet|vriendelijke groet(en)?|mvg|groet(en|jes)?|kind regards|best regards|regards|cheers)\b[\s\S]*$/i;
const SALUTATION = /^\s*(beste|hoi|hallo|hey|goedemorgen|goedemiddag|goedenavond|dear|hi|hello)\b[^\n,]{0,40},?/gim;

export function scrubText(value) {
  if (typeof value !== 'string') return value;
  const keep = [];
  return value
    .replace(KEEP, (m) => { keep.push(m); return `\u0001${keep.length - 1}\u0002`; })
    .replace(SIGNATURE, '\n[ondertekening]')
    .replace(SALUTATION, '[aanhef]')
    .replace(EMAIL, '[gebruiker]')
    .replace(URL, '[link]')
    .replace(UNC, '[pad]')
    .replace(ACCOUNT, '[account]')
    .replace(GUID, '[id]')
    .replace(MAC, '[mac]')
    .replace(IPV6, '[ip]')
    .replace(IPV4, '[ip]')
    .replace(PHONE, '[telefoon]')
    .replace(MONEY, '[bedrag]')
    .replace(HOSTNAME, '[host]')
    .replace(DOMAIN, '[host]')
    .replace(/\u0001(\d+)\u0002/g, (_, i) => keep[Number(i)]);
}

// Namen die een ticket zelf meedraagt (klant, behandelaar, aanvrager) zijn de namen die het vaakst in de
// vrije tekst terugkomen. We vervangen ze letterlijk, plus losse woorden ervan van 4+ tekens met een hoofdletter
// (rechtsvormen als B.V. en Holding eruit), langste eerst.
const LEGAL = /\b(b\.?v\.?|n\.?v\.?|v\.?o\.?f\.?|holding|groep|group|stichting|vereniging|gemeente)\b/gi;
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function nameTerms(names = []) {
  const out = new Set();
  for (const raw of names) {
    const v = String(raw ?? '').replace(/⟦\/?extern⟧/g, '').trim();
    if (v.length <= 2) continue;
    out.add(v);
    for (const w of v.replace(LEGAL, ' ').split(/[\s&,/()|-]+/)) if (w.length >= 4 && /^[A-ZÀ-Ý]/.test(w)) out.add(w);
  }
  return [...out].sort((a, b) => b.length - a.length);
}

export function scrubNames(value, terms = []) {
  if (typeof value !== 'string') return value;
  let t = scrubText(value);
  for (const term of terms) {
    const isWord = !/\s/.test(term);
    const rx = new RegExp((isWord ? '\\b' : '') + escapeRegExp(term) + (isWord ? '\\b' : ''), isWord ? 'g' : 'gi');
    t = t.replace(rx, isWord ? '[naam]' : '[klant]');
  }
  return t.replace(/(\[(naam|klant)\][\s,&]*){2,}/g, '[klant] ');
}

export function anonymizeTicket(t = {}) {
  // Namen die het ticket zelf meedraagt; welke velden er zijn verschilt per bron (hub of Central-MCP).
  const terms = nameTerms([t.companyName, t.contactName, t.resourceName, t.klant, t.behandelaar, t.aanvrager]);
  return {
    title: scrubNames(t.title ?? '', terms),
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
