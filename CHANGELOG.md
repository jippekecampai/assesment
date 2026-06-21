# Changelog

## 2026-06-21

### Added

- Campai Skills Academy toegevoegd als interne trainingsmodus naast recruitment.
- Leerprofielen, rolpaden, skill-gap analyse, XP, levels, badges en modulevoortgang toegevoegd.
- Trainingsmodules toegevoegd voor Microsoft 365, Azure, Kaseya Stack, Fortigate, SharePoint/Teams, migraties, Inforcer, AI/Copilot, communicatie en Engels.
- Teamchallenge toegevoegd om samenwerking en herbruikbare MSP-werkwijzen te stimuleren.
- Trainingrapport-export toegevoegd met `usageMode: campai-internal-training`.
- Learned-achtige medewerker-home toegevoegd met quick cards, taken, career plan, Onboard & Learn tabel en module-detailmodal.

### Changed

- Navigatie uitgebreid met `Skills Academy`.
- Documentatiekaart uitgebreid met trainingresultaten.
- README uitgebreid met Academy-scope, governance en gamification-uitgangspunten.

### Risk / Follow-up

- Modulevoortgang staat lokaal in `localStorage`; productiegebruik vereist server-side opslag en autorisatie.
- Trainingdata moet gescheiden blijven van recruitment- en HR-besluitvorming.
- Badges zijn nu gekoppeld aan moduleafronding, maar nog niet aan senior review of bewijsuploads.
- Module-updates bewaren status/comment lokaal; productie vereist server-side timeline en reviewrechten.

## 2026-06-12

### Added

- Profiel- en adminpaneel toegevoegd aan het dashboard.
- Approllen vastgelegd voor Assessment Admin, Reviewer, Question Author en Candidate.
- Documentatiekaart toegevoegd voor profiel, vragenbank, kandidaatresultaten, bronmateriaal, governancebesluiten en wijzigingen.
- Lokaal dashboard-auditlog toegevoegd voor selectie-, filter-, antwoord-, vraag- en exportacties.

### Changed

- README uitgebreid met admin- en wijzigingsdocumentatieproces.
- Ontbrekende CSS-variabelen `--line` en `--navy` toegevoegd.
- Responsive CSS uitgebreid voor adminpaneel en smalle schermen.
- Assetversie aangepast naar `20260612-console-cleanup` zodat Azure-browsers de nieuwe CSS en JavaScript ophalen.
- Console opgeschoond: begeleidende prototype-teksten verwijderd, `Profiel & admin` hernoemd naar `Beheer`, SSO-blok uit de topbar verwijderd en overbodige bron-/architectuurpanelen verwijderd.

### Risk / Follow-up

- Adminrol is nu front-end zichtbaar en lokaal bruikbaar voor het prototype, maar nog niet server-side afgedwongen.
- Productiegebruik moet Entra ID app roles of security groups afdwingen in `server.mjs` voordat adminacties vertrouwd mogen worden.
