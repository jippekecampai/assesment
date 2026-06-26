# Sollicitant-assessmentflow — Design

**Datum:** 2026-06-26
**Status:** Concept — ter review bij de gebruiker
**Repo:** `jippekecampai/assesment`
**Stack:** React 19 + Mantine 9 + Vite (frontend) · `server.mjs` Node + Azure Table (backend)

---

## 1. Doel & intentie

De app ziet er Campai uit maar is nu een demo (hardcoded kandidaten, antwoorden in
localStorage). Dit ontwerp maakt er een **werkend recruitment-assessment** van:

1. Een **reviewer** (medewerker, Entra SSO) voert een **sollicitant** in voor een
   bepaalde **functie** en krijgt een **toegangscode**.
2. De sollicitant maakt de test **op locatie, onder toezicht** (geen remote, geen
   AI-hulp): op een testapparaat voert hij de code in op een **startscherm** en
   krijgt een **vergrendelde** pagina waar verder niets kan behalve de test.
3. Bij inleveren ziet de sollicitant **direct** zijn **totaalscore + uitslag per
   domein** (sterktes/aandacht), maar **géén rol-fit of hire-advies**.
4. Het resultaat wordt **server-side opgeslagen** en verschijnt op het
   **Reviewdashboard**: totaalscore, rol-fit (reviewer-only), domein-uitslag en
   **per vraag** het gegeven antwoord + goed/fout + bewijs.

### Niet-doelen (YAGNI)
- **Geen** e-mail/remote-uitnodiging — de test is bewust on-site en supervised.
- **Geen** wachtwoord-userstore en **geen** Entra-account voor sollicitanten.
- **Geen** automatische afwijzing — menselijke review blijft de gate (governance).
- **Geen** leeftijds-/persoonlijke proxy's in de meting (zie §9, bias).
- **Geen** tweede deployment — één app, gesplitst op route (zie §3).

---

## 2. Beslissingen (vastgelegd met de gebruiker)

| Onderwerp | Keuze |
|-----------|-------|
| Kandidaat-login | **Uitnodigingslink + toegangscode** (geen wachtwoord, geen Entra) |
| Afname | **On-site, supervised**; code op een **startscherm** op het testapparaat |
| Wat de sollicitant ziet | **Score + domein-uitslag**, **géén** rol-fit/hire-advies |
| Vragen per functie | **Filteren op functie** (domein-rolgewicht boven drempel) |
| Werkhouding meten | **Regulier domein** (Werkhouding & Communicatie) versterkt met SJT-vragen, bias-arm |
| Resultaatopslag | **Server-side** (Azure Table; lokaal file-fallback) |
| Dashboard | **Echte sollicitanten** vervangen de demo-kandidaten |
| Architectuur | **Aanpak A** — één app, gesplitst op route (`/test/*` = kiosk) |

---

## 3. Architectuur (Aanpak A — één app, route-split)

Twee gebruikers-werelden die niet achter dezelfde Entra-gate kunnen:

```
                 Azure App Service (Easy Auth = "allow anonymous")
                 │
  ┌──────────────┴───────────────────────────────────────────────┐
  │ server.mjs  — bewaakt auth PER endpoint                       │
  │                                                               │
  │  Medewerker-API (vereist x-ms-client-principal = Entra)       │
  │    /api/candidates            (CRUD sollicitanten)            │
  │    /api/results               (lezen voor dashboard)          │
  │    /api/hub/*                 (bestaand)                      │
  │                                                               │
  │  Kandidaat-API (vereist geldige code, GEEN Entra)            │
  │    POST /api/assessment/start   { code }                     │
  │    POST /api/assessment/submit  { code, answers }            │
  │                                                               │
  │  Static: dist/ (React SPA) + SPA-fallback                    │
  └───────────────────────────────────────────────────────────────┘
        │                                   │
   React-route "/" e.v.               React-route "/test/*"
   Medewerker-app (Mantine,           Kandidaat-kiosk (vergrendeld,
   AppShell, dashboard, …)            geen nav, alleen de test)
```

- **Easy Auth** staat op *allow anonymous* zodat de kiosk-route bereikbaar is; de
  app/`server.mjs` dwingt af: medewerker-endpoints eisen de Entra-principal,
  kandidaat-endpoints eisen een geldige, niet-afgeronde code.
- **Frontend-routing:** de SPA krijgt een minimale route-splitsing. `/test/*`
  rendert de **kiosk-shell** (geen `AppShell`, geen sidebar); al het andere rendert
  de bestaande medewerker-`AppShell`. (Lichtgewicht: een pad-check in `main.tsx`/
  `App.tsx` of `react-router` voor twee top-level routes — implementatiekeuze in het
  plan, beide passen.)

---

## 4. Datamodel (server-side, Azure Table; lokaal JSON-fallback)

Partitiekeuze: `partitionKey = "candidate"` voor sollicitanten, `"result"` voor
uitslagen (of twee tabellen — keuze in het plan). Velden:

**Candidate**
| veld | type | uitleg |
|---|---|---|
| `id` | string | rowKey, gegenereerd |
| `naam` | string | volledige naam |
| `email` | string? | optioneel (administratie) |
| `functie` | string | rol-id uit `roles[]` (bepaalt filtering + weging) |
| `code` | string | korte toegangscode (bv. 6 tekens, hoofdletters/cijfers, niet-ambigu) |
| `status` | enum | `uitgenodigd` → `bezig` → `afgerond` |
| `aangemaaktDoor` | string | e-mail reviewer (uit Entra-principal) |
| `aangemaaktOp` | iso | |
| `gestartOp` | iso? | gezet bij `start` |
| `ingediendOp` | iso? | gezet bij `submit` |

**AssessmentResult**
| veld | type | uitleg |
|---|---|---|
| `candidateId` | string | koppeling |
| `functie` | string | rol-id (snapshot) |
| `antwoorden` | array | per vraag: `{ questionId, domain, choice, correct }` |
| `domeinScores` | object | `{ [domain]: 0–100 }` (% goed per domein) |
| `totaalScore` | number | gemiddelde/gewogen totaal |
| `ingediendOp` | iso | |

Antwoorden worden **alleen server-side** definitief opgeslagen. Tijdens de test mag
de kiosk lokaal autosaven (herstel bij refresh), maar de waarheid is de server.

---

## 5. Kandidaat-flow (kiosk, route `/test`)

1. **Startscherm** (`/test`): "Start assessment" + invoerveld voor de code.
   Foutmelding bij ongeldige/al-afgeronde code.
2. `POST /api/assessment/start { code }` → valideert code, zet status `bezig` +
   `gestartOp`, geeft terug: kandidaat-naam, functie, en de **gefilterde vragenset**
   (zie §6). Antwoordsleutels (`answer`) gaan **niet** mee naar de client.
3. **Vergrendelde test** (`/test/run`): één vraag per keer, voortgangsbalk, géén
   sidebar/nav/uitlog. De bestaande Kandidaattest-UI wordt hergebruikt maar in de
   kiosk-shell en zonder de "rolweging"-context-zijbalk (die is reviewer-info).
   Lokale autosave voor herstel bij refresh; de back-knop hervat dezelfde sessie.
4. **Inleveren** → `POST /api/assessment/submit { code, answers }` → server scoort
   (§7), slaat `AssessmentResult` op, zet status `afgerond`, en geeft de
   **kandidaat-uitslag** terug: totaalscore + `domeinScores` (sterktes/aandacht).
   **Geen** rol-fit, **geen** hire-advies.
5. **Uitslagscherm** (`/test/klaar`): score + domein-uitslag, nette afsluiting.
   De code is daarna verbruikt (status `afgerond` → `start` weigert hem).

---

## 6. Vragen filteren op functie

- Elke vraag heeft een `domain`; elke functie (`role`) heeft `weights[domain]`.
- **Relevantieregel:** neem de vragen waarvan het domein een rolgewicht **≥ drempel**
  heeft voor de gekozen functie. Drempel zo gekozen dat elke functie een zinnige set
  overhoudt; met een **minimum-aantal** vragen als ondergrens (vul aan met de
  zwaarst-wegende overige domeinen tot het minimum gehaald is).
- **Werkhouding & Communicatie** telt altijd mee (relevant voor elke functie).
- Hergebruikt de bestaande `roles[].weights` + `testQuestions[].domain` — **geen**
  nieuw tag-/koppelsysteem.
- De filterlogica is een **pure functie** (`selectQuestionsForRole(roleId)`),
  unit-testbaar, en draait **server-side** bij `start` (de client krijgt alleen de
  geselecteerde vragen, zonder antwoordsleutels).

---

## 7. Scoring (server-side, bij `submit`)

- Per **domein**: `domeinScore = round(100 * aantalGoed / aantalVragenInDomein)`.
  Domeinen zonder vragen in deze (gefilterde) test komen niet voor in `domeinScores`.
- **Totaalscore:** gemiddelde over de beantwoorde domeinen (of gewogen met
  rolgewichten — keuze in het plan; default ongewogen gemiddelde voor de
  kandidaat-weergave, rol-fit apart).
- **Rol-fit (reviewer-only):** de bestaande `roleScore`/`scoreState` over de
  `domeinScores` met de rolgewichten van de functie → `Sterke fit`/`Geschikt`/
  `Borderline`/`Niet geschikt`. Deze waarde gaat **niet** naar de kandidaat.
- "Onbekend onderwerp"-antwoorden (bestaande adaptieve fallback) tellen als
  niet-goed voor het domein, maar de fallbackvraag blijft in de set (bestaand gedrag).
- Scoring is een **pure functie** (`scoreAssessment(answers, questions, role)`),
  unit-testbaar zonder netwerk.

---

## 8. Medewerker-flow (Entra, bestaande app)

- **Nieuw scherm "Sollicitanten"** (nav onder Recruitment): formulier (naam, functie,
  optioneel e-mail) → `POST /api/candidates` → toont de **code** prominent
  (kopieerbaar) zodat de reviewer hem op locatie kan gebruiken. Lijst met alle
  sollicitanten + status (`uitgenodigd`/`bezig`/`afgerond`) en aanmaakdatum.
- **Reviewdashboard** leest echte data: `GET /api/candidates` + `GET /api/results`.
  De demo-kandidaten (`candidates[]` in `data.ts`) worden vervangen door de
  ingediende sollicitanten. Per sollicitant: totaalscore, **rol-fit** (reviewer-only),
  domein-uitslag (heatmap/inspector), en **per vraag** het gegeven antwoord +
  goed/fout + bewijs (de bestaande "Vraagbewijs"-tab, nu gevuld met echte antwoorden).
- De Skills Academy (interne medewerkers) blijft ongewijzigd op demo-data; dit
  ontwerp raakt alleen de recruitment-kant.

---

## 9. Werkhouding meten — bias-arm (governance)

- Werkhouding/betrouwbaarheid wordt gemeten als **regulier domein** via
  **situational-judgement-vragen** (realistische scenario's: eigenaarschap, afspraken
  nakomen, omgaan met druk, zorgvuldig met bedrijfsmiddelen/security), met een vaste
  scoringssleutel — **dezelfde vragen en scoring voor iedereen**.
- **Expliciet verboden:** leeftijd/generatie of persoonlijke proxy's (woonsituatie,
  privégedrag) als signaal. Een gestandaardiseerde SJT is juist **minder** biased dan
  onderbuik-oordeel; dat is het hele punt.
- Wat **niet** gemeten wordt (geen schijnzekerheid): toekomstig verzuim/"belt zich
  ziek". Gemeten wordt **oordeel en houding** in werk-relevante scenario's.
- De domein-uitslag is voor de kandidaat zichtbaar als gewoon domein; de
  **interpretatie** ("past deze houding bij de functie?") blijft **reviewer-only**.
- Vervolg (buiten deze scope): achteraf controleren op groepsverschillen per vraag
  zodra er genoeg data is, en items eruit halen die zonder werk-relevante reden één
  groep benadelen.

---

## 10. Auth, vergrendeling & beveiliging

- **Easy Auth → allow anonymous**; `server.mjs` dwingt per endpoint af:
  - Medewerker-endpoints: `x-ms-client-principal` aanwezig (Entra). Zonder → `401`.
  - Kandidaat-endpoints: geldige, niet-afgeronde `code`. Zonder/ongeldig → `401/410`.
- **Code-eigenschappen:** kort, niet-ambigu, willekeurig; eenmalig bruikbaar
  (na `afgerond` weigert `start`); rate-limit op `start` tegen brute-force.
- **Antwoordsleutels** (`answer`) verlaten de server nooit richting de kiosk; scoring
  gebeurt server-side.
- **Kiosk-vergrendeling** is UX, geen harde sandbox (de echte waarborg is fysiek
  toezicht on-site): geen nav/uitlog, geen externe links, refresh hervat de sessie.
- Lokaal/dev zonder Azure: file-fallback datastore (bestaand patroon in `server.mjs`),
  en een dev-manier om de Entra-principal te simuleren voor de medewerker-kant.

---

## 11. Foutafhandeling

- Ongeldige code → nette melding op het startscherm; geen lek of de code bestaat.
- Al-afgeronde code → "deze test is al ingeleverd".
- Submit zonder volledige antwoorden → toegestaan (onbeantwoord = niet-goed), maar
  met een bevestigingsstap ("X vragen niet beantwoord — toch inleveren?").
- Backend onbereikbaar bij submit → kiosk bewaart antwoorden lokaal en probeert
  opnieuw; geen dataverlies.
- Azure niet geconfigureerd → file-fallback (dev), geen crash.

---

## 12. Testen / verificatie

- **Unit (pure functies):** `selectQuestionsForRole` (filtering + minimum),
  `scoreAssessment` (antwoorden → domeinscores + totaal), code-generatie/-validatie.
- **API:** `start` (geldige/ongeldige/afgeronde code), `submit` (scoort + slaat op +
  status), medewerker-endpoints (zonder Entra → 401).
- **Handmatig (end-to-end):** sollicitant aanmaken → code → kiosk-test → score +
  domein-uitslag (geen fit-advies) → dashboard toont de sollicitant met rol-fit en
  per-vraag-bewijs.
- `npm run check` (tsc) groen · bestaande `npm test` blijft groen · `spoke-doctor`
  groen.

---

## 13. Bouwvolgorde (binnen één spec, geen aparte fases)

1. Datamodel + `server.mjs` endpoints (`candidates` CRUD, `assessment/start|submit`)
   + scoring/filter pure functies + unit-tests.
2. Kandidaat-kiosk (route-split, startscherm, vergrendelde test, uitslagscherm).
3. Medewerker "Sollicitanten"-scherm (aanmaken + code + statuslijst).
4. Reviewdashboard op echte data (sollicitanten + resultaten + per-vraag-bewijs).
5. Werkhouding & Communicatie versterken met SJT-vragen (bias-arm).
6. Easy-Auth allow-anonymous + per-endpoint enforcement + dev-fallback.

---

## 14. Open punten (te bevestigen tijdens implementatie)

- Exacte **drempel** + **minimum-aantal** vragen voor de functie-filtering (ijken op
  de bestaande vragenbank zodat elke functie ≥ N zinnige vragen krijgt).
- Eén tabel met partitiekeys vs. twee tabellen (Candidate / Result) in Azure.
- Frontend-routing: lichte pad-check vs. `react-router` (beide acceptabel).
- Totaalscore: ongewogen gemiddelde (kandidaatweergave) vs. rolgewogen — default
  ongewogen voor de kandidaat, rol-fit apart voor de reviewer.
