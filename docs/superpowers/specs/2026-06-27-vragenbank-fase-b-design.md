# Vragenbank Fase B — Design (AI-generatie + import + domein per sollicitant)

**Datum:** 2026-06-27
**Status:** Concept — ter review bij de gebruiker
**Repo:** `jippekecampai/assesment`
**Vervolg op:** Vragenbank Fase A (server-store + ≥5/domein + seed + coverage).

---

## 1. Doel & intentie

De vragenbank sneller vullen en gerichter inzetten:

1. **AI-generatie per domein (in-app):** kies een domein → de app genereert
   conceptvragen via een **provider-agnostisch** OpenAI-compatible model → senior
   keurt goed → bank.
2. **Import (zonder key):** plak JSON-vragen (uit Thread/eigen AI) → valideren →
   concepten → senior-review.
3. **Handmatige domeinkeuze per sollicitant:** naast de functie-default kun je per
   sollicitant de te toetsen domeinen overschrijven.

Het verwarrende **"Hub-bronmateriaal / Klant"-blok** in de Vragenbank wordt
vervangen door een **"Genereer of importeer vragen"**-blok.

### Niet-doelen (YAGNI)
- **Geen** individuele-vraag-selectie per sollicitant (alleen domein-override).
- **Geen** vaste vendor-binding voor AI — alles via een OpenAI-compatible endpoint.
- **Geen** auto-goedkeuring: AI/import levert **concepten**, nooit direct live.
- **Geen** klant/hub-bron meer in dit scherm.

---

## 2. Beslissingen (met de gebruiker vastgelegd)

| Onderwerp | Keuze |
|---|---|
| Generatie-motor | **Allebei**: in-app AI **én** import |
| AI-backend | **Provider-agnostisch** OpenAI-compatible endpoint via env (`AI_ENDPOINT`/`AI_API_KEY`/`AI_MODEL`); model later te kiezen (GitHub Models/Foundry/lokaal) |
| AI-guard | Generatie loopt door de guard (compliant; no-op bij domein-only) |
| Goedkeuring | AI/import → **concepten** → senior-review → bank |
| Handmatige controle | **Domein-override per sollicitant** (default = functie-domeinen) |

---

## 3. Architectuur

```
Vragenbank (medewerker)                         Sollicitanten (medewerker)
 ┌───────────────────────────────┐               ┌───────────────────────────┐
 │ "Genereer of importeer vragen"│               │ naam + functie            │
 │  • domein + aantal → Genereer │               │ + optioneel domein-select │
 │  • plak JSON → Importeer      │               └───────────┬───────────────┘
 └───────────┬───────────────────┘                           │ domeinen op candidate
   POST /api/questions/generate (staff)                       ▼
             │                                    selectQuestionsForRole(rol, approved,
             ▼                                       { domains: candidate.domeinen })
   lib/ai-client.mjs  ──guard──►  ${AI_ENDPOINT} (OpenAI-compatible)
             │  parse + valideer
             ▼
   concepten → conceptenlijst in de Vragenbank → senior keurt goed → POST /api/questions (store)
```

Import: client valideert geplakte JSON → zelfde conceptenlijst → senior-review.

---

## 4. Componenten / bestanden

| Bestand | Wijziging |
|---|---|
| `lib/ai-guard.mjs` (nieuw) | Server-side `PromptSanitizer` (plain-JS kopie van `src/lib/ai-guard.ts`), zodat de Node-server de guard kan gebruiken. |
| `lib/ai-client.mjs` (nieuw) | `generateQuestions({ domain, count })` → prompt bouwen, guard, OpenAI-compatible call, JSON parse + validatie. `isConfigured()`. |
| `server.mjs` | `POST /api/questions/generate` (staff) → `ai-client.generateQuestions` → concepten terug; `503` als niet geconfigureerd. `POST /api/candidates` accepteert optioneel `domeinen`. |
| `lib/assessment.mjs` | `selectQuestionsForRole(roleId, approved=[], { domains, minPerDomain=5, weightThreshold=0.07 })` — optionele `domains`-override. |
| `lib/assessment-service.mjs` | `startAssessment` gebruikt `candidate.domeinen` als override indien gezet. |
| `lib/candidate-store.mjs` | `createCandidate` accepteert + bewaart optioneel `domeinen: string[]`. |
| `src/lib/api.ts` | `generateQuestions(domain, count)`; `createCandidate` krijgt optioneel `domeinen`. |
| `src/views/Vragenfabriek.tsx` | Vervang het hub-bron/"Klant"-blok door "Genereer of importeer vragen" (domein + aantal + Genereer; plak-import). Beide → conceptenlijst. |
| `src/views/Sollicitanten.tsx` | Optionele domein-multiselect (default = functie-domeinen) → meesturen bij `createCandidate`. |
| `.env.example` | `AI_ENDPOINT`, `AI_API_KEY`, `AI_MODEL` documenteren. |

---

## 5. AI-generator (`lib/ai-client.mjs`)

- **Config (env):** `AI_ENDPOINT` (OpenAI-compatible chat-completions URL), `AI_API_KEY`,
  `AI_MODEL`. `isConfigured()` = alle drie aanwezig.
- **Prompt:** een op het domein toegespitste variant van
  `docs/vragen-generatie-prompt.md` — "genereer N diepe scenario-vragen voor domein
  X, 4 plausibele opties, exact één beste antwoord, geen definitievragen, geen PII,
  Nederlands (Engels-domein in het Engels), JSON-array `{domain,type,prompt,options,answer}`".
- **Guard:** prompt door `PromptSanitizer.sanitize()` vóór verzenden; antwoord door
  `.rehydrate()`. Bij domein-only zijn er geen entiteiten → no-op, maar compliant en
  klaar voor toekomstige hub-bron met PII.
- **Call:** `POST ${AI_ENDPOINT}` met `{ model: AI_MODEL, messages:[...], temperature }`
  en `Authorization: Bearer ${AI_API_KEY}`; OpenAI-compatible response parsen
  (`choices[0].message.content`).
- **Parse + validatie:** JSON-array uit het antwoord halen (tolerant: eerste `[`..`]`);
  elk item valideren (`domain` ∈ 13 domeinen, `options.length===4`, `answer` 0–3,
  `prompt` niet leeg); ongeldige items overslaan. Retourneer alleen geldige concepten.
- **Fouten:** niet geconfigureerd → throw `AiError('not_configured')` (server → 503);
  endpoint-fout/timeout → `AiError('ai_error')` (502); geen geldige output → lege lijst
  met een nette melding.

---

## 6. Import (client-side)

- In de Vragenbank een **plak-veld** (textarea) + "Importeer". Client parse't de JSON,
  valideert per item (zelfde regels als §5), en voegt geldige items toe aan de
  **conceptenlijst** (de bestaande draft-werklijst). Ongeldige items → nette melding
  met aantal overgeslagen.
- Geen nieuw endpoint nodig; import is puur client-validatie → conceptenlijst →
  bestaande goedkeur-flow (`addQuestion` → store).

---

## 7. Vragenbank-UI (vervangt het "Klant"-blok)

Nieuw blok **"Genereer of importeer vragen"**:
- **Genereren:** `Select` domein (13) + `NumberInput` aantal (default 5) + knop
  **Genereer**. Roept `generateQuestions(domain, count)` → voegt concepten toe aan de
  werklijst. Bij `503` (niet geconfigureerd): nette hint "AI-endpoint niet ingesteld —
  gebruik import of stel `AI_*` in".
- **Importeren:** `Textarea` "Plak JSON-vragen" + knop **Importeer** → client-validatie
  → concepten in de werklijst.
- De bestaande **"Nieuwe conceptvraag"** (handmatig) en de **conceptenlijst +
  goedkeuren + coverage per domein** blijven.

---

## 8. Handmatige domeinkeuze per sollicitant

- **Datamodel:** `candidate.domeinen?: string[]` (optioneel; leeg/afwezig = functie-default).
- **UI (Sollicitanten):** een **MultiSelect** "Domeinen (optioneel)" met de 13 domeinen;
  default leeg met hint "leeg = automatisch op basis van functie".
- **Selectie:** `selectQuestionsForRole(roleId, approved, { domains })` — als `domains`
  gezet is, gebruik die als de relevante set (i.p.v. rolgewicht-drempel); ≥5/domein
  blijft. `startAssessment` geeft `candidate.domeinen` door als die er zijn.
- **Scoring/rol-fit:** ongewijzigd (rol-fit weegt nog steeds met de rolgewichten over
  de geteste domeinen).

---

## 9. Governance & beveiliging

- AI/import → **concepten**; alleen senior-goedkeuring (`POST /api/questions`, staff)
  zet iets in de live bank. Nooit auto-approve.
- Alle nieuwe endpoints (`/api/questions/generate`) staff-only (`requireStaff`).
- AI-call loopt door de guard; geen klant-PII (domein-only prompt). Geen secrets in de
  browser — `AI_*` staan server-side.
- Antwoordsleutels blijven server-side (concepten worden pas vragen na goedkeuren; de
  kiosk krijgt nooit `answer`).

---

## 10. Foutafhandeling

- AI niet geconfigureerd → `503 {error:'ai_not_configured'}`; UI toont hint + import
  blijft werken.
- AI-endpoint down/timeout → `502`; nette melding; geen crash.
- Ongeldige AI/import-JSON → geldige items overnemen, ongeldige overslaan + tellen.
- Domein-override leeg → val terug op functie-default (bestaand gedrag).

---

## 11. Testen / verificatie

- **Unit:** `ai-client` prompt-bouw + response-parse/validatie met een **fake fetch**
  (geen echte AI-call); import-validatie (pure functie); `selectQuestionsForRole`
  met `domains`-override (≥5 per gekozen domein); `startAssessment` met
  `candidate.domeinen`.
- **Handmatig:** Vragenbank → Genereer (met een test-endpoint of mock) en Importeer →
  concepten verschijnen → goedkeuren → coverage stijgt → kiosk gebruikt ze.
  Sollicitant met domein-override → kiosk toetst alleen die domeinen.
- `npm test` groen, `tsc`/`build` groen, `node --check server.mjs`.

---

## 12. Bouwvolgorde
1. `lib/ai-guard.mjs` (server-guard) + test.
2. `lib/ai-client.mjs` (generate + parse/validate, fake-fetch test).
3. `server.mjs`: `POST /api/questions/generate` + `domeinen` op `/api/candidates`.
4. `lib/assessment.mjs` domein-override + `assessment-service`/`candidate-store` `domeinen`.
5. Frontend: `api.ts` (generate + domeinen) ; Vragenbank generate/import-blok ; Sollicitanten domein-multiselect.
6. `.env.example` + korte setup-notitie (hoe `AI_*` te zetten met GitHub Models/Foundry).

---

## 13. Open punten (tijdens bouw)
- Exact OpenAI-compatible request-formaat kan per backend licht verschillen; we
  mikken op de standaard `chat/completions`-vorm en documenteren afwijkingen.
- Aantal-default voor generatie (voorstel 5) en max (voorstel 10) ijken.
