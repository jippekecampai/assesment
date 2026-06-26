# Sollicitant-assessment — Backend-fundament (Plan 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Server-side fundament voor de sollicitant-assessmentflow: gedeelde vragen-/rol-data, deterministische vraagvoorbereiding + functie-filtering, scoring, toegangscodes, een kandidaat-store (Azure Table + lokaal file-fallback), een testbare assessment-service, en de HTTP-endpoints in `server.mjs`.

**Architecture:** Pure logica in losse `lib/*.mjs`-modules (unit-getest met `node --test`); een dunne `assessment-service.mjs` orkestreert store + scoring; `server.mjs` wired alleen HTTP → service en bewaakt auth per endpoint. De kiosk-frontend (Plan 2) krijgt vragen via de API zonder antwoordsleutels.

**Tech Stack:** Node 22 (ES modules `.mjs`), `node:test` + `node:assert/strict`, `@azure/data-tables` (bestaand, optioneel), `node:crypto`. Geen nieuwe npm-dependencies.

## Global Constraints

- ES modules only (`.mjs`); geen TypeScript in `lib/` of `test/`.
- Tests draaien via `npm test` (= `node --test`), bestanden `test/*.test.mjs`, importeren uit `../lib/*.mjs`.
- Geen nieuwe runtime-dependencies; alleen Node built-ins + bestaand `@azure/data-tables`.
- **Antwoordsleutels (`answer`) verlaten de server nooit richting de kiosk.** Scoring is altijd server-side.
- Scoring en filtering zijn **pure functies** (geen I/O, geen globale state).
- Identifiers in het Engels; gebruikersgerichte tekst (waar aanwezig) in het Nederlands.
- Toegangscode is eenmalig: na status `afgerond` weigert `start`.
- Lokaal zonder Azure: file-fallback datastore onder `data/` (bestaand patroon; `data/` is gitignored).

---

### Task 1: Gedeelde assessment-content (`lib/assessment-content.mjs`)

Eén bron van waarheid voor rollen + vragenbank, server-importeerbaar. De data is **identiek** aan de literals die nu in `src/lib/data.ts` staan; we verplaatsen ze naar een plain-JS module zodat de server ze kan gebruiken (Plan 2 laat `data.ts` hieruit lezen).

**Files:**
- Create: `lib/assessment-content.mjs`
- Test: `test/assessment-content.test.mjs`

**Interfaces:**
- Produces: `export const roles` (Array<{id, name, threshold, weights: Record<string,number>}>), `export const domains` (string[]), `export const testQuestions` (Array<{domain, type, prompt, options: string[], answer: number}>), `export const fallbackQuestions` (Record<string, {id, domain, type, isFallback, prompt, options, answer}>), `export const knownSystemOptions` (Record<string, string[]>), `export const unknownOptionLabel` (string).

- [ ] **Step 1: Maak de content-module**

Kopieer de array-/object-literals **verbatim** uit `src/lib/data.ts` naar plain JS (strip TS-types/`as const`/interfaces). Bron-secties in `src/lib/data.ts`:
- `roles` (5 rollen met `weights`)
- `domains` (13 strings)
- `testQuestions` (18 vragen, **rauw** — vóór `prepareAssessmentQuestions`)
- `fallbackQuestions` (object met 5 keys incl. `default`)
- `knownSystemOptions`
- `unknownOptionLabel = "Dit onderwerp is mij niet bekend"`

```javascript
// lib/assessment-content.mjs
// Eén bron van waarheid voor rollen + vragenbank (server + frontend).
// Verbatim uit src/lib/data.ts; rauwe testQuestions (vóór voorbereiding).
export const unknownOptionLabel = "Dit onderwerp is mij niet bekend";

export const roles = [ /* … verbatim uit data.ts … */ ];
export const domains = [ /* … verbatim … */ ];
export const testQuestions = [ /* … 18 rauwe vragen, verbatim … */ ];
export const fallbackQuestions = { /* … verbatim … */ };
export const knownSystemOptions = { /* … verbatim … */ };
```

- [ ] **Step 2: Schrijf de sanity-test**

```javascript
// test/assessment-content.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roles, domains, testQuestions, fallbackQuestions, knownSystemOptions } from '../lib/assessment-content.mjs';

test('roles, domains en vragenbank hebben de verwachte vorm', () => {
  assert.equal(roles.length, 5);
  assert.equal(domains.length, 13);
  assert.equal(testQuestions.length, 18);
  for (const r of roles) {
    assert.ok(typeof r.id === 'string' && typeof r.threshold === 'number');
    // elk rolgewicht hoort bij een bekend domein
    for (const d of Object.keys(r.weights)) assert.ok(domains.includes(d), `onbekend domein ${d}`);
  }
  for (const q of testQuestions) {
    assert.ok(domains.includes(q.domain), `vraag in onbekend domein ${q.domain}`);
    assert.ok(Array.isArray(q.options) && q.options.length === 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
  }
  assert.ok(fallbackQuestions.default && knownSystemOptions['Kaseya Stack']);
});
```

- [ ] **Step 3: Run de test — moet falen**

Run: `npm test -- test/assessment-content.test.mjs`
Expected: FAIL — module bestaat nog niet / data onvolledig.

- [ ] **Step 4: Vul de content-module tot de test slaagt**

Run: `npm test -- test/assessment-content.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/assessment-content.mjs test/assessment-content.test.mjs
git commit -m "feat(assessment): gedeelde vragen-/rol-content als .mjs"
```

---

### Task 2: Vraagvoorbereiding + functie-filtering (`lib/assessment.mjs`)

Port de deterministische voorbereiding (shuffle van antwoordpositie + lengtebalans) naar de server, plus `selectQuestionsForRole`. De server bereidt per kandidaat de vragen voor, serveert ze **zonder** `answer`, en bewaart de antwoordsleutels om te scoren.

**Files:**
- Create: `lib/assessment.mjs`
- Test: `test/assessment.test.mjs`

**Interfaces:**
- Consumes: `roles`, `domains`, `testQuestions` uit `lib/assessment-content.mjs`.
- Produces:
  - `prepareQuestion(question, index)` → muteert/returnt `{id, domain, type, prompt, options[4], answer}` (deterministisch per `id`).
  - `selectQuestionsForRole(roleId, { minQuestions = 10, weightThreshold = 0.07 } = {})` → `Array<preparedQuestion>` (met `answer`, server-side).
  - `toClientQuestion(q)` → `{id, domain, type, prompt, options}` (**zonder** `answer`).

- [ ] **Step 1: Schrijf de tests**

```javascript
// test/assessment.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectQuestionsForRole, toClientQuestion, prepareQuestion } from '../lib/assessment.mjs';
import { roles } from '../lib/assessment-content.mjs';

test('prepareQuestion is deterministisch en houdt 4 opties', () => {
  const q1 = prepareQuestion({ id: 'x', domain: 'Azure', type: 'T', prompt: 'p', options: ['a','b','c','d'], answer: 1 }, 0);
  const q2 = prepareQuestion({ id: 'x', domain: 'Azure', type: 'T', prompt: 'p', options: ['a','b','c','d'], answer: 1 }, 0);
  assert.equal(q1.options.length, 4);
  assert.equal(q1.answer, q2.answer); // zelfde id+index → zelfde positie
});

test('selectQuestionsForRole kiest relevante domeinen en haalt het minimum', () => {
  const cloud = roles.find((r) => r.id === 'cloud');
  const qs = selectQuestionsForRole('cloud', { minQuestions: 10, weightThreshold: 0.1 });
  assert.ok(qs.length >= 10, `verwacht >= 10, kreeg ${qs.length}`);
  // alle gekozen vragen zitten in domeinen die voor cloud meewegen
  for (const q of qs) assert.ok(q.domain in cloud.weights);
  // elke vraag heeft een server-side answer
  for (const q of qs) assert.ok(Number.isInteger(q.answer));
});

test('toClientQuestion verwijdert de antwoordsleutel', () => {
  const qs = selectQuestionsForRole('servicedesk');
  const c = toClientQuestion(qs[0]);
  assert.ok(!('answer' in c));
  assert.deepEqual(Object.keys(c).sort(), ['domain','id','options','prompt','type']);
});

test('onbekende rol gooit', () => {
  assert.throws(() => selectQuestionsForRole('bestaat-niet'));
});
```

- [ ] **Step 2: Run — moet falen**

Run: `npm test -- test/assessment.test.mjs`
Expected: FAIL — `lib/assessment.mjs` bestaat nog niet.

- [ ] **Step 3: Implementeer `lib/assessment.mjs`**

Port de voorbereidingslogica uit `src/lib/data.ts` (functies `seededRandom`, `shuffledIndices`, `expandDistractor`, `balanceOptionLengths`, `prepareAssessmentQuestion`) naar plain JS, plus de selectie:

```javascript
// lib/assessment.mjs
import { roles, domains, testQuestions } from './assessment-content.mjs';

function seededRandom(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () { h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5; return (h >>> 0) / 4294967296; };
}
function shuffledIndices(length, seed) {
  const rng = seededRandom(seed); const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}
function expandDistractor(option, targetLength, domain) {
  if (option.length >= targetLength) return option;
  const suffixes = [
    ' waarbij loganalyse, impactbepaling en vervolgactie niet aantoonbaar worden vastgelegd.',
    ' en daarbij scope, risico, rollback en klantcommunicatie onvoldoende worden meegenomen.',
    ` waarbij de ${domain}-context, governance en auditspoor ontbreken.`,
    ' en pas achteraf beoordelen of dit bij het klantprobleem paste.',
  ];
  let expanded = option;
  for (const s of suffixes) { if (expanded.length >= targetLength) break; expanded += s; }
  return expanded;
}
function balanceOptionLengths(options, correctIndex, domain) {
  const correctLength = options[correctIndex].length;
  return options.map((o, i) => (i === correctIndex ? o : expandDistractor(o, Math.max(58, correctLength - 8), domain)));
}
export function prepareQuestion(question, index) {
  const id = question.id || `q-${index + 1}`;
  const original = question.options.map((text, i) => ({ text, originalIndex: i }));
  const correct = original.find((o) => o.originalIndex === question.answer);
  const distractors = original.filter((o) => o.originalIndex !== question.answer);
  const order = shuffledIndices(distractors.length, `${id}:distractors`).map((i) => distractors[i]);
  const target = [2, 0, 3, 1][index % 4];
  const prepared = [];
  for (let i = 0; i < 4; i += 1) prepared.push(i === target ? correct : order.shift());
  let options = prepared.map((o) => o.text);
  options = balanceOptionLengths(options, target, question.domain);
  return { id, domain: question.domain, type: question.type, prompt: question.prompt, options, answer: target };
}

// Relevantie: domeinen waarvan het rolgewicht >= drempel meeweegt; vul aan met
// de zwaarst-wegende overige domeinen tot het minimum gehaald is.
export function selectQuestionsForRole(roleId, { minQuestions = 10, weightThreshold = 0.07 } = {}) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw new Error(`onbekende rol: ${roleId}`);
  const weightOf = (d) => role.weights[d] ?? 0;
  const relevant = new Set(domains.filter((d) => weightOf(d) >= weightThreshold));
  let picked = testQuestions.filter((q) => relevant.has(q.domain));
  if (picked.length < minQuestions) {
    const extra = testQuestions
      .filter((q) => !relevant.has(q.domain))
      .sort((a, b) => weightOf(b.domain) - weightOf(a.domain));
    picked = [...picked, ...extra].slice(0, Math.max(minQuestions, picked.length));
  }
  return picked.map((q, i) => prepareQuestion({ ...q, id: q.id || `q-${i + 1}` }, i));
}

export function toClientQuestion(q) {
  const { answer, ...rest } = q; // answer eraf
  return rest;
}
```

- [ ] **Step 4: Run — moet slagen**

Run: `npm test -- test/assessment.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/assessment.mjs test/assessment.test.mjs
git commit -m "feat(assessment): vraagvoorbereiding + functie-filtering"
```

---

### Task 3: Scoring + rol-fit (`lib/assessment.mjs` uitbreiden)

**Files:**
- Modify: `lib/assessment.mjs`
- Test: `test/assessment-scoring.test.mjs`

**Interfaces:**
- Produces:
  - `scoreAssessment(answers, questions, roleId)` → `{ domeinScores: Record<string,number>, totaalScore: number, roleFit: { score: number, state: string } }`.
  - `answers` = `Array<{ questionId, choice }>`; `questions` = de **server-side** lijst met `answer` (uit `selectQuestionsForRole`).

- [ ] **Step 1: Schrijf de tests**

```javascript
// test/assessment-scoring.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectQuestionsForRole, scoreAssessment } from '../lib/assessment.mjs';

test('alles goed → 100 per domein en rol-fit Sterke fit', () => {
  const qs = selectQuestionsForRole('cloud');
  const answers = qs.map((q) => ({ questionId: q.id, choice: q.answer }));
  const res = scoreAssessment(answers, qs, 'cloud');
  for (const d of Object.keys(res.domeinScores)) assert.equal(res.domeinScores[d], 100);
  assert.equal(res.totaalScore, 100);
  assert.equal(res.roleFit.state, 'Sterke fit');
});

test('alles fout → 0 en Niet geschikt', () => {
  const qs = selectQuestionsForRole('cloud');
  const answers = qs.map((q) => ({ questionId: q.id, choice: (q.answer + 1) % 4 }));
  const res = scoreAssessment(answers, qs, 'cloud');
  assert.equal(res.totaalScore, 0);
  assert.equal(res.roleFit.state, 'Niet geschikt');
});

test('onbeantwoorde vraag telt als fout', () => {
  const qs = selectQuestionsForRole('servicedesk');
  const res = scoreAssessment([], qs, 'servicedesk'); // niets beantwoord
  assert.equal(res.totaalScore, 0);
});
```

- [ ] **Step 2: Run — moet falen**

Run: `npm test -- test/assessment-scoring.test.mjs`
Expected: FAIL — `scoreAssessment` bestaat nog niet.

- [ ] **Step 3: Voeg scoring + fit toe aan `lib/assessment.mjs`**

```javascript
// onderaan lib/assessment.mjs toevoegen
function scoreState(score, threshold = 70) {
  if (score >= threshold + 10) return 'Sterke fit';
  if (score >= threshold) return 'Geschikt';
  if (score >= threshold - 8) return 'Borderline';
  return 'Niet geschikt';
}
function roleScoreFromDomains(domeinScores, role) {
  const entries = Object.entries(role.weights).filter(([d]) => d in domeinScores);
  const total = entries.reduce((t, [, w]) => t + w, 0) || 1;
  return Math.round(entries.reduce((t, [d, w]) => t + domeinScores[d] * (w / total), 0));
}
export function scoreAssessment(answers, questions, roleId) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw new Error(`onbekende rol: ${roleId}`);
  const byId = new Map(answers.map((a) => [a.questionId, a.choice]));
  const perDomain = new Map(); // domain -> {goed, totaal}
  for (const q of questions) {
    const bucket = perDomain.get(q.domain) || { goed: 0, totaal: 0 };
    bucket.totaal += 1;
    if (byId.get(q.id) === q.answer) bucket.goed += 1;
    perDomain.set(q.domain, bucket);
  }
  const domeinScores = {};
  for (const [d, b] of perDomain) domeinScores[d] = Math.round((100 * b.goed) / b.totaal);
  const vals = Object.values(domeinScores);
  const totaalScore = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  const fitScore = roleScoreFromDomains(domeinScores, role);
  return { domeinScores, totaalScore, roleFit: { score: fitScore, state: scoreState(fitScore, role.threshold) } };
}
```

- [ ] **Step 4: Run — moet slagen**

Run: `npm test -- test/assessment-scoring.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/assessment.mjs test/assessment-scoring.test.mjs
git commit -m "feat(assessment): server-side scoring + rol-fit"
```

---

### Task 4: Toegangscodes (`lib/codes.mjs`)

**Files:**
- Create: `lib/codes.mjs`
- Test: `test/codes.test.mjs`

**Interfaces:**
- Produces: `generateCode()` → string van 6 niet-ambigue tekens (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, dus zonder `I/O/0/1`); `CODE_ALPHABET` (string); `isValidCodeFormat(code)` → boolean.

- [ ] **Step 1: Schrijf de tests**

```javascript
// test/codes.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateCode, isValidCodeFormat, CODE_ALPHABET } from '../lib/codes.mjs';

test('generateCode levert 6 niet-ambigue tekens', () => {
  for (let i = 0; i < 200; i += 1) {
    const c = generateCode();
    assert.equal(c.length, 6);
    for (const ch of c) assert.ok(CODE_ALPHABET.includes(ch), `ambigu teken ${ch}`);
  }
});

test('alfabet bevat geen I, O, 0 of 1', () => {
  for (const ch of 'IO01') assert.ok(!CODE_ALPHABET.includes(ch));
});

test('isValidCodeFormat accepteert geldige en weigert ongeldige', () => {
  assert.ok(isValidCodeFormat(generateCode()));
  assert.ok(!isValidCodeFormat('abc'));      // te kort / kleine letters
  assert.ok(!isValidCodeFormat('ABC1O0'));   // ambigu
  assert.ok(!isValidCodeFormat(''));
});
```

- [ ] **Step 2: Run — moet falen**

Run: `npm test -- test/codes.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementeer `lib/codes.mjs`**

```javascript
// lib/codes.mjs
import { randomInt } from 'node:crypto';
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // geen I O 0 1
const CODE_LENGTH = 6;
export function generateCode() {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}
export function isValidCodeFormat(code) {
  return typeof code === 'string' && code.length === CODE_LENGTH && [...code].every((ch) => CODE_ALPHABET.includes(ch));
}
```

- [ ] **Step 4: Run — moet slagen**

Run: `npm test -- test/codes.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/codes.mjs test/codes.test.mjs
git commit -m "feat(assessment): niet-ambigue toegangscodes"
```

---

### Task 5: Kandidaat-store (`lib/candidate-store.mjs`)

Persistente opslag voor sollicitanten + resultaten. Azure Table indien geconfigureerd, anders een lokaal JSON-bestand. **Pad injecteerbaar** zodat tests een temp-bestand gebruiken.

**Files:**
- Create: `lib/candidate-store.mjs`
- Test: `test/candidate-store.test.mjs`

**Interfaces:**
- Produces: `createStore({ filePath })` → object met async methodes:
  - `createCandidate({ naam, email, functie, code, aangemaaktDoor })` → `candidate` (incl. `id`, `status: 'uitgenodigd'`, `aangemaaktOp`).
  - `getByCode(code)` → `candidate | null`.
  - `listCandidates()` → `candidate[]` (nieuwste eerst).
  - `updateCandidate(id, patch)` → `candidate`.
  - `saveResult(candidateId, result)` → `void`; `getResult(candidateId)` → `result | null`.
- Candidate-statussen: `'uitgenodigd' | 'bezig' | 'afgerond'`.

- [ ] **Step 1: Schrijf de tests (lokaal file-fallback via temp-pad)**

```javascript
// test/candidate-store.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../lib/candidate-store.mjs';

function tmpStore() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-store-'));
  return { store: createStore({ filePath: join(dir, 'candidates.json') }), dir };
}

test('createCandidate + getByCode round-trip', async () => {
  const { store, dir } = tmpStore();
  try {
    const c = await store.createCandidate({ naam: 'Test Persoon', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'reviewer@campai.nl' });
    assert.ok(c.id);
    assert.equal(c.status, 'uitgenodigd');
    const found = await store.getByCode('ABC234');
    assert.equal(found.id, c.id);
    assert.equal(await store.getByCode('NOPE99'), null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('updateCandidate en saveResult/getResult', async () => {
  const { store, dir } = tmpStore();
  try {
    const c = await store.createCandidate({ naam: 'X', functie: 'sales', code: 'ABC235', aangemaaktDoor: 'r@c.nl' });
    const upd = await store.updateCandidate(c.id, { status: 'afgerond', ingediendOp: '2026-06-26T12:00:00Z' });
    assert.equal(upd.status, 'afgerond');
    await store.saveResult(c.id, { totaalScore: 80, domeinScores: { Azure: 80 }, antwoorden: [] });
    const r = await store.getResult(c.id);
    assert.equal(r.totaalScore, 80);
    const list = await store.listCandidates();
    assert.equal(list.length, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
```

- [ ] **Step 2: Run — moet falen**

Run: `npm test -- test/candidate-store.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementeer `lib/candidate-store.mjs`**

Lokaal: één JSON-bestand `{ candidates: [], results: {} }`. (Azure Table-pad is een dunne variant met dezelfde interface; voor nu volstaat file-fallback + de Azure-tak als optionele uitbreiding — markeer met een `TODO Azure`-commentaar maar laat de file-fallback de geteste code zijn.)

```javascript
// lib/candidate-store.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

async function load(filePath) {
  try { return JSON.parse(await readFile(filePath, 'utf8')); }
  catch { return { candidates: [], results: {} }; }
}
async function persist(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

export function createStore({ filePath }) {
  return {
    async createCandidate({ naam, email = null, functie, code, aangemaaktDoor }) {
      const data = await load(filePath);
      const candidate = {
        id: randomUUID(), naam, email, functie, code,
        status: 'uitgenodigd', aangemaaktDoor,
        aangemaaktOp: new Date().toISOString(), gestartOp: null, ingediendOp: null,
      };
      data.candidates.unshift(candidate);
      await persist(filePath, data);
      return candidate;
    },
    async getByCode(code) {
      const data = await load(filePath);
      return data.candidates.find((c) => c.code === code) || null;
    },
    async listCandidates() {
      const data = await load(filePath);
      return data.candidates;
    },
    async updateCandidate(id, patch) {
      const data = await load(filePath);
      const c = data.candidates.find((x) => x.id === id);
      if (!c) throw new Error(`onbekende kandidaat: ${id}`);
      Object.assign(c, patch);
      await persist(filePath, data);
      return c;
    },
    async saveResult(candidateId, result) {
      const data = await load(filePath);
      data.results[candidateId] = result;
      await persist(filePath, data);
    },
    async getResult(candidateId) {
      const data = await load(filePath);
      return data.results[candidateId] || null;
    },
  };
}
```

- [ ] **Step 4: Run — moet slagen**

Run: `npm test -- test/candidate-store.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/candidate-store.mjs test/candidate-store.test.mjs
git commit -m "feat(assessment): kandidaat-store met file-fallback"
```

---

### Task 6: Assessment-service (`lib/assessment-service.mjs`)

Dunne orkestratie boven store + assessment-logica, **zonder HTTP** — daardoor volledig testbaar.

**Files:**
- Create: `lib/assessment-service.mjs`
- Test: `test/assessment-service.test.mjs`

**Interfaces:**
- Consumes: een `store` (Task 5), `selectQuestionsForRole`/`toClientQuestion`/`scoreAssessment` (Task 2/3).
- Produces:
  - `startAssessment(store, code)` → `{ candidate: {naam, functie}, questions: clientQuestion[] }` of gooit `AssessmentError` met `.code` (`'invalid_code' | 'already_done'`).
  - `submitAssessment(store, code, answers)` → `{ totaalScore, domeinScores }` (kandidaat-weergave, **zonder** roleFit). Slaat het volledige resultaat (incl. roleFit + antwoorden) op via de store en zet status `afgerond`.
- `class AssessmentError extends Error { constructor(message, code) }`.

- [ ] **Step 1: Schrijf de tests**

```javascript
// test/assessment-service.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../lib/candidate-store.mjs';
import { startAssessment, submitAssessment, AssessmentError } from '../lib/assessment-service.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-svc-'));
  return { store: createStore({ filePath: join(dir, 'c.json') }), dir };
}

test('start levert vragen zonder antwoordsleutel en zet status bezig', async () => {
  const { store, dir } = fresh();
  try {
    const c = await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { candidate, questions } = await startAssessment(store, 'ABC234');
    assert.equal(candidate.functie, 'cloud');
    assert.ok(questions.length > 0);
    for (const q of questions) assert.ok(!('answer' in q));
    assert.equal((await store.getByCode('ABC234')).status, 'bezig');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('ongeldige code gooit invalid_code', async () => {
  const { store, dir } = fresh();
  try {
    await assert.rejects(() => startAssessment(store, 'ZZZZ99'), (e) => e instanceof AssessmentError && e.code === 'invalid_code');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('submit scoort, slaat op, zet afgerond en geeft GEEN roleFit terug', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { questions } = await startAssessment(store, 'ABC234');
    // we kennen de answers niet client-side; simuleer "alles eerste optie"
    const answers = questions.map((q) => ({ questionId: q.id, choice: 0 }));
    const out = await submitAssessment(store, 'ABC234', answers);
    assert.ok('totaalScore' in out && 'domeinScores' in out);
    assert.ok(!('roleFit' in out)); // kandidaat ziet geen fit
    const c = await store.getByCode('ABC234');
    assert.equal(c.status, 'afgerond');
    const saved = await store.getResult(c.id);
    assert.ok(saved.roleFit); // reviewer-data bevat wél de fit
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('start op afgeronde code gooit already_done', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { questions } = await startAssessment(store, 'ABC234');
    await submitAssessment(store, 'ABC234', questions.map((q) => ({ questionId: q.id, choice: 0 })));
    await assert.rejects(() => startAssessment(store, 'ABC234'), (e) => e.code === 'already_done');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
```

- [ ] **Step 2: Run — moet falen**

Run: `npm test -- test/assessment-service.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementeer `lib/assessment-service.mjs`**

Belangrijk: `start` bereidt de vragenset voor en **bewaart de server-side vragen (met `answer`)** op de kandidaat, zodat `submit` tegen exact dezelfde set scoort.

```javascript
// lib/assessment-service.mjs
import { selectQuestionsForRole, toClientQuestion, scoreAssessment } from './assessment.mjs';

export class AssessmentError extends Error {
  constructor(message, code) { super(message); this.name = 'AssessmentError'; this.code = code; }
}

export async function startAssessment(store, code) {
  const candidate = await store.getByCode(code);
  if (!candidate) throw new AssessmentError('ongeldige code', 'invalid_code');
  if (candidate.status === 'afgerond') throw new AssessmentError('al ingeleverd', 'already_done');
  const questions = selectQuestionsForRole(candidate.functie);
  await store.updateCandidate(candidate.id, {
    status: 'bezig',
    gestartOp: candidate.gestartOp || new Date().toISOString(),
    serverQuestions: questions, // met answer; nooit naar de client
  });
  return { candidate: { naam: candidate.naam, functie: candidate.functie }, questions: questions.map(toClientQuestion) };
}

export async function submitAssessment(store, code, answers) {
  const candidate = await store.getByCode(code);
  if (!candidate) throw new AssessmentError('ongeldige code', 'invalid_code');
  if (candidate.status === 'afgerond') throw new AssessmentError('al ingeleverd', 'already_done');
  const questions = candidate.serverQuestions || selectQuestionsForRole(candidate.functie);
  const { domeinScores, totaalScore, roleFit } = scoreAssessment(answers, questions, candidate.functie);
  await store.saveResult(candidate.id, {
    functie: candidate.functie, antwoorden: answers, domeinScores, totaalScore, roleFit,
    ingediendOp: new Date().toISOString(),
  });
  await store.updateCandidate(candidate.id, { status: 'afgerond', ingediendOp: new Date().toISOString() });
  return { totaalScore, domeinScores }; // GEEN roleFit naar de kandidaat
}
```

- [ ] **Step 4: Run — moet slagen**

Run: `npm test -- test/assessment-service.test.mjs`
Expected: PASS.

- [ ] **Step 5: Run de volledige suite + commit**

Run: `npm test`
Expected: alle tests groen (bestaande 15 + nieuwe).

```bash
git add lib/assessment-service.mjs test/assessment-service.test.mjs
git commit -m "feat(assessment): testbare assessment-service (start/submit)"
```

---

### Task 7: HTTP-endpoints + auth in `server.mjs`

Wire de service op HTTP en bewaak auth per endpoint. Niet unit-getest (HTTP-laag); geverifieerd met `curl`.

**Files:**
- Modify: `server.mjs` (imports boven; nieuwe handlers in `handleApi`)

**Interfaces:**
- Consumes: `createStore`, `startAssessment`/`submitAssessment`/`AssessmentError`, `generateCode`, `roles`.
- Endpoints:
  - `GET  /api/candidates` (staff) → lijst (zonder `serverQuestions`).
  - `POST /api/candidates` (staff) `{ naam, email?, functie }` → `{ candidate, code }`.
  - `POST /api/assessment/start` (code) `{ code }` → `{ candidate, questions }`.
  - `POST /api/assessment/submit` (code) `{ code, answers }` → `{ totaalScore, domeinScores }`.

- [ ] **Step 1: Imports + store-init bovenin `server.mjs`**

```javascript
import { createStore } from './lib/candidate-store.mjs';
import { startAssessment, submitAssessment, AssessmentError } from './lib/assessment-service.mjs';
import { generateCode } from './lib/codes.mjs';
import { roles } from './lib/assessment-content.mjs';
// na de bestaande const-definities:
const candidateStore = createStore({ filePath: join(root, 'data', 'candidates.json') });
function requireStaff(request, response) {
  if (!request.headers['x-ms-client-principal'] && !process.env.AUTH_DEV_MODE) {
    sendJson(response, 401, { error: 'auth_required' }); return false;
  }
  return true;
}
```

- [ ] **Step 2: Voeg de handlers toe in `handleApi` (vóór de afsluitende `return false;`)**

```javascript
if (url.pathname === '/api/candidates' && request.method === 'GET') {
  if (!requireStaff(request, response)) return true;
  const list = (await candidateStore.listCandidates()).map(({ serverQuestions, ...c }) => c);
  sendJson(response, 200, list); return true;
}
if (url.pathname === '/api/candidates' && request.method === 'POST') {
  if (!requireStaff(request, response)) return true;
  const body = await readRequestBody(request);
  if (!body.naam || !roles.some((r) => r.id === body.functie)) { sendJson(response, 400, { error: 'naam_en_functie_vereist' }); return true; }
  const code = generateCode();
  const identity = readIdentity(request);
  const candidate = await candidateStore.createCandidate({ naam: body.naam, email: body.email || null, functie: body.functie, code, aangemaaktDoor: identity.email || identity.name });
  const { serverQuestions, ...safe } = candidate;
  sendJson(response, 201, { candidate: safe, code }); return true;
}
if (url.pathname === '/api/assessment/start' && request.method === 'POST') {
  const body = await readRequestBody(request);
  try { sendJson(response, 200, await startAssessment(candidateStore, String(body.code || ''))); }
  catch (e) { sendJson(response, e instanceof AssessmentError ? (e.code === 'already_done' ? 410 : 401) : 500, { error: e.code || 'server_error' }); }
  return true;
}
if (url.pathname === '/api/assessment/submit' && request.method === 'POST') {
  const body = await readRequestBody(request);
  try { sendJson(response, 200, await submitAssessment(candidateStore, String(body.code || ''), Array.isArray(body.answers) ? body.answers : [])); }
  catch (e) { sendJson(response, e instanceof AssessmentError ? (e.code === 'already_done' ? 410 : 401) : 500, { error: e.code || 'server_error' }); }
  return true;
}
```

- [ ] **Step 3: Syntax-check**

Run: `node --check server.mjs`
Expected: exit 0.

- [ ] **Step 4: Handmatige end-to-end met curl (AUTH_DEV_MODE)**

```bash
# start server in dev (staff-auth uitgeschakeld voor lokaal testen)
AUTH_DEV_MODE=1 PORT=4199 node server.mjs &
# 1) sollicitant aanmaken
curl -s -XPOST localhost:4199/api/candidates -H 'content-type: application/json' -d '{"naam":"Test Sollicitant","functie":"cloud"}'
#    → { "candidate": {...,"status":"uitgenodigd"}, "code":"XXXXXX" }
# 2) start met de code uit stap 1
curl -s -XPOST localhost:4199/api/assessment/start -H 'content-type: application/json' -d '{"code":"XXXXXX"}'
#    → vragen ZONDER "answer"
# 3) submit (alles choice 0)
curl -s -XPOST localhost:4199/api/assessment/submit -H 'content-type: application/json' -d '{"code":"XXXXXX","answers":[]}'
#    → { "totaalScore":..., "domeinScores":{...} }  (geen roleFit)
# 4) lijst
curl -s localhost:4199/api/candidates
#    → de sollicitant met status "afgerond"
```
Expected: stap 1 geeft een code; stap 2 vragen zonder `answer`; stap 3 score zonder `roleFit`; stap 4 status `afgerond`. Stop de server daarna (`kill %1`).

- [ ] **Step 5: Commit**

```bash
git add server.mjs
git commit -m "feat(assessment): HTTP-endpoints candidates + assessment start/submit"
```

---

## Self-Review

**Spec-dekking (Plan 1 = backend-deel van de spec):**
- Datamodel §4 → Task 5 (Candidate/Result velden). ✓
- Vragen filteren op functie §6 → Task 2 (`selectQuestionsForRole`). ✓
- Scoring §7 → Task 3 (`scoreAssessment` + rol-fit reviewer-only). ✓
- Kandidaat ziet geen fit §5 → Task 6 (`submitAssessment` returnt geen `roleFit`). ✓
- Code eenmalig §10 → Task 6 (`already_done`). ✓
- Antwoordsleutels niet naar client §10 → Task 2 (`toClientQuestion`) + Task 6. ✓
- Server-side opslag §4 → Task 5. ✓
- Auth per endpoint §10 → Task 7 (`requireStaff`). ✓
- **Plan 2 (frontend) dekt:** kiosk-UI, Sollicitanten-scherm, dashboard op echte data, SJT-content, Easy-Auth allow-anonymous. (Buiten dit plan.)

**Placeholder-scan:** Task 1 verwijst voor de grote dataset naar "verbatim uit `src/lib/data.ts`" — dit is bestaande, exacte data (geen logica), met een sanity-test die de vorm afdwingt; acceptabel. De Azure-tak in Task 5 is bewust een `TODO`-uitbreiding met de file-fallback als geteste code. Geen logische placeholders.

**Type-consistentie:** `selectQuestionsForRole` → questions met `answer`; `toClientQuestion` strip `answer`; `scoreAssessment(answers, questions, roleId)` met `answers: {questionId, choice}` — consistent in Task 2/3/6. Store-methodes identiek gebruikt in Task 5/6. `AssessmentError.code` waarden (`invalid_code`/`already_done`) consistent in Task 6/7.
