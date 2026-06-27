# Changelog

## 2026-06-27 — Werkende sollicitant-assessmentflow (Plan 1 + Plan 2)

- **Backend (Plan 1):** gedeelde vragen-/rol-content (`lib/assessment-content.mjs`),
  vraagvoorbereiding + functie-filtering + scoring/rol-fit (`lib/assessment.mjs`),
  toegangscodes (`lib/codes.mjs`), kandidaat-store Azure Table + file-fallback
  (`lib/candidate-store.mjs`), assessment-service (`lib/assessment-service.mjs`),
  en HTTP-endpoints in `server.mjs`: `GET/POST /api/candidates` (staff),
  `POST /api/assessment/start|submit` (code), `GET /api/candidates/:id/result`
  (staff, per-vraag-bewijs). 33 unit-tests groen.
- **Frontend (Plan 2):** route-split — `/test*` = vergrendelde **kiosk** (code-start
  → 1 vraag per scherm → uitslag met score + domein-uitslag, **géén** rol-fit),
  al het andere de medewerker-app. Nieuw **Sollicitanten**-scherm (aanmaken + code
  + statuslijst). **Reviewdashboard** op echte data met per-vraag-bewijs + rol-fit
  (reviewer-only).
- **Beveiliging:** antwoordsleutels en rol-fit bereiken de kiosk nooit; codes zijn
  eenmalig; staff-endpoints achter Entra (`requireStaff`), kandidaat-endpoints
  code-gated.
- **Opvul-logica verwijderd:** de kunstmatige optie-lengtebalans (`balanceOptionLengths`)
  die afleiders verraadde is eruit; vragenkwaliteit/-aantal volgt in de vragenbank-feature.
- **Azure Easy Auth:** `excludedPaths` = `/test`, `/assets/app.js`, `/assets/app.css`,
  `/favicon.ico`, `/api/assessment/start|submit` → kiosk anoniem bereikbaar op locatie,
  staff + staff-API's achter Entra SSO. Hiervoor genereert Vite **vaste asset-namen**
  (`assets/app.js|css`, geen hash) omdat authV2 `excludedPaths` exact matcht.
  Let op: niet-gehashte assets → bij toekomstige deploys evt. cache-busting toevoegen.

## 2026-06-26 — AI guard (@cmp/ai-guard) gevendord + Azure-deploy hersteld

- **AI guard:** de Campai PII-pseudonimisatielaag uit Roland's hub-repo
  (`tuxmanro/campai-portal-v2`, `packages/ai-guard` = private workspace-package)
  is 1-op-1 gevendord als `src/lib/ai-guard.ts` (`PromptSanitizer`, zero deps).
  Hub-contract: AI-prompts gaan altijd eerst door de guard zodat het model nooit
  rauwe klant-PII ziet. De app roept nu nog geen LLM aan; de guard staat klaar
  voor het moment dat er een Claude-call bijkomt (dan: sanitize() vóór, rehydrate()
  na). Runtime geverifieerd (round-trip, geen PII-lek).
- **Design system:** bevestigd dat Mantine (skill-forge) leidend blijft voor deze
  spoke (i.t.t. de Console-look uit de hub-docs) — geen wijziging nodig.
- **Azure-deploy hersteld:** `npm start` (node server.mjs) teruggezet en de deploy-
  workflow bouwt nu `dist/` in CI; de app draait weer (achter Entra SSO).

## 2026-06-26 — Migratie naar React + Mantine afgerond (alle 6 schermen)

- **Alle schermen gemigreerd** naar Mantine: Reviewdashboard (cockpit, fit-ring,
  radar, heatmap, detail-tabs), Skills Academy (XP/level, skill-gap, module-board
  + modal), Kandidaattest (adaptief, autosave, onbekend-fallbackvragen, rolweging),
  Vragenfabriek (concept-editor, hub-bron, promote naar assessment), Beleid, Beheer
  (profiel, rollen, datastructuur, memory, auditlog).
- **Logica behouden in `src/lib/`:** `data.ts` (alle data + assessment-prep),
  `scoring.ts` (rolfit/encoding), `learning.ts` (XP, gaps, audit, localStorage),
  `assessment.ts` (antwoorden + adaptieve fallbackvragen + gepromote concepten).
- **Spoke-contract meeverhuisd:** `server.mjs` serveert nu de `dist/`-build met
  SPA-fallback en behoudt alle `/api`-handlers (hub-proxy + Azure Table). Getest:
  root 200, `/api/health` ok, SPA-fallback 200. `spoke-doctor` groen, `npm test`
  15/15 groen, `tsc --noEmit` groen, productiebuild groen.
- **Documentatie:** `CLAUDE.md` herschreven naar de React/Mantine/Vite-stack;
  `spoke-doctor` huisstijl-check herkent nu `campai-theme.ts`.

## 2026-06-26 — Start migratie naar React + Mantine (skill-forge-stack)

- **[STABLE] snapshot:** de werkende vanilla HTML/JS-versie is vastgezet als
  git-tag `stable-vanilla-20260626`. Volledig terugrolbaar via
  `git checkout stable-vanilla-20260626`.
- **Besluit:** app wordt omgebouwd van vanilla (`index.html` + `app.js` +
  `styles.css` + `server.mjs`) naar **React 19 + Mantine 9 + TanStack Start +
  Vite/bun**, identiek aan referentie-repo `skill-forge`. Zie `PROJECT.md`.
- **Reden:** Mantine bestaat alleen binnen React; "dezelfde stack/theme/
  componentconventies als skill-forge" vereist de React-stack. Eén Campai-
  huisstijl en herbruikbare componenten over beide apps.
- **Behouden (alleen verplaatst):** alle data, score-/wegingslogica, hub-
  integratie, anonimisering, Entra-auth, autosave, RBAC, governance-gates.
- **Aanpak:** scaffolding eerst, daarna per scherm migreren met een review-
  checkpoint. Campai-theme 1-op-1 uit skill-forge.

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
