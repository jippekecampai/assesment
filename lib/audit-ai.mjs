// lib/audit-ai.mjs
// Bewijsoverzicht AI-geletterdheid (ISO 42001): per medewerker wanneer 'Wat is AI' en de 10 gouden regels zijn
// bevestigd, en de beste oefenscore AI / Copilot met datum. Zelfde regel als de kaart in Mijn overview:
// compleet = beide bevestigd én een score van minstens 70%.
export const AI_DOMEIN = 'AI / Copilot';
export const AI_DREMPEL = 70;
export const AI_POLICIES = ['ai-geletterdheid', 'gouden-regels'];

export function aiBewijs(policies, practice) {
  const perOid = new Map();
  const rij = (oid) => {
    if (!perOid.has(oid)) perOid.set(oid, { entraOid: oid, naam: null, email: null, watIsAi: null, goudenRegels: null, besteScore: null, scoreOp: null, pogingen: 0 });
    return perOid.get(oid);
  };
  for (const { entraOid, acks } of policies) {
    const r = rij(entraOid);
    r.watIsAi = acks?.['ai-geletterdheid'] || null;
    r.goudenRegels = acks?.['gouden-regels'] || null;
  }
  for (const { entraOid, results } of practice) {
    const ai = (results || []).filter((x) => x.domain === AI_DOMEIN && x.total > 0);
    if (!ai.length && !perOid.has(entraOid)) continue;
    const r = rij(entraOid);
    r.pogingen = ai.length;
    for (const x of results || []) { r.naam ||= x.naam || null; r.email ||= x.email || null; }
    for (const x of ai) {
      const pct = Math.round((x.score / x.total) * 100);
      if (r.besteScore === null || pct > r.besteScore || (pct === r.besteScore && x.at < r.scoreOp)) { r.besteScore = pct; r.scoreOp = x.at; }
    }
  }
  return [...perOid.values()]
    .map((r) => ({ ...r, compleet: Boolean(r.watIsAi && r.goudenRegels && r.besteScore !== null && r.besteScore >= AI_DREMPEL) }))
    .sort((a, b) => Number(b.compleet) - Number(a.compleet) || String(a.naam || a.email || a.entraOid).localeCompare(String(b.naam || b.email || b.entraOid)));
}
