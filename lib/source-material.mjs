// Bouwt geanonimiseerde conceptvraag-kandidaten uit hub-data voor de Vragenfabriek.
// Output-vorm = draftQuestions[] : { domain, role, source, prompt }.
// Elke bron is best-effort: een falende/lege bron slaan we over, de rest gaat door.
import { anonymizeTicket, anonymizeDevice, anonymizeLive, scrubText } from './anonymize.mjs';

const DEFAULT_ROLE = 'Servicedesk Engineer';

async function safe(fn, fallback) {
  try { return await fn(); } catch { return fallback; }
}

export async function buildSourceMaterial(hub, companyId) {
  if (!companyId) throw new Error('companyId is verplicht voor live/scoped hub-data.');
  const out = [];

  const tickets = await safe(() => hub.tickets.list({ companyId }), []);
  for (const raw of (tickets || []).slice(0, 10)) {
    const t = anonymizeTicket(raw);
    if (!t.title) continue;
    out.push({
      domain: t.category || 'Algemeen',
      role: DEFAULT_ROLE,
      source: 'Autotask-ticket (geanonimiseerd)',
      prompt: `Casus uit een geanonimiseerd ticket: "${t.title}". Laat de kandidaat impact bepalen, troubleshooten, documenteren en de klant informeren.`,
    });
  }

  const devices = await safe(() => hub.devices.list({ companyId }), []);
  const osSeen = new Set();
  for (const raw of (devices || [])) {
    const d = anonymizeDevice(raw);
    if (!d.os || osSeen.has(d.os)) continue;
    osSeen.add(d.os);
    out.push({
      domain: 'Servers',
      role: DEFAULT_ROLE,
      source: 'Datto RMM device-inventory (geanonimiseerd)',
      prompt: `Een omgeving draait ${scrubText(d.os)} (${d.type || 'onbekend type'}). Laat de kandidaat patch-, backup- en monitoringaanpak voor dit platform uitleggen.`,
    });
    if (osSeen.size >= 5) break;
  }

  const rmm = await safe(() => hub.live.rmmAlerts(companyId), { configured: false });
  if (rmm && rmm.configured) {
    const clean = anonymizeLive(rmm);
    out.push({
      domain: 'Kaseya Stack',
      role: DEFAULT_ROLE,
      source: 'Live Datto RMM-alerts (geanonimiseerd)',
      prompt: `Op basis van actuele (geanonimiseerde) RMM-alerts: ${scrubText(summarizeAlerts(clean))}. Laat de kandidaat de alert-naar-ticket-naar-klantupdate-flow beschrijven.`,
    });
  }

  return out;
}

function summarizeAlerts(clean) {
  const arr = Array.isArray(clean.alerts) ? clean.alerts : [];
  const first = arr.slice(0, 3).map((a) => (a && (a.message || a.title)) || 'alert').join('; ');
  return first || 'meerdere openstaande alerts';
}
