# 02 — Architectuur- & ontwerpkeuzes (UX-uplift)

**Datum:** 2026-06-22
**Branch:** `claude/pensive-sagan-bdrpzq`
**Context:** visueel & UX-herontwerp naar een rustige consultant/management-cockpit.
Logica, datamodel en governance zijn contractueel en blijven ongewijzigd.

---

## 1. Geen rewrite, geen frameworks, geen build-step

**Besluit:** de vanilla stack blijft (`index.html` + `app.js` + `styles.css` + `server.mjs`).
Geen Next.js/React/Vue, geen bundler, geen nieuwe runtime-dependencies in `package.json`.

**Reden:** het design-doel is een presentatielaag-uplift, geen architectuur-migratie. De
spoke-contracten (`spoke-doctor`) en de bestaande SSR/server-routes blijven intact. Een
framework zou de YAGNI-grens uit het spec-document (`docs/superpowers/specs/...`) schenden en
zou risico op logica-regressie sterk vergroten. De enige toegevoegde dependency is
**dev-only en niet gecommit** (`jsdom`, alleen lokaal voor de smoke-test, met `--no-save`).

**Gevolg voor structuur:** we houden één CSS-bestand en één JS-bestand. Dit is bewust géén
modularisatie naar ES-modules: de winst (iets nettere bestandsindeling) weegt niet op tegen
het risico van een `<script type=module>`-omzetting + meerdere fetches zonder bundler. De
interne *organisatie* is wel verbeterd (zie §3).

---

## 2. Scheiding meetkern ↔ presentatielaag (behouden contract)

**Wat NIET is aangeraakt** (geverifieerd, zie §5):
- `roles[]`, `domains[]`, `domainDetails{}`, `candidates[]`, `learners[]`, `trainingModules[]`,
  `testQuestions[]`, `fallbackQuestions{}`, `draftQuestions[]` — datamodel & veldnamen.
- `roleScore()`, `scoreState()`, `scoreClass()` — score-/wegings-/drempellogica, byte-identiek.
- Adaptieve test (`prepareAssessmentQuestion`, optie-shuffle, fallback-vragen,
  "onbekend onderwerp"-flow).
- `usageMode`-scheiding in `buildReport()` (`campai-only`) vs. `buildTrainingReport()`
  (`campai-internal-training`).
- Governance-gates: Vragenfabriek publiceert nooit automatisch naar `testQuestions[]`
  (senior-review-promotie via `promoteDraftToAssessment`), anonymisatie via `lib/*`.
- App-rollen (`adminRoles`), auditlog, identity-load.

**Wat WEL is vervangen:** uitsluitend de render-/markup-/stijl-laag.

---

## 3. Nieuwe presentatie-architectuur

### 3.1 Design-systeem in `styles.css` (volledig herschreven)
Eén afdwingbaar systeem i.p.v. losse one-off selectors:
- **Tokens** voor spacing (`--space-1…10`, 4px-grid) en typografie (`--fs-*`, `--font-*`),
  bovenop de bestaande v2-merk-tokens (navy/lime/cyan ongewijzigd).
- **Primitieven:** `.panel` (+ `--quiet`/`--feature`), `.grid` met `.col-*`-spans,
  `.tabstrip`/`.tab`/`.tabpanel`, `.view-head`, `.kpi-strip`, `.cockpit`, `.fit-ring`,
  `.risk-badge`, `.mode-banner`.
- De zware `--gradient-mesh`-achtergrond en glow-schaduwen zijn verwijderd → rustiger vlak.

### 3.2 Progressive disclosure via tabs (`bindTabs()`)
Het Reviewdashboard heeft nu drie lagen:
- **Laag 1 (conclusie):** `.cockpit` met fit-ring, risico-badge en één conclusie-zin
  (`#cockpitConclusion`) + sterkste/zwakste-chips.
- **Laag 2 (ondersteuning):** rol-fit-ranking (`#roleBars`) + sterktes/aandacht
  (`#decisionInspector`).
- **Laag 3 (detail, achter tabs):** competentieprofiel (radar + benchmark), scenario's,
  vraagbewijs, topicmatrix. Dit is de engineer-laag.

Tabs zijn een generiek, toetsenbord-/ARIA-vriendelijk mechanisme (`role=tablist/tab/tabpanel`,
`aria-selected`), herbruikbaar buiten het dashboard.

### 3.3 Render-functies aangepast (gedrag gelijk, output anders)
- `renderCandidate()` — vult nu de cockpit-conclusie (beste rol-fit + geselecteerde rol +
  advies + chips), kleurt de ring/risico-badge via de nieuwe `fitEncoding()`-helper. De
  onderliggende scores komen onveranderd uit `roleScore`/`scoreState`.
- `renderInspector()` — vereenvoudigd tot sterktes/aandacht-lijst (de score+drempel staan nu
  in de conclusie-zone, niet meer driedubbel).
- `renderDomainHeatmap()` — 5-staps `heatClass()`-encoding i.p.v. 3 pastels; per rij een
  "laagste domein"-signaal; smal-scherm-fallback (`.hm-fallback`) met top-gaten i.p.v. een
  onleesbaar mini-raster.
- `renderRadar()` — alleen geometrie (viewBox/center/radius) aangepast voor de eigen, ruimere
  tab; geen overlap meer met een scrollende tabel.
- `renderAcademy()` — extra conclusie-zin (`#academyConclusion`).
- `bindNavigation()` — werkt de topbar-titel bij en sluit de mobiele sidebar.

### 3.4 Nieuwe pure helpers (presentatie-only, geen meetlogica)
- `heatClass(score)` — score → 1 van 5 ramp-klassen.
- `fitEncoding(state)` — fit-state → ring-kleur + badge-klasse + risicolabel. Leest uit
  `scoreState`, herberekent niets.

Deze raken de scorewaarden niet aan; ze vertalen bestaande uitkomsten naar visuele encoding.

---

## 4. Behouden, expliciet zichtbaar gehouden (geen "schoner door weglaten")

- **Coverage/dekking:** de heatmap blijft (sterker leesbaar), met alle personen × domeinen.
- **Confidence/risico:** per kandidaat nu expliciet als risico-badge + drempel in de conclusie.
- **Best-fit = advies:** de `.advice-note` benadrukt "geen automatisch oordeel"; de tekst is
  bewust prominent in laag 1 gehouden.
- **usageMode-scheiding:** zichtbaar gemaakt met `.mode-banner` (recruitment vs.
  internal-training) bovenaan elke view.
- **Topicmatrix:** behouden (inclusief de afgeleide `(rowIndex+domainIndex)%4`-modifier) maar
  naar de detail-tab verplaatst; het is geen onafhankelijke meting en hoort niet in laag 1.

---

## 5. Verificatie van "geen logica-regressie"

**Snapshot-harness** (`scratchpad/snapshot.mjs`, niet gecommit): laadt het echte `app.js` in een
`vm`-sandbox met DOM/storage-shims, neutraliseert de trailing `init()`, en serialiseert voor
elke persoon × elke rol: `roleScore`, `scoreState`, `scoreClass`. Vóór en ná de hele
herontwerp-wijziging → **byte-identieke output** (`diff` leeg).

**Runtime smoke-test** (`scratchpad/smoke.mjs`, jsdom): laadt de echte `index.html`, draait
`app.js`, bezoekt alle 6 views, klikt alle tabs, wisselt kandidaat/rol/medewerker, en
assert dat elk dynamisch blok rendert zonder `console.error` of exception. → **PASS**.

**Doctor/check/test:** `npm run doctor` groen, `npm run check` schoon, `npm test` 15/15 pass.

---

## 6. Bewust niet meegenomen / lichter behandeld

- **Academy, Vragenfabriek, Governance, Beheer:** kregen het volledige design-systeem
  (tokens, panelen, conclusie-strip, mode-banner) maar **geen** eigen tab-gelaagdheid; ze waren
  minder overladen dan het dashboard en hadden dat niet nodig. Eerlijk gemeld in het
  nachtrapport.
- **Heatmap-kleurramp** is geoptimaliseerd op lichtheidssprong/scanbaarheid, niet op een
  formele colour-blind-safe schaal — een latere verfijning waard, maar buiten scope vannacht.
- **Geen** server-side wijzigingen (`server.mjs`, `lib/*`) — niet nodig voor een UX-uplift.
