# Campai Assessment als Portal-spoke ("Rolands manier") — Design

**Datum:** 2026-06-22
**Status:** Concept — ter review bij de gebruiker
**Repo:** `jippekecampai/assesment` (deze repo)
**Referentie:** `tuxmanro/campai-portal-v2` → `templates/spoke-starter` (read-only geraadpleegd)

---

## 1. Doel & intentie

De bestaande interne app (Campai recruitment-assessment + Skills Academy) wordt
opgenomen in het **Campai Portal (Hub & Spoke)** als **EXTERNAL spoke**, zodat hij
in de launcher verschijnt met door-de-hub-bestuurde toegang.

Nieuw t.o.v. de huidige app: de **Vragenfabriek** trekt echte, **geanonimiseerde**
MSP-casuïstiek uit de hub-gateway (Autotask-tickets, Datto RMM-devices, live
bron-data) en zet die om in **conceptvragen** (`draftQuestions[]`) voor
**verplichte senior-review**. Dit operationaliseert de "Aanbevolen Campai
Databronnen" uit de README, binnen de hub-contracten.

### Niet-doelen (YAGNI)
- **Geen** Next.js-rewrite. De bestaande vanilla app (`index.html` + `app.js` +
  `styles.css` + `server.mjs`) blijft. We wrappen hem en porten Rolands
  contractlaag ernaartoe.
- **Geen** EMBEDDED/iframe-variant.
- **Geen** eigen vendor-clients (Autotask/Datto/IT Glue) — alles via de gateway.
- **Geen** nieuwe auth — de bestaande Azure App Service Entra-SSO blijft; dat *is*
  naadloze SSO voor een EXTERNAL spoke (zelfde Entra-tenant, geen geforceerde prompt).
- **Geen** klant-PII naar kandidaten — anonimisatie is een harde eis.

---

## 2. Beslissingen (vastgelegd met de gebruiker)

| Onderwerp | Keuze |
|-----------|-------|
| Verpakking | Wrappen, Rolands contractlaag overnemen (geen rewrite) |
| App-type | `EXTERNAL` |
| Hub-data lezen | Ja — t.b.v. de Vragenfabriek |
| Bronnen/scopes | Autotask tickets, Datto RMM devices, live bron-data |
| Launcher-toegang (suggestie) | `hr`, `management`, `directie`, `modernwork` — **niet bindend** |
| Definitieve afdelingen | Beheerder beslist bij goedkeuring (bron: hub Department-tabel ← `SG-Department-*` Entra-groepen) |
| Interne app-roles | Assessment Admin, Reviewer, Question Author, Candidate (bestaand, via Entra) |

---

## 3. Hub-contracten (uit `spoke-starter/CLAUDE.md`, door `spoke-doctor` bewaakt)

1. **Autotask leidend** — companies/contacten/bron-data uitsluitend via de
   hub-gateway (`lib/hub.mjs` → `/hub/v1`). Geen directe bron-calls.
2. **Geen eigen auth** — identiteit + rechten via de hub (Entra SSO). `lib/auth.mjs`.
3. **Data binnen scope** — de hub past RLS/RBAC toe op basis van de gebruiker;
   live-data vereist altijd een `companyId`.
4. **Huisstijl = Console** — navy `#003d6b`, lime `#cdd100`, cyan `#0bb4ed`.
5. **Secrets niet committen** — `HUB_APP_TOKEN`/Entra-secrets in `.env`, nooit in
   git of in de browser.

---

## 4. Architectuur

```
Browser (index.html / app.js)
  │  fetch /api/hub/companies, /api/hub/source-material?companyId=…
  │  (token NOOIT in de browser)
  ▼
server.mjs  ──►  lib/hub.mjs  ──►  ${HUB_BASE_URL}/hub/v1/...
  │                 (x-hub-app-token + optioneel user-OBO-token)
  │
  ├─ lib/auth.mjs        getUserToken() — env/OBO
  └─ lib/anonymize.mjs   strip klantnamen, users, domeinen, IP's, bedragen, secrets
        ▼
   draftQuestions[]  (source-label)  ──►  Vragenbank-view  ──►  senior-review  ──►  testQuestions[]
```

Server-side data lezen → anonimiseren → pas dán naar de browser. De Vragenfabriek
publiceert nooit automatisch: senior-review blijft de gate naar `testQuestions[]`.

---

## 5. Componenten / deliverables

### 5.1 Uit de spoke-starter geport (zelfde gedrag, TS → `.mjs`)

| Bestand (nieuw) | Bron | Aanpassing |
|---|---|---|
| `spoke.manifest.json` | `spoke-starter/spoke.manifest.json` | ingevuld voor deze app (zie §6) |
| `scripts/spoke-doctor.mjs` | idem | huisstijl-check naar `styles.css` i.p.v. `app/globals.css`; rest ongewijzigd |
| `lib/hub.mjs` | `lib/hub.ts` | TS-types verwijderd; zelfde endpoints/headers/methodes; `server-only`-import vervangen door een runtime-guard/comment |
| `lib/auth.mjs` | `lib/auth.ts` | `getUserToken()` (env `HUB_USER_TOKEN`, Azure-OBO als TODO) |
| `.env.example` | idem | samengevoegd met bestaande `AZURE_STORAGE_CONNECTION_STRING` |
| `.github/workflows/spoke-doctor.yml` | idem | `typecheck`-stap → `npm run check` (geen TS) |
| `CLAUDE.md` | `spoke-starter/CLAUDE.md` | ingevuld voor deze app; verwijst naar vanilla-stack |

`spoke-doctor.mjs` scant al `.js/.jsx/.mjs`, dus de bestaande `app.js`/`server.mjs`
vallen onder de contract-check. De FORBIDDEN-regexes matchen vendor-**hostnames**
(bv. `webservices*.autotask.net`, `api.datto.com`), niet de losse woorden
"Autotask"/"Datto" die in de assessmentvragen als tekst voorkomen — die triggeren
dus geen false positive.

### 5.2 Nieuw in deze repo

- **`lib/anonymize.mjs`** — verwijdert klantnamen, gebruikersnamen, e-mail/UPN,
  domeinen, IP-adressen, contract-/factuurbedragen en secrets uit hub-payloads
  vóór ze de server verlaten. Eén pure functie per entiteitstype + een generieke
  string-scrubber. Unit-testbaar zonder netwerk.

### 5.3 Wijzigingen in bestaande bestanden

- **`server.mjs`**
  - `GET /api/hub/companies` → `hub.companies.list()` (companyId-keuze).
  - `GET /api/hub/source-material?companyId=…` → parallel
    `hub.tickets.list({companyId})`, `hub.devices.list({companyId})`,
    `hub.live.rmmAlerts(companyId)`, `hub.live.autotask('tickets', companyId)`
    → door `anonymize` → teruggeven als concept-bronmateriaal.
  - Faalt netjes (JSON-error) als `HUB_BASE_URL`/`HUB_APP_TOKEN` ontbreken
    (lokaal zonder hub blijft de rest van de app werken).
- **`app.js`** — in de Vragenbank-view: knop "Bronmateriaal uit hub" +
  companyId-keuze → vult `draftQuestions[]` met `source`-label. Geen
  auto-publicatie.
- **`styles.css`** — cyan `#0bb1ef` → `#0bb4ed` (exact Console-token).
- **`package.json`** — script `"doctor": "node scripts/spoke-doctor.mjs"`;
  `@azure/data-tables` blijft.
- **`CHANGELOG.md`** + **`DATASTRUCTURE.md`** — bijwerken per repo-conventie
  (nieuwe datastroom: hub → draftQuestions).

---

## 6. Manifest (definitief concept)

```json
{
  "key": "campai-assessment",
  "name": "Campai Assessment & Skills Academy",
  "type": "EXTERNAL",
  "vendor": "HR / Recruitment",
  "description": "Recruitment-assessment + interne Skills Academy. De Vragenfabriek voert geanonimiseerde MSP-casuïstiek uit de hub aan voor senior-review.",
  "url": "https://cmp-app-assessment-test-weu-001.azurewebsites.net/",
  "route": null,
  "icon": "clipboard-check",
  "color": "#0bb4ed",
  "modules": ["tickets", "devices", "live"],
  "flags": [],
  "scopes": ["companies:read", "mappings:read", "tickets:read", "devices:read", "live:read"],
  "departments": ["hr", "management", "directie", "modernwork"],
  "roles": []
}
```

- `companies:read` + `mappings:read` zijn nodig omdat live-data altijd een
  `companyId` vereist en je die companyId via de hub ophaalt (gouden regel).
- **`departments` is een niet-bindende suggestie.** De leidende bron is de
  Department-tabel in de hub-tenant, gevoed door de `SG-Department-*`
  Entra-groepen. De beheerder mapt de app bij **App indienen** op de echte
  `Department.key`-waarden (de hub matcht op key, `apps.service.ts:238`, en
  negeert onbekende keys). `spoke-doctor` valideert `departments` niet; de
  manifest-validatie eist alleen "is een lijst".
- Roland's repo-seed (`sales`/`servicedesk`/`management`/`development`) is
  **dummy-data** en NIET leidend voor onze afdelingen.
- De interne app-roles (Assessment Admin/Reviewer/Question Author/Candidate)
  staan los van `roles[]` hier — dat zijn Entra-claims die de app zelf gebruikt
  voor RBAC binnen de app.

---

## 7. SSO / identiteit

- EXTERNAL spoke: eigen tabblad, eigen SSO tegen **dezelfde Entra-tenant** als de
  hub → naadloze sessie. Geen `prompt=login`/`select_account`.
- `server.mjs` leest de identiteit al uit `x-ms-client-principal` (App Service
  Auth). `lib/auth.mjs.getUserToken()` is de plek voor het OBO-token richting de
  hub-gateway; lokaal draait de hub in `AUTH_DEV_MODE` (user-token optioneel).

---

## 8. Foutafhandeling

- Ontbrekende hub-config → `/api/hub/*` geeft `503 {error:"hub_unconfigured"}`;
  de app blijft verder werken (assessment/Academy zijn self-contained).
- `HubError` (gateway non-2xx) → doorgegeven als `502/4xx` met nette boodschap.
- Anonimisatie faalt closed: als een veld niet veilig te scrubben is, wordt het
  weggelaten i.p.v. doorgegeven.

---

## 9. Testen / verificatie

- `npm run doctor` → **groen** (manifest geldig, geen directe vendor-calls, hub-client
  gebruikt, huisstijl-tokens aanwezig, geen secrets in source).
- `npm run check` → `node --check` op `app.js`/`server.mjs` (+ nieuwe `lib/*.mjs`).
- `lib/anonymize.mjs` — unit-tests met representatieve payloads (klantnaam, UPN,
  IP, bedrag) → asserteer dat niets gevoeligs lekt.
- Handmatig: `/api/hub/source-material` met dev-hub → bronmateriaal verschijnt
  geanonimiseerd in `draftQuestions[]`, niet in `testQuestions[]`.

---

## 10. Indienen (na groen)

1. `npm run doctor` groen.
2. `spoke.manifest.json` volledig.
3. Portaal: **Apps → App indienen** (formulier of manifest plakken).
4. Beheerder keurt goed + wijst toe → app in de launcher.
