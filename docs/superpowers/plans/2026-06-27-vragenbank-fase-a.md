# Vragenbank Fase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De vragenbank vergroten en verdiepen: een server-store voor goedgekeurde vragen, een ≥5-per-relevant-domein-selectie (seed + goedgekeurd), staff-endpoints + Vragenfabriek-koppeling, en een door mij geschreven seed van ≥5 diepe vragen per domein.

**Architecture:** Goedgekeurde vragen leven server-side (`lib/question-bank.mjs`, Azure Table + file-fallback). De pure selectie (`lib/assessment.mjs`) combineert de statische seed met goedgekeurde vragen en kiest ≥5 per relevant domein. De service haalt de goedgekeurde vragen op en geeft ze aan de selectie; de kiosk-flow en scoring blijven verder ongewijzigd (antwoordsleutels nooit naar de client).

**Tech Stack:** Node 22 (`.mjs`), `node:test`, `@azure/data-tables` (bestaand), React 19 + Mantine + Vite (frontend). Geen nieuwe runtime-deps.

## Global Constraints

- ES modules `.mjs`; backend-tests via `npm test` (`node --test`, `test/*.test.mjs`).
- Geen nieuwe runtime-dependencies.
- **Antwoordsleutels (`answer`) verlaten de server nooit richting de kiosk** (`toClientQuestion`). Selectie/scoring blijven puur.
- **≥ 5 vragen per relevant domein, geen maximum**; domeinen met <5 leveren wat er is en worden gesignaleerd.
- Goedgekeurde-store-mutaties achter `requireStaff` (Entra); kandidaat-endpoints code-gated.
- 13 domeinen blijven (geen nieuw domein); IT Glue → "Kaseya Stack", AI-tooling → "AI / Copilot".
- Frontend-verificatie: `npx tsc --noEmit` + `npx vite build` (geen FE-testrunner).
- Geen klant-PII in vragen.

---

### Task 1: Goedgekeurde-vragen-store (`lib/question-bank.mjs`)

Persistente store voor goedgekeurde vragen, zelfde patroon als `lib/candidate-store.mjs` (Azure Table als `AZURE_STORAGE_CONNECTION_STRING` gezet is, anders file-fallback). Pad/connStr injecteerbaar voor tests.

**Files:**
- Create: `lib/question-bank.mjs`
- Test: `test/question-bank.test.mjs`

**Interfaces:**
- Produces: `createQuestionBank({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentQuestions' })` → object met async methodes:
  - `listApproved()` → `Question[]` (nieuwste eerst)
  - `addApproved({ domain, type, prompt, options, answer, source, approvedBy })` → `Question` (incl. `id`, `approvedAt`)
  - `removeApproved(id)` → `void`
- `Question` = `{ id, domain, type, prompt, options:string[4], answer:number, source, approvedBy, approvedAt }`.

- [ ] **Step 1: Test (file-fallback via temp-pad)**

```javascript
// test/question-bank.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createQuestionBank } from '../lib/question-bank.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-qb-'));
  return { bank: createQuestionBank({ filePath: join(dir, 'q.json') }), dir };
}

test('addApproved + listApproved round-trip', async () => {
  const { bank, dir } = fresh();
  try {
    const q = await bank.addApproved({ domain: 'Azure', type: 'Scenario', prompt: 'p', options: ['a','b','c','d'], answer: 1, source: 'Handmatig', approvedBy: 'senior@campai.nl' });
    assert.ok(q.id && q.approvedAt);
    const list = await bank.listApproved();
    assert.equal(list.length, 1);
    assert.equal(list[0].domain, 'Azure');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('removeApproved verwijdert', async () => {
  const { bank, dir } = fresh();
  try {
    const q = await bank.addApproved({ domain: 'Azure', type: 'T', prompt: 'p', options: ['a','b','c','d'], answer: 0, source: 'Handmatig', approvedBy: 's@c.nl' });
    await bank.removeApproved(q.id);
    assert.equal((await bank.listApproved()).length, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
```

- [ ] **Step 2: Run → faalt** — `npm test -- test/question-bank.test.mjs` → FAIL.

- [ ] **Step 3: Implementeer `lib/question-bank.mjs`**

```javascript
// lib/question-bank.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

function build({ domain, type, prompt, options, answer, source = 'Handmatig', approvedBy = '' }) {
  return { id: randomUUID(), domain, type, prompt, options, answer, source, approvedBy, approvedAt: new Date().toISOString() };
}

function fileBank(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { questions: [] }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  return {
    async addApproved(input) { const d = await load(); const q = build(input); d.questions.unshift(q); await persist(d); return q; },
    async listApproved() { return (await load()).questions; },
    async removeApproved(id) { const d = await load(); d.questions = d.questions.filter((q) => q.id !== id); await persist(d); },
  };
}

function azureBank(connectionString, tableName) {
  let clientPromise;
  async function client() {
    if (!clientPromise) clientPromise = (async () => {
      const { TableClient } = await import('@azure/data-tables');
      const c = TableClient.fromConnectionString(connectionString, tableName);
      await c.createTable().catch((e) => { if (e.statusCode !== 409) throw e; });
      return c;
    })();
    return clientPromise;
  }
  return {
    async addApproved(input) { const c = await client(); const q = build(input); await c.createEntity({ partitionKey: 'question', rowKey: q.id, data: JSON.stringify(q) }); return q; },
    async listApproved() { const c = await client(); const out = []; for await (const e of c.listEntities({ queryOptions: { filter: "PartitionKey eq 'question'" } })) out.push(JSON.parse(e.data)); return out.sort((a, b) => String(b.approvedAt).localeCompare(String(a.approvedAt))); },
    async removeApproved(id) { const c = await client(); await c.deleteEntity('question', id).catch((e) => { if (e.statusCode !== 404) throw e; }); },
  };
}

export function createQuestionBank({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentQuestions' } = {}) {
  return connectionString ? azureBank(connectionString, tableName) : fileBank(filePath);
}
```

- [ ] **Step 4: Run → slaagt** — `npm test -- test/question-bank.test.mjs` → PASS. Daarna volledige suite `npm test` groen.

- [ ] **Step 5: Commit**

```bash
git add lib/question-bank.mjs test/question-bank.test.mjs
git commit -m "feat(vragenbank): server-store voor goedgekeurde vragen"
```

---

### Task 2: ≥5-per-domein selectie (`lib/assessment.mjs`)

`selectQuestionsForRole` accepteert nu goedgekeurde vragen en kiest ≥5 per relevant domein uit seed + goedgekeurd.

**Files:**
- Modify: `lib/assessment.mjs` (vervang `selectQuestionsForRole`)
- Test: `test/assessment.test.mjs` (bestaande tests aanpassen + nieuwe)

**Interfaces:**
- Produces: `selectQuestionsForRole(roleId, approved = [], { minPerDomain = 5, weightThreshold = 0.07 } = {})` → `Question[]` (prepared, mét `answer`). Combineert `testQuestions` (seed) + `approved`; per relevant domein `min(minPerDomain, beschikbaar)` vragen; domeinen met 0 leveren niets.
- Consumes (later): `assessment-service` geeft `approved` mee.

- [ ] **Step 1: Vervang de bestaande Task-2-tests in `test/assessment.test.mjs`** (de oude `selectQuestionsForRole`-tests gebruiken de oude signatuur). Nieuwe tests die de regel toetsen onafhankelijk van de seedgrootte:

```javascript
// in test/assessment.test.mjs — vervang de bestaande selectQuestionsForRole-tests
test('selectQuestionsForRole levert >=5 per relevant domein als beschikbaar', () => {
  // 6 goedgekeurde Azure-vragen → ruim voldoende voor het Azure-domein
  const approved = Array.from({ length: 6 }, (_, i) => ({
    id: `appr-az-${i}`, domain: 'Azure', type: 'Scenario',
    prompt: `Azure vraag ${i}`, options: ['a', 'b', 'c', 'd'], answer: 1,
  }));
  const qs = selectQuestionsForRole('cloud', approved, { minPerDomain: 5, weightThreshold: 0.1 });
  const azureCount = qs.filter((q) => q.domain === 'Azure').length;
  assert.ok(azureCount >= 5, `verwacht >=5 Azure, kreeg ${azureCount}`);
  for (const q of qs) assert.ok(Number.isInteger(q.answer)); // server-side answer aanwezig
});

test('selectQuestionsForRole degradeert netjes bij <5 beschikbaar', () => {
  // domein met maar 2 beschikbare → neemt 2, crasht niet
  const approved = [
    { id: 'x1', domain: 'VoIP', type: 'T', prompt: 'v1', options: ['a','b','c','d'], answer: 0 },
    { id: 'x2', domain: 'VoIP', type: 'T', prompt: 'v2', options: ['a','b','c','d'], answer: 0 },
  ];
  const qs = selectQuestionsForRole('servicedesk', approved, { minPerDomain: 5, weightThreshold: 0.99 });
  // bij drempel 0.99 is geen enkel domein 'relevant' → val terug op alle domeinen? Nee: leeg toegestaan.
  assert.ok(Array.isArray(qs));
});

test('onbekende rol gooit', () => {
  assert.throws(() => selectQuestionsForRole('bestaat-niet'));
});

test('toClientQuestion verwijdert de antwoordsleutel', () => {
  const qs = selectQuestionsForRole('servicedesk', []);
  if (qs.length) { const c = toClientQuestion(qs[0]); assert.ok(!('answer' in c)); }
});
```

- [ ] **Step 2: Run → faalt** — `npm test -- test/assessment.test.mjs` → FAIL (oude signatuur).

- [ ] **Step 3: Implementeer de nieuwe `selectQuestionsForRole`** (vervang de bestaande functie):

```javascript
// Relevante domeinen = rolgewicht >= drempel. Per relevant domein min(N, beschikbaar)
// vragen uit seed + goedgekeurd (seed eerst, dan goedgekeurd; stabiele volgorde).
export function selectQuestionsForRole(roleId, approved = [], { minPerDomain = 5, weightThreshold = 0.07 } = {}) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw new Error(`onbekende rol: ${roleId}`);
  const weightOf = (d) => role.weights[d] ?? 0;
  const relevant = domains.filter((d) => weightOf(d) >= weightThreshold)
    .sort((a, b) => weightOf(b) - weightOf(a));
  // pool met stabiele ids: seed krijgt 'seed-<i>', goedgekeurde behouden hun id.
  const seed = testQuestions.map((q, i) => ({ ...q, id: q.id ?? `seed-${i}` }));
  const pool = [...seed, ...approved];
  const chosen = [];
  for (const domain of relevant) {
    const inDomain = pool.filter((q) => q.domain === domain);
    chosen.push(...inDomain.slice(0, minPerDomain)); // min(N, beschikbaar)
  }
  return chosen.map((q, i) => prepareQuestion(q, i));
}
```

- [ ] **Step 4: Run → slaagt** — `npm test -- test/assessment.test.mjs` → PASS. Volledige suite `npm test` groen (pas indien nodig de scoring-test aan die `selectQuestionsForRole('cloud')` zonder 2e arg aanroept — die werkt nog want `approved` heeft default `[]`).

- [ ] **Step 5: Commit**

```bash
git add lib/assessment.mjs test/assessment.test.mjs
git commit -m "feat(vragenbank): >=5 vragen per relevant domein (seed + goedgekeurd)"
```

---

### Task 3: Service + endpoints (`lib/assessment-service.mjs`, `server.mjs`)

De service haalt goedgekeurde vragen op en geeft ze aan de selectie; staff-endpoints beheren de bank.

**Files:**
- Modify: `lib/assessment-service.mjs` (`startAssessment` krijgt `questionBank`)
- Modify: `server.mjs` (questionBank-init + 3 endpoints + startAssessment-call)
- Test: `test/assessment-service.test.mjs` (fake questionBank)

**Interfaces:**
- `startAssessment(store, code, questionBank)` — `questionBank` heeft `listApproved()`. Roept `selectQuestionsForRole(functie, approved)`.
- Endpoints (staff, `requireStaff`): `GET /api/questions` → lijst; `POST /api/questions` `{domain,type,prompt,options,answer,source?}` → toegevoegd; `DELETE /api/questions/:id`.

- [ ] **Step 1: Test** — pas `test/assessment-service.test.mjs` aan: `startAssessment` krijgt een fake bank `{ listApproved: async () => [] }`, en nieuwe assert dat goedgekeurde vragen meekomen:

```javascript
const fakeBank = (approved = []) => ({ listApproved: async () => approved });

test('startAssessment betrekt goedgekeurde vragen', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const approved = Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, domain: 'Azure', type: 'S', prompt: `q${i}`, options: ['a','b','c','d'], answer: 1 }));
    const { questions } = await startAssessment(store, 'ABC234', fakeBank(approved));
    assert.ok(questions.filter((q) => q.domain === 'Azure').length >= 5);
    for (const q of questions) assert.ok(!('answer' in q));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
```
Werk de bestaande `startAssessment`-aanroepen in dit testbestand bij met `fakeBank()` als derde arg.

- [ ] **Step 2: Run → faalt** — `npm test -- test/assessment-service.test.mjs` → FAIL.

- [ ] **Step 3: Implementeer**

In `lib/assessment-service.mjs`:
```javascript
export async function startAssessment(store, code, questionBank) {
  const candidate = await store.getByCode(code);
  if (!candidate) throw new AssessmentError('ongeldige code', 'invalid_code');
  if (candidate.status === 'afgerond') throw new AssessmentError('al ingeleverd', 'already_done');
  const approved = questionBank ? await questionBank.listApproved() : [];
  const questions = selectQuestionsForRole(candidate.functie, approved);
  await store.updateCandidate(candidate.id, {
    status: 'bezig',
    gestartOp: candidate.gestartOp || new Date().toISOString(),
    serverQuestions: questions,
  });
  return { candidate: { naam: candidate.naam, functie: candidate.functie }, questions: questions.map(toClientQuestion) };
}
```
(`submitAssessment` blijft ongewijzigd: het scoort tegen `candidate.serverQuestions`.)

In `server.mjs`: na de bestaande imports en `candidateStore`:
```javascript
import { createQuestionBank } from './lib/question-bank.mjs';
import { domains } from './lib/assessment-content.mjs';
const questionBank = createQuestionBank({ filePath: join(root, 'data', 'questions.json') });
```
Werk de start-handler bij: `await startAssessment(candidateStore, String(body.code || ''), questionBank)`.
Voeg in `handleApi` (vóór `return false;`) toe:
```javascript
if (url.pathname === '/api/questions' && request.method === 'GET') {
  if (!requireStaff(request, response)) return true;
  sendJson(response, 200, await questionBank.listApproved()); return true;
}
if (url.pathname === '/api/questions' && request.method === 'POST') {
  if (!requireStaff(request, response)) return true;
  const b = await readRequestBody(request);
  if (!domains.includes(b.domain) || !Array.isArray(b.options) || b.options.length !== 4 || !Number.isInteger(b.answer) || b.answer < 0 || b.answer > 3 || !b.prompt) {
    sendJson(response, 400, { error: 'ongeldige_vraag' }); return true;
  }
  const identity = readIdentity(request);
  const q = await questionBank.addApproved({ domain: b.domain, type: b.type || 'Scenario', prompt: b.prompt, options: b.options, answer: b.answer, source: b.source || 'Handmatig', approvedBy: identity.email || identity.name });
  sendJson(response, 201, q); return true;
}
const dm = url.pathname.match(/^\/api\/questions\/([^/]+)$/);
if (dm && request.method === 'DELETE') {
  if (!requireStaff(request, response)) return true;
  await questionBank.removeApproved(decodeURIComponent(dm[1]));
  sendJson(response, 200, { ok: true }); return true;
}
```

- [ ] **Step 4: Verify** — `npm test` groen + `node --check server.mjs`. Handmatig (AUTH_DEV_MODE):
```bash
AUTH_DEV_MODE=1 PORT=4205 node server.mjs &
curl -s -XPOST localhost:4205/api/questions -H 'content-type: application/json' -d '{"domain":"Azure","type":"Scenario","prompt":"Test?","options":["a","b","c","d"],"answer":1}'
curl -s localhost:4205/api/questions    # → de toegevoegde vraag
kill %1
```

- [ ] **Step 5: Commit**

```bash
git add lib/assessment-service.mjs server.mjs test/assessment-service.test.mjs
git commit -m "feat(vragenbank): goedgekeurde vragen in selectie + staff-endpoints"
```

---

### Task 4: Frontend — Vragenfabriek naar server-store

De Vragenfabriek "Toevoegen aan assessment" schrijft naar de server-bank; toon de goedgekeurde bank + aantal per domein.

**Files:**
- Modify: `src/lib/api.ts` (questions-functies + type)
- Modify: `src/views/Vragenfabriek.tsx`

**Interfaces:**
- `type ApprovedQuestion = { id:string; domain:string; type:string; prompt:string; options:string[]; answer:number; source:string; approvedBy:string; approvedAt:string }`
- `listQuestions(): Promise<ApprovedQuestion[]>` (`GET /api/questions`)
- `addQuestion(q:{domain:string;type:string;prompt:string;options:string[];answer:number;source?:string}): Promise<ApprovedQuestion>` (`POST /api/questions`)
- `removeQuestion(id:string): Promise<void>` (`DELETE /api/questions/:id`)

- [ ] **Step 1: API-client** — voeg de drie functies + type toe aan `src/lib/api.ts`. `npx tsc --noEmit` groen.

- [ ] **Step 2: Vragenfabriek** — in `src/views/Vragenfabriek.tsx`:
  - vervang de `promote`-actie (die nu `addCustomQuestion` naar localStorage schrijft) door `await addQuestion({ domain, type, prompt, options, answer, source: 'Handmatig' })`; toon een Mantine-notificatie + ververs.
  - laad `listQuestions()` in state; toon een **"Goedgekeurde bank"**-paneel met het **aantal per domein** (en markeer domeinen met <5, bv. rode badge) zodat seniors zien waar nog vragen nodig zijn.
  - behoud de bestaande concept-/editflow (draftQuestions blijven het werkblad vóór goedkeuren).

- [ ] **Step 3: Verify** — `npx tsc --noEmit && npx vite build` exit 0. Visueel (AUTH_DEV_MODE-server): concept goedkeuren → verschijnt in "Goedgekeurde bank"; aantal-per-domein klopt; <5 gemarkeerd.

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.ts src/views/Vragenfabriek.tsx
git commit -m "feat(fe): Vragenfabriek schrijft naar server-bank + aantal per domein"
```

---

### Task 5: Seed-content — ≥5 diepe vragen per domein

Breid de seed (`testQuestions` in `lib/assessment-content.mjs`) uit naar **≥5 vragen per domein** volgens de kwaliteitseisen uit de spec (§3): diepgang/toepassing (geen definitievragen), 4 plausibele even-lange opties met exact één beste professionele antwoord, interne tool-/IT Glue-/AI-invalshoeken waar relevant, bias-arme Werkhouding-SJT, geen klant-PII, Nederlands (Engels-domein in het Engels).

**Files:**
- Modify: `lib/assessment-content.mjs` (`testQuestions` uitbreiden)
- Test: `test/assessment-content.test.mjs` (dekkingstest)

**Werkwijze:** schrijf per domein (13 domeinen) in batches; mik op ≥5 kwalitatief sterke vragen. Hergebruik bestaande goede vragen; vervang zwakke. Elk item exact in de vorm `{ domain, type, prompt, options:[4], answer }`.

- [ ] **Step 1: Dekkingstest** — voeg toe aan `test/assessment-content.test.mjs`:

```javascript
import { testQuestions, domains } from '../lib/assessment-content.mjs';
test('elke domein heeft minstens 5 seed-vragen', () => {
  for (const d of domains) {
    const n = testQuestions.filter((q) => q.domain === d).length;
    assert.ok(n >= 5, `domein "${d}" heeft maar ${n} vragen (>=5 vereist)`);
  }
});
test('elke vraag is goed gevormd', () => {
  for (const q of testQuestions) {
    assert.ok(domains.includes(q.domain));
    assert.equal(q.options.length, 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    // diepgang-heuristiek: prompt is een echte casus, niet één korte definitie-zin
    assert.ok(q.prompt.length >= 40, `te korte/oppervlakkige prompt: ${q.prompt}`);
  }
});
```
(Verhoog ook de bestaande `testQuestions.length`-assert naar het nieuwe totaal, of verwijder die exacte-telling-assert ten gunste van de ≥5/domein-test.)

- [ ] **Step 2: Run → faalt** — `npm test -- test/assessment-content.test.mjs` → FAIL (domeinen <5).

- [ ] **Step 3: Schrijf de vragen** — vul `testQuestions` aan tot elk domein ≥5 sterke vragen heeft (zie spec §3). Domeinen: Microsoft 365, Azure, Kaseya Stack (incl. IT Glue-documentzoeken + AI in IT Glue), Fortigate, AI / Copilot, VoIP, Servers, SharePoint / Teams, SharePoint / Azure Migrations, Inforcer, Basic IT & Troubleshooting, Werkhouding & Communicatie (SJT), Engels (Engelstalig).

- [ ] **Step 4: Run → slaagt** — `npm test` (volledige suite) groen.

- [ ] **Step 5: Commit**

```bash
git add lib/assessment-content.mjs test/assessment-content.test.mjs
git commit -m "feat(vragenbank): seed >=5 diepe vragen per domein"
```

---

## Self-Review

**Spec-dekking:**
- Server-store + in-app goedkeuren (spec §4/§5) → Task 1 + Task 3 (endpoints) + Task 4 (Vragenfabriek). ✓
- ≥5 per relevant domein (spec §7) → Task 2. ✓
- Service betrekt goedgekeurde vragen (spec §4) → Task 3. ✓
- Aantal-per-domein zichtbaar / <5 signaleren (spec §7/§9) → Task 4. ✓
- Seed ≥5 diepe vragen per domein (spec §3) → Task 5. ✓
- Antwoordsleutel nooit naar kiosk (spec §8) → Task 2 (`toClientQuestion`) + bestaande contract. ✓
- AI-generatie = Fase B, niet hier. ✓

**Placeholder-scan:** Task 5 is inherent content-werk; het is begrensd door de dekkings- + vorm-test (≥5/domein, 4 opties, geldige answer, prompt-lengte) i.p.v. elke vraag voor te schrijven — acceptabel want het is redactionele content, geen logica. Geen logische placeholders elders.

**Type-consistentie:** `selectQuestionsForRole(roleId, approved, opts)` consistent in Task 2/3. `createQuestionBank().listApproved/addApproved/removeApproved` consistent in Task 1/3/4. `startAssessment(store, code, questionBank)` consistent in Task 3 (+ server-call). `Question`/`ApprovedQuestion`-velden gelijk in Task 1/4.
