# 01 — Ontwerpkader: de rustige Campai-cockpit

**Datum:** 2026-06-22
**Status:** vastgelegde richting, hier concreet en afdwingbaar gemaakt.

> De richting ligt vast (rustige consultant-/HR-/management-cockpit binnen Campai v2). Dit
> document **kiest** niets opnieuw; het vertaalt de richting naar regels waar de build aan
> toetsbaar is.

---

## 0. Vier principes (de meetlat)

1. **Eén hoofdconclusie per view.** Elke view opent met één regel die in mensentaal de
   conclusie geeft (fit / risico / advies). Al het andere is ondersteuning of detail.
2. **Management aan de oppervlakte, engineer één klik dieper.** De bovenste laag bevat geen
   technische ruis. Detail (radar, topicmatrix, bewijs-tabel) zit achter een tab/disclosure.
3. **Rust door ritme.** Eén spacing-schaal, één type-schaal, veel witruimte, terughoudend
   kleurgebruik. Kleur betekent iets; ze versiert niet.
4. **Encoding boven decoratie.** Een datavisualisatie moet in één oogopslag een patroon tonen
   (heatmap, balken), niet pas na het lezen van losse cijfers.

---

## 1. Typografische schaal & verticaal ritme

**Fonts (v2, ongewijzigd):** Sora = display/koppen, Inter = body/UI, JetBrains Mono = getallen
& codes (scores, drempels, id's). Mono voor cijfers geeft kolom-uitlijning en een "cockpit"-gevoel.

**Type-schaal** (tokens `--fs-*`, 1.20 ratio, afgerond):

| Token | px | Gebruik |
|-------|----|---------|
| `--fs-display` | 30 | view-conclusie (Sora 700) |
| `--fs-h2` | 22 | sectiekop (Sora 600) |
| `--fs-h3` | 17 | panelkop (Sora 600) |
| `--fs-body` | 15 | lopende tekst (Inter 400/500) |
| `--fs-sm` | 13 | secundair |
| `--fs-label` | 11 | overline-labels (Inter 600, uppercase, letter-spacing) |
| `--fs-metric` | 34 | groot kerncijfer (JetBrains Mono) |

**Verticaal ritme:** spacing-schaal op een 4px-grid, tokens `--space-*`:
`4, 8, 12, 16, 24, 32, 48, 64`. Regels:
- Afstand **tussen secties** = `--space-8` (48px). Tussen panelen in een grid = `--space-6` (32).
- Padding **binnen een paneel** = `--space-6` (32) desktop, `--space-5` (24) smal.
- Verticale afstand kop→inhoud = `--space-4` (16). Label→waarde = `--space-2` (8).
- Geen losse marges meer per component: alles verwijst naar deze tokens.

---

## 2. Kleurgebruik binnen v2-tokens

Fundament (ongewijzigd): navy `#003d6b`, navy-deep `#002847`, lime `#cdd100`, cyan `#0bb4ed`.
Status: good `#16844f`, warn `#c88605`, risk `#e62a4f`.

**Rolverdeling (afdwingbaar):**
- **Navy** = structuur: sidebar, koppen, tekst, randen. De rust-basis.
- **Cyan** = *interactie & selectie*: actieve nav, geselecteerde kandidaat, primaire knop,
  focusring. Eén accent voor "waar ben ik / wat doe ik".
- **Lime** = *spaarzaam, alleen voor de hoofd-KPI/positief eindoordeel* (bv. de fit-ring bij
  "sterke fit", XP-voortgang in de Academy). Lime is een schreeuwerige kleur; max. één
  lime-element per view, anders verdwijnt de hiërarchie.
- **Good/warn/risk** = uitsluitend voor score-/risico-encoding (heatmap, balken, badges).
  Nooit decoratief.
- **Neutralen:** witruimte is wit/`--surface`; panelen op `--bg` (zeer licht). De zware
  gradient-mesh achtergrond gaat eruit (te druk) → rustige egale achtergrond.

**Regel:** een vlak is óf neutraal (structuur) óf draagt een statuskleur die een score betekent.
Geen statuskleur "voor de sier".

---

## 3. Kaart-/paneelpatroon & spacing-systeem

Eén paneel-primitief `.panel`: `--surface`, `--radius` (16), `1px --border`, zachte
`--shadow`, padding `--space-6`. Varianten via modifier-classes, niet via losse CSS per blok:
- `.panel--quiet` (geen schaduw, alleen rand) voor ondersteunende info.
- `.panel--feature` voor de conclusie-zone (iets prominenter: navy accentrand links).

**Paneelkop** `.panel__head`: overline-label (`--fs-label`) + `<h3>` links, optionele actie/legenda
rechts. Vast ritme kop→inhoud = `--space-4`.

**Grid:** een herbruikbaar 12-koloms-gevoel via `.grid` met named spans
(`.col-4`, `.col-6`, `.col-8`, `.col-12`), gap `--space-6`. Geen `auto-fit minmax` meer (dat gaf
het ongecontroleerde herstapelen). Breekpunt < 960px → alles `col-12`.

---

## 4. Datavisualisatie-stijl

### 4.1 Heatmap — van plat pastel naar leesbare encoding
- **Sequentiële kleurramp** met echte lichtheidssprongen over de 0–100-schaal in 5 stappen
  (risk → zwak → midden → goed → sterk), niet 3 pastels. Donker/verzadigd = laag risico-uiterste
  en hoog-sterk-uiterste duidelijk onderscheidbaar; de stappen verschillen merkbaar in lichtheid
  zodat het patroon zichtbaar is **zonder** de cijfers te lezen.
- **Cel = kleurvlak met de score in mono**, voldoende groot (min. ~40px hoog), score-getal
  leesbaar met contrastbewuste tekstkleur (donkere tekst op lichte cel, witte op donkere).
- **Geen verplichte horizontale scroll op desktop:** korte domeinlabels in een sticky
  kop-rij; bij smal scherm degradeert de heatmap naar een per-persoon "top-risico"-lijst i.p.v.
  een onleesbaar mini-raster.
- **Legenda als gradient-balk** met de 5 stappen, niet 3 losse stipjes.
- Rij-conclusie: per persoon een mini "laagste domein"-indicator zodat het gat meteen opvalt.

### 4.2 Radar — herpositioneren, niet naast een scrollpaneel
- De radar verhuist naar een **eigen tab** ("Competentieprofiel") met volledige breedte en
  ruime marge rond de labels; hij deelt geen rij meer met de benchmark-tabel → geen overlap.
- Standaard-overzicht gebruikt **geen** radar maar **gesorteerde horizontale balken**
  (sterkste → zwakste domein), want dat is voor management/TAM sneller scanbaar ("waar zit het
  gat" = onderste balken). De radar blijft beschikbaar als verdieping voor wie het profielvorm
  wil zien — hij wordt herpositioneerd, niet verwijderd.

### 4.3 Scores algemeen
- Balken: spoor = neutraal, vulling = statuskleur o.b.v. drempel. Cijfer in mono ernaast.
- Eén consistente score→kleur-functie voor heel de app (drempelgebaseerd waar een rol-drempel
  geldt; absoluut waar geen drempel).

---

## 5. Progressive-disclosure-patroon

Per detail-rijke view geldt een vaste gelaagdheid:

**Laag 1 — Conclusie (altijd zichtbaar, management-leesbaar):**
- Reviewdashboard: *"{Kandidaat} — {beste/gekozen rol}: {fit-score}/100, advies {staat}.
  Sterkste: …  Aandacht: …"* + fit-ring + risico-badge. Eén feature-paneel.
- Academy: *"{Medewerker} → {doelrol}: rolfit {n}/100, {k} kritieke gaten, level {l}."*

**Laag 2 — Ondersteuning (zichtbaar, compact):** rol-fit-ranking (alle rollen), skill-gap-balken.

**Laag 3 — Detail (achter tabs/disclosure, "op aanvraag"):** competentieprofiel (radar +
benchmark), scenario-prestatie, vraagbewijs-tabel, topicmatrix. Dit is de engineer-laag.

**Tabs** zijn het mechanisme (geen accordion-wildgroei): één tabstrip per detailzone, ARIA
`role=tablist`, toetsenbordbedienbaar, eerste tab = meest management-relevante.

**Wat blijft ALTIJD zichtbaar (contract, mag niet achter een klik verdwijnen):**
coverage/dekking (heatmap), de fit-score + drempel, het expliciete "advies is voor een mens,
geen automatisch oordeel"-kader, en de usageMode-scheiding recruitment vs. academy.

---

## 6. Toetsbare acceptatie (waar de rechter op meet)

- [ ] Elke view opent met één visueel dominante conclusie-regel.
- [ ] ≤ ~5 blokken in laag 1+2; de rest achter tabs.
- [ ] Heatmap toont een patroon zonder cijfers te hoeven lezen; legenda is een ramp.
- [ ] Radar overlapt niets en deelt geen rij met een scrollende tabel.
- [ ] Eén spacing-schaal en één type-schaal, overal via tokens.
- [ ] Smal scherm: inklapbare nav, geen 12-blokken-scroll, geen onleesbaar mini-raster.
- [ ] Lime ≤ 1 prominente plek per view; statuskleur alleen voor scores.
- [ ] Score-/coverage-/governance-logica ongewijzigd (snapshot vóór/ná identiek).
