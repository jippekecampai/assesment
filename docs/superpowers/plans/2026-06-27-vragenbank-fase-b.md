# Vragenbank Fase B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In-app AI-generatie van conceptvragen per domein (provider-agnostisch, via de AI-guard) + JSON-import + handmatige domein-override per sollicitant.

**Architecture:** Een server-side AI-guard (`.mjs`) en AI-client (`.mjs`) genereren conceptvragen via een OpenAI-compatible endpoint; `server.mjs` ontsluit dit staff-only en levert concepten (geen auto-approve). De selectie krijgt een optionele domein-override die per sollicitant wordt opgeslagen. De Vragenbank-UI vervangt het "Klant"-blok door genereren/importeren; Sollicitanten krijgt een domein-multiselect.

**Tech Stack:** Node 22 (`.mjs`), `node:test`, React 19 + Mantine + Vite. Geen nieuwe runtime-dependencies (gebruik global `fetch`).

## Global Constraints

- ES modules `.mjs`; backend-tests via `npm test` (`node --test`, `test/*.test.mjs`).
- Geen nieuwe runtime-dependencies; gebruik de ingebouwde `fetch`.
- AI-generatie + import leveren **concepten**; alleen senior-goedkeuring (`POST /api/questions`) zet iets in de live bank. Nooit auto-approve.
- Nieuwe beheer-endpoints staff-only (`requireStaff`); kandidaat-endpoints blijven code-gated; antwoordsleutels nooit naar de kiosk.
- AI-call loopt door de guard; AI-config (`AI_ENDPOINT`/`AI_API_KEY`/`AI_MODEL`) staat server-side, nooit in de browser.
- 13 domeinen (uit `lib/assessment-content.mjs`); domein-override leeg = functie-default.
- Frontend-verificatie: `npx tsc --noEmit` + `npx vite build`.

---

### Task 1: Server-side AI-guard (`lib/ai-guard.mjs`)

Plain-JS kopie van de gevendorde `src/lib/ai-guard.ts` zodat de Node-server de guard kan gebruiken.

**Files:**
- Create: `lib/ai-guard.mjs`
- Test: `test/ai-guard.test.mjs`

**Interfaces:**
- Produces: `class PromptSanitizer { sanitize(text, entities=[]) → { text, map }; rehydrate(text, map) → string }`.

- [ ] **Step 1: Test**

```javascript
// test/ai-guard.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PromptSanitizer } from '../lib/ai-guard.mjs';

test('sanitize tokeniseert e-mail/IP en rehydrate is een round-trip', () => {
  const s = new PromptSanitizer();
  const original = 'Mail jan@acme.nl vanaf 10.0.0.5';
  const { text, map } = s.sanitize(original, [{ value: 'Acme', category: 'BEDRIJF' }]);
  assert.ok(!text.includes('jan@acme.nl') && !text.includes('10.0.0.5'));
  assert.equal(s.rehydrate(text, map), original);
});

test('sanitize zonder entiteiten en zonder PII laat tekst ongemoeid', () => {
  const s = new PromptSanitizer();
  const { text } = s.sanitize('Genereer 5 vragen voor het domein Azure');
  assert.equal(text, 'Genereer 5 vragen voor het domein Azure');
});
```

- [ ] **Step 2: Run → faalt** — `npm test -- test/ai-guard.test.mjs` → FAIL.

- [ ] **Step 3: Implementeer** — kopieer de logica uit `src/lib/ai-guard.ts` naar plain JS (strip types):

```javascript
// lib/ai-guard.mjs — server-side PromptSanitizer (kopie van src/lib/ai-guard.ts)
const REGEX_PATTERNS = [
  { category: 'EMAIL', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { category: 'IBAN', re: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,8}\b/g },
  { category: 'IP', re: /\b\d{1,3}(?:\.\d{1,3}){3}\b/g },
];
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export class PromptSanitizer {
  sanitize(text, entities = []) {
    const candidates = [];
    for (const entity of entities) {
      const value = entity.value?.trim();
      if (!value) continue;
      const re = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(value)}(?![A-Za-z0-9])`, 'gi');
      for (let m = re.exec(text); m; m = re.exec(text)) candidates.push({ start: m.index, end: m.index + m[0].length, value, category: entity.category });
    }
    for (const { category, re } of REGEX_PATTERNS) {
      re.lastIndex = 0;
      for (let m = re.exec(text); m; m = re.exec(text)) candidates.push({ start: m.index, end: m.index + m[0].length, value: m[0], category });
    }
    candidates.sort((a, b) => a.start - b.start || b.end - a.end);
    const accepted = []; let consumedUntil = -1;
    for (const c of candidates) { if (c.start >= consumedUntil) { accepted.push(c); consumedUntil = c.end; } }
    const map = new Map(); const valueToToken = new Map(); const counters = new Map();
    let out = ''; let cursor = 0;
    for (const c of accepted) {
      const key = `${c.category} ${c.value}`;
      let token = valueToToken.get(key);
      if (!token) { const n = (counters.get(c.category) ?? 0) + 1; counters.set(c.category, n); token = `[${c.category}_${n}]`; valueToToken.set(key, token); map.set(token, c.value); }
      out += text.slice(cursor, c.start) + token; cursor = c.end;
    }
    out += text.slice(cursor);
    return { text: out, map };
  }
  rehydrate(text, map) {
    const tokens = [...map.keys()].sort((a, b) => b.length - a.length);
    let out = text;
    for (const token of tokens) out = out.split(token).join(map.get(token));
    return out;
  }
}
```

- [ ] **Step 4: Run → slaagt** — `npm test -- test/ai-guard.test.mjs` → PASS; volledige suite `npm test` groen.

- [ ] **Step 5: Commit**

```bash
git add lib/ai-guard.mjs test/ai-guard.test.mjs
git commit -m "feat(vragenbank): server-side AI-guard (.mjs)"
```

---

### Task 2: AI-client (`lib/ai-client.mjs`)

Genereert conceptvragen via een OpenAI-compatible endpoint, met validatie en injecteerbare `fetch` voor tests.

**Files:**
- Create: `lib/ai-client.mjs`
- Test: `test/ai-client.test.mjs`

**Interfaces:**
- Consumes: `PromptSanitizer` (Task 1), `domains` uit `lib/assessment-content.mjs`.
- Produces:
  - `isConfigured()` → boolean (alle drie `AI_ENDPOINT`/`AI_API_KEY`/`AI_MODEL` gezet).
  - `async generateQuestions({ domain, count = 5 }, { fetchImpl = fetch } = {})` → `Question[]` (gevalideerde concepten `{domain,type,prompt,options,answer,source:'AI'}`); throws `AiError(code)` (`'not_configured'` | `'ai_error'`).
  - `class AiError extends Error { code }`.
  - `parseQuestions(text)` → geldige `Question[]` uit ruwe modeltekst (export voor tests).

- [ ] **Step 1: Test (fake fetch — geen echte AI-call)**

```javascript
// test/ai-client.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateQuestions, parseQuestions, AiError } from '../lib/ai-client.mjs';

test('parseQuestions haalt geldige vragen uit modeltekst en dropt ongeldige', () => {
  const raw = 'Hier:\n[{"domain":"Azure","type":"Scenario","prompt":"Een lange genoeg prompt over azure governance?","options":["a","b","c","d"],"answer":2},{"domain":"Onzin","prompt":"x","options":["a"],"answer":9}]';
  const qs = parseQuestions(raw);
  assert.equal(qs.length, 1);
  assert.equal(qs[0].domain, 'Azure');
  assert.equal(qs[0].source, 'AI');
});

test('generateQuestions gebruikt de fake fetch en levert concepten', async () => {
  const fake = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: '[{"domain":"Azure","type":"Scenario","prompt":"Een voldoende lange scenariovraag over Azure?","options":["a","b","c","d"],"answer":1}]' } }] }) });
  // forceer config via env in de test
  process.env.AI_ENDPOINT = 'http://x'; process.env.AI_API_KEY = 'k'; process.env.AI_MODEL = 'm';
  const qs = await generateQuestions({ domain: 'Azure', count: 1 }, { fetchImpl: fake });
  assert.equal(qs.length, 1);
  assert.equal(qs[0].domain, 'Azure');
});

test('generateQuestions zonder config gooit not_configured', async () => {
  delete process.env.AI_ENDPOINT; delete process.env.AI_API_KEY; delete process.env.AI_MODEL;
  await assert.rejects(() => generateQuestions({ domain: 'Azure' }), (e) => e instanceof AiError && e.code === 'not_configured');
});
```

- [ ] **Step 2: Run → faalt** — `npm test -- test/ai-client.test.mjs` → FAIL.

- [ ] **Step 3: Implementeer `lib/ai-client.mjs`**

```javascript
// lib/ai-client.mjs
import { domains } from './assessment-content.mjs';
import { PromptSanitizer } from './ai-guard.mjs';

export class AiError extends Error { constructor(code, message) { super(message || code); this.name = 'AiError'; this.code = code; } }

export function isConfigured() {
  return Boolean(process.env.AI_ENDPOINT && process.env.AI_API_KEY && process.env.AI_MODEL);
}

function isValidQuestion(q) {
  return q && domains.includes(q.domain) && Array.isArray(q.options) && q.options.length === 4
    && q.options.every((o) => typeof o === 'string' && o.trim())
    && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    && typeof q.prompt === 'string' && q.prompt.trim().length >= 30;
}

export function parseQuestions(text) {
  const start = text.indexOf('['); const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) return [];
  let arr;
  try { arr = JSON.parse(text.slice(start, end + 1)); } catch { return []; }
  if (!Array.isArray(arr)) return [];
  return arr.filter(isValidQuestion).map((q) => ({
    domain: q.domain, type: q.type || 'Scenario', prompt: q.prompt.trim(),
    options: q.options.map((o) => o.trim()), answer: q.answer, source: 'AI',
  }));
}

function buildPrompt(domain, count) {
  return `Genereer ${count} hoogwaardige Nederlandstalige meerkeuzevragen voor een MSP-recruitmentassessment, domein "${domain}". `
    + `Toets toepassing/oordeel, GEEN definitievragen. Elke vraag: een korte realistische situatie + 4 PLAUSIBELE opties van vergelijkbare lengte, precies één duidelijk beste professionele antwoord (geen flauwe/overduidelijk foute opties). `
    + (domain === 'Engels' ? 'Voor dit domein zijn vraag en opties in het Engels (technisch leesbegrip). ' : '')
    + `Geen klantnamen/PII. Antwoord UITSLUITEND met een JSON-array van objecten: {"domain":"${domain}","type":"Scenario","prompt":"...","options":["..","..","..",".."],"answer":0-3}.`;
}

export async function generateQuestions({ domain, count = 5 }, { fetchImpl = fetch } = {}) {
  if (!domains.includes(domain)) throw new AiError('invalid_domain', `onbekend domein: ${domain}`);
  if (!isConfigured()) throw new AiError('not_configured');
  const guard = new PromptSanitizer();
  const userPrompt = buildPrompt(domain, count);
  const { text: safePrompt, map } = guard.sanitize(userPrompt); // no-op bij domein-only, compliant
  let res;
  try {
    res = await fetchImpl(process.env.AI_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ model: process.env.AI_MODEL, temperature: 0.7,
        messages: [
          { role: 'system', content: 'Je bent een ervaren MSP-assessmentauteur. Antwoord uitsluitend met geldige JSON.' },
          { role: 'user', content: safePrompt },
        ] }),
    });
  } catch (e) { throw new AiError('ai_error', e.message); }
  if (!res.ok) throw new AiError('ai_error', `endpoint ${res.status}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return parseQuestions(guard.rehydrate(content, map));
}
```

- [ ] **Step 4: Run → slaagt** — `npm test -- test/ai-client.test.mjs` → PASS; volledige suite groen.

- [ ] **Step 5: Commit**

```bash
git add lib/ai-client.mjs test/ai-client.test.mjs
git commit -m "feat(vragenbank): provider-agnostische AI-vragengenerator (via guard)"
```

---

### Task 3: Domein-override in selectie + store + service

**Files:**
- Modify: `lib/assessment.mjs` (`selectQuestionsForRole` krijgt `domains`-override)
- Modify: `lib/candidate-store.mjs` (`buildCandidate` accepteert `domeinen`)
- Modify: `lib/assessment-service.mjs` (`startAssessment` geeft override door)
- Test: `test/assessment.test.mjs` (+ override-test), `test/assessment-service.test.mjs` (+ override-test)

**Interfaces:**
- `selectQuestionsForRole(roleId, approved = [], { domains, minPerDomain = 5, weightThreshold = 0.07 } = {})` — als `domains` (array) gezet is, gebruik die als relevante set; anders rolgewicht ≥ drempel.
- `createCandidate({ naam, email, functie, code, aangemaaktDoor, domeinen })` — `domeinen` optioneel (default `null`).
- `startAssessment` gebruikt `candidate.domeinen` als override indien een niet-lege array.

- [ ] **Step 1: Tests**

In `test/assessment.test.mjs` toevoegen:
```javascript
test('selectQuestionsForRole respecteert domains-override', () => {
  const approved = Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, domain: 'VoIP', type: 'S', prompt: `vraag ${i} over voip`, options: ['a','b','c','d'], answer: 1 }));
  const qs = selectQuestionsForRole('cloud', approved, { domains: ['VoIP'], minPerDomain: 5 });
  assert.ok(qs.length >= 5 && qs.every((q) => q.domain === 'VoIP'));
});
```
In `test/assessment-service.test.mjs` toevoegen (fakeBank uit dat bestand hergebruiken):
```javascript
test('startAssessment gebruikt candidate.domeinen als override', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl', domeinen: ['Werkhouding & Communicatie'] });
    const { questions } = await startAssessment(store, 'ABC234', fakeBank([]));
    assert.ok(questions.length > 0 && questions.every((q) => q.domain === 'Werkhouding & Communicatie'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
```

- [ ] **Step 2: Run → faalt** — `npm test -- test/assessment.test.mjs test/assessment-service.test.mjs` → FAIL.

- [ ] **Step 3: Implementeer**

`lib/assessment.mjs` — pas `selectQuestionsForRole` aan (vervang de relevant-bepaling):
```javascript
export function selectQuestionsForRole(roleId, approved = [], { domains: override, minPerDomain = 5, weightThreshold = 0.07 } = {}) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw new Error(`onbekende rol: ${roleId}`);
  const weightOf = (d) => role.weights[d] ?? 0;
  const relevant = Array.isArray(override) && override.length
    ? override.filter((d) => domains.includes(d))
    : domains.filter((d) => weightOf(d) >= weightThreshold).sort((a, b) => weightOf(b) - weightOf(a));
  const seed = testQuestions.map((q, i) => ({ ...q, id: q.id ?? `seed-${i}` }));
  const pool = [...seed, ...approved];
  const chosen = [];
  for (const domain of relevant) chosen.push(...pool.filter((q) => q.domain === domain).slice(0, minPerDomain));
  return chosen.map((q, i) => prepareQuestion(q, i));
}
```
(`domains` blijft geïmporteerd uit `assessment-content.mjs`; let op de naambotsing — gebruik `override` als parameternaam zoals hierboven.)

`lib/candidate-store.mjs` — `buildCandidate`:
```javascript
function buildCandidate({ naam, email = null, functie, code, aangemaaktDoor, domeinen = null }) {
  return {
    id: randomUUID(), naam, email, functie, code, domeinen,
    status: 'uitgenodigd', aangemaaktDoor,
    aangemaaktOp: new Date().toISOString(), gestartOp: null, ingediendOp: null,
  };
}
```

`lib/assessment-service.mjs` — in `startAssessment`, de selectie-regel:
```javascript
  const override = Array.isArray(candidate.domeinen) && candidate.domeinen.length ? candidate.domeinen : undefined;
  const questions = selectQuestionsForRole(candidate.functie, approved, { domains: override });
```

- [ ] **Step 4: Run → slaagt** — beide testbestanden + volledige `npm test` groen.

- [ ] **Step 5: Commit**

```bash
git add lib/assessment.mjs lib/candidate-store.mjs lib/assessment-service.mjs test/assessment.test.mjs test/assessment-service.test.mjs
git commit -m "feat(vragenbank): domein-override per sollicitant in selectie"
```

---

### Task 4: Server-endpoints (generate + candidates.domeinen)

**Files:**
- Modify: `server.mjs`
- (geen unit-test; curl-verificatie)

**Interfaces:**
- `POST /api/questions/generate` (staff) `{ domain, count? }` → `200 [concepten]` (niet opgeslagen); `503 {error:'ai_not_configured'}` als AI niet geconfigureerd; `502 {error:'ai_error'}` bij endpoint-fout; `400` bij ongeldig domein.
- `POST /api/candidates` accepteert optioneel `domeinen: string[]` (gevalideerd: subset van `domains`) → meegegeven aan `createCandidate`.

- [ ] **Step 1: Imports + generate-endpoint**

Boven in `server.mjs` (bij de andere lib-imports):
```javascript
import { generateQuestions, isConfigured as aiConfigured, AiError } from './lib/ai-client.mjs';
```
In `handleApi` (vóór `return false;`):
```javascript
if (url.pathname === '/api/questions/generate' && request.method === 'POST') {
  if (!requireStaff(request, response)) return true;
  const b = await readRequestBody(request);
  if (!domains.includes(b.domain)) { sendJson(response, 400, { error: 'ongeldig_domein' }); return true; }
  if (!aiConfigured()) { sendJson(response, 503, { error: 'ai_not_configured' }); return true; }
  try {
    const count = Math.min(10, Math.max(1, Number(b.count) || 5));
    const concepts = await generateQuestions({ domain: b.domain, count });
    sendJson(response, 200, concepts);
  } catch (e) {
    sendJson(response, e instanceof AiError && e.code === 'not_configured' ? 503 : 502, { error: e.code || 'ai_error' });
  }
  return true;
}
```

- [ ] **Step 2: `domeinen` op POST /api/candidates**

In de bestaande `POST /api/candidates`-handler, na de naam/functie-validatie, vóór `createCandidate`:
```javascript
  const domeinen = Array.isArray(b.domeinen) ? b.domeinen.filter((d) => domains.includes(d)) : null;
```
en geef `domeinen: domeinen && domeinen.length ? domeinen : null` mee aan `candidateStore.createCandidate({...})`.

- [ ] **Step 3: Verify**

`node --check server.mjs` → exit 0. `npm test` groen. Handmatig (AUTH_DEV_MODE, zonder AI-config → 503):
```bash
AUTH_DEV_MODE=1 PORT=4206 node server.mjs &
curl -s -o /dev/null -w "%{http_code}\n" -XPOST localhost:4206/api/questions/generate -H 'content-type: application/json' -d '{"domain":"Azure","count":5}'   # → 503 (ai_not_configured)
curl -s -XPOST localhost:4206/api/candidates -H 'content-type: application/json' -d '{"naam":"Test","functie":"cloud","domeinen":["Azure","Servers"]}'   # → candidate met domeinen
kill %1
```
Expected: generate → 503 zonder AI-config; candidate-create accepteert `domeinen`.

- [ ] **Step 4: Commit**

```bash
git add server.mjs
git commit -m "feat(vragenbank): /api/questions/generate + domeinen op /api/candidates"
```

---

### Task 5: Frontend — API-client + Vragenbank genereer/import-blok

**Files:**
- Modify: `src/lib/api.ts`
- Modify: `src/views/Vragenfabriek.tsx`

**Interfaces:**
- `generateQuestions(domain: string, count: number): Promise<DraftQuestionInput[]>` → `POST /api/questions/generate`.
- `createCandidate(input)` (bestaand) krijgt optioneel `domeinen?: string[]`.
- `type DraftQuestionInput = { domain:string; type:string; prompt:string; options:string[]; answer:number; source?:string }`.

- [ ] **Step 1: API-client** — voeg toe aan `src/lib/api.ts`:
```typescript
export type DraftQuestionInput = { domain: string; type: string; prompt: string; options: string[]; answer: number; source?: string };
export const generateQuestions = (domain: string, count: number) =>
  post<DraftQuestionInput[]>("/api/questions/generate", { domain, count });
```
en breid `createCandidate`'s input-type uit met `domeinen?: string[]` (doorgeven in de body).

- [ ] **Step 2: Vragenbank** — vervang in `src/views/Vragenfabriek.tsx` het hub-bron/"Klant"-blok (`loadCompanies`/`loadSourceMaterial`/companies-state) door een **"Genereer of importeer vragen"**-blok:
  - **Genereer:** `Select` domein (uit `domains`) + `NumberInput` aantal (default 5, 1–10) + knop **Genereer** → `await generateQuestions(domain, count)` → voeg resultaten toe aan de bestaande `drafts`-werklijst (map naar de `Draft`-vorm). Bij `ApiError` met code `ai_not_configured` → notificatie "AI-endpoint niet ingesteld — gebruik import of stel AI_* in"; andere fout → nette melding.
  - **Importeer:** `Textarea` "Plak JSON-vragen" + knop **Importeer** → `JSON.parse` in try/catch → valideer elk item client-side (`domains.includes`, `options.length===4`, `answer` 0–3, `prompt` aanwezig) → geldige toevoegen aan `drafts`, melding met aantal toegevoegd/overgeslagen.
  - Verwijder de hub-`fetch`-calls en companies-state uit dit bestand.

- [ ] **Step 3: Verify** — `npx tsc --noEmit && npx vite build` exit 0. Visueel (AUTH_DEV_MODE-server): Importeer met een geldige JSON-array → concepten verschijnen in de werklijst; Genereer zonder AI-config → nette "niet ingesteld"-melding.

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.ts src/views/Vragenfabriek.tsx
git commit -m "feat(fe): Vragenbank genereer (AI) + importeer (JSON) i.p.v. Klant-blok"
```

---

### Task 6: Frontend — domein-multiselect op Sollicitanten

**Files:**
- Modify: `src/views/Sollicitanten.tsx`

**Interfaces:**
- Consumes: `domains` uit `src/lib/data.ts`; `createCandidate` met optioneel `domeinen`.

- [ ] **Step 1: UI + wiring** — voeg in het aanmaakformulier een Mantine **`MultiSelect`** "Domeinen (optioneel)" toe met `data={domains}`, label-hint "leeg = automatisch op basis van functie". State `domeinen: string[]`. Geef bij `createCandidate` `domeinen: domeinen.length ? domeinen : undefined` mee. Reset na aanmaken.

- [ ] **Step 2: Verify** — `npx tsc --noEmit && npx vite build` exit 0. Visueel: sollicitant met gekozen domeinen aanmaken; (optioneel) via de kiosk-flow bevestigen dat alleen die domeinen getoetst worden.

- [ ] **Step 3: Commit**

```bash
git add src/views/Sollicitanten.tsx
git commit -m "feat(fe): domein-multiselect (override) bij sollicitant aanmaken"
```

---

### Task 7: Config-documentatie (`.env.example`)

**Files:**
- Modify: `.env.example`
- Modify: `docs/vragen-generatie-prompt.md` (korte verwijzing naar in-app generatie)

- [ ] **Step 1: `.env.example`** — voeg toe met uitleg:
```
# In-app AI-vragengeneratie (optioneel; OpenAI-compatible endpoint).
# Leeg laten = generatie uit; de import-flow werkt altijd.
# Bron: GitHub Models, Azure AI Foundry-deployment, of een lokaal AI-Toolkit-endpoint.
AI_ENDPOINT=   # bv. https://models.github.ai/inference/chat/completions of je Foundry-endpoint
AI_API_KEY=    # token/key van die bron
AI_MODEL=      # bv. gpt-4o-mini
```

- [ ] **Step 2: Notitie** — voeg onderaan `docs/vragen-generatie-prompt.md` een korte sectie toe: "In-app: kies in de Vragenbank een domein → Genereer (vereist `AI_*` env). Zonder config: gebruik Importeer (plak de JSON van deze prompt)."

- [ ] **Step 3: Commit**

```bash
git add .env.example docs/vragen-generatie-prompt.md
git commit -m "docs(vragenbank): AI_* config + in-app generatie/import-notitie"
```

---

## Self-Review

**Spec-dekking:**
- Server-guard (spec §4) → Task 1. ✓
- AI-generator provider-agnostisch + guard + parse/validatie (spec §5) → Task 2. ✓
- `/api/questions/generate` staff + 503/502 (spec §5/§9) → Task 4. ✓
- Import client-side validatie (spec §6) → Task 5. ✓
- "Klant"-blok vervangen door genereren/importeren (spec §7) → Task 5. ✓
- Domein-override per sollicitant (spec §8) → Task 3 (logica) + Task 4 (endpoint) + Task 6 (UI). ✓
- Concepten, nooit auto-approve (spec §9) → Task 4 (geeft concepten terug, slaat niet op) + bestaande goedkeur-flow. ✓
- `AI_*` config-docs (spec §4) → Task 7. ✓

**Placeholder-scan:** UI-taken (5/6) geven exacte bestanden + interfaces + concrete stappen; de JSX zelf is beschreven met de Mantine-componenten en gedragsregels (geen vage "handle errors"). Geen logische placeholders in de testbare taken (1–4) — die hebben volledige code.

**Type-consistentie:** `generateQuestions({domain,count},{fetchImpl})` (server) vs `generateQuestions(domain,count)` (frontend client) — bewust verschillend (server-fn vs HTTP-wrapper), beide consistent binnen hun taak. `selectQuestionsForRole(roleId, approved, {domains})` consistent in Task 3/§8. `candidate.domeinen` consistent in Task 3/4/6. `AiError.code` (`not_configured`/`ai_error`/`invalid_domain`) consistent Task 2/4.
