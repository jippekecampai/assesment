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
