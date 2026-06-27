# Skills Academy SSO-koppeling — Implementatieplan (Fase 1)

> **Voor agentic workers:** gebruik superpowers:subagent-driven-development. Stappen met `- [ ]`.

**Goal:** De Skills Academy koppelen aan het via Entra SSO ingelogde profiel (`/auth/me`) en module-voortgang server-side bewaren op `entraOid`. Plus de Fase 2-spec voor Roland klaarzetten.

**Architecture:** Node `.mjs` backend (file-fallback + Azure Table), React/Mantine frontend. Identiteit via de hub; geen eigen login. `/auth/me` valt buiten `/hub/v1` → aparte helper.

**Tech Stack:** Node http, @azure/data-tables (optioneel), React 19 + Mantine 9 + Vite + TS.

## Global Constraints
- Identiteit uitsluitend via de hub; geen eigen user-store/login.
- `/auth/me` zit buiten `/hub/v1`: gebruik `${HUB_BASE_URL}/auth/me` met `Authorization: Bearer <userToken>`.
- Voortgang gekoppeld aan `entraOid`. Nieuwe endpoints identiteit-gated (geen entraOid → 401).
- Zonder user-token (dev): `/api/me` geeft `{ authenticated: false }`; frontend valt terug op de bestaande mock-learners + localStorage (demo intact).
- Geen secrets naar de browser. `node --check`, `npm test`, `tsc`, `vite build` groen.

---

### Task 1: Backend-libs — hub-me + learning-store

**Files:**
- Create: `lib/hub-me.mjs`
- Create: `lib/learning-store.mjs`
- Test: `test/hub-me.test.mjs`, `test/learning-store.test.mjs`

**Interfaces:**
- Produces: `getMe(userToken, { fetchImpl=fetch }) -> Promise<profile|null>` waarbij profile = `{ name, email, jobTitle, entraOid, department }` (afgeleid uit hub `/auth/me`).
- Produces: `createLearningStore({ filePath, connectionString?, tableName='AssessmentLearning' }) -> { getProgress(entraOid), saveProgress(entraOid, completedModules) }`.

- [ ] **Stap 1: `lib/hub-me.mjs`**
```js
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
```

- [ ] **Stap 2: test `test/hub-me.test.mjs`** — fake fetch: (a) geldig profiel → genormaliseerd object; (b) `userToken` leeg → `null` zonder fetch; (c) non-2xx → `null`.
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMe } from '../lib/hub-me.mjs';

test('getMe zonder token geeft null', async () => {
  assert.equal(await getMe(undefined, { fetchImpl: () => { throw new Error('niet aanroepen'); } }), null);
});
test('getMe normaliseert profiel', async () => {
  process.env.HUB_BASE_URL = 'http://hub.local/api';
  const fake = async () => ({ ok: true, json: async () => ({ name: 'Jip', email: 'jip@campai.nl', jobTitle: 'Cloud Engineer', entraOid: 'oid-1', departments: [{ key: 'cloud', name: 'Cloud' }] }) });
  const me = await getMe('tok', { fetchImpl: fake });
  assert.equal(me.entraOid, 'oid-1'); assert.equal(me.department, 'Cloud'); assert.equal(me.jobTitle, 'Cloud Engineer');
});
test('getMe bij non-2xx geeft null', async () => {
  process.env.HUB_BASE_URL = 'http://hub.local/api';
  const me = await getMe('tok', { fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({}) }) });
  assert.equal(me, null);
});
```

- [ ] **Stap 3: `lib/learning-store.mjs`** — zelfde patroon als `lib/question-bank.mjs` (file + Azure). Record: `{ entraOid, completedModules: string[], updatedAt }`. `getProgress(entraOid)` → record of default `{ entraOid, completedModules: [] }`. `saveProgress(entraOid, completedModules)` → record met nieuwe `updatedAt`. Azure: partitionKey `'learning'`, rowKey `entraOid`, upsert.

- [ ] **Stap 4: test `test/learning-store.test.mjs`** — file-store round-trip: default leeg → save `['m1','m2']` → get geeft die terug; overschrijven met `['m3']` werkt. Gebruik een temp `filePath` in de scratch/temp.

- [ ] **Stap 5: verifieer** `node --check lib/hub-me.mjs lib/learning-store.mjs` en `npm test` groen.

- [ ] **Stap 6: commit** `feat(skills-academy): hub-me + learning-store (voortgang op entraOid)`

---

### Task 2: Server-endpoints + API-client

**Files:**
- Modify: `server.mjs`
- Modify: `src/lib/api.ts`

**Interfaces:**
- Consumes: `getMe` (Task 1), `createLearningStore` (Task 1), bestaande `getUserToken` uit `lib/auth.mjs`.
- Produces (HTTP): `GET /api/me`, `GET /api/learning/me`, `PUT /api/learning/me`.
- Produces (client): `getMe()`, `getLearningProgress()`, `saveLearningProgress(completedModules)`.

- [ ] **Stap 1: server wiring** — in `server.mjs`: importeer `getMe` uit `./lib/hub-me.mjs`, `getUserToken` uit `./lib/auth.mjs`, `createLearningStore` uit `./lib/learning-store.mjs`. Init: `const learningStore = createLearningStore({ filePath: join(root, 'data', 'learning.json') });`. Helper:
```js
async function currentProfile() {
  const token = await getUserToken();
  if (!token) return null;
  return getMe(token);
}
```

- [ ] **Stap 2: endpoints** in `handleApi`:
```js
if (url.pathname === '/api/me' && request.method === 'GET') {
  const me = await currentProfile();
  sendJson(response, 200, me ? { authenticated: true, ...me } : { authenticated: false });
  return true;
}
if (url.pathname === '/api/learning/me' && request.method === 'GET') {
  const me = await currentProfile();
  if (!me?.entraOid) { sendJson(response, 401, { error: 'geen_identiteit' }); return true; }
  sendJson(response, 200, await learningStore.getProgress(me.entraOid));
  return true;
}
if (url.pathname === '/api/learning/me' && request.method === 'PUT') {
  const me = await currentProfile();
  if (!me?.entraOid) { sendJson(response, 401, { error: 'geen_identiteit' }); return true; }
  const b = await readRequestBody(request);
  const completed = Array.isArray(b.completedModules) ? b.completedModules.filter((x) => typeof x === 'string') : [];
  sendJson(response, 200, await learningStore.saveProgress(me.entraOid, completed));
  return true;
}
```
Plaats deze vóór de SPA-fallback, bij de andere `/api`-routes. Let op: PUT-body lezen werkt met de bestaande `readRequestBody` (die method-onafhankelijk de body leest).

- [ ] **Stap 3: API-client** in `src/lib/api.ts`:
```ts
export type MeProfile =
  | { authenticated: false }
  | { authenticated: true; name: string | null; email: string | null; jobTitle: string | null; entraOid: string | null; department: string | null };
export type LearningProgress = { entraOid: string; completedModules: string[]; updatedAt?: string };
export const getMe = () => get<MeProfile>("/api/me");
export const getLearningProgress = () => get<LearningProgress>("/api/learning/me");
export const saveLearningProgress = (completedModules: string[]) =>
  put<LearningProgress>("/api/learning/me", { completedModules });
```
Voeg een `put<T>`-helper toe naast `post`/`get` (zelfde patroon, method `PUT`).

- [ ] **Stap 4: verifieer** `node --check server.mjs`, `npm test`, `npx tsc --noEmit`. Handmatig (AUTH_DEV_MODE + `HUB_USER_TOKEN`): `/api/me` → `{authenticated:true,...}`; zonder token → `{authenticated:false}`; `PUT /api/learning/me` → opgeslagen.

- [ ] **Stap 5: commit** `feat(skills-academy): /api/me + /api/learning/me endpoints en API-client`

---

### Task 3: Skills Academy frontend-integratie

**Files:**
- Modify: `src/views/SkillsAcademy.tsx`

**Interfaces:**
- Consumes: `getMe`, `getLearningProgress`, `saveLearningProgress` (Task 2).

- [ ] **Stap 1: profiel laden** — bij mount `getMe()`.
  - `authenticated: true`: bouw een learner-weergave uit het profiel (`name`, rol = `jobTitle ?? "—"`, afdeling = `department`). Verberg/!gebruik de mock-learner-dropdown voor de live-gebruiker. Laad voltooide modules via `getLearningProgress()`.
  - `authenticated: false`: huidige mock-learners + `localStorage` blijven (ongewijzigd gedrag).
- [ ] **Stap 2: voortgang server-side** — module afvinken roept `saveLearningProgress(next)` aan (optimistic update + foutmelding bij falen). Voor de live-gebruiker NIET meer naar `localStorage` schrijven.
- [ ] **Stap 3: verifieer** `npx tsc --noEmit` + `npx vite build` exit 0. Visueel: met token toont de Academy de ingelogde persoon en bewaart afvinken server-side; zonder token werkt de demo als vanouds.
- [ ] **Stap 4: commit** `feat(skills-academy): toon ingelogd profiel + server-voortgang (fallback naar demo)`

---

### Task 4: Docs — .env + Fase 2-verzoek voor Roland

**Files:**
- Modify: `.env.example`
- Create: `docs/skills-academy-fase2-roland-employees-endpoint.md`

- [ ] **Stap 1: `.env.example`** — voeg een notitie toe bij `HUB_USER_TOKEN`: "Dev: zet hier een hub-gebruikerstoken zodat /api/me en de Skills Academy werken. Prod: via OBO/Easy Auth (zie lib/auth.mjs)."
- [ ] **Stap 2: Roland-verzoek** — `docs/skills-academy-fase2-roland-employees-endpoint.md`: vraag om `GET /hub/v1/employees` (scope `employees:read`) → `[{ id, name, email, jobTitle, department, entraOid }]`, zelfde guard-patroon als `/hub/v1/companies`, geen gevoelige velden. Korte uitleg waarom (volledige medewerkerslijst in de Academy), en dat het optioneel/aanvullend is op `/auth/me`.
- [ ] **Stap 3: commit** `docs(skills-academy): .env-notitie + Fase 2 hub-endpoint-verzoek voor Roland`
