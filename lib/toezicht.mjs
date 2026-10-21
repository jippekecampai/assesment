// lib/toezicht.mjs
// Toezicht tijdens de kiosk-assessment: wat de kandidaat deed naast het beantwoorden (weg uit het scherm,
// plakken, kopiëren, uitleg vragen). Informatie voor het gesprek, nooit een score: scoreAssessment kijkt hier niet naar.
import { AssessmentError } from './assessment-service.mjs';

export const EVENT_TYPES = ['start', 'weg', 'plak', 'kopieer', 'herladen', 'geen-volledig-scherm', 'uitleg', 'uitleg-geblokkeerd'];
export const WEG_REDENEN = ['ander-venster', 'ander-tabblad', 'volledig-scherm-verlaten'];
const MAX_EVENTS = 300;
const MAX_PER_BATCH = 50;

const clampInt = (v, min, max) => (Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Math.round(Number(v)))) : min);
const validIso = (v) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);

export function cleanEvents(input, now = new Date()) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, MAX_PER_BATCH)
    .filter((e) => e && EVENT_TYPES.includes(e.type))
    .map((e) => ({
      type: e.type,
      at: validIso(e.at) || now.toISOString(),
      ...(e.type === 'weg' ? { sec: clampInt(e.sec, 0, 86400), reden: WEG_REDENEN.includes(e.reden) ? e.reden : 'onbekend' } : {}),
      ...(Number.isInteger(e.vraag) && e.vraag >= 0 && e.vraag < 1000 ? { vraag: e.vraag } : {}),
    }));
}

export function summarize(events) {
  const count = (t) => events.filter((e) => e.type === t).length;
  const weg = events.filter((e) => e.type === 'weg');
  return {
    weg: weg.length,
    wegSec: weg.reduce((t, e) => t + (e.sec || 0), 0),
    langsteWegSec: weg.reduce((m, e) => Math.max(m, e.sec || 0), 0),
    plak: count('plak'),
    kopieer: count('kopieer'),
    uitleg: count('uitleg'),
    uitlegGeblokkeerd: count('uitleg-geblokkeerd'),
    herladen: count('herladen'),
    volledigScherm: count('geen-volledig-scherm') === 0,
  };
}

// Eén schrijver per kandidaat tegelijk: events en uitleg-tellingen komen kort na elkaar binnen en de store
// doet read-modify-write. De app draait als één instantie, dus een slot in het geheugen volstaat.
const locks = new Map();
function withLock(key, fn) {
  const prev = locks.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => {}));
  return next;
}

export function recordEvents(store, code, raw) {
  return withLock(code, async () => {
    const candidate = await store.getByCode(code);
    if (!candidate) throw new AssessmentError('ongeldige code', 'invalid_code');
    if (candidate.status !== 'bezig') throw new AssessmentError('assessment loopt niet', 'not_running');
    const events = [...(candidate.toezicht?.events || []), ...cleanEvents(raw)].slice(-MAX_EVENTS);
    await store.updateCandidate(candidate.id, { toezicht: { events, samenvatting: summarize(events) } });
    return { ok: true };
  });
}

// Het logboek is alleen voor leden van één Entra-groep (LOGBOEK_GROUP_ID) of, tot die groep er is, voor de
// e-mailadressen in LOGBOEK_USERS (komma-gescheiden). Zonder beide ziet niemand het, behalve lokaal in
// AUTH_DEV_MODE. Groepen en e-mail komen uit de claims van Easy Auth (x-ms-client-principal); voor groepen moet
// de app-registratie groepsclaims uitgeven.
const GROUP_CLAIMS = ['groups', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'];
const MAIL_CLAIMS = ['preferred_username', 'email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'];
export function canSeeLogboek(principalHeader, env = process.env) {
  if (!principalHeader) return Boolean(env.AUTH_DEV_MODE);
  const groupId = env.LOGBOEK_GROUP_ID;
  const users = String(env.LOGBOEK_USERS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!groupId && !users.length) return false;
  try {
    const decoded = JSON.parse(Buffer.from(principalHeader, 'base64').toString('utf8'));
    const claims = decoded.claims || [];
    if (groupId && claims.some((c) => GROUP_CLAIMS.includes(c.typ) && c.val === groupId)) return true;
    const mails = [decoded.userDetails, ...claims.filter((c) => MAIL_CLAIMS.includes(c.typ)).map((c) => c.val)];
    return mails.some((m) => typeof m === 'string' && users.includes(m.toLowerCase()));
  } catch { return false; }
}
