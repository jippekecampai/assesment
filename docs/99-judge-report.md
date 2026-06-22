# 99 — Judge report (onafhankelijke beoordeling)

**Datum:** 2026-06-22
**Beoordeelde wijziging:** visueel & UX-herontwerp naar rustige Campai-cockpit
**Branch:** `claude/pensive-sagan-bdrpzq`
**Ronde:** 1

De rechter beoordeelt streng tegen de diagnose (`docs/00`) en het ontwerpkader (`docs/01`).

---

## 1. Visuele kwaliteit & hiërarchie

| Toets | Oordeel | Bewijs |
|------|---------|--------|
| Eén duidelijke conclusie per view i.p.v. overladen | ✅ | Elke view opent met `.view-head` (conclusie-zin) + `mode-banner`. Dashboard heeft één feature-cockpit met fit-ring + risico-badge bovenaan. |
| TAM/manager ziet rol-fit + gaten in ~5s | ✅ | `#cockpitConclusion`: *"Beste rol-fit: X · n/100 … advies {staat}"* + chips "Sterkste/Aandacht". Geen scrollen nodig. |
| Eén primaire actie/conclusie i.p.v. concurrerende panelen | ✅ | Laag 1 = conclusie; laag 2 = 2 panelen; laag 3 (4 panelen) verborgen achter tabs. Van ~12 gelijktijdige blokken → ~4 zichtbaar. |
| Visualisaties scanbaar | ✅ | Heatmap: 5-staps ramp met merkbare lichtheidssprong + "laagste domein"-signaal per rij; legenda is een ramp. Patroon zichtbaar zonder cijfers te lezen. |
| Rustige cockpit, onmiskenbaar Campai | ✅ | v2-tokens (Sora/Inter/JetBrains Mono, navy/lime/cyan), gradient-mesh verwijderd, consistent spacing-ritme via `--space-*`. Lime alleen voor XP/positief eindoordeel. |

**Bevinding:** de kernklacht (plat pastelraster, radar botst met scrollpaneel, geen
hiërarchie, alles tegelijk) is concreet opgelost. Radar staat nu in een eigen ruime tab
(`viewBox 440×360`), deelt geen rij meer met een scrollende tabel.

## 2. Gebruikerswaarde

- **TAM/recruiter:** ziet direct best-fit-rol + score + advies + sterkste/zwakste domein. ✅
- **Management/HR:** risico-badge ("Laag/Beperkt/Aandacht/Hoog risico") + conclusie-zin zonder
  technische ruis; technische tabel zit achter een tab. ✅
- **Engineer:** klikt door naar Competentieprofiel (radar + benchmark), Scenario's, Vraagbewijs,
  Topicmatrix. ✅

## 3. Behoud van kernwaarde / geen logica-regressie

| Toets | Oordeel | Bewijs |
|------|---------|--------|
| Score/weging/coverage identiek bij identieke input | ✅ | `snapshot.mjs` draait het echte `app.js` in een `vm`-sandbox; `roleScore`/`scoreState`/`scoreClass` voor alle personen × rollen — `diff` vóór/ná **leeg** (byte-identiek). |
| `usageMode`-scheiding intact | ✅ | `buildReport()` = `campai-only`; `buildTrainingReport()` = `campai-internal-training`; visueel versterkt met `mode-banner`. |
| Governance-gates intact | ✅ | Vragenfabriek promoot alleen via `promoteDraftToAssessment` (handmatig); geen auto-publicatie; `lib/anonymize` ongemoeid. |
| Best-fit blijft advies | ✅ | `.advice-note` ("geen automatisch oordeel") prominent in laag 1. |
| Render-guard / geen klant-PII naar kandidaten | ✅ | Kandidaattest toont alleen `testQuestions` (domain/type/prompt/options); geen hub-PII-pad gewijzigd. |

## 4. Technische kwaliteit

| Commando | Resultaat |
|----------|-----------|
| `npm run check` | ✅ schoon (`node --check` app.js + server.mjs) |
| `npm test` | ✅ 15/15 pass |
| `npm run doctor` | ✅ alle contracten OK (huisstijl-tokens aanwezig, geen `#0bb1ef`) |
| jsdom smoke-test | ✅ alle 6 views + alle tabs + kandidaat/rol/medewerker-wissel renderen zonder `console.error`/exception; 14 render-asserts groen |
| server boot | ✅ `/`, `/app.js`, `/styles.css` → 200; `/api/me` → JSON |

Logische opbouw: render-laag netjes gescheiden van meetkern; nieuwe helpers (`heatClass`,
`fitEncoding`) zijn puur en presentatie-only. Geen dode/misleidende code geïntroduceerd;
verwijderde UI-code is verantwoord in `CHANGELOG.md`.

## 5. Anti-cheat controle

- ❌→✅ **Geen screenshots als bewijs:** validatie is een echte jsdom-runtime-test + curl, geen
  plaatjes.
- ✅ **Geen stille feature-verwijdering:** heatmap, coverage, scenario's, vraagbewijs,
  topicmatrix, governance, badges, teamchallenge — allemaal nog aanwezig (deels verplaatst naar
  tabs, niet weggehaald).
- ✅ **Geen hardcoded demo-uitkomst:** alle cijfers komen uit `roleScore`/`scoreState` over de
  bestaande data; snapshot bewijst gelijke output.
- ✅ **Geen vereenvoudigde scorelogica:** meetkern byte-identiek.
- ✅ **Geen valse "AI-powered"-claim:** geen AI-marketingtekst toegevoegd.
- ✅ **Geen verborgen errors:** de bestaande `try/catch` rond hub-fetch/export tonen nette
  meldingen; geen nieuwe stille catches.

## 6. Regressiecontrole

Kernwaarde (domeinen → rolwegingen → scores; coverage/confidence; advies-voor-mens) is
behouden én aantoonbaar beter ontsloten. Bewust lichter behandeld en eerlijk gemeld:
- Academy/Vragenfabriek/Governance/Beheer kregen het volledige design-systeem en een
  conclusie-strip, maar **geen** eigen tab-gelaagdheid (waren minder overladen).
- Heatmap-ramp optimaliseert lichtheidscontrast, **nog niet** formeel colour-blind-safe.

Geen van beide raakt de meetlogica of een contractregel.

---

## Resterende zwakke punten (eerlijk)

1. Heatmap-kleurramp nog niet getoetst op colour-blind-safe (deuteranopie). Klein, verfijnbaar.
2. Vier secundaire views zijn consistent gestyled maar niet zo diep gelaagd als het dashboard.
3. Geen geautomatiseerde visuele-regressietest (alleen render-/scoring-asserts) — bewust, want
   geen build/CI-screenshotsysteem aanwezig.

Geen van deze rechtvaardigt een FAIL; ze staan op de "morgen reviewen"-lijst.

---

## JUDGE VERDICT: PASS

De app start zonder fouten, de meetlogica is byte-identiek, governance/usageMode/render-guard
zijn intact, en de visuele/UX-laag is fundamenteel rustiger en scanbaarder dan de gediagnoseerde
uitgangssituatie: één conclusie per view, een echt-leesbare heatmap, een herpositioneerde radar
en progressive disclosure via tabs. De resterende punten zijn verfijningen, geen blokkers.
