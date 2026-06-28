// lib/policy-store.mjs
// Bewaart per medewerker (entraOid) welke beleids-/AI-geletterdheidsonderdelen zijn
// gelezen & begrepen — bewijs voor o.a. ISO 42001 (AI-geletterdheid + beleidsbesef).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

function fileStore(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { byOid: {} }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  return {
    async get(entraOid) { return { entraOid, acks: (await load()).byOid[entraOid] || {} }; },
    async ack(entraOid, policyId) {
      const d = await load();
      d.byOid[entraOid] = { ...(d.byOid[entraOid] || {}), [policyId]: new Date().toISOString() };
      await persist(d);
      return { entraOid, acks: d.byOid[entraOid] };
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
    async get(entraOid) {
      const c = await client();
      try { return { entraOid, acks: JSON.parse((await c.getEntity('policy', entraOid)).data || '{}') }; }
      catch (e) { if (e.statusCode === 404) return { entraOid, acks: {} }; throw e; }
    },
    async ack(entraOid, policyId) {
      const c = await client();
      const cur = await this.get(entraOid);
      const acks = { ...cur.acks, [policyId]: new Date().toISOString() };
      await c.upsertEntity({ partitionKey: 'policy', rowKey: entraOid, data: JSON.stringify(acks) }, 'Replace');
      return { entraOid, acks };
    },
  };
}

export function createPolicyStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentPolicyAcks' } = {}) {
  return connectionString ? azureStore(connectionString, tableName) : fileStore(filePath);
}
