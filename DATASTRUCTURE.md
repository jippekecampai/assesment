# Campai Console — Data Structure

Dit document beschrijft de canonieke databoom van de Campai Console.
Het wordt bijgewerkt bij elke relevante codewijziging (zie `CHANGELOG.md`).

---

## Entiteitenoverzicht

```
Campai Console
├── people[]                    Alle personen in de app
│   ├── candidates[]            type: "candidate" — recruitment
│   │   ├── id, name, meta
│   │   ├── type: "candidate"
│   │   ├── scores{}            domain → 0–100
│   │   ├── scenarioScores[]    score per scenario-opdracht
│   │   └── scenarioLabels[]    label per scenario-opdracht
│   └── learners[]              type: "learner" — interne medewerkers
│       ├── id, name, meta
│       ├── type: "learner"
│       ├── role                huidige rol (= role.name)
│       ├── targetRole          doelrol (= role.name)
│       └── scores{}            domain → 0–100
│
├── roles[]
│   ├── id, name, threshold
│   └── weights{}               domain → 0.0–1.0 (som ≈ 1)
│
├── domains[]                   string[] — MSP-kennisdomeinen
├── domainDetails{}             domain → beschrijving
│
├── /api/learning/me             voortgang per ingelogde medewerker
│   ├── entraOid
│   ├── completedModules[]
│   └── updatedAt
│
├── trainingModules[]
│   ├── id, title, domain       domain ∈ domains[]
│   ├── level, xp, format
│   ├── proof, badge
│   └── [optioneel] prerequisites[], resources[], sourceRefs[]
│
├── testQuestions[]
│   ├── id (auto), domain       domain ∈ domains[]
│   ├── type, prompt
│   ├── options[]               na shuffle: positie wisselt deterministisch per vraag
│   └── answer                  index van correct antwoord na shuffle
│
├── fallbackQuestions{}         domain → fallback-vraag als kandidaat domein niet kent
│
├── draftQuestions[]            conceptvragen voor de vragenbank
│   └── source                  bronlabel voor senior review en attributie
│
├── CONTENT_SOURCES.md          bronregister voor externe inspiratie en licenties
│
└── dashboardModules[]          registry van alle dashboard-modules
    ├── id, title, description
    ├── view                    welke navigatieview ("overview", "academy", etc.)
    ├── dataSource[]            welke data-entiteiten worden gebruikt
    └── panel                   HTML element-id dat de module vult
```

---

## Relaties

| Veld | Constraint |
|------|-----------|
| `people.scores` sleutels | ∈ `domains[]` |
| `roles.weights` sleutels | ∈ `domains[]` |
| `trainingModules.domain` | ∈ `domains[]` |
| `testQuestions.domain` | ∈ `domains[]` |
| SSO `entraOid` | sleutel voor `/api/learning/me` en persoonlijke modulevoortgang |
| `learner.role` / `learner.targetRole` | legacy seeddata; actieve rol komt uit SSO `jobTitle` of gekozen groeirol |
| `dashboardModules.view` | = `data-view` attribuut in `index.html` |
| `dashboardModules.panel` | = HTML `id` attribuut |

---

## Dashboard modules

| Module | View | Data | Render |
|--------|------|------|--------|
| Mijn overview | employeeOverview | /api/me, /api/learning/me, trainingModules | React `MedewerkerOverview` |
| Sollicitanten | sollicitanten | candidates | React `Sollicitanten` |
| Kandidaat reviews | candidateReviews | candidates, roles, results | React `Reviewdashboard` |
| Skills Academy | academy | /api/me, /api/learning/me, roles, trainingModules | React `SkillsAcademy` |
| Kandidaattest | test | testQuestions | React kiosk |
| Vragenbank | questions | draftQuestions, approved questions | React `Vragenfabriek` |
| Beheer | admin | /api/me, appSettingsMap, auditLog | React `Beheer` |

---

## Protocol: nieuw data toevoegen

### Hub-bronmateriaal → conceptvragen (spoke)
1. De Vragenbank-knop "Bronmateriaal uit hub" roept `/api/hub/source-material?companyId=…`.
2. `server.mjs` leest via `lib/hub.mjs` (gateway) tickets/devices/live-data, draait
   die door `lib/anonymize.mjs` en bouwt kandidaten met `lib/source-material.mjs`.
3. De kandidaten worden toegevoegd aan `draftQuestions[]` (vorm: domain, role, source,
   prompt) — nooit automatisch aan `testQuestions[]`.
4. Senior-review promoveert ze handmatig (bestaande flow). Documenteer in `CHANGELOG.md`.

### Nieuwe kandidaat
1. Voeg een object toe aan `candidates[]` met `type: "candidate"` en alle domeinen in `scores{}`
2. Het Overzicht toont de kandidaat automatisch in de kaartgrid en heatmap
3. Documenteer in `CHANGELOG.md`

### Nieuwe medewerker
1. Voeg een object toe aan `learners[]` met `type: "learner"`, `role`, `targetRole` en alle domeinen in `scores{}`
2. Het Overzicht toont de medewerker automatisch; de Academy past het leerprofiel automatisch aan
3. Documenteer in `CHANGELOG.md`

### Nieuw domein
1. Voeg de domeinnaam toe aan `domains[]`
2. Voeg een beschrijving toe aan `domainDetails{}`
3. Voeg een gewicht toe in elk object in `roles[].weights` (zorg dat de som ≈ 1 blijft)
4. Voeg de domeinscore toe aan alle bestaande objecten in `people[].scores{}`
5. Documenteer in `CHANGELOG.md`

### Nieuwe rol
1. Voeg een object toe aan `roles[]` met `id`, `name`, `threshold` en `weights{}` voor alle domeinen
2. De rol is direct beschikbaar in Overzicht, Kandidaattest en doelrolkeuze in de Academy
3. Documenteer in `CHANGELOG.md`

### Nieuwe trainingsmodule
1. Voeg een object toe aan `trainingModules[]` met een `domain` ∈ `domains[]`
2. De module verschijnt automatisch in het leerprofiel van medewerkers in de Academy
3. Leg externe bron of inspiratie vast in `CONTENT_SOURCES.md` wanneer van toepassing
4. Documenteer in `CHANGELOG.md`

### Nieuwe assessmentvraag
1. Voeg een object toe aan `testQuestions[]` met `domain`, `type`, `prompt`, `options[]` en `answer`
2. Opties worden automatisch gehusseld; het juiste antwoord staat niet meer altijd op dezelfde positie
3. Overweeg ook een fallback-variant toe te voegen aan `fallbackQuestions{}`
4. Leg externe bron of inspiratie vast in `CONTENT_SOURCES.md` wanneer van toepassing
5. Documenteer in `CHANGELOG.md`

### Nieuwe dashboard-module
1. Voeg HTML aan het betreffende view toe in `index.html` (panel met uniek `id`)
2. Schrijf een `render…()` functie in `app.js` die het panel vult
3. Registreer de module in `dashboardModules[]` (id, title, description, view, dataSource, panel)
4. Roep de render aan in `renderAll()` of de view-specifieke render
5. Documenteer in `CHANGELOG.md`

---

## Lokale state (localStorage)

| Sleutel | Inhoud |
|---------|--------|
| `camaiAnswers` | `{ questionId: answerIndex \| answerObject }` |
| `camaiQuestionIndex` | huidig vraagnummer in de kandidaattest |
| `camaiAuditLog` | array van auditlog-entries |
| `camaiCompletedModules` | `{ learnerId: [moduleId, ...] }` |
| `camaiModuleUpdates` | `{ learnerId: { moduleId: { status, comment, timeline } } }` |

Productiegebruik vereist server-side opslag en autorisatie via Microsoft Entra ID.
