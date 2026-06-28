// lib/coaching-store.mjs
// Manager houdt per medewerker 1:1's en coaching bij. Ontwikkeldata (gescheiden van
// recruitment). File-fallback + Azure Table, zelfde patroon als de andere stores.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

function buildEntry({ type, title, date, focus = '', action = '', createdBy = '' }) {
  return {
    id: randomUUID(),
    type: type === 'Review' ? 'Review' : '1:1',
    title, date, focus, action, createdBy,
    createdAt: new Date().toISOString(),
  };
}

function fileStore(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { byLearner: {} }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  return {
    async list(learnerId) {
      const d = await load();
      return (d.byLearner[learnerId] || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    },
    async add(learnerId, input) {
      const d = await load(); const e = buildEntry(input);
      d.byLearner[learnerId] = [e, ...(d.byLearner[learnerId] || [])];
      await persist(d); return e;
    },
    async remove(learnerId, id) {
      const d = await load();
      d.byLearner[learnerId] = (d.byLearner[learnerId] || []).filter((e) => e.id !== id);
      await persist(d);
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
  const pk = (learnerId) => `coaching_${String(learnerId).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  return {
    async list(learnerId) {
      const c = await client(); const out = [];
      const safe = pk(learnerId).replace(/'/g, "''");
      for await (const e of c.listEntities({ queryOptions: { filter: `PartitionKey eq '${safe}'` } })) out.push(JSON.parse(e.data));
      return out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    },
    async add(learnerId, input) {
      const c = await client(); const e = buildEntry(input);
      await c.createEntity({ partitionKey: pk(learnerId), rowKey: e.id, data: JSON.stringify(e) });
      return e;
    },
    async remove(learnerId, id) {
      const c = await client();
      await c.deleteEntity(pk(learnerId), id).catch((e) => { if (e.statusCode !== 404) throw e; });
    },
  };
}

export function createCoachingStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentCoaching' } = {}) {
  return connectionString ? azureStore(connectionString, tableName) : fileStore(filePath);
}
