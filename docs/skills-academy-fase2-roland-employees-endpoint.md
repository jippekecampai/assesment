# Fase 2: Hub-endpoint `/hub/v1/employees` (Roland-verzoek)

## Doel
De Campai Skills Academy wil de volledige lijst van interne medewerkers kunnen tonen in UI-selectoren en leaderboards. Momenteel kunnen we alleen de ingelogde gebruiker ophalen via `/auth/me`.

## Verzoek aan Roland

Wij vragen om **één nieuwe hub-endpoint** in `tuxmanro/campai-portal-v2`:

```
GET /hub/v1/employees
```

**Beveiliging:** dezelfde guard-patroon als `/hub/v1/companies`
- App-token (bearer-auth) + nieuwe scope: `employees:read`
- Response-body: JSON-array van medewerker-objecten

## Response-schema (minimaal, geen gevoelige velden)

```json
[
  {
    "id": "emp-uuid",
    "name": "Jan Pieterzoon",
    "email": "jan@campai.nl",
    "jobTitle": "Senior Developer",
    "department": "Engineering",
    "entraOid": "12345678-1234-1234-1234-123456789abc"
  },
  ...
]
```

## Waarom deze velden

- **`id`, `name`, `email`** — standaard medewerkersdata voor UI-display
- **`jobTitle`, `department`** — voor filtering en contextualisering in Academy
- **`entraOid`** — stabiele sleutel om leervoortgang aan te koppelen (Entra-synced, immutable)

**Niet nodig:** rollen, permissions, autotask-velden, salarissen of andere gevoelige organisatiedata.

## Aanvullende opmerkingen

Dit endpoint is **aanvullend** op bestaande endpoints:
- `/auth/me` — ingelogde gebruiker (husting Phase 1)
- `/beheer/admin/users` — admin-only, ongeschikt voor spoke-volgsysteem

We zullen dit endpoint aanroepen met hetzelfde app-token dat we al gebruiken voor `/hub/v1/companies`.

Graag laten weten wanneer dit beschikbaar is!
