# Vragenbank Fase A — Design (kwaliteitsbank + server-store + 5/domein)

**Datum:** 2026-06-27
**Status:** Concept — ter review bij de gebruiker
**Repo:** `jippekecampai/assesment`
**Vervolg op:** de werkende sollicitant-assessmentflow (Plan 1 + Plan 2).

---

## 1. Doel & intentie

De assessment werkt, maar de vragenbank is te klein en te oppervlakkig om écht te
meten of een sollicitant een domein begrijpt. Fase A maakt de bank:

1. **Groot genoeg** — **minimaal 5 vragen per relevant domein** (geen maximum), zodat
   een goede score niet op toeval kan berusten.
2. **Diep genoeg** — vragen toetsen toepassing/oordeel, niet het opdreunen van een
   definitie.
3. **Beheerbaar** — goedgekeurde vragen leven server-side; seniors keuren in-app
   nieuwe vragen goed (de Vragenfabriek is de gate). De kiosk scoort tegen de
   uitgebreide bank.

**Fase B (later, buiten deze spec):** AI-generatie van conceptvragen uit hub-data
(tickets/IT Glue) via de AI-guard. Deze spec legt de fundamenten waar Fase B op
aansluit (zelfde concept→review→bank-flow).

### Niet-doelen (YAGNI)
- **Geen** AI-generatie in Fase A (dat is Fase B).
- **Geen** maximum op het aantal vragen per test (5/domein mag de test lang maken).
- **Geen** adoptie-analytics ("gebruiken collega's AI in IT Glue?") — dat is een
  losse, latere richting (Skills Academy), geen onderdeel van de vragenbank.

---

## 2. Beslissingen (met de gebruiker vastgelegd)

| Onderwerp | Keuze |
|-----------|-------|
| Opslag goedgekeurde vragen | **Server-store** (Azure Table + file-fallback) + **in-app goedkeuren** |
| Volgorde | **Handmatige bank eerst** (Fase A); AI-generatie later (Fase B) |
| Seed-auteur | **Ik schrijf de seed**, senior reviewt/bewerkt/keurt in-app |
| Vragen per relevant domein | **≥ 5, geen maximum** |
| Diepgang | Toepassing/oordeel, **geen** losse definitievragen |
| Eigen vragen (Thread) | Gebruiker voegt toe via de Vragenfabriek-goedkeurflow |

---

## 3. Inhoudelijke richtlijnen voor de seed (kwaliteitseisen)

Elke vraag voldoet hieraan:

1. **Diepgang / toepassing.** De vraag schetst een situatie en vraagt om de juiste
   aanpak, diagnose of afweging. *Niet:* "Wat is het verschil tussen IaaS en PaaS?".
   *Wel:* "Een klantworkload draait op een losse VM met handmatige patches en geen
   schaalbaarheid; wat is de sterkste verbetering en waaróm?".
2. **Plausibele afleiders.** Alle vier de opties zijn geloofwaardig en van nature
   vergelijkbaar van lengte (geen kunstmatige opvulling — die is verwijderd).
   Precies één is duidelijk het beste *professionele* antwoord.
3. **Interne/tool-gerichte invalshoek waar relevant.** Vragen toetsen ook hoe je de
   Campai-stack in de praktijk gebruikt, niet alleen theorie:
   - **IT Glue** (mapt op domein *Kaseya Stack*): documentatie vinden/structureren,
     password-/documenthygiëne, en het gebruik van **AI in IT Glue** (Smart Audit /
     Kaseya Assist) — bv. "hoe vind je snel de juiste runbook/asset?".
   - **Kaseya-stack**: samenhang Autotask ↔ Datto RMM ↔ IT Glue ↔ EDR ↔ BullPhish,
     inclusief GenAI-assistenten in de tooling.
   - **AI / Copilot**: praktisch, veilig AI-gebruik (incl. AI in de eigen tooling).
4. **Bias-arm voor Werkhouding & Communicatie**: situational-judgement-scenario's
   (eigenaarschap, afspraken nakomen, omgaan met druk, zorgvuldig met
   bedrijfsmiddelen/security). Geen leeftijd/persoonlijke proxy's.
5. **Domeindekking**: ≥5 vragen voor elk van de 13 domeinen (≈65+ in totaal). Waar
   een onderwerp (IT Glue, GenAI-tooling) geen eigen domein heeft, valt het onder het
   dichtstbijzijnde bestaande domein.
6. **Geen klant-PII** in vragen (bestaande harde regel).

De seed is door mij geschreven **concept**; de senior kan elke vraag in de
Vragenfabriek bekijken, bewerken, goedkeuren of afkeuren. (De seed staat in de repo
en is dus zichtbaar/gedeployed; de governance is dat een senior 'm nakijkt — de
in-app store is voor latere toevoegingen.)

---

## 4. Architectuur (bouwt op het bestaande)

```
            ┌──────────────────────── kiosk (sollicitant) ───────────────┐
            │ selectQuestionsForRole(rol)  → seed + goedgekeurde store     │
            │   → ≥5 per relevant domein → vragen ZONDER answer            │
            └──────────────────────────────────────────────────────────────┘
   seed-bank (repo)                         goedgekeurde-store (server)
   lib/assessment-content.mjs               lib/question-bank.mjs
   (door mij geschreven, ≥5/domein)         (Azure Table + file-fallback)
            ▲                                          ▲
            │                                          │ POST /api/questions (staff)
            │                                          │
            └──────── Vragenfabriek (medewerker) ──────┘
                      concept (handmatig / Thread) → senior-review → goedkeuren → store
```

- **Seed-bank** = `lib/assessment-content.mjs` (`testQuestions`), door mij uitgebreid
  naar ≥5/domein. Versiebeheerd.
- **Goedgekeurde-store** = `lib/question-bank.mjs`: persistente goedgekeurde vragen
  (Azure Table partitie `question` + file-fallback), zelfde patroon als
  `lib/candidate-store.mjs`.
- **`selectQuestionsForRole`** (in `lib/assessment.mjs`) combineert **seed +
  goedgekeurde store**, en kiest **≥5 per relevant domein** (rolgewicht ≥ drempel;
  domeinen met <5 leveren wat er is + worden gesignaleerd).
- **Vragenfabriek**: "Toevoegen aan assessment" schrijft naar de **server-store**
  (`POST /api/questions`) i.p.v. localStorage; de bestaande concept-/editflow blijft.

---

## 5. Componenten / bestanden

| Bestand | Wijziging |
|---|---|
| `lib/assessment-content.mjs` | **Seed uitgebreid** naar ≥5 plausibele, diepe vragen per domein (incl. IT Glue/AI-tooling-invalshoeken + Werkhouding-SJT). |
| `lib/question-bank.mjs` (nieuw) | Store goedgekeurde vragen: `listApproved()`, `addApproved(question)`, `removeApproved(id)`. Azure Table (`AssessmentQuestions`) + file-fallback; pad/connStr injecteerbaar (tests). |
| `lib/assessment.mjs` | `selectQuestionsForRole` async maken óf een variant die seed+store combineert; **≥5 per relevant domein**-regel; `prepareQuestion`/`scoreAssessment` ongewijzigd. |
| `lib/assessment-service.mjs` | `startAssessment` haalt de gecombineerde bank op (await store). |
| `server.mjs` | `GET /api/questions` (staff, lijst goedgekeurd) + `POST /api/questions` (staff, voeg goedgekeurde vraag toe) + `DELETE /api/questions/:id` (staff). |
| `src/lib/api.ts` | `listQuestions()`, `addQuestion(q)`, `removeQuestion(id)` + types. |
| `src/views/Vragenfabriek.tsx` | Promote → `addQuestion` (server) i.p.v. localStorage; toon goedgekeurde bank + **aantal per domein** (zodat seniors zien waar <5). |
| `test/question-bank.test.mjs` (nieuw) | Store round-trip (file-fallback). |
| `test/assessment.test.mjs` | Test ≥5/domein-selectie en seed-dekking. |

---

## 6. Datamodel — goedgekeurde vraag

Zelfde vorm als seed-vragen, plus herkomst/metadata:

| veld | type | uitleg |
|---|---|---|
| `id` | string | gegenereerd |
| `domain` | string | een van de 13 domeinen |
| `type` | string | bv. "Scenario", "Situational judgement" |
| `prompt` | string | de vraag |
| `options` | string[4] | plausibele opties |
| `answer` | number | index correct antwoord (server-side; nooit naar kiosk) |
| `source` | string | herkomst (bv. "Handmatig", "Thread", later "Hub/AI") |
| `approvedBy` | string | e-mail senior (uit Entra-principal) |
| `approvedAt` | iso | |

---

## 7. Selectie-regel (≥5 per relevant domein)

- Bepaal **relevante domeinen** voor de rol: `weights[domein] ≥ drempel`.
- Combineer **seed + goedgekeurde store** per domein.
- Kies per relevant domein **min(5, beschikbaar)** vragen; bij meer beschikbaar:
  neem 5 (deterministisch, seeded op rol+domein zodat de set stabiel is).
- Domeinen met **<5** beschikbare vragen: neem alles én **signaleer** het gat
  (server-log + zichtbaar in de Vragenfabriek "aantal per domein").
- Totale test = som over relevante domeinen (mag lang zijn; bewust geen cap).
- Antwoordsleutels blijven server-side (`toClientQuestion`).

---

## 8. Governance & beveiliging

- Goedgekeurde-store-mutaties (`POST/DELETE /api/questions`) achter `requireStaff`
  (Entra). Kandidaat-endpoints blijven code-gated en krijgen nooit `answer`.
- Seed = concept; senior-review is de gate (in-app bewerken/goedkeuren/afkeuren).
- Geen klant-PII in vragen; voor Fase B (AI) loopt elke generatie door de AI-guard.

---

## 9. Foutafhandeling
- Store onbereikbaar → val terug op alleen de seed (test blijft werken).
- Domein <5 vragen → degradeer netjes (neem wat er is) + signaleer; nooit crashen.
- Azure niet geconfigureerd → file-fallback (dev), zoals de kandidaat-store.

---

## 10. Testen / verificatie
- **Unit:** `question-bank` round-trip (file-fallback); `selectQuestionsForRole`
  levert ≥5 per relevant domein wanneer beschikbaar, en degradeert correct bij <5;
  seed-dekking-test (elk domein ≥5 in de seed).
- **Bestaand:** scoring/kiosk-tests blijven groen (contract ongewijzigd).
- **Handmatig:** Vragenfabriek → concept goedkeuren → verschijnt in de bank →
  kiosk-test bevat meer vragen voor dat domein; dashboard toont per-vraag-bewijs.

---

## 11. Bouwvolgorde
1. `lib/question-bank.mjs` + test (store).
2. `selectQuestionsForRole` ≥5/domein (seed+store) + tests.
3. `server.mjs` endpoints `GET/POST/DELETE /api/questions` + service-koppeling.
4. Frontend: `api.ts` + Vragenfabriek naar server-store + "aantal per domein".
5. **Seed-content**: ik schrijf ≥5 diepe vragen per domein (grootste inspanning;
   eigen stap, in batches per domein) + seed-dekking-test.

---

## 12. Open punten (tijdens bouw te bevestigen)
- Exacte **drempel** voor "relevant domein" (ijken zodat elke rol een zinnige set
  relevante domeinen heeft).
- Of de 13 domeinen volstaan of dat IT Glue/GenAI een eigen sub-tag verdienen
  (voorstel: bestaande domeinen hergebruiken, geen nieuw domein in Fase A).
