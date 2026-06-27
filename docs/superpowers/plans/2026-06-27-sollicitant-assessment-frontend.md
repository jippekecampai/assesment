# Sollicitant-assessment — Frontend + afronding (Plan 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De kandidaat-kiosk (code-start + vergrendelde test + uitslag), het Sollicitanten-beheerscherm, het Reviewdashboard op echte data, bias-arme werkhoudingsvragen, en Easy-Auth op allow-anonymous — bovenop de backend uit Plan 1.

**Architecture:** Eén React/Vite-SPA, gesplitst op route: `/test*` rendert de kiosk-shell (geen sidebar, code-gated), al het andere de bestaande medewerker-`AppShell` (Entra). De frontend praat met de Plan 1-endpoints via een kleine typed API-client. Geen antwoordsleutels/rol-fit in de kiosk.

**Tech Stack:** React 19 + Mantine 9 + Vite 7 (frontend), TypeScript. Backend (Plan 1) is `.mjs` + `server.mjs`. Geen testrunner voor React → verificatie via `npx tsc --noEmit` + `npx vite build` + Playwright-screenshots. Backend-content-wijziging blijft getest met `node --test`.

## Global Constraints

- Mantine + `campaiTheme`; geen nieuwe UI-library. Nederlandse UI-copy.
- Kiosk (`/test*`) mag NOOIT: navigatie naar de medewerker-app tonen, `answer` of `roleFit` ontvangen/tonen. Kandidaat ziet score + domein-uitslag, GEEN rol-fit/hire-advies.
- Frontend praat met de backend via deze endpoints (Plan 1, bestaand):
  - `POST /api/assessment/start` `{code}` → `{ candidate:{naam,functie}, questions:[{id,domain,type,prompt,options}] }` (geen `answer`).
  - `POST /api/assessment/submit` `{code, answers:[{questionId,choice}]}` → `{ totaalScore, domeinScores }` (geen `roleFit`).
  - `GET /api/candidates` (staff) → `[{id,naam,email,functie,code,status,aangemaaktOp,...}]` (geen `serverQuestions`).
  - `POST /api/candidates` (staff) `{naam,email?,functie}` → `{ candidate, code }`.
  - `GET /api/results` (staff, bestaand) — voor reviewer-resultaten.
- Functie = rol-id uit `roles` (`servicedesk|cloud|modernwork|sales|tam`).
- Verificatie per UI-taak: `npx tsc --noEmit` groen + `npx vite build` groen; visuele check waar genoemd.
- Geen wijziging aan Roland's repo (read-only).

---

### Task 1: Typed API-client (`src/lib/api.ts`)

**Files:**
- Create: `src/lib/api.ts`

**Interfaces:**
- Produces:
  - `type ClientQuestion = { id:string; domain:string; type:string; prompt:string; options:string[] }`
  - `type StartResponse = { candidate:{naam:string;functie:string}; questions:ClientQuestion[] }`
  - `type SubmitResponse = { totaalScore:number; domeinScores:Record<string,number> }`
  - `type Candidate = { id:string; naam:string; email:string|null; functie:string; code:string; status:'uitgenodigd'|'bezig'|'afgerond'; aangemaaktOp:string; gestartOp:string|null; ingediendOp:string|null }`
  - `async function startAssessment(code:string): Promise<StartResponse>` (throws `ApiError` with `.code`/`.status`)
  - `async function submitAssessment(code:string, answers:{questionId:string;choice:number}[]): Promise<SubmitResponse>`
  - `async function listCandidates(): Promise<Candidate[]>`
  - `async function createCandidate(input:{naam:string;email?:string;functie:string}): Promise<{candidate:Candidate;code:string}>`
  - `class ApiError extends Error { status:number; code?:string }`

- [ ] **Step 1: Implement `src/lib/api.ts`**

```typescript
export type ClientQuestion = { id: string; domain: string; type: string; prompt: string; options: string[] };
export type StartResponse = { candidate: { naam: string; functie: string }; questions: ClientQuestion[] };
export type SubmitResponse = { totaalScore: number; domeinScores: Record<string, number> };
export type CandidateStatus = "uitgenodigd" | "bezig" | "afgerond";
export type Candidate = {
  id: string; naam: string; email: string | null; functie: string; code: string;
  status: CandidateStatus; aangemaaktOp: string; gestartOp: string | null; ingediendOp: string | null;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) { super(message); this.status = status; this.code = code; }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `HTTP ${res.status}`, data.error);
  return data as T;
}
async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  return data as T;
}

export const startAssessment = (code: string) => post<StartResponse>("/api/assessment/start", { code });
export const submitAssessment = (code: string, answers: { questionId: string; choice: number }[]) =>
  post<SubmitResponse>("/api/assessment/submit", { code, answers });
export const listCandidates = () => get<Candidate[]>("/api/candidates");
export const createCandidate = (input: { naam: string; email?: string; functie: string }) =>
  post<{ candidate: Candidate; code: string }>("/api/candidates", input);
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat(fe): typed API-client voor assessment-endpoints"
```

---

### Task 2: Route-split kiosk vs medewerker-app (`src/main.tsx`)

De SPA rendert de kiosk op `/test*`, anders de bestaande `App`. Beide binnen dezelfde `MantineProvider`.

**Files:**
- Modify: `src/main.tsx`
- Create: `src/kiosk/Kiosk.tsx` (router-loze top-level kiosk-shell — voor nu een placeholder die in Task 3/4 gevuld wordt)

**Interfaces:**
- Produces: `Kiosk` component (default export from `src/kiosk/Kiosk.tsx`).
- Consumes: existing `App` from `src/App.tsx`, `campaiTheme`.

- [ ] **Step 1: Maak de kiosk-shell placeholder**

```tsx
// src/kiosk/Kiosk.tsx
import { Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconClipboardCheck } from "@tabler/icons-react";

export default function Kiosk() {
  return (
    <Center mih="100vh" bg="campaiNavy.0">
      <Stack align="center" gap="md">
        <ThemeIcon size={56} radius="md" color="campaiNavy"><IconClipboardCheck size={32} /></ThemeIcon>
        <Text fw={800} ff="heading" c="campaiNavy.7">Campai Assessment</Text>
        <Text c="dimmed" size="sm">Kiosk — wordt gevuld in de volgende stap.</Text>
      </Stack>
    </Center>
  );
}
```

- [ ] **Step 2: Splits in `src/main.tsx`**

In `src/main.tsx`, kies op basis van het pad welke top-level component rendert (binnen de bestaande providers). Voeg toe (na de imports): `const isKiosk = window.location.pathname.startsWith("/test");` en render `{isKiosk ? <Kiosk /> : <App />}` in plaats van alleen `<App />`. Importeer `Kiosk` lazy of direct. Laat `MantineProvider`/`ColorSchemeScript`/`QueryClientProvider`/`Notifications` ongewijzigd om beide heen staan.

- [ ] **Step 3: Verifieer build + beide routes**

Run: `npx tsc --noEmit && npx vite build`
Expected: exit 0 voor beide.
Visueel (dev): `npm run dev`, open `/` (medewerker-AppShell) én `/test` (kiosk-placeholder) — bevestig dat `/test` GEEN sidebar/nav toont.

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx src/kiosk/Kiosk.tsx
git commit -m "feat(fe): route-split kiosk (/test) vs medewerker-app"
```

---

### Task 3: Kiosk — startscherm met code (`src/kiosk/`)

**Files:**
- Modify: `src/kiosk/Kiosk.tsx` (state machine: `start` → `running` → `done`)
- Create: `src/kiosk/StartScreen.tsx`

**Interfaces:**
- `StartScreen` props: `{ onStarted: (code: string, data: StartResponse) => void }`.
- Consumes: `startAssessment`, `ApiError` uit `src/lib/api.ts`.

- [ ] **Step 1: StartScreen**

```tsx
// src/kiosk/StartScreen.tsx
import { useState } from "react";
import { Button, Card, Center, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { IconClipboardCheck } from "@tabler/icons-react";
import { startAssessment, ApiError, type StartResponse } from "../lib/api";

export function StartScreen({ onStarted }: { onStarted: (code: string, data: StartResponse) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function begin() {
    setBusy(true); setError(null);
    try {
      const data = await startAssessment(code.trim().toUpperCase());
      onStarted(code.trim().toUpperCase(), data);
    } catch (e) {
      const err = e as ApiError;
      setError(err.code === "already_done" ? "Deze test is al ingeleverd." : "Ongeldige code. Controleer en probeer opnieuw.");
    } finally { setBusy(false); }
  }

  return (
    <Center mih="100vh" bg="campaiNavy.0" p="md">
      <Card withBorder radius="md" p="xl" w={420}>
        <Stack align="center" gap="md">
          <ThemeIcon size={56} radius="md" color="campaiNavy"><IconClipboardCheck size={32} /></ThemeIcon>
          <Title order={2} fz="xl" c="campaiNavy.7">Start assessment</Title>
          <Text c="dimmed" size="sm" ta="center">Voer de toegangscode in die je van Campai hebt gekregen.</Text>
          <TextInput
            value={code} onChange={(e) => setCode(e.currentTarget.value)} placeholder="BV. ABC234"
            size="lg" w="100%" styles={{ input: { textAlign: "center", letterSpacing: 4, textTransform: "uppercase" } }}
            error={error} onKeyDown={(e) => e.key === "Enter" && begin()}
          />
          <Button fullWidth size="md" color="campaiNavy" loading={busy} disabled={code.trim().length < 6} onClick={begin}>
            Start
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
```

- [ ] **Step 2: Wire in Kiosk state**

In `src/kiosk/Kiosk.tsx`: `const [phase,setPhase]=useState<'start'|'running'|'done'>('start')`, plus `code`, `startData`, `result` state. In `start` render `<StartScreen onStarted={(c,d)=>{setCode(c);setStartData(d);setPhase('running')}} />`. Render the runner/result in Task 4 (for now `running`/`done` can render a placeholder Text).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx vite build` → exit 0.
Visueel: `/test` toont het code-startscherm; foute code → nette foutmelding (test met een willekeurige code tegen een lokaal draaiende `npm run server` met AUTH_DEV_MODE + een aangemaakte kandidaat, of bevestig de UI-staat).

- [ ] **Step 4: Commit**

```bash
git add src/kiosk/
git commit -m "feat(fe): kiosk startscherm met toegangscode"
```

---

### Task 4: Kiosk — vergrendelde test + uitslag (`src/kiosk/`)

**Files:**
- Create: `src/kiosk/AssessmentRunner.tsx`, `src/kiosk/ResultScreen.tsx`
- Modify: `src/kiosk/Kiosk.tsx`

**Interfaces:**
- `AssessmentRunner` props: `{ code:string; data:StartResponse; onDone:(r:SubmitResponse)=>void }`.
- `ResultScreen` props: `{ result:SubmitResponse }`.
- Consumes: `submitAssessment`, types from `src/lib/api.ts`. Mantine `Progress`, `Radio`, `Card`, `Button`.

- [ ] **Step 1: AssessmentRunner** — één vraag per keer, voortgangsbalk, geen nav. Lokale `answers` state (`Record<questionId, choice>`), met autosave naar `sessionStorage` (sleutel per code) zodat refresh hervat. Laatste vraag → knop "Inleveren" → `submitAssessment(code, answers[])` → `onDone(result)`. Bij ontbrekende antwoorden een bevestiging ("X vragen niet beantwoord — toch inleveren?").

```tsx
// src/kiosk/AssessmentRunner.tsx
import { useState } from "react";
import { Badge, Box, Button, Card, Center, Group, Progress, Radio, Stack, Text, Title } from "@mantine/core";
import { submitAssessment, type StartResponse, type SubmitResponse } from "../lib/api";

export function AssessmentRunner({ code, data, onDone }: { code: string; data: StartResponse; onDone: (r: SubmitResponse) => void }) {
  const key = `camai-kiosk-${code}`;
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    try { return JSON.parse(sessionStorage.getItem(key) || "{}"); } catch { return {}; }
  });
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const q = data.questions[idx];
  const total = data.questions.length;

  function choose(choice: number) {
    const next = { ...answers, [q.id]: choice };
    setAnswers(next);
    try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
  }
  async function submit() {
    const unanswered = data.questions.filter((x) => answers[x.id] == null).length;
    if (unanswered > 0 && !window.confirm(`${unanswered} vraag/vragen niet beantwoord — toch inleveren?`)) return;
    setBusy(true);
    try {
      const result = await submitAssessment(code, data.questions.map((x) => ({ questionId: x.id, choice: answers[x.id] ?? -1 })));
      try { sessionStorage.removeItem(key); } catch { /* ignore */ }
      onDone(result);
    } finally { setBusy(false); }
  }

  return (
    <Center mih="100vh" bg="var(--mantine-color-gray-0)" p="md">
      <Card withBorder radius="md" p="xl" w={720} maw="100%">
        <Stack gap="lg">
          <Group justify="space-between">
            <Text size="xs" tt="uppercase" c="dimmed" fw={700}>{data.candidate.naam} · vraag {idx + 1}/{total}</Text>
            <Badge variant="light" color="campaiCyan">Autosave</Badge>
          </Group>
          <Progress value={((idx + 1) / total) * 100} size="sm" radius="xl" color="campaiNavy" />
          <Box>
            <Badge variant="light" color="gray" radius="sm" mb="sm">{q.domain} / {q.type}</Badge>
            <Title order={2} fz="xl" c="campaiNavy.8" lh={1.3}>{q.prompt}</Title>
          </Box>
          <Radio.Group value={answers[q.id] != null ? String(answers[q.id]) : null} onChange={(v) => choose(Number(v))}>
            <Stack gap="sm">
              {q.options.map((opt, i) => (
                <Card key={i} withBorder radius="md" p="sm" style={{ cursor: "pointer", borderColor: answers[q.id] === i ? "var(--mantine-color-campaiNavy-6)" : undefined }} onClick={() => choose(i)}>
                  <Radio value={String(i)} label={<Text size="sm">{opt}</Text>} />
                </Card>
              ))}
            </Stack>
          </Radio.Group>
          <Group justify="space-between">
            <Button variant="default" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Vorige</Button>
            {idx < total - 1
              ? <Button color="campaiNavy" onClick={() => setIdx(idx + 1)}>Volgende</Button>
              : <Button color="campaiNavy" loading={busy} onClick={submit}>Inleveren</Button>}
          </Group>
        </Stack>
      </Card>
    </Center>
  );
}
```

- [ ] **Step 2: ResultScreen** — score + domein-uitslag (sterktes/aandacht), GEEN rol-fit. Toon `totaalScore` groot + per domein een balk (kleur via score). Nette afsluiting ("Bedankt, je test is ingeleverd.").

```tsx
// src/kiosk/ResultScreen.tsx
import { Badge, Card, Center, Group, Progress, RingProgress, Stack, Text, Title } from "@mantine/core";
import type { SubmitResponse } from "../lib/api";

const color = (s: number) => (s >= 75 ? "campaiLime" : s >= 60 ? "campaiCyan" : "campaiRed");

export function ResultScreen({ result }: { result: SubmitResponse }) {
  const domains = Object.entries(result.domeinScores).sort((a, b) => b[1] - a[1]);
  return (
    <Center mih="100vh" bg="campaiNavy.0" p="md">
      <Card withBorder radius="md" p="xl" w={620} maw="100%">
        <Stack align="center" gap="lg">
          <Title order={2} c="campaiNavy.7">Bedankt — je test is ingeleverd</Title>
          <RingProgress size={150} thickness={12} roundCaps
            sections={[{ value: result.totaalScore, color: color(result.totaalScore) }]}
            label={<Stack gap={0} align="center"><Text fw={800} fz={28} ff="heading" c="campaiNavy.7">{result.totaalScore}</Text><Text size="10px" tt="uppercase" c="dimmed">score</Text></Stack>} />
          <Stack gap="sm" w="100%">
            <Text size="xs" tt="uppercase" c="dimmed" fw={700}>Uitslag per onderdeel</Text>
            {domains.map(([d, s]) => (
              <Group key={d} justify="space-between" wrap="nowrap" gap="md">
                <Text size="sm" w={220} truncate>{d}</Text>
                <Progress flex={1} value={s} size="sm" radius="xl" color={color(s)} />
                <Text size="sm" ff="monospace" w={32} ta="right">{s}</Text>
              </Group>
            ))}
          </Stack>
          <Text c="dimmed" size="sm" ta="center">Campai neemt contact met je op over de vervolgstappen.</Text>
        </Stack>
      </Card>
    </Center>
  );
}
```

- [ ] **Step 3: Wire Kiosk phases** — `running` → `<AssessmentRunner code={code} data={startData} onDone={(r)=>{setResult(r);setPhase('done')}} />`; `done` → `<ResultScreen result={result} />`.

- [ ] **Step 4: Verify (end-to-end, lokaal)**

Build the app (`npx vite build`), run `AUTH_DEV_MODE=1 node server.mjs` on a test port, create a candidate via `POST /api/candidates`, then in the browser open `/test`, enter the code, complete the flow. Confirm: locked screen (no nav), questions have no answer hints, result shows score + per-domain and NO role-fit text. Also `npx tsc --noEmit` green.

- [ ] **Step 5: Commit**

```bash
git add src/kiosk/
git commit -m "feat(fe): kiosk vergrendelde test + uitslagscherm"
```

---

### Task 5: Sollicitanten-beheerscherm (`src/views/Sollicitanten.tsx`)

**Files:**
- Create: `src/views/Sollicitanten.tsx`
- Modify: `src/App.tsx` (nav-entry "Sollicitanten" onder Recruitment + route)

**Interfaces:**
- Consumes: `listCandidates`, `createCandidate` uit `src/lib/api.ts`; `roles` uit `src/lib/data.ts`.
- Nieuwe `ViewId` `"sollicitanten"`.

- [ ] **Step 1: Sollicitanten-view** — formulier (naam, functie-Select uit `roles`, optioneel e-mail) → `createCandidate` → toon de **code** prominent (kopieerknop). Lijst (uit `listCandidates`, via TanStack Query of `useEffect`) met naam, functie, status-badge, aanmaakdatum; ververst na aanmaken. Mantine `Table`, `Select`, `TextInput`, `Button`, `Badge`, `CopyButton`.

```tsx
// src/views/Sollicitanten.tsx — kernstructuur
import { useEffect, useState } from "react";
import { Badge, Box, Button, Card, CopyButton, Grid, Group, Select, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { listCandidates, createCandidate, type Candidate } from "../lib/api";
import { roles } from "../lib/data";
import { ViewHead } from "./_shared";

const statusColor: Record<string, string> = { uitgenodigd: "gray", bezig: "campaiCyan", afgerond: "campaiLime" };

export function Sollicitanten() {
  const [list, setList] = useState<Candidate[]>([]);
  const [naam, setNaam] = useState(""); const [functie, setFunctie] = useState<string | null>(null);
  const [email, setEmail] = useState(""); const [code, setCode] = useState<string | null>(null);
  const refresh = () => listCandidates().then(setList).catch(() => {});
  useEffect(() => { refresh(); }, []);

  async function add() {
    if (!naam || !functie) return;
    const { code } = await createCandidate({ naam, email: email || undefined, functie });
    setCode(code); setNaam(""); setEmail("");
    notifications.show({ message: "Sollicitant aangemaakt.", color: "campaiNavy" });
    refresh();
  }
  // ... render: ViewHead + Grid [ formulier-Card (met code-weergave + CopyButton na aanmaken) | lijst-Card met Table ]
}
```
Render: links de formulier-`Card` (na aanmaken een opvallende `Card` met de code + `CopyButton`), rechts de lijst-`Table` met kolommen Naam / Functie (rol-naam via `roles`) / Status (`Badge`) / Aangemaakt. Functie-`Select` data = `roles.map(r=>({value:r.id,label:r.name}))`.

- [ ] **Step 2: Nav + route in `App.tsx`** — voeg `{ id:"sollicitanten", label:"Sollicitanten", icon:IconUserPlus, group:"Recruitment" }` toe aan `navEntries`, `sollicitanten:"Sollicitanten"` aan `viewTitles`, en `{view==="sollicitanten" && <Sollicitanten />}` in de render-switch. Importeer `IconUserPlus` + `Sollicitanten`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npx vite build` → exit 0.
Visueel (met `AUTH_DEV_MODE` server): open de medewerker-app, ga naar Sollicitanten, maak er één aan → code verschijnt + kopieerbaar; lijst toont de sollicitant met status `uitgenodigd`.

- [ ] **Step 4: Commit**

```bash
git add src/views/Sollicitanten.tsx src/App.tsx
git commit -m "feat(fe): Sollicitanten-beheerscherm (aanmaken + code + lijst)"
```

---

### Task 6: Per-vraag-bewijs in resultaat + result-endpoint (backend)

Het opgeslagen resultaat moet per vraag detail bevatten (vraagtekst + gekozen optie + goed/fout) zodat de reviewer per vraag kan inzien; en er moet een staff-endpoint zijn om het resultaat te lezen (de uitslag staat in de candidate-store, niet in `/api/results`).

**Files:**
- Modify: `lib/assessment.mjs` (nieuwe pure helper `gradeDetails`)
- Modify: `lib/assessment-service.mjs` (`submitAssessment` slaat de details op)
- Modify: `server.mjs` (nieuw endpoint `GET /api/candidates/:id/result`, staff)
- Modify: `test/assessment-service.test.mjs` (assert dat het opgeslagen resultaat per-vraag-details bevat)

**Interfaces:**
- Produces in `lib/assessment.mjs`: `gradeDetails(answers, questions)` → `Array<{ questionId, domain, prompt, options, chosenIndex, correctIndex, correct }>` (pure; gebruikt de server-side `questions` mét `answer`).
- `submitAssessment` slaat in het result op: `{ functie, domeinScores, totaalScore, roleFit, details, ingediendOp }` (de `details` vervangt/verrijkt de eerdere kale `antwoorden`).
- Endpoint `GET /api/candidates/:id/result` (staff, via `requireStaff`) → `candidateStore.getResult(id)` (volledige reviewer-uitslag incl. `roleFit` + `details`), of `404 {error:'not_found'}`.

- [ ] **Step 1: Test** — breid `test/assessment-service.test.mjs` uit: na `submitAssessment` heeft `store.getResult(id)` een `details`-array met per vraag `{questionId, prompt, chosenIndex, correctIndex, correct, domain, options}`, en bevat het result nog steeds `roleFit`.

```javascript
test('submit slaat per-vraag-details op (reviewer-bewijs)', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { questions } = await startAssessment(store, 'ABC234');
    await submitAssessment(store, 'ABC234', questions.map((q, i) => ({ questionId: q.id, choice: i % 4 })));
    const c = await store.getByCode('ABC234');
    const saved = await store.getResult(c.id);
    assert.ok(Array.isArray(saved.details) && saved.details.length === questions.length);
    for (const d of saved.details) {
      assert.ok('questionId' in d && 'prompt' in d && 'chosenIndex' in d && 'correctIndex' in d && typeof d.correct === 'boolean');
    }
    assert.ok(saved.roleFit); // reviewer-data behoudt de fit
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
```

- [ ] **Step 2: Run → faalt** — `npm test -- test/assessment-service.test.mjs` → FAIL (geen `details`).

- [ ] **Step 3: Implementeer**

In `lib/assessment.mjs` toevoegen:
```javascript
export function gradeDetails(answers, questions) {
  const byId = new Map(answers.map((a) => [a.questionId, a.choice]));
  return questions.map((q) => {
    const chosenIndex = byId.has(q.id) ? byId.get(q.id) : -1;
    return { questionId: q.id, domain: q.domain, prompt: q.prompt, options: q.options, chosenIndex, correctIndex: q.answer, correct: chosenIndex === q.answer };
  });
}
```
In `lib/assessment-service.mjs` `submitAssessment`: importeer `gradeDetails`, en sla op:
```javascript
const details = gradeDetails(answers, questions);
await store.saveResult(candidate.id, { functie: candidate.functie, details, domeinScores, totaalScore, roleFit, ingediendOp: new Date().toISOString() });
```
(verwijder de eerdere kale `antwoorden: answers` — `details` vervangt het.)

In `server.mjs` `handleApi`, een staff-endpoint (parse id uit het pad):
```javascript
const m = url.pathname.match(/^\/api\/candidates\/([^/]+)\/result$/);
if (m && request.method === 'GET') {
  if (!requireStaff(request, response)) return true;
  const result = await candidateStore.getResult(decodeURIComponent(m[1]));
  if (!result) { sendJson(response, 404, { error: 'not_found' }); return true; }
  sendJson(response, 200, result);
  return true;
}
```

- [ ] **Step 4: Run → slaagt** — `npm test` (volledige suite groen) + `node --check server.mjs`.

- [ ] **Step 5: Commit**

```bash
git add lib/assessment.mjs lib/assessment-service.mjs server.mjs test/assessment-service.test.mjs
git commit -m "feat(assessment): per-vraag-bewijs in resultaat + result-endpoint"
```

---

### Task 7: Reviewdashboard op echte data (frontend)

Vervang de demo-kandidaten door echte sollicitanten + hun uitslag, met per-vraag-bewijs.

**Files:**
- Modify: `src/lib/api.ts` (voeg `getCandidateResult(id)` toe + type `CandidateResult`)
- Modify: `src/views/Reviewdashboard.tsx`

**Interfaces:**
- `type GradeDetail = { questionId:string; domain:string; prompt:string; options:string[]; chosenIndex:number; correctIndex:number; correct:boolean }`
- `type CandidateResult = { functie:string; domeinScores:Record<string,number>; totaalScore:number; roleFit:{score:number;state:string}; details:GradeDetail[]; ingediendOp:string }`
- `getCandidateResult(id:string): Promise<CandidateResult>` → `GET /api/candidates/${id}/result`.

- [ ] **Step 1: API-client** — voeg `CandidateResult`/`GradeDetail` + `getCandidateResult` toe aan `src/lib/api.ts`. `npx tsc --noEmit` groen.

- [ ] **Step 2: Dashboard op echte data** — in `src/views/Reviewdashboard.tsx`: laad `listCandidates()` (state). Toon een lijst/keuze van sollicitanten met status-badge. Bij selectie van een **afgeronde** sollicitant: `getCandidateResult(id)` → toon `totaalScore` (RingProgress), **rol-fit** `roleFit.state` (reviewer-only, hier zichtbaar), domein-uitslag als **balken per getest domein** (uit `domeinScores`), en een **per-vraag-bewijs**-tabel uit `details` (kolommen: Vraag (prompt), Domein, Gekozen antwoord (`options[chosenIndex]` of "—" bij -1), Goed/fout (badge groen/rood)). Behoud de Mantine-cockpit-stijl (Card/RingProgress/Progress/Table/Badge). Verwijder de demo-`candidates`/scores-afhankelijkheid uit dit scherm.
- Shape: `domeinScores` bevat alleen geteste domeinen → gebruik de balken-variant (geen radar over 13 domeinen). De oude demo-radar/heatmap mag hier weg (de demo `candidates[]` in `data.ts` blijft bestaan voor evt. ander gebruik, maar het dashboard gebruikt 'm niet meer).

- [ ] **Step 3: Lege staat** — geen sollicitanten/geen afgeronde → nette lege staat ("Nog geen ingeleverde assessments"), niet de demo.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npx vite build` → exit 0.
Visueel (met `AUTH_DEV_MODE` server + een afgeronde sollicitant uit de kiosk-flow): dashboard toont die persoon met score, rol-fit, domein-balken en per-vraag-bewijs; zonder data de lege staat.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api.ts src/views/Reviewdashboard.tsx
git commit -m "feat(fe): Reviewdashboard op echte sollicitant-data + per-vraag-bewijs"
```

---

### Task 8: Easy-Auth allow-anonymous + verificatie

De kiosk-route moet buiten de Entra-gate bereikbaar zijn; staff-endpoints blijven afgedwongen in `server.mjs` (`requireStaff`).

**Files:** geen code (Azure-config). Gebruik `az` (ingelogd als Janneke@campai.nl).

- [ ] **Step 1: Lees huidige auth-config**

Run: `az webapp auth show --name cmp-app-assessment-test-weu-001 --resource-group rg-cmp-assessment-test -o json`
Noteer of `unauthenticatedClientAction` op `RedirectToLoginPage` staat.

- [ ] **Step 2: Zet allow-anonymous** (app handelt auth zelf af)

Run: `az webapp auth update --name cmp-app-assessment-test-weu-001 --resource-group rg-cmp-assessment-test --unauthenticated-client-action AllowAnonymous`
(Indien de v2 auth-CLI nodig is: `az webapp auth set` met een config-bestand — controleer met `az webapp auth show` welke versie actief is; pas de aanroep daarop aan.)

- [ ] **Step 3: Verifieer scheiding (na deploy/redeploy)**

- Kiosk bereikbaar zonder login: `curl -s -o /dev/null -w "%{http_code}" https://cmp-app-assessment-test-weu-001.azurewebsites.net/test` → 200 (geen redirect naar Microsoft-login).
- Staff-API afgeschermd: `curl -s -o /dev/null -w "%{http_code}" https://cmp-app-assessment-test-weu-001.azurewebsites.net/api/candidates` → 401 (geen Entra-principal).
- Medewerker-app via browser → nog steeds Entra-login (App Service stuurt de principal-header mee zodra ingelogd).

- [ ] **Step 4: Documenteer** — noteer de wijziging in `CHANGELOG.md` (Easy Auth → AllowAnonymous; app dwingt staff-auth af in `server.mjs`).

```bash
git add CHANGELOG.md
git commit -m "docs: Easy Auth allow-anonymous voor kiosk-route"
```

---

## Self-Review

**Spec-dekking (frontend-deel):**
- Route-split kiosk vs staff (spec §3) → Task 2. ✓
- Kandidaat-kiosk: code-start, vergrendelde test, uitslag zonder fit (spec §5) → Task 3/4. ✓
- Sollicitanten aanmaken + code + status (spec §8) → Task 5. ✓
- Dashboard echte data + per-vraag (spec §8) → Task 6. ✓
- Werkhouding bias-arm (spec §9) → Task 7. ✓
- Easy-Auth allow-anonymous + per-endpoint enforcement (spec §10) → Task 8 (+ Plan 1 `requireStaff`). ✓
- Antwoordsleutels/rol-fit niet naar kiosk (spec §5/§10) → Task 1/4 (client krijgt ze niet van de API; kiosk toont geen fit). ✓

**Placeholder-scan:** Task 6 laat de exacte heatmap/radar-aanpassing aan de implementer met een duidelijke regel (balken-variant bij < 5 domeinen) — concreet genoeg, geen TBD. Task 7 vraagt om 3 extra SJT-items "in dezelfde stijl" — bewust redactioneel, met één volledig uitgewerkt voorbeeld + exacte vorm. Task 8 is config, geen code-placeholder.

**Type-consistentie:** `ClientQuestion`/`StartResponse`/`SubmitResponse`/`Candidate` gedefinieerd in Task 1 en consistent gebruikt in Task 3/4/5/6. `choice` als number, `answers:[{questionId,choice}]` consistent met Plan 1 `scoreAssessment`. `functie` = rol-id overal.

**Volgorde-afhankelijkheid:** Task 1 (API) eerst; 2 (split) vóór 3/4 (kiosk); 5/6 (staff) onafhankelijk van kiosk; 7 (content) raakt backend-test; 8 (auth) als laatste want vereist deploy om te verifiëren.
