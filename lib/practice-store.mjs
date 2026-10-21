// lib/practice-store.mjs
// Bewaart oefenresultaten van de Skills Academy per medewerker (entraOid).
// Puur leren/ontwikkeling — NOOIT een HR-beoordeling. Zelfde patroon als
// candidate-store/question-bank (file-fallback + Azure Table).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const MAX_RESULTS = 100;

// naam/email: wie het resultaat haalde, zodat het als bewijs te tonen is (o.a. ISO 42001 AI-geletterdheid).
function addTo(results, { domain, score, total, set = null, naam = null, email = null }) {
  const entry = { domain, score, total, at: new Date().toISOString(), ...(set ? { set } : {}), ...(naam ? { naam } : {}), ...(email ? { email } : {}) };
  return [entry, ...(Array.isArray(results) ? results : [])].slice(0, MAX_RESULTS);
}

function fileStore(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { byOid: {} }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  return {
    async getResults(entraOid) { return { entraOid, results: (await load()).byOid[entraOid] || [] }; },
    async listAll() { return Object.entries((await load()).byOid).map(([entraOid, results]) => ({ entraOid, results })); },
    async addResult(entraOid, input) {
      const d = await load();
      d.byOid[entraOid] = addTo(d.byOid[entraOid], input);
      await persist(d);
      return { entraOid, results: d.byOid[entraOid] };
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
  return {
    async getResults(entraOid) {
      const c = await client();
      try {
        const e = await c.getEntity('practice', entraOid);
        return { entraOid, results: JSON.parse(e.data || '[]') };
      } catch (e) { if (e.statusCode === 404) return { entraOid, results: [] }; throw e; }
    },
    async listAll() {
      const c = await client(); const out = [];
      for await (const e of c.listEntities({ queryOptions: { filter: "PartitionKey eq 'practice'" } })) out.push({ entraOid: e.rowKey, results: JSON.parse(e.data || '[]') });
      return out;
    },
    async addResult(entraOid, input) {
      const c = await client();
      const cur = await this.getResults(entraOid);
      const results = addTo(cur.results, input);
      await c.upsertEntity({ partitionKey: 'practice', rowKey: entraOid, data: JSON.stringify(results) }, 'Replace');
      return { entraOid, results };
    },
  };
}

export function createPracticeStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentPractice' } = {}) {
  return connectionString ? azureStore(connectionString, tableName) : fileStore(filePath);
}
