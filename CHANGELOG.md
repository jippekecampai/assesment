# Changelog

## 2026-06-22 — UX-uplift: rustige Campai-cockpit (visueel & UX-herontwerp)

- **Scope:** volledige presentatielaag herontworpen naar een rustige consultant/management-cockpit
  binnen Campai v2-tokens. Aangeraakt: `styles.css` (volledig herschreven), `index.html`
  (herstructureerd), `app.js` (alléén render-/bind-functies). **Niet** aangeraakt: datamodel,
  score-/wegings-/coveragelogica, `usageMode`-scheiding, governance-gates, `server.mjs`, `lib/*`.
- **Reden:** de app was overladen en slecht scanbaar (≈12 panelen tegelijk, geen hiërarchie,
  heatmap als plat pastelraster, radar die botste met een scrollpaneel). Zie
  `docs/00-design-diagnosis.md`.
- **Design-systeem:** spacing-schaal (`--space-*`, 4px-grid) en typeschaal (`--fs-*`) toegevoegd;
  paneel-/grid-/tab-primitieven; zware gradient-mesh-achtergrond verwijderd voor rust.
- **Reviewdashboard (anker):** progressive disclosure in 3 lagen — conclusie-cockpit (fit-ring,
  risico-badge, één conclusie-zin) → rol-fit-ranking + sterktes/aandacht → detail achter tabs
  (competentieprofiel, scenario's, vraagbewijs, topicmatrix).
- **Heatmap:** van 3 pastels naar een 5-staps sequentiële encoding (`heatClass()`) met
  per-rij "laagste domein"-signaal en een leesbare smal-scherm-fallback.
- **Radar:** herpositioneerd naar een eigen, ruimere tab — geen overlap meer met de
  benchmark-tabel.
- **Consistent uitgerold** over Kandidaattest, Skills Academy, Vragenfabriek, Governance en
  Beheer (view-conclusie-strip + `mode-banner` voor de recruitment/internal-training-scheiding).
- **Responsive:** inklapbare sidebar (`#navToggle`), 12-koloms-grid degradeert netjes, heatmap
  valt terug op een lijst i.p.v. een onleesbaar mini-raster.
- **UI-code verwijderd (mét reden):** de oude `.qualification-ring`/`#qualificationStatus`/
  `#qualificationText`/`#decisionLabel`-blokken zijn weg — de fit-conclusie stond drie keer
  versnipperd en is nu één keer prominent in de cockpit. De `.section-divider` is vervangen
  door de cockpit-sectie (scroll-anchor `#overviewDetailAnchor` behouden).
- **Risico/follow-up:** heatmap-ramp is geoptimaliseerd op lichtheidscontrast, nog niet formeel
  colour-blind-safe. Academy/Vragenfabriek/Governance/Beheer kregen het systeem maar geen eigen
  tab-gelaagdheid (waren minder overladen). Detail: `docs/02-decisions.md`,
  `docs/99-judge-report.md`.
- **Verificatie:** scoring-snapshot vóór/ná byte-identiek; jsdom-smoke-test (alle views/tabs)
  PASS; `npm run doctor`/`check` groen; `npm test` 15/15.

## 2026-06-22 — Portal-spoke (EXTERNAL)
- **Scope:** App omgevormd tot Campai Portal-spoke: `spoke.manifest.json`,
  `scripts/spoke-doctor.mjs`, `lib/hub.mjs`, `lib/auth.mjs`, `lib/anonymize.mjs`,
  `lib/source-material.mjs`, CI-workflow.
- **Vragenfabriek:** nieuwe routes `/api/hub/companies` en `/api/hub/source-material`
  lezen geanonimiseerde tickets/devices/live-data via de hub-gateway → `draftQuestions[]`.
- **Huisstijl:** cyan `#0bb1ef` → `#0bb4ed` (Console-token).
- **Reden:** opname in de Portal-launcher met door-de-hub-bestuurde toegang.
- **Risico/follow-up:** OBO-token (`lib/auth.mjs`) is nog een stub; vullen bij de
  Azure/Entra-uitrol. `departments` in het manifest bevestigt de beheerder.

## 2026-06-21

### Added

- Open-source inspiratie verwerkt in Campai-eigen trainingsmodules, assessmentvragen en conceptvragen voor Azure, M365 security, attack paths, secure automation en security awareness.
- `CONTENT_SOURCES.md` toegevoegd voor bronregistratie, licentie-inschatting en gebruiksbeleid.
- Overzicht uitgebreid met stats strip, kandidaat-/medewerkerkaarten en domeindekking-heatmap.
- `DATASTRUCTURE.md` toegevoegd als protocol voor nieuwe kandidaten, medewerkers, domeinen, rollen, modules en dashboardmodules.
- `people[]` en `dashboardModules[]` toegevoegd als basis voor uitbreidbare dashboardstructuur.
- Campai Skills Academy toegevoegd als interne trainingsmodus naast recruitment.
- Leerprofielen, rolpaden, skill-gap analyse, XP, levels, badges en modulevoortgang toegevoegd.
- Trainingsmodules toegevoegd voor Microsoft 365, Azure, Kaseya Stack, Fortigate, SharePoint/Teams, migraties, Inforcer, AI/Copilot, communicatie en Engels.
- Teamchallenge toegevoegd om samenwerking en herbruikbare MSP-werkwijzen te stimuleren.
- Trainingrapport-export toegevoegd met `usageMode: campai-internal-training`.
- Learned-achtige medewerker-home toegevoegd met quick cards, taken, career plan, Onboard & Learn tabel en module-detailmodal.

### Changed

- Kandidaattestvragen krijgen nu een gebalanceerde antwoordvolgorde en vergelijkbare optie-lengtes; lokale oude testantwoorden worden bij schemawijziging gereset.
- Vragenbankconcepten zijn nu openklapbaar, bewerkbaar en kunnen vanuit de reviewlijst aan het assessment worden toegevoegd.
- Beheer toont nu expliciet de datastructuur, browser-memory en actieve settings naast documentatie en auditlog.
- Campai Design System styling toegepast met een vaste linker dashboardnavigatie.
- Navigatie uitgebreid met `Skills Academy`.
- Documentatiekaart uitgebreid met trainingresultaten.
- README uitgebreid met Academy-scope, governance en gamification-uitgangspunten.

### Risk / Follow-up

- Letterlijk hergebruik van externe content alleen doen na expliciete licentiecheck; onduidelijke bronnen zijn nu uitsluitend als inspiratie gebruikt.
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
