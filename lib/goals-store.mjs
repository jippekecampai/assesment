// lib/goals-store.mjs
// Eigen ontwikkeldoelen + toekomstwens van de medewerker (per entraOid). De
// medewerker beheert dit zelf; de manager kan het later inzien. File + Azure Table.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

function buildGoal({ title, metric = '', linkedDomain = '', due = '' }) {
  return { id: randomUUID(), title, metric, linkedDomain, progress: 0, status: 'todo', due, createdAt: new Date().toISOString() };
}
function emptyRecord(entraOid) { return { entraOid, aspiration: '', goals: [] }; }

function fileStore(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { byOid: {} }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  async function rec(d, oid) { return d.byOid[oid] || { aspiration: '', goals: [] }; }
  return {
    async get(oid) { const d = await load(); return { entraOid: oid, ...(await rec(d, oid)) }; },
    async setAspiration(oid, aspiration) {
      const d = await load(); const r = await rec(d, oid); r.aspiration = aspiration;
      d.byOid[oid] = r; await persist(d); return { entraOid: oid, ...r };
    },
    async addGoal(oid, input) {
      const d = await load(); const r = await rec(d, oid); r.goals = [buildGoal(input), ...r.goals];
      d.byOid[oid] = r; await persist(d); return { entraOid: oid, ...r };
    },
    async updateGoal(oid, id, patch) {
      const d = await load(); const r = await rec(d, oid);
      r.goals = r.goals.map((g) => (g.id === id ? { ...g, ...patch } : g));
      d.byOid[oid] = r; await persist(d); return { entraOid: oid, ...r };
    },
    async removeGoal(oid, id) {
      const d = await load(); const r = await rec(d, oid); r.goals = r.goals.filter((g) => g.id !== id);
      d.byOid[oid] = r; await persist(d); return { entraOid: oid, ...r };
    },
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
  async function read(c, oid) {
    try { return JSON.parse((await c.getEntity('goals', oid)).data || '{}'); }
    catch (e) { if (e.statusCode === 404) return { aspiration: '', goals: [] }; throw e; }
  }
  async function write(c, oid, r) {
    await c.upsertEntity({ partitionKey: 'goals', rowKey: oid, data: JSON.stringify({ aspiration: r.aspiration || '', goals: r.goals || [] }) }, 'Replace');
  }
  return {
    async get(oid) { const c = await client(); const r = await read(c, oid); return { entraOid: oid, ...r }; },
    async setAspiration(oid, aspiration) { const c = await client(); const r = await read(c, oid); r.aspiration = aspiration; await write(c, oid, r); return { entraOid: oid, ...r }; },
    async addGoal(oid, input) { const c = await client(); const r = await read(c, oid); r.goals = [buildGoal(input), ...(r.goals || [])]; await write(c, oid, r); return { entraOid: oid, ...r }; },
    async updateGoal(oid, id, patch) { const c = await client(); const r = await read(c, oid); r.goals = (r.goals || []).map((g) => (g.id === id ? { ...g, ...patch } : g)); await write(c, oid, r); return { entraOid: oid, ...r }; },
    async removeGoal(oid, id) { const c = await client(); const r = await read(c, oid); r.goals = (r.goals || []).filter((g) => g.id !== id); await write(c, oid, r); return { entraOid: oid, ...r }; },
  };
}

export function createGoalsStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentGoals' } = {}) {
  return connectionString ? azureStore(connectionString, tableName) : fileStore(filePath);
}
