// lib/sync-safety.mjs
// Veilige reconciliatie van lokale en remote gebruikersdata — voorkomt dat een
// VERSE/LEGE staat gevulde remote-data overschrijft (zoals gebeurde bij een
// zuster-app). Inhoud gaat vóór tijd; een verse staat krijgt een leeg/oudste
// tijdstempel zodat hij nooit als "nieuwer" geldt.

// True zodra er écht door de gebruiker ingevulde data is.
export function hasUserContent(completedModules) {
  return Array.isArray(completedModules) && completedModules.length > 0;
}

// Een verse/default-staat: leeg + leegste tijdstempel (telt nooit als nieuwer).
export function freshProgress(entraOid = "") {
  return { entraOid, completedModules: [], updatedAt: "" };
}

// Kies veilig tussen lokaal en remote.
// - remote heeft inhoud, lokaal niet  -> ALTIJD remote
// - lokaal heeft inhoud, remote niet   -> lokaal
// - beide inhoud (of beide leeg)       -> nieuwste updatedAt wint ("" = oudste)
export function safeMergeProgress(local, remote) {
  const l = local || freshProgress();
  const r = remote || freshProgress();
  const lc = hasUserContent(l.completedModules);
  const rc = hasUserContent(r.completedModules);
  if (rc && !lc) return r;
  if (lc && !rc) return l;
  return (r.updatedAt || "") > (l.updatedAt || "") ? r : l;
}

// Mag de client leervoortgang naar de server schrijven?
// Alleen NA een succesvolle eerste pull (hydrated). Zo kan een niet-geladen of
// mislukte pull nooit gevulde remote overschrijven.
export function canPushProgress(hydrated) {
  return hydrated === true;
}
