# Campai Assessment & Skills Academy — Campai spoke (project-context)

Dit is een **EXTERNAL spoke** voor het Campai Portal (Hub & Spoke). De hub levert
identiteit (Entra SSO), RBAC en huisstijl. Deze app is **React 19 + Mantine 9 +
Vite** (zie `PROJECT.md`): UI in `src/` (`App.tsx` = AppShell, `src/views/*` =
schermen, `src/lib/*` = data/scoring/theme). De Campai-theme staat in
`src/lib/campai-theme.ts` (1-op-1 met referentie-repo `skill-forge`).
`server.mjs` serveert de productiebuild (`dist/`) met SPA-fallback en proxyt
`/api` naar hub/Azure. De vanilla-versie staat als git-tag
`stable-vanilla-20260626` (+ `index.legacy.html`).

## Harde afspraken (spoke-doctor bewaakt dit — `npm run doctor`)
1. **Autotask leidend.** Hub-data uitsluitend via `lib/hub.mjs` → `/hub/v1`. Geen
   directe Autotask/Datto/IT Glue-calls.
2. **Geen eigen auth.** Identiteit via de hub (Entra SSO); `lib/auth.mjs`.
3. **Data binnen scope.** Live-data vereist altijd een `companyId`.
4. **Huisstijl = Console.** navy #003d6b, lime #cdd100, cyan #0bb4ed.
5. **Secrets niet committen.** `HUB_APP_TOKEN`/Entra in `.env` (zie `.env.example`).
6. **Geen klant-PII naar kandidaten.** Hub-data gaat door `lib/anonymize.mjs`;
   conceptvragen landen in `draftQuestions[]` voor verplichte senior-review.

## Commando's
- `npm run dev` — Vite dev-server (HMR) op http://127.0.0.1:4173
- `npm run build` — productiebuild naar `dist/`
- `npm run server` — `node server.mjs` serveert `dist/` + `/api` (productie)
- `npm run check` — TypeScript typecheck (`tsc --noEmit`)
- `npm run doctor` — contract-check (moet groen zijn vóór indienen)
- `npm test` — unit-tests (`node --test`)

## Indienen
1. `npm run doctor` groen.
2. `spoke.manifest.json` volledig.
3. Portaal: **Apps → App indienen**. Beheerder keurt goed + mapt afdelingen.

Let op: `spoke.manifest.json` → `departments` is een suggestie. De beheerder mapt
op de echte `Department.key` (uit de `SG-Department-*` Entra-groepen).
