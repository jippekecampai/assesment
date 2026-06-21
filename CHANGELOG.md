# Changelog

## 2026-06-21 (unified-overview)

### Added

- `DATASTRUCTURE.md` toegevoegd: canonieke databoom met alle entiteiten, relaties, dashboard-modules en het protocol voor het toevoegen van nieuwe data.
- `people[]` unified array toegevoegd: kandidaten en medewerkers samengevoegd met `type: "candidate"` / `type: "learner"`.
- `dashboardModules[]` registry toegevoegd: elke module declareert id, title, view, dataSource en panel. Nieuwe modules hangen hier als eerste aan.
- Stats strip aan het Overzicht: telkaarten voor kandidaten, medewerkers, domeinen en trainingsmodules.
- People overview in het Overzicht: klikbare kaarten voor kandidaten (beste rol-fit) en medewerkers (doelrol-score + modulevoortgang).
- Domeindekking heatmap in het Overzicht: matrix van alle personen × domeinen, kleurgecodeerd.
- Scheidingslijn "Kandidaatdetail" als ankerpunt na klikken op een kandidaatkaart.

### Changed

- `renderAll()` roept nu eerst de drie nieuwe overview-renders aan.
- Overzicht toont nu kandidaten én medewerkers op één pagina.

### Risk / Follow-up

- `people[]` is een computed view; mutaties na initialisatie vereisen expliciete her-initialisatie.
- Click-handlers worden hergebonden bij elke `renderAll()`; productie vereist event delegation.

## 2026-06-21 (assessment-antwoordbias)

### Changed

- Antwoordopties van de assessmentvragen worden nu deterministisch per vraag gehusseld (`shuffleQuestionOptions`), zodat het juiste antwoord niet langer altijd op positie b staat. De volgorde is geseed op `question.id` en blijft daarom stabiel over reloads, zodat autosaved antwoorden niet verspringen.
- Optieteksten van alle test- en fallbackvragen herschreven naar vergelijkbare lengte, zodat het juiste antwoord niet meer te herkennen is als "het langste antwoord".

### Risk / Follow-up

- De shuffle is deterministisch per `question.id`, dus de volgorde is gelijk voor alle kandidaten. Voor echte assessmentsecurity is per-kandidaat randomisatie beter; dat vereist het persisteren van de optievolgorde naast de antwoorden in `localStorage` (of server-side).
- Reeds in `localStorage` opgeslagen antwoorden van vóór deze wijziging kunnen naar een andere optie verwijzen; voor het prototype is een schone testsessie voldoende.

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
