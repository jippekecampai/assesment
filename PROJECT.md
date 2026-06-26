# Campai Assessment & Skills Academy — Project

Status: **migratie naar React + Mantine afgerond** (2026-06-26). Alle 6 schermen
draaien op Mantine; spoke-contract (server/doctor/CLAUDE.md) meeverhuisd.

## Doel

De Campai recruitment-assessment + Skills Academy app op dezelfde UI-stack,
theme en componentconventies brengen als de referentie `skill-forge`
(de "Herbouwde Campai cockpit"). Eén Campai-huisstijl, herbruikbare
componenten, voorspelbaar onderhoud.

## Architectuurbesluit (2026-06-26)

Mantine is een React-componentbibliotheek en bestaat niet buiten React. De
app was vanilla (`index.html` + `app.js` + `styles.css`, geserveerd door
`server.mjs`). Om "dezelfde stack als skill-forge" te halen, wordt de app
omgebouwd naar:

- **React 19** + **TanStack Start / Router / Query**
- **Mantine 9** (`@mantine/core|hooks|form|notifications`) + `@tabler/icons-react`
- **Vite 8** + **bun**
- Campai-theme 1-op-1 uit `skill-forge/src/lib/campai-theme.ts`

### Wat behouden blijft (alleen verplaatst, gedrag ongewijzigd)

- Alle **data** (rollen, domeinen, kandidaten, learners, modules, evidence,
  testvragen, draftQuestions) → `src/lib/data.ts`
- Alle **score-/wegingslogica** (`roleScore`, `scoreState`, `learnerXp`, …)
  → `src/lib/scoring.ts`
- **Hub-integratie** (Autotask via `lib/hub.mjs`), **anonimisering**,
  **Entra-auth**, **autosave**, **RBAC**, **governance-gates**

### Wat verandert

- De ~30 imperatieve `render*`-functies → React/Mantine-componenten per scherm
- De serveerlaag (`server.mjs`) → TanStack-server; hub-proxy/Azure-logica
  meeverhuizen
- `CLAUDE.md` "vanilla"-regel en `scripts/spoke-doctor.mjs` worden herzien
  naar de nieuwe stack

## Schermen (6)

1. Reviewdashboard — cockpit, fit-ring, radar, heatmap, detail-tabs
2. Kandidaattest — adaptief assessment, lokale autosave
3. Vragenfabriek — conceptvragen + hub-bron + senior-review-gate
4. Skills Academy — XP, learning path, modules, module-modal
5. Beleid — governance-regels
6. Beheer — profiel, rollen, documentatie, audit-log

## Terugrollen

Werkende vanilla-versie staat als git-tag **`stable-vanilla-20260626`**.
`git checkout stable-vanilla-20260626` herstelt de volledige vanilla-app.

## Conventies

- UI-copy in het **Nederlands**, Campai-conventie.
- Componenten en theme **kopiëren uit skill-forge**, niet opnieuw verzinnen.
- Per scherm migreren met een review-checkpoint; niet alles in één klap.
