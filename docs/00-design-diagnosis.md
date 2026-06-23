# 00 — Ontwerpdiagnose (visueel & UX)

**Datum:** 2026-06-22
**Scope:** waarom de app "overladen" en slecht scanbaar aanvoelt — concreet en benoembaar.
**Methode:** statische analyse van `index.html`, `app.js` (render-laag), `styles.css`.
**Niet in scope:** meet-/scorelogica (gehard, contractueel vastgelegd — niet aangeraakt).

---

## 1. Hoeveel informatieblokken concurreren gelijktijdig om aandacht?

### Reviewdashboard (`#overviewView`) — het ankerscherm

Bij het openen staan **twaalf** onafhankelijke blokken tegelijk in één verticale scroll,
zonder hiërarchie ertussen:

| # | Blok | Bron |
|---|------|------|
| 1 | KPI-stats (4 cijfers) | `renderOverviewStats` |
| 2 | Kandidaten-kaarten | `renderOverviewPeople` |
| 3 | Medewerkers-kaarten | `renderOverviewPeople` |
| 4 | Domeindekking-heatmap (13 kolommen) | `renderDomainHeatmap` |
| 5 | Kandidaat-profielstrip + meta-grid | `renderCandidate` |
| 6 | Controls-rij (3 selects) | statisch |
| 7 | Beste rol-fit (5 balken + ring) | `renderRoles` |
| 8 | Competentiekaart: radar **naast** benchmark-tabel | `renderRadar` + `renderBenchmarkTable` |
| 9 | Beslisinspector | `renderInspector` |
| 10 | Topicmatrix (7×13 cellen = 91 getallen) | `renderTopicMatrix` |
| 11 | Scenarioprestatie (10 rijen) | `renderTimeline` |
| 12 | Vraagbewijs-tabel | `renderEvidence` |

Op één scherm staan zo ruw geteld **>250 losse getallen** (heatmap 13×6=78, topicmatrix 91,
benchmark 13×3, scenario 10, rolbalken 5, KPI 4 …). Alles heeft hetzelfde visuele gewicht:
witte kaart, zelfde radius, zelfde schaduw, zelfde koptypografie. Niets domineert, dus het
oog krijgt geen startpunt.

**Concurrentie:** blok 4 (heatmap, álle personen × álle domeinen) en blokken 7–12 (detail van
één kandidaat) staan door elkaar in dezelfde kolom. De gebruiker weet niet of dit scherm over
"de hele pijplijn" of over "deze ene kandidaat" gaat — het is allebei tegelijk, ongescheiden.

### Andere views
- **Skills Academy** (`#academyView`): hero + 2 home-kaarten + 6 panelen (skill-gap, taken,
  badges, moduletabel, teamchallenge, KPI's) — zelfde "alles tegelijk"-patroon.
- **Vragenbank / Governance / Beheer**: rustiger, maar zelfde platte kaart-op-kaart-stapeling
  zonder leesvolgorde.

---

## 2. Hiërarchie: is de primaire conclusie per view visueel als zodanig behandeld?

**Nee.** Per view ontbreekt een dominante "dit is de conclusie"-zone.

- Het Reviewdashboard heeft wél een conclusie in de data — *"kandidaat X past op rol Y met
  fit-score Z, advies = geschikt/borderline"* — maar die staat versnipperd over blok 5
  (`#decisionLabel`), blok 7 (`#fitPill` + ring), en blok 9 (inspector). Drie plekken, drie
  keer hetzelfde half verteld, nergens groot.
- De `<h1>` in de topbar ("Assessmentconsole voor rol-fit") is statisch en verandert nooit;
  hij draagt geen conclusie.
- Alle panel-koppen (`<h3>`) hebben hetzelfde gewicht. Een management-conclusie en een
  audit-tabel zien er typografisch identiek uit.

---

## 3. Scanbaarheid: ziet een TAM/manager binnen ~5 s "rol-fit / waar de gaten"?

**Niet binnen 5 seconden.** Om "past deze kandidaat?" te beantwoorden moet de gebruiker:
1. naar beneden scrollen voorbij de heatmap van álle personen,
2. de juiste kandidaat in een `<select>` kiezen (of een kaart aanklikken),
3. de fit-ring zoeken (blok 7), en
4. de gaten zelf afleiden uit blok 9 of de heatmap-rij.

Er is geen enkele regel die in mensentaal zegt *"Sterke fit voor Cloud Engineer; risico op
VoIP en Inforcer."* De best-fit-rol wordt wél berekend in `renderOverviewPeople`
(`[...roles].sort(...)`), maar alleen klein op de kaart getoond — niet als kop-conclusie.

---

## 4. Specifieke pijnpunten

### 4.1 Heatmap = plat pastelraster met piepkleine cijfers
`renderDomainHeatmap` zet per cel een getal met één van drie klassen (`hm-good/warn/risk`).
In `styles.css` zijn dat lichte pastels met donkere tekst. Problemen:
- **Lage encoding-resolutie:** 3 tinten voor een 0–100-schaal. 74 en 60 zien er identiek uit
  (beide "warn"), 75 en 96 ook (beide "good"). De kleur draagt nauwelijks informatie.
- **Pastel = lage contrastsprong:** good/warn/risk liggen qua lichtheid dicht bij elkaar; het
  raster oogt egaal. Je *ziet* geen patroon, je moet de cijfers lezen.
- **Cijfers klein** in krappe cellen; 13 kolommen dwingen horizontale scroll (`.hm-scroll`),
  waardoor je nooit alle domeinen tegelijk ziet.

### 4.2 Radar botst met het naastgelegen scrollpaneel
`.skill-map-wrap` zet de SVG-radar (`viewBox 0 0 420 320`) **naast** de benchmark-tabel
(`#benchmarkTable`, 13 rijen, scrollt). De radarlabels staan op `radius + 34` en lopen tegen
de paneelrand/tabel aan; bij smallere kolommen overlappen tekstlabels met de tabel. Een
13-assige radar is bovendien intrinsiek druk en moeilijk af te lezen — slechte
encoding voor "waar zit het gat".

### 4.3 Ontbrekend verticaal ritme
Spacing is ad hoc: panelen hebben eigen paddings, `.section-divider`, `.controls-row`,
`.dashboard-grid` met `auto-fit minmax(...)`. Er is geen consistente baseline-spacing-eenheid;
kaarten "zweven" op wisselende afstanden. Tokens bestaan voor kleur/radius/shadow, maar **niet
voor spacing** (geen `--space-*`-schaal) en **niet voor een typografische schaal** (font-sizes
staan los per selector).

### 4.4 Gedrag op smal scherm
`.app-shell` is `grid-template-columns: 260px minmax(0,1fr)` — de sidebar is niet inklapbaar.
`.dashboard-grid` valt via `auto-fit` terug naar één kolom, maar dan staan álle 12 blokken
nóg langer onder elkaar (extreem lange scroll). De heatmap scrollt horizontaal binnen een al
smal scherm. Er is geen mobiele navigatie-affordance.

### 4.5 Topicmatrix is grotendeels ruis
`renderTopicMatrix` toont 91 cellen, maar de waarde is `base + ((rowIndex+domainIndex)%4)*3-4`
— een **cosmetische afgeleide** van de domeinscore, geen onafhankelijke meting. Het oogt als
data maar voegt nauwelijks informatie toe; het concurreert wel zwaar om aandacht. (We behouden
de afgeleide logica, maar verplaatsen hem naar een detaillaag.)

---

## 5. Maintainability: kan deze structuur het herontwerp dragen?

Grotendeels ja, met gerichte ingrepen:

- **Sterk punt:** strikte scheiding tussen *data + scorelogica* (`app.js` regels 1–1003) en
  de *render-laag* (`render*`-functies die `innerHTML` in vaste panel-id's schrijven). De
  scorelogica (`roleScore`, `scoreState`, `scoreClass`) is puur en herbruikbaar. We kunnen de
  hele presentatielaag vervangen zonder de meetkern aan te raken.
- **Zwak punt:** de markup zit hard in `index.html` (elk paneel met vaste id). Herontwerp van
  layout vereist dus parallel HTML + CSS + render-aanpassingen. Dat is te doen, maar vraagt om
  een afgesproken paneel-/spacing-systeem zodat we niet 12 losse kaarten blijven stapelen.
- **CSS:** 38 KB zonder spacing-/typeschaal-tokens en met veel one-off selectors. Een
  herbruikbaar design-systeem (tokens + een paar kaart-/grid-primitieven) is nodig; losse
  patches verergeren de wildgroei.

**Conclusie:** geen volledige rewrite nodig. De meetkern blijft; we vervangen de
presentatielaag en introduceren een afdwingbaar design-systeem (tokens voor spacing + type,
een tab-gebaseerd progressive-disclosure-patroon, en een heatmap met echte encoding).
