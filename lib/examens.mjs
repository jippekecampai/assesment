// lib/examens.mjs
// Examens voor een rol (Cloud Engineer, AI Engineer): toetsen of iemand geschikt is om in die rol aan de slag te gaan.
// Anders dan bij oefenen ziet de browser de juiste antwoorden niet: de server houdt ze vast, rekent de uitslag uit
// en bewaart de poging (met het toezichtlogboek) voor de beoordelaar. Slagen = hooguit MAX_FOUT vragen fout.
// Uitleg vragen mag tijdens het examen (met verklap-controle); wie de uitleg leest moet het daarna zelf kunnen.
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { cleanEvents, summarize } from './toezicht.mjs';
import { tutorMessages, verklapt } from './uitleg.mjs';
import { chat as defaultChat } from './ai-client.mjs';

const HIER = join(dirname(fileURLToPath(import.meta.url)), 'examens');
export const MAX_FOUT = 1;
export const UITLEG_MAX = 40; // per poging
const MAX_EVENTS = 300;

export async function laadExamen(id) {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  try { return JSON.parse(await readFile(join(HIER, `${id}.json`), 'utf8')); } catch { return null; }
}

export async function listExamens() {
  const files = (await readdir(HIER)).filter((f) => f.endsWith('.json'));
  const out = [];
  for (const f of files) {
    const e = JSON.parse(await readFile(join(HIER, f), 'utf8'));
    out.push({ id: e.id, titel: e.titel, rol: e.rol, omschrijving: e.omschrijving, aantal: e.vragen.length, maxFout: MAX_FOUT });
  }
  return out.sort((a, b) => a.titel.localeCompare(b.titel));
}

// Wat de browser van een examen krijgt: alles behalve het juiste antwoord en de uitleg.
export function voorBrowser(e) {
  const { vragen, ...rest } = e;
  return { ...rest, maxFout: MAX_FOUT, vragen: vragen.map(({ answer, uitleg, ...v }) => v) };
}

export function beoordeel(e, antwoorden) {
  const per = {};
  const details = e.vragen.map((v) => {
    const gekozen = Number.isInteger(antwoorden?.[v.id]) ? antwoorden[v.id] : -1;
    const goed = gekozen === v.answer;
    per[v.onderwerp] ??= { goed: 0, totaal: 0 };
    per[v.onderwerp].totaal++;
    if (goed) per[v.onderwerp].goed++;
    return { id: v.id, gekozen, juist: v.answer, goed };
  });
  const goed = details.filter((d) => d.goed).length;
  const fout = details.length - goed;
  return { goed, fout, totaal: details.length, pct: Math.round((goed / details.length) * 100), geslaagd: fout <= MAX_FOUT, perOnderwerp: per, details };
}

// ---- opslag van pogingen (zelfde patroon als de andere stores) ----
function fileStore(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { pogingen: [] }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  return {
    async list() { return (await load()).pogingen; },
    async get(id) { return (await load()).pogingen.find((p) => p.id === id) || null; },
    async put(p) { const d = await load(); d.pogingen = [p, ...d.pogingen.filter((x) => x.id !== p.id)]; await persist(d); return p; },
  };
}
function azureStore(connectionString, tableName) {
  let clientPromise;
  async function client() {
    if (!clientPromise) clientPromise = (async () => {
      const { TableClient } = await import('@azure/data-tables');
      const c = TableClient.fromConnectionString(connectionString, tableName);
      await c.createTable().catch((e) => { if (e.statusCode !== 409) throw e; });
      return c;
    })();
    return clientPromise;
  }
  return {
    async list() { const c = await client(); const out = []; for await (const e of c.listEntities({ queryOptions: { filter: "PartitionKey eq 'poging'" } })) out.push(JSON.parse(e.data)); return out; },
    async get(id) { const c = await client(); try { return JSON.parse((await c.getEntity('poging', id)).data); } catch (e) { if (e.statusCode === 404) return null; throw e; } },
    async put(p) { const c = await client(); await c.upsertEntity({ partitionKey: 'poging', rowKey: p.id, data: JSON.stringify(p) }, 'Replace'); return p; },
  };
}
export function createExamenStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentExamens' } = {}) {
  return connectionString ? azureStore(connectionString, tableName) : fileStore(filePath);
}

// Eén schrijver per poging tegelijk (events en uitleg-tellingen komen kort na elkaar binnen).
const locks = new Map();
function metSlot(id, fn) {
  const prev = locks.get(id) || Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(id, next.catch(() => {}));
  return next;
}

export async function startPoging(store, examenId, wie) {
  const e = await laadExamen(examenId);
  if (!e) return null;
  const p = { id: randomUUID(), examenId, titel: e.titel, entraOid: wie.entraOid || null, naam: wie.naam || null, email: wie.email || null,
    gestart: new Date().toISOString(), status: 'bezig', uitleg: 0, uitlegGeblokkeerd: 0, toezicht: { events: [], samenvatting: summarize([]) } };
  await store.put(p);
  return { poging: p.id, examen: voorBrowser(e) };
}

async function eigenPoging(store, id, wie) {
  const p = await store.get(id);
  if (!p || (p.email && wie.email && p.email.toLowerCase() !== wie.email.toLowerCase())) return null;
  return p;
}

export function logEvents(store, id, wie, raw) {
  return metSlot(id, async () => {
    const p = await eigenPoging(store, id, wie);
    if (!p || p.status !== 'bezig') return false;
    const events = [...p.toezicht.events, ...cleanEvents(raw)].slice(-MAX_EVENTS);
    await store.put({ ...p, toezicht: { events, samenvatting: summarize(events) } });
    return true;
  });
}

export async function examenUitleg(store, id, wie, { vraagId, vraag, history }, { chat = defaultChat } = {}) {
  const p = await eigenPoging(store, id, wie);
  if (!p || p.status !== 'bezig') return { fout: 'niet_bezig' };
  if (p.uitleg + p.uitlegGeblokkeerd >= UITLEG_MAX) return { fout: 'uitleg_max' };
  const e = await laadExamen(p.examenId);
  const v = e?.vragen.find((x) => x.id === vraagId);
  if (!v) return { fout: 'onbekende_vraag' };
  const tekst = String(vraag || '').trim().slice(0, 300);
  if (!tekst) return { fout: 'leeg' };
  const vorm = { domain: e.onderwerpen?.[v.onderwerp] || v.onderwerp, prompt: v.prompt, options: v.options, answer: v.answer };
  const hist = Array.isArray(history) ? history.slice(-6) : [];
  let antwoord = await chat(tutorMessages(vorm, hist, tekst));
  if (await verklapt(vorm, antwoord, chat)) {
    antwoord = await chat(tutorMessages(vorm, hist, tekst, true));
    if (await verklapt(vorm, antwoord, chat)) antwoord = null;
  }
  await metSlot(id, async () => {
    const q = await store.get(id);
    await store.put({ ...q, uitleg: q.uitleg + (antwoord ? 1 : 0), uitlegGeblokkeerd: q.uitlegGeblokkeerd + (antwoord ? 0 : 1) });
  });
  return antwoord ? { antwoord } : { geblokkeerd: true };
}

export function inleveren(store, id, wie, antwoorden, raw) {
  return metSlot(id, async () => {
    const p = await eigenPoging(store, id, wie);
    if (!p) return { fout: 'onbekend' };
    if (p.status !== 'bezig') return { fout: 'al_ingeleverd' };
    const e = await laadExamen(p.examenId);
    const uitslag = beoordeel(e, antwoorden);
    const events = [...p.toezicht.events, ...cleanEvents(raw)].slice(-MAX_EVENTS);
    await store.put({ ...p, status: 'ingeleverd', ingeleverd: new Date().toISOString(), uitslag, toezicht: { events, samenvatting: summarize(events) } });
    // Na inleveren mag de deelnemer alles zien, inclusief de uitleg per vraag.
    return { ...uitslag, details: uitslag.details.map((d) => ({ ...d, uitleg: e.vragen.find((v) => v.id === d.id)?.uitleg || '' })) };
  });
}

// Voor de beoordelaar: alle ingeleverde pogingen, nieuwste eerst, zonder de antwoorden per vraag.
export async function resultaten(store) {
  return (await store.list())
    .filter((p) => p.status === 'ingeleverd')
    .map(({ uitslag, toezicht, ...p }) => ({ ...p, goed: uitslag.goed, fout: uitslag.fout, totaal: uitslag.totaal, pct: uitslag.pct, geslaagd: uitslag.geslaagd, perOnderwerp: uitslag.perOnderwerp, toezicht: toezicht.samenvatting }))
    .sort((a, b) => String(b.ingeleverd).localeCompare(String(a.ingeleverd)));
}

export async function mijnPogingen(store, wie) {
  return (await resultaten(store)).filter((p) => p.email && wie.email && p.email.toLowerCase() === wie.email.toLowerCase())
    .map(({ toezicht, ...p }) => p);
}
