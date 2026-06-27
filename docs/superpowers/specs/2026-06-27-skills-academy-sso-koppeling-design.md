# Skills Academy ↔ SSO-profielen — Design

**Datum:** 2026-06-27
**Status:** Concept — ter review bij de gebruiker
**Vervolg op:** Vragenbank Fase B + assessment-flow.

---

## 1. Doel & beslissingen

De Skills Academy is nu **mock** (hard-coded "Lotte/Daan" in `src/lib/data.ts`,
voortgang in `localStorage`). We koppelen hem aan de **echte interne profielen**:
medewerkers loggen intern in via **Entra SSO** door de Campai Portal-hub.

Vastgelegd met de gebruiker:
- **Gefaseerd (beide):** Fase 1 = eigen profiel via SSO (nu, zonder wijziging bij
  Roland). Fase 2 = volledige medewerkerslijst (vereist een klein hub-endpoint van
  Roland; wij leveren de spec, wij passen Roland's repo NOOIT aan).
- **Voortgang server-side**, gekoppeld aan **`entraOid`** (stabiele Entra-id), zodat
  voortgang mee-reist tussen apparaten en centraal zichtbaar is.

### Wat de hub nu al biedt (uit Roland's repo, read-only gelezen)
- `GET /auth/me` → ingelogde gebruiker: `{ name, email, jobTitle, entraOid,
  entraGroups[], entraRoles[], permissions[], roles[], companyIds[] }`. Geen scope nodig
  (JWT). **Let op:** dit valt **buiten** `/hub/v1`.
- `GET /beheer/admin/users` → álle medewerkers, maar **admin-only** (`manage_rbac`) en
  met gevoelige velden → niet geschikt voor de Academy.
- **Geen** spoke-vriendelijk "lijst medewerkers"-endpoint → Fase 2 bij Roland.

### Niet-doelen (YAGNI)
- Geen eigen user-store/login (identiteit blijft van de hub).
- Geen volledige medewerker-directory in Fase 1.
- Geen schrijfacties richting de hub.

---

## 2. Fase 1 — Eigen profiel via SSO + server-voortgang (bouwbaar nu)

### 2.1 Identiteit ophalen
- `lib/auth.mjs` `getUserToken()` bestaat al (dev: `HUB_USER_TOKEN`; prod: OBO — TODO).
- **Nieuw** `lib/hub-me.mjs`: `getMe(userToken, { fetchImpl })` → `GET ${HUB_BASE_URL}/auth/me`
  met `x-hub-app-token` + `Authorization: Bearer <userToken>`. Aparte helper omdat
  `/auth/me` buiten `/hub/v1` valt. Geeft het profiel terug of `null` als niet
  geconfigureerd/niet ingelogd.
- **Server** `GET /api/me` (identiteit vereist): roept `getMe` aan; geeft
  `{ name, email, jobTitle, entraOid, department }` terug, of `204`/leeg als er geen
  user-token is (dev zonder token → frontend valt terug op mock-selectie).

### 2.2 Voortgang server-side (op entraOid)
- **Nieuw** `lib/learning-store.mjs` (zelfde patroon als `candidate-store`/`question-bank`:
  file-fallback + Azure Table `AssessmentLearning`). Record per persoon:
  `{ entraOid, completedModules: string[], updatedAt }`.
- **Server:**
  - `GET /api/learning/me` → voortgang van de ingelogde gebruiker (via `getMe` → entraOid).
  - `PUT /api/learning/me` `{ completedModules: string[] }` → opslaan/overschrijven.
  - Beide identiteit-gated: zonder geldige `entraOid` → `401`.

### 2.3 Frontend (`src/views/SkillsAcademy.tsx`)
- Bij laden: `GET /api/me`.
  - **Profiel gevonden:** toon die persoon als learner (naam, rol = `jobTitle`,
    afdeling = `department`). Voortgang via `GET /api/learning/me`; afvinken module →
    `PUT /api/learning/me`. `localStorage` vervalt voor de live-gebruiker.
  - **Geen profiel (dev/zonder token):** val terug op de huidige mock-learners +
    `localStorage`, zodat de demo blijft werken.
- De module-catalogus (`trainingModules`) en het XP/badge-model blijven zoals nu.
- `targetRole`: voorlopig afgeleid/instelbaar in de UI (geen hub-veld); later te verfijnen.

### 2.4 Bekende afhankelijkheid (prod)
- In **prod (Azure)** moet het **hub-gebruikerstoken** beschikbaar komen (OBO of via
  Easy Auth). Dat is nu een TODO in `lib/auth.mjs`. Fase 1 is **dev-verifieerbaar** met
  `HUB_USER_TOKEN`; de prod-tokenkoppeling is een aparte, kleine vervolgstap (mogelijk
  met Easy Auth-config). Dit blokkeert de bouw/het testen niet.

---

## 3. Fase 2 — Volledige medewerkerslijst (verzoek aan Roland)

Spec die wij aan Roland leveren (hij bouwt het in zijn repo):
- **`GET /hub/v1/employees`** (app-token + nieuwe scope **`employees:read`**).
- Retourneert per medewerker een **minimale** set:
  `{ id, name, email, jobTitle, department, entraOid }` (geen gevoelige velden).
- Zelfde guard-patroon als `/hub/v1/companies`.

Zodra dat live is:
- Assessment-app haalt de lijst op (server-side via `lib/hub.mjs`), toont alle collega's
  in de Academy en koppelt voortgang per `entraOid`. Reviewers kunnen een medewerker kiezen.

---

## 4. Componenten / bestanden

| Bestand | Wijziging |
|---|---|
| `lib/hub-me.mjs` (nieuw) | `getMe(userToken)` → `/auth/me`. |
| `lib/learning-store.mjs` (nieuw) | Voortgang per `entraOid` (file + Azure Table). |
| `server.mjs` | `GET /api/me`, `GET/PUT /api/learning/me` (identiteit-gated). |
| `src/lib/api.ts` | `getMe()`, `getLearningProgress()`, `saveLearningProgress()`. |
| `src/views/SkillsAcademy.tsx` | Profiel uit `/api/me`; voortgang server-side; mock-fallback. |
| `.env.example` | Notitie `HUB_USER_TOKEN` (dev) + verwijzing naar OBO (prod). |
| `docs/.../roland-employees-endpoint-request.md` (nieuw) | Fase 2-spec voor Roland. |

---

## 5. Testen / verificatie
- **Unit:** `learning-store` round-trip (file); `getMe` met fake fetch (profiel + niet-
  geconfigureerd → null). `npm test` groen, `tsc`/`build` groen, `node --check`.
- **Handmatig (dev, AUTH_DEV_MODE + `HUB_USER_TOKEN`):** `/api/me` geeft profiel;
  module afvinken → `PUT /api/learning/me` → herladen behoudt voortgang.
- **Fallback:** zonder token toont de Academy de mock-learners (demo intact).

---

## 6. Governance
- Identiteit blijft van de hub (geen eigen login). Hub-data alleen via de hub.
- `entraOid` is geen gevoelige klant-PII; voortgang is interne ontwikkeldata (gescheiden
  van recruitment, conform de bestaande scheiding Academy ↔ Sollicitanten).
- Nieuwe endpoints identiteit-gated; geen secrets naar de browser.
