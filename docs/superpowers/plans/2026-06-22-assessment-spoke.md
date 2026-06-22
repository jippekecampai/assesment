# Assessment-app als Campai Portal-spoke — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De bestaande vanilla Campai assessment-app omvormen tot een EXTERNAL Portal-spoke door Rolands contractlaag erin te porten en de Vragenfabriek geanonimiseerde hub-data te laten lezen.

**Architecture:** De vanilla app (`index.html`/`app.js`/`styles.css`/`server.mjs`) blijft. We porten Rolands spoke-starter contractlaag (`spoke.manifest.json`, `scripts/spoke-doctor.mjs`, `lib/hub.mjs`, `lib/auth.mjs`) naar plain ESM. De server krijgt twee nieuwe routes die via de hub-gateway data lezen, door een anonimisatielaag halen en als conceptvragen aan de Vragenbank aanbieden. Geen Next.js, geen nieuwe runtime-dependencies.

**Tech Stack:** Node.js ≥ 22 (ESM, `"type":"module"`), vanilla browser-JS, `@azure/data-tables` (bestaand), `node:test` voor unit-tests (geen extra dependency).

## Global Constraints

- **Geen directe vendor-API-calls.** Alle hub-data uitsluitend via `lib/hub.mjs` → `${HUB_BASE_URL}/hub/v1`. Verboden hosts (Autotask/Datto/IT Glue/Inforcer/RoboShadow) nooit direct aanroepen.
- **Geen secrets in git of browser.** `HUB_APP_TOKEN` en Entra-secrets alleen in `.env` (al in `.gitignore`). Token nooit naar de client sturen.
- **Huisstijl = Console:** navy `#003d6b`, lime `#cdd100`, cyan **`#0bb4ed`** (exact).
- **Geen klant-PII naar de browser/kandidaat.** Hub-data wordt server-side geanonimiseerd vóór ze de server verlaat. Bij twijfel: veld weglaten (fail closed).
- **Human-approved gate blijft:** hub-bronmateriaal landt in `draftQuestions[]`, nooit automatisch in `testQuestions[]`.
- **Bekende hub-scopes** (voor het manifest): `companies:read`, `contacts:read`, `mappings:read`, `devices:read`, `contracts:read`, `tickets:read`, `invoices:read`, `opportunities:read`, `live:read`.
- Werk uitsluitend in repo `jippekecampai/assesment`. Rolands repo is alleen-lezen referentie.

---

### Task 1: Contractlaag-statics (manifest, spoke-doctor, huisstijl-fix)

**Files:**
- Create: `spoke.manifest.json`
- Create: `scripts/spoke-doctor.mjs`
- Modify: `package.json` (scripts: `doctor`, `test`)
- Modify: `styles.css:18`, `styles.css:23`, `styles.css:26` (cyan → `#0bb4ed`)

**Interfaces:**
- Produces: `npm run doctor` (exit 0 = contracten OK), `spoke.manifest.json` aan de repo-root.

- [ ] **Step 1: Schrijf het manifest**

Create `spoke.manifest.json`:

```json
{
  "key": "campai-assessment",
  "name": "Campai Assessment & Skills Academy",
  "type": "EXTERNAL",
  "vendor": "HR / Recruitment",
  "description": "Recruitment-assessment + interne Skills Academy. De Vragenfabriek voert geanonimiseerde MSP-casuistiek uit de hub aan voor senior-review.",
  "url": "https://cmp-app-assessment-test-weu-001.azurewebsites.net/",
  "route": null,
  "icon": "clipboard-check",
  "color": "#0bb4ed",
  "modules": ["tickets", "devices", "live"],
  "flags": [],
  "scopes": ["companies:read", "mappings:read", "tickets:read", "devices:read", "live:read"],
  "departments": ["hr", "management", "directie", "modernwork"],
  "roles": []
}
```

- [ ] **Step 2: Schrijf de spoke-doctor**

Create `scripts/spoke-doctor.mjs` (geport uit Rolands spoke-starter; één aanpassing: huisstijl-check kijkt naar `styles.css` én `app/globals.css`):

```javascript
#!/usr/bin/env node
// spoke-doctor — bewaakt de hub-contracten in een spoke (Hub & Spoke laag 2).
// Draait lokaal (`npm run doctor`) en in CI; faalt (exit 1) bij contractbreuk.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const KNOWN_SCOPES = ['companies:read', 'contacts:read', 'mappings:read', 'devices:read', 'contracts:read', 'tickets:read', 'invoices:read', 'opportunities:read', 'live:read'];
const TYPES = ['INTERNAL', 'EXTERNAL', 'EMBEDDED'];
const KEY_RE = /^[a-z0-9][a-z0-9-]{1,48}$/;

// --- 1. Manifest -----------------------------------------------------------
const manifestPath = join(ROOT, 'spoke.manifest.json');
if (!existsSync(manifestPath)) {
  fail('spoke.manifest.json ontbreekt.');
} else {
  let m;
  try { m = JSON.parse(readFileSync(manifestPath, 'utf8')); }
  catch { fail('spoke.manifest.json is geen geldige JSON.'); m = null; }
  if (m) {
    if (typeof m.key !== 'string' || !KEY_RE.test(m.key)) fail('manifest.key: kleine letters/cijfers/koppelteken, 2-49 tekens.');
    if (typeof m.name !== 'string' || !m.name.trim()) fail('manifest.name is verplicht.');
    const type = String(m.type || '').toUpperCase();
    if (!TYPES.includes(type)) fail(`manifest.type moet een van ${TYPES.join(' / ')} zijn.`);
    if (type === 'INTERNAL' && !m.route) fail('INTERNAL vereist manifest.route.');
    if ((type === 'EXTERNAL' || type === 'EMBEDDED') && !/^https?:\/\//.test(String(m.url || ''))) fail('EXTERNAL/EMBEDDED vereist een geldige manifest.url (https://...).');
    if (Array.isArray(m.scopes)) {
      const unknown = m.scopes.filter((s) => !KNOWN_SCOPES.includes(s));
      if (unknown.length) fail(`Onbekende scope(s): ${unknown.join(', ')}. Beschikbaar: ${KNOWN_SCOPES.join(', ')}.`);
    } else if (m.scopes !== undefined) {
      fail('manifest.scopes moet een lijst zijn.');
    }
  }
}

// --- 2. Bronbestanden scannen ---------------------------------------------
const SRC_DIRS = ['app', 'lib', 'src', 'components', 'pages', 'scripts'].map((d) => join(ROOT, d)).filter(existsSync);
const files = [];
for (const dir of SRC_DIRS) walk(dir, files);
// Scan ook losse root-bestanden (app.js, server.mjs).
for (const f of ['app.js', 'server.mjs']) { const p = join(ROOT, f); if (existsSync(p)) files.push(p); }
function walk(dir, out) {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(p))) out.push(p);
  }
}

const FORBIDDEN = [
  { re: /webservices\d*\.autotask\.net|autotask\.net\/atservices|ATWS\/v1/i, why: 'directe Autotask-API' },
  { re: /\bapi\.datto\.com|rmm\.datto/i, why: 'directe Datto RMM-API' },
  { re: /\bapi\.itglue\.com|itglue\.com\/api/i, why: 'directe IT Glue-API' },
  { re: /api(-eu)?\.inforcer\.com/i, why: 'directe Inforcer-API' },
  { re: /api\.roboshadow\.com/i, why: 'directe RoboShadow-API' },
];
let usesHub = false;
const HUB_IMPORT = /['"][^'"]*lib\/hub['"]|@cmp\/hub-sdk/;
for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  if (HUB_IMPORT.test(txt)) usesHub = true;
  for (const rule of FORBIDDEN) {
    if (rule.re.test(txt)) fail(`${rel(f)}: ${rule.why} aangetroffen — gebruik de hub-gateway (lib/hub.mjs), niet de bron direct.`);
  }
  if (/passport-local|next-auth\/providers\/credentials/.test(txt)) warn(`${rel(f)}: lijkt eigen authenticatie te bevatten — identiteit hoort via de hub (Entra SSO).`);
}
if (files.length && !usesHub) warn('Geen import van de hub-client (lib/hub of @cmp/hub-sdk) gevonden — leest deze app wel hub-data?');

// --- 3. Huisstijl (Console-tokens) ----------------------------------------
const cssCandidates = [join(ROOT, 'styles.css'), join(ROOT, 'app', 'globals.css')].filter(existsSync);
if (cssCandidates.length) {
  const c = cssCandidates.map((p) => readFileSync(p, 'utf8')).join('\n');
  if (!/--cmp-navy|--navy|#003d6b/i.test(c)) warn('CSS mist de Console-tokens (navy #003d6b e.d.).');
  if (/#0bb1ef/i.test(c)) fail('CSS gebruikt cyan #0bb1ef — Console-token is #0bb4ed.');
} else {
  warn('Geen stylesheet gevonden — gebruik je de Console-huisstijl?');
}

function rel(p) { return p.replace(ROOT + '/', '').replace(ROOT + '\\', ''); }

// --- Rapport ---------------------------------------------------------------
for (const w of warnings) console.log(`\x1b[33mWAARSCHUWING\x1b[0m  ${w}`);
if (errors.length === 0) {
  console.log(`\x1b[32m✓ spoke-doctor: alle contracten OK\x1b[0m${warnings.length ? ` (${warnings.length} waarschuwing(en))` : ''}`);
  process.exit(0);
}
for (const e of errors) console.log(`\x1b[31mFOUT\x1b[0m  ${e}`);
console.log(`\n\x1b[31mspoke-doctor: ${errors.length} contractbreuk(en) — los op vóór indienen.\x1b[0m`);
process.exit(1);
```

- [ ] **Step 3: Fix de cyan-huisstijl in `styles.css`**

Vervang op regels 18, 23, 26 elke `#0bb1ef` door `#0bb4ed`:

```css
  --cyan: #0bb4ed;
```
```css
  --ai: #0bb4ed;
```
```css
  --gradient-cyan: linear-gradient(135deg, #0bb4ed, #6cd6f4);
```

- [ ] **Step 4: Voeg scripts toe aan `package.json`**

Wijzig het `scripts`-blok naar:

```json
  "scripts": {
    "dev": "node server.mjs",
    "start": "node server.mjs",
    "check": "node --check app.js && node --check server.mjs",
    "doctor": "node scripts/spoke-doctor.mjs",
    "test": "node --test"
  },
```

- [ ] **Step 5: Draai de doctor — moet groen zijn**

Run: `npm run doctor`
Expected: `✓ spoke-doctor: alle contracten OK` met exit 0. (Eén waarschuwing over ontbrekende hub-import is op dit punt OK — die verdwijnt na Task 5.)

- [ ] **Step 6: Commit**

```bash
git add spoke.manifest.json scripts/spoke-doctor.mjs styles.css package.json
git commit -m "Add spoke manifest + spoke-doctor, fix cyan huisstijl token"
```

---

### Task 2: Hub-client en auth porten (`lib/hub.mjs`, `lib/auth.mjs`, `.env.example`)

**Files:**
- Create: `lib/hub.mjs`
- Create: `lib/auth.mjs`
- Create: `.env.example`
- Test: `test/hub.test.mjs`

**Interfaces:**
- Produces: `createHubClient({ userToken })` met `companies.list()`, `tickets.list({companyId})`, `devices.list({companyId})`, `live.rmmAlerts(companyId)`, `live.autotask(entity, companyId)`, `catalog()`. Gooit `Error` als `HUB_BASE_URL`/`HUB_APP_TOKEN` ontbreken. Exporteert `class HubError extends Error { status }`.
- Produces: `getUserToken()` → `Promise<string|undefined>`.

- [ ] **Step 1: Schrijf de falende test**

Create `test/hub.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHubClient, HubError } from '../lib/hub.mjs';

test('createHubClient gooit zonder HUB_BASE_URL', () => {
  assert.throws(() => createHubClient({ baseUrl: '', appToken: 'x' }), /HUB_BASE_URL/);
});

test('createHubClient gooit zonder HUB_APP_TOKEN', () => {
  assert.throws(() => createHubClient({ baseUrl: 'http://h/api', appToken: '' }), /HUB_APP_TOKEN/);
});

test('hub.tickets.list roept /hub/v1/tickets met companyId en app-token aan', async () => {
  const calls = [];
  const fakeFetch = async (url, opts) => {
    calls.push({ url, opts });
    return { ok: true, status: 200, json: async () => [{ id: 't1' }] };
  };
  const hub = createHubClient({ baseUrl: 'http://h/api', appToken: 'tok', fetchImpl: fakeFetch });
  const rows = await hub.tickets.list({ companyId: 'c1' });
  assert.deepEqual(rows, [{ id: 't1' }]);
  assert.equal(calls[0].url, 'http://h/api/hub/v1/tickets?companyId=c1');
  assert.equal(calls[0].opts.headers['x-hub-app-token'], 'tok');
});

test('hub gooit HubError bij non-2xx', async () => {
  const fakeFetch = async () => ({ ok: false, status: 403, text: async () => 'nope' });
  const hub = createHubClient({ baseUrl: 'http://h/api', appToken: 'tok', fetchImpl: fakeFetch });
  await assert.rejects(() => hub.companies.list(), (e) => e instanceof HubError && e.status === 403);
});
```

- [ ] **Step 2: Draai de test — moet falen**

Run: `node --test test/hub.test.mjs`
Expected: FAIL — `Cannot find module '../lib/hub.mjs'`.

- [ ] **Step 3: Schrijf `lib/hub.mjs`**

Create `lib/hub.mjs` (geport uit Rolands `lib/hub.ts`; TS-types verwijderd, `server-only` vervangen door een comment-guard, `fetchImpl` toegevoegd voor testbaarheid):

```javascript
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
```

- [ ] **Step 4: Schrijf `lib/auth.mjs`**

Create `lib/auth.mjs` (geport uit Rolands `lib/auth.ts`):

```javascript
// Identiteit komt van de hub (Entra SSO) — bouw GEEN eigen user-store/login.
// Productie (Azure): haal via de On-Behalf-Of-flow een hub-access-token voor de
// ingelogde gebruiker en geef dat aan createHubClient({ userToken }).
// Lokaal/dev: de hub draait in AUTH_DEV_MODE en negeert het user-token.

export async function getUserToken() {
  if (process.env.HUB_USER_TOKEN) return process.env.HUB_USER_TOKEN;
  // TODO (Azure): OBO-token van de ingelogde gebruiker uit de App Service-sessie.
  return undefined;
}
```

- [ ] **Step 5: Schrijf `.env.example`**

Create `.env.example`:

```bash
# Hub-gateway (verplicht voor de Vragenfabriek-koppeling)
HUB_BASE_URL=http://localhost:3001/api
HUB_APP_TOKEN=zet-hier-je-scoped-app-token   # Beheer > Apps > jouw app > API-tokens

# Lokaal optioneel: hub in AUTH_DEV_MODE negeert het user-token.
# HUB_USER_TOKEN=

# Bestaand: Azure Table Storage voor assessment-resultaten (leeg = lokale JSON-store).
# AZURE_STORAGE_CONNECTION_STRING=

# Productie (Azure / Entra SSO):
# ENTRA_TENANT_ID=
# ENTRA_CLIENT_ID=
# ENTRA_CLIENT_SECRET=
```

- [ ] **Step 6: Draai de test — moet slagen**

Run: `node --test test/hub.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add lib/hub.mjs lib/auth.mjs .env.example test/hub.test.mjs
git commit -m "Port hub gateway client + auth stub from spoke-starter"
```

---

### Task 3: Anonimisatielaag (`lib/anonymize.mjs`)

**Files:**
- Create: `lib/anonymize.mjs`
- Test: `test/anonymize.test.mjs`

**Interfaces:**
- Produces: `scrubText(s) -> string` (vervangt e-mail/IP/URL/domein/UNC/bedrag/GUID door placeholders). `anonymizeTicket(t) -> {title,status,priority,category}`. `anonymizeDevice(d) -> {os,type,category,eolStatus,warrantyDate}`. `anonymizeLive(payload) -> object` (deep string-scrub). Alle functies puur en netwerkvrij.

- [ ] **Step 1: Schrijf de falende test**

Create `test/anonymize.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrubText, anonymizeTicket, anonymizeDevice, anonymizeLive } from '../lib/anonymize.mjs';

test('scrubText verwijdert e-mail, IP, domein en bedrag', () => {
  const out = scrubText('Mail jan@klantbv.nl vanaf 10.0.12.34 op klantbv.sharepoint.com, factuur EUR 1.250,00');
  assert.ok(!out.includes('jan@klantbv.nl'));
  assert.ok(!out.includes('10.0.12.34'));
  assert.ok(!out.includes('klantbv.sharepoint.com'));
  assert.ok(!/1\.250,00/.test(out));
  assert.ok(out.includes('[gebruiker]') && out.includes('[ip]') && out.includes('[host]') && out.includes('[bedrag]'));
});

test('scrubText laat onschuldige tekst staan', () => {
  assert.equal(scrubText('Backup faalt drie nachten op de fileserver'), 'Backup faalt drie nachten op de fileserver');
});

test('anonymizeTicket houdt alleen veilige, geschoonde velden', () => {
  const t = anonymizeTicket({ id: 't1', companyId: 'c1', psaNumber: 'T20240001', title: 'VPN down bij klantbv.nl', status: 'Open', priority: 'High', queue: 'Tier2', category: 'Network' });
  assert.deepEqual(Object.keys(t).sort(), ['category', 'priority', 'status', 'title']);
  assert.ok(!t.title.includes('klantbv.nl'));
});

test('anonymizeDevice dropt hostname en companyId', () => {
  const d = anonymizeDevice({ id: 'd1', companyId: 'c1', hostname: 'KLANT-DC01', os: 'Windows Server 2022', type: 'Server', category: 'Server', eolStatus: 'OK', warrantyDate: '2027-01-01' });
  assert.ok(!('hostname' in d) && !('companyId' in d));
  assert.equal(d.os, 'Windows Server 2022');
});

test('anonymizeLive scrubt strings diep en behoudt structuur', () => {
  const out = anonymizeLive({ configured: true, items: [{ note: 'reset wachtwoord voor piet@klantbv.nl' }] });
  assert.equal(out.configured, true);
  assert.ok(!JSON.stringify(out).includes('piet@klantbv.nl'));
});
```

- [ ] **Step 2: Draai de test — moet falen**

Run: `node --test test/anonymize.test.mjs`
Expected: FAIL — `Cannot find module '../lib/anonymize.mjs'`.

- [ ] **Step 3: Schrijf `lib/anonymize.mjs`**

Create `lib/anonymize.mjs`:

```javascript
// Anonimisatielaag — verwijdert klant-PII uit hub-payloads VOORDAT iets de server
// verlaat. Contract: geen klantnamen, gebruikers, domeinen, IP's, bedragen of
// secrets richting de browser/kandidaat. Fail closed: bij twijfel weglaten.

const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const URL = /\bhttps?:\/\/[^\s)]+/gi;
const UNC = /\\\\[^\s\\]+(?:\\[^\s\\]+)*/g;
const GUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const MONEY = /(?:EUR|USD|€|\$)\s?\d[\d.,]*/gi;
// Domeinnaam met bekende TLD/onderdeel (na e-mail/URL-scrub, vangt bv. klant.sharepoint.com).
const DOMAIN = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\.[a-z]{2,}\b/gi;

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
```

- [ ] **Step 4: Draai de test — moet slagen**

Run: `node --test test/anonymize.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/anonymize.mjs test/anonymize.test.mjs
git commit -m "Add anonymization layer for hub source material"
```

---

### Task 4: Bronmateriaal-builder (`lib/source-material.mjs`)

**Files:**
- Create: `lib/source-material.mjs`
- Test: `test/source-material.test.mjs`

**Interfaces:**
- Consumes: een hub-client (uit `createHubClient`) + `anonymize*` uit `lib/anonymize.mjs`.
- Produces: `buildSourceMaterial(hub, companyId) -> Promise<Array<{domain,role,source,prompt}>>` — conceptvraag-kandidaten in dezelfde vorm als `draftQuestions[]`. Faalt nooit op één lege bron; slaat ontbrekende bronnen over.

- [ ] **Step 1: Schrijf de falende test**

Create `test/source-material.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSourceMaterial } from '../lib/source-material.mjs';

function fakeHub() {
  return {
    tickets: { list: async () => [{ id: 't1', companyId: 'c1', title: 'Backup faalt op DC bij klantbv.nl', status: 'Open', priority: 'High', category: 'Servers' }] },
    devices: { list: async () => [{ id: 'd1', hostname: 'KLANT-DC01', os: 'Windows Server 2022', type: 'Server', category: 'Server', eolStatus: 'OK' }] },
    live: {
      rmmAlerts: async () => ({ configured: true, alerts: [{ message: 'CPU 99% op host 10.0.0.5' }] }),
      autotask: async () => ({ configured: false }),
    },
  };
}

test('buildSourceMaterial levert geanonimiseerde conceptvragen', async () => {
  const out = await buildSourceMaterial(fakeHub(), 'c1');
  assert.ok(Array.isArray(out) && out.length >= 1);
  for (const item of out) {
    assert.ok(item.domain && item.role && item.source && item.prompt);
  }
  const blob = JSON.stringify(out);
  assert.ok(!blob.includes('klantbv.nl') && !blob.includes('KLANT-DC01') && !blob.includes('10.0.0.5'));
});

test('buildSourceMaterial vereist companyId', async () => {
  await assert.rejects(() => buildSourceMaterial(fakeHub(), ''), /companyId/);
});

test('buildSourceMaterial overleeft een falende bron', async () => {
  const hub = fakeHub();
  hub.devices.list = async () => { throw new Error('scope mist'); };
  const out = await buildSourceMaterial(hub, 'c1');
  assert.ok(out.length >= 1); // tickets + live blijven werken
});
```

- [ ] **Step 2: Draai de test — moet falen**

Run: `node --test test/source-material.test.mjs`
Expected: FAIL — `Cannot find module '../lib/source-material.mjs'`.

- [ ] **Step 3: Schrijf `lib/source-material.mjs`**

Create `lib/source-material.mjs`:

```javascript
// Bouwt geanonimiseerde conceptvraag-kandidaten uit hub-data voor de Vragenfabriek.
// Output-vorm = draftQuestions[] : { domain, role, source, prompt }.
// Elke bron is best-effort: een falende/lege bron slaan we over, de rest gaat door.
import { anonymizeTicket, anonymizeDevice, anonymizeLive, scrubText } from './anonymize.mjs';

const DEFAULT_ROLE = 'Servicedesk Engineer';

async function safe(fn, fallback) {
  try { return await fn(); } catch { return fallback; }
}

export async function buildSourceMaterial(hub, companyId) {
  if (!companyId) throw new Error('companyId is verplicht voor live/scoped hub-data.');
  const out = [];

  const tickets = await safe(() => hub.tickets.list({ companyId }), []);
  for (const raw of (tickets || []).slice(0, 10)) {
    const t = anonymizeTicket(raw);
    if (!t.title) continue;
    out.push({
      domain: t.category || 'Algemeen',
      role: DEFAULT_ROLE,
      source: 'Autotask-ticket (geanonimiseerd)',
      prompt: `Casus uit een geanonimiseerd ticket: "${t.title}". Laat de kandidaat impact bepalen, troubleshooten, documenteren en de klant informeren.`,
    });
  }

  const devices = await safe(() => hub.devices.list({ companyId }), []);
  const osSeen = new Set();
  for (const raw of (devices || [])) {
    const d = anonymizeDevice(raw);
    if (!d.os || osSeen.has(d.os)) continue;
    osSeen.add(d.os);
    out.push({
      domain: 'Servers',
      role: DEFAULT_ROLE,
      source: 'Datto RMM device-inventory (geanonimiseerd)',
      prompt: `Een omgeving draait ${scrubText(d.os)} (${d.type || 'onbekend type'}). Laat de kandidaat patch-, backup- en monitoringaanpak voor dit platform uitleggen.`,
    });
    if (osSeen.size >= 5) break;
  }

  const rmm = await safe(() => hub.live.rmmAlerts(companyId), { configured: false });
  if (rmm && rmm.configured) {
    const clean = anonymizeLive(rmm);
    out.push({
      domain: 'Kaseya Stack',
      role: DEFAULT_ROLE,
      source: 'Live Datto RMM-alerts (geanonimiseerd)',
      prompt: `Op basis van actuele (geanonimiseerde) RMM-alerts: ${scrubText(summarizeAlerts(clean))}. Laat de kandidaat de alert-naar-ticket-naar-klantupdate-flow beschrijven.`,
    });
  }

  return out;
}

function summarizeAlerts(clean) {
  const arr = Array.isArray(clean.alerts) ? clean.alerts : [];
  const first = arr.slice(0, 3).map((a) => (a && (a.message || a.title)) || 'alert').join('; ');
  return first || 'meerdere openstaande alerts';
}
```

- [ ] **Step 4: Draai de test — moet slagen**

Run: `node --test test/source-material.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/source-material.mjs test/source-material.test.mjs
git commit -m "Add hub source-material builder for Vragenfabriek"
```

---

### Task 5: Server-routes voor de hub-koppeling (`server.mjs`)

**Files:**
- Modify: `server.mjs` (imports bovenaan; nieuwe takken in `handleApi`)

**Interfaces:**
- Consumes: `createHubClient`, `getUserToken`, `buildSourceMaterial`.
- Produces: `GET /api/hub/companies` → `[{id,name,city}]` (geschoonde namen blijven — companies zijn de keuzelijst voor de reviewer, geen kandidaat-output). `GET /api/hub/source-material?companyId=…` → `{ items: [...] }`. Beide geven `503 {error:"hub_unconfigured"}` als env mist; `502 {error:"hub_error"}` bij `HubError`.

- [ ] **Step 1: Voeg imports toe bovenaan `server.mjs`**

Voeg na de bestaande `node:`-imports (na regel 4) toe:

```javascript
import { createHubClient, HubError } from "./lib/hub.mjs";
import { getUserToken } from "./lib/auth.mjs";
import { buildSourceMaterial } from "./lib/source-material.mjs";
```

- [ ] **Step 2: Voeg een hub-helper toe boven `handleApi`**

Voeg vlak boven `async function handleApi(` toe:

```javascript
function hubConfigured() {
  return Boolean(process.env.HUB_BASE_URL && process.env.HUB_APP_TOKEN);
}

async function getHub() {
  const userToken = await getUserToken();
  return createHubClient({ userToken });
}
```

- [ ] **Step 3: Voeg de routes toe in `handleApi`**

Voeg in `handleApi`, vlak vóór de afsluitende `return false;`, toe:

```javascript
  if (url.pathname === "/api/hub/companies" && request.method === "GET") {
    if (!hubConfigured()) { sendJson(response, 503, { error: "hub_unconfigured" }); return true; }
    try {
      const hub = await getHub();
      const companies = await hub.companies.list();
      sendJson(response, 200, companies.map((c) => ({ id: c.id, name: c.name, city: c.city ?? null })));
    } catch (error) {
      const status = error instanceof HubError ? 502 : 500;
      sendJson(response, status, { error: "hub_error", message: error.message });
    }
    return true;
  }

  if (url.pathname === "/api/hub/source-material" && request.method === "GET") {
    if (!hubConfigured()) { sendJson(response, 503, { error: "hub_unconfigured" }); return true; }
    const companyId = url.searchParams.get("companyId");
    if (!companyId) { sendJson(response, 400, { error: "companyId_required" }); return true; }
    try {
      const hub = await getHub();
      const items = await buildSourceMaterial(hub, companyId);
      sendJson(response, 200, { items });
    } catch (error) {
      const status = error instanceof HubError ? 502 : 500;
      sendJson(response, status, { error: "hub_error", message: error.message });
    }
    return true;
  }
```

- [ ] **Step 4: Syntax-check + doctor**

Run: `npm run check && npm run doctor`
Expected: beide groen; de eerdere "geen hub-import"-waarschuwing is nu weg (server.mjs importeert `lib/hub.mjs`).

- [ ] **Step 5: Handmatige rooktest (zonder hub-config)**

Run: `npm run dev` (in een tweede shell), dan:
```bash
curl -s http://127.0.0.1:4173/api/hub/companies
```
Expected: `{"error":"hub_unconfigured"}` met HTTP 503, en de rest van de app blijft laden. Stop de server (Ctrl-C).

- [ ] **Step 6: Commit**

```bash
git add server.mjs
git commit -m "Add server routes for hub companies + source material"
```

---

### Task 6: Vragenbank-UI — "Bronmateriaal uit hub" (`index.html`, `app.js`)

**Files:**
- Modify: `index.html:392-423` (knop + companyId-select in het "Nieuw"-paneel)
- Modify: `app.js` (event-handler bij de overige listeners rond regel 1122; gebruikt bestaande `draftQuestions`, `renderQuestionFactory`, `recordAudit`, `toast`)

**Interfaces:**
- Consumes: `GET /api/hub/companies`, `GET /api/hub/source-material?companyId=…`.
- Produces: voegt opgehaalde items toe aan `draftQuestions[]` (boven), hertekent de Vragenbank. Geen promotie naar `testQuestions[]`.

- [ ] **Step 1: Voeg de hub-knop toe in `index.html`**

Voeg in `#questionsView`, ná het sluitende `</form>` (regel 422) en vóór `</section>` (regel 423), toe:

```html
              <div class="hub-source">
                <span class="label">Hub-bronmateriaal</span>
                <label>Klant
                  <select id="hubCompany"><option value="">— kies klant —</option></select>
                </label>
                <button class="ghost-button" type="button" id="hubLoadCompaniesBtn">Klanten laden</button>
                <button class="primary-button" type="button" id="hubSourceBtn">Bronmateriaal uit hub</button>
                <p class="hub-source-hint" id="hubSourceHint">Haalt geanonimiseerde casuïstiek op voor senior-review.</p>
              </div>
```

- [ ] **Step 2: Voeg de event-handlers toe in `app.js`**

Voeg direct ná de bestaande `#questionForm`-submit-listener (na regel 1138, vóór `#globalSearch`) toe:

```javascript
  $("#hubLoadCompaniesBtn")?.addEventListener("click", async () => {
    const hint = $("#hubSourceHint");
    try {
      const res = await fetch("/api/hub/companies");
      if (res.status === 503) { hint.textContent = "Hub niet geconfigureerd (HUB_BASE_URL/HUB_APP_TOKEN ontbreekt)."; return; }
      if (!res.ok) { hint.textContent = "Kon klanten niet laden."; return; }
      const companies = await res.json();
      $("#hubCompany").innerHTML = `<option value="">— kies klant —</option>` +
        companies.map((c) => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.name)}</option>`).join("");
      hint.textContent = `${companies.length} klant(en) geladen.`;
    } catch (error) {
      hint.textContent = "Kon klanten niet laden.";
    }
  });

  $("#hubSourceBtn")?.addEventListener("click", async () => {
    const hint = $("#hubSourceHint");
    const companyId = $("#hubCompany").value;
    if (!companyId) { hint.textContent = "Kies eerst een klant."; return; }
    hint.textContent = "Bezig met ophalen…";
    try {
      const res = await fetch(`/api/hub/source-material?companyId=${encodeURIComponent(companyId)}`);
      if (res.status === 503) { hint.textContent = "Hub niet geconfigureerd."; return; }
      if (!res.ok) { hint.textContent = "Ophalen mislukt."; return; }
      const { items } = await res.json();
      if (!items || !items.length) { hint.textContent = "Geen bronmateriaal gevonden."; return; }
      for (const item of items.reverse()) {
        draftQuestions.unshift({
          domain: item.domain,
          role: item.role,
          type: "Scenario",
          source: item.source,
          prompt: item.prompt,
          options: defaultDraftOptions({}),
          answer: 1
        });
      }
      activeDraftIndex = 0;
      recordAudit("Hub-bronmateriaal opgehaald", `${items.length} concepten / klant ${companyId}`);
      renderQuestionFactory();
      hint.textContent = `${items.length} conceptvraag(en) toegevoegd voor review.`;
      toast("Hub-bronmateriaal toegevoegd aan de Vragenbank.");
    } catch (error) {
      hint.textContent = "Ophalen mislukt.";
    }
  });
```

- [ ] **Step 3: Syntax-check**

Run: `npm run check`
Expected: groen (geen syntaxfouten in `app.js`).

- [ ] **Step 4: Handmatige UI-verificatie**

Run: `npm run dev`, open `http://127.0.0.1:4173`, ga naar **Vragenbank**. Zonder hub-config: klik "Klanten laden" → hint toont "Hub niet geconfigureerd…". De rest van de Vragenbank (handmatige conceptvraag toevoegen) werkt onveranderd. Stop de server.

- [ ] **Step 5: Commit**

```bash
git add index.html app.js
git commit -m "Add 'Bronmateriaal uit hub' to Vragenbank"
```

---

### Task 7: CI, projectcontext en documentatie

**Files:**
- Create: `.github/workflows/spoke-doctor.yml`
- Create: `CLAUDE.md`
- Modify: `CHANGELOG.md` (nieuwe entry bovenaan)
- Modify: `DATASTRUCTURE.md` (nieuwe datastroom)

**Interfaces:** geen runtime-interface; bewaakt de contracten in CI en legt de spoke-conventies vast.

- [ ] **Step 1: CI-workflow**

Create `.github/workflows/spoke-doctor.yml`:

```yaml
name: spoke-doctor

on:
  push:
  pull_request:

jobs:
  doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - name: Contract-check (spoke-doctor)
        run: npm run doctor
      - name: Syntax-check
        run: npm run check
      - name: Unit tests
        run: npm test
```

- [ ] **Step 2: Projectcontext `CLAUDE.md`**

Create `CLAUDE.md`:

```markdown
# Campai Assessment & Skills Academy — Campai spoke (project-context)

Dit is een **EXTERNAL spoke** voor het Campai Portal (Hub & Spoke). De hub levert
identiteit (Entra SSO), RBAC en huisstijl. Deze app is vanilla (geen Next.js):
`index.html` + `app.js` + `styles.css`, geserveerd door `server.mjs`.

## Harde afspraken (spoke-doctor bewaakt dit — `npm run doctor`)
1. **Autotask leidend.** Hub-data uitsluitend via `lib/hub.mjs` → `/hub/v1`. Geen
   directe Autotask/Datto/IT Glue-calls.
2. **Geen eigen auth.** Identiteit via de hub (Entra SSO); `lib/auth.mjs`.
3. **Data binnen scope.** Live-data vereist altijd een `companyId`.
4. **Huisstijl = Console.** navy #003d6b, lime #cdd100, cyan #0bb4ed.
5. **Secrets niet committen.** `HUB_APP_TOKEN`/Entra in `.env` (zie `.env.example`).
6. **Geen klant-PII naar kandidaten.** Hub-data gaat door `lib/anonymize.mjs`;
   conceptvragen landen in `draftQuestions[]` voor verplichte senior-review.

## Commando's
- `npm run dev` — lokaal op http://127.0.0.1:4173
- `npm run doctor` — contract-check (moet groen zijn vóór indienen)
- `npm run check` — syntax-check
- `npm test` — unit-tests (`node --test`)

## Indienen
1. `npm run doctor` groen.
2. `spoke.manifest.json` volledig.
3. Portaal: **Apps → App indienen**. Beheerder keurt goed + mapt afdelingen.

Let op: `spoke.manifest.json` → `departments` is een suggestie. De beheerder mapt
op de echte `Department.key` (uit de `SG-Department-*` Entra-groepen).
```

- [ ] **Step 3: CHANGELOG-entry**

Voeg bovenaan `CHANGELOG.md` (onder de titel) toe:

```markdown
## 2026-06-22 — Portal-spoke (EXTERNAL)
- **Scope:** App omgevormd tot Campai Portal-spoke: `spoke.manifest.json`,
  `scripts/spoke-doctor.mjs`, `lib/hub.mjs`, `lib/auth.mjs`, `lib/anonymize.mjs`,
  `lib/source-material.mjs`, CI-workflow.
- **Vragenfabriek:** nieuwe routes `/api/hub/companies` en `/api/hub/source-material`
  lezen geanonimiseerde tickets/devices/live-data via de hub-gateway → `draftQuestions[]`.
- **Huisstijl:** cyan `#0bb1ef` → `#0bb4ed` (Console-token).
- **Reden:** opname in de Portal-launcher met door-de-hub-bestuurde toegang.
- **Risico/follow-up:** OBO-token (`lib/auth.mjs`) is nog een stub; vullen bij de
  Azure/Entra-uitrol. `departments` in het manifest bevestigt de beheerder.
```

- [ ] **Step 4: DATASTRUCTURE-uitbreiding**

Voeg onder de sectie "Protocol: nieuw data toevoegen" in `DATASTRUCTURE.md` een nieuw blok toe:

```markdown
### Hub-bronmateriaal → conceptvragen (spoke)
1. De Vragenbank-knop "Bronmateriaal uit hub" roept `/api/hub/source-material?companyId=…`.
2. `server.mjs` leest via `lib/hub.mjs` (gateway) tickets/devices/live-data, draait
   die door `lib/anonymize.mjs` en bouwt kandidaten met `lib/source-material.mjs`.
3. De kandidaten worden toegevoegd aan `draftQuestions[]` (vorm: domain, role, source,
   prompt) — nooit automatisch aan `testQuestions[]`.
4. Senior-review promoveert ze handmatig (bestaande flow). Documenteer in `CHANGELOG.md`.
```

- [ ] **Step 5: Volledige groene check**

Run: `npm run doctor && npm run check && npm test`
Expected: doctor groen (0 fouten), check groen, alle tests PASS.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/spoke-doctor.yml CLAUDE.md CHANGELOG.md DATASTRUCTURE.md
git commit -m "Add CI workflow, spoke CLAUDE.md, changelog + datastructure docs"
```

---

## Self-Review-notities

- **Spec-dekking:** manifest (§6) → Task 1; hub-client/auth (§5.1) → Task 2; anonimisatie (§5.2) → Task 3; bronmateriaal+routes (§5.3, §4) → Task 4+5; Vragenbank-UI (§5.3) → Task 6; CI/CLAUDE/changelog/datastructure (§5.1, §5.3) → Task 7; huisstijl-fix (§5.3) → Task 1; foutafhandeling (§8) → Task 5; tests (§9) → Task 2/3/4 + Step "groene check".
- **Geen placeholders:** alle code-stappen bevatten volledige code en exacte commando's.
- **Type-consistentie:** `createHubClient`, `HubError`, `buildSourceMaterial`, `scrubText`, `anonymizeTicket/Device/Live`, `getUserToken` consistent gebruikt over Tasks 2–6.
- **SSO (§7):** geen codewijziging nodig — bestaande App Service Entra-auth blijft; `lib/auth.mjs` is het OBO-aanknopingspunt (stub, follow-up in CHANGELOG).
```
