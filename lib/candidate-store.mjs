// lib/candidate-store.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

function buildCandidate({ naam, email = null, functie, code, aangemaaktDoor }) {
  return {
    id: randomUUID(), naam, email, functie, code,
    status: 'uitgenodigd', aangemaaktDoor,
    aangemaaktOp: new Date().toISOString(), gestartOp: null, ingediendOp: null,
  };
}

// --- file-fallback (dev/tests) ---
function fileStore(filePath) {
  async function load() {
    try { return JSON.parse(await readFile(filePath, 'utf8')); }
    catch { return { candidates: [], results: {} }; }
  }
  async function persist(data) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2));
  }
  return {
    async createCandidate(input) {
      const data = await load(); const candidate = buildCandidate(input);
      data.candidates.unshift(candidate); await persist(data); return candidate;
    },
    async getByCode(code) { return (await load()).candidates.find((c) => c.code === code) || null; },
    async listCandidates() { return (await load()).candidates; },
    async updateCandidate(id, patch) {
      const data = await load(); const c = data.candidates.find((x) => x.id === id);
      if (!c) throw new Error(`onbekende kandidaat: ${id}`);
      Object.assign(c, patch); await persist(data); return c;
    },
    async saveResult(candidateId, result) {
      const data = await load(); data.results[candidateId] = result; await persist(data);
    },
    async getResult(candidateId) { return (await load()).results[candidateId] || null; },
  };
}

// --- Azure Table (productie) ---
function azureStore(connectionString, tableName) {
  let clientPromise;
  async function client() {
    if (!clientPromise) {
      clientPromise = (async () => {
        const { TableClient } = await import('@azure/data-tables');
        const c = TableClient.fromConnectionString(connectionString, tableName);
        await c.createTable().catch((e) => { if (e.statusCode !== 409) throw e; });
        return c;
      })();
    }
    return clientPromise;
  }
  return {
    async createCandidate(input) {
      const c = await client(); const candidate = buildCandidate(input);
      await c.createEntity({ partitionKey: 'candidate', rowKey: candidate.id, code: candidate.code, data: JSON.stringify(candidate) });
      return candidate;
    },
    async getByCode(code) {
      const c = await client();
      const safe = String(code).replace(/'/g, "''");
      const it = c.listEntities({ queryOptions: { filter: `PartitionKey eq 'candidate' and code eq '${safe}'` } });
      for await (const e of it) return JSON.parse(e.data);
      return null;
    },
    async listCandidates() {
      const c = await client(); const out = [];
      for await (const e of c.listEntities({ queryOptions: { filter: `PartitionKey eq 'candidate'` } })) out.push(JSON.parse(e.data));
      return out.sort((a, b) => String(b.aangemaaktOp).localeCompare(String(a.aangemaaktOp)));
    },
    async updateCandidate(id, patch) {
      const c = await client(); const e = await c.getEntity('candidate', id);
      const candidate = { ...JSON.parse(e.data), ...patch };
      await c.updateEntity({ partitionKey: 'candidate', rowKey: id, code: candidate.code, data: JSON.stringify(candidate) }, 'Replace');
      return candidate;
    },
    async saveResult(candidateId, result) {
      const c = await client();
      await c.upsertEntity({ partitionKey: 'result', rowKey: candidateId, data: JSON.stringify(result) }, 'Replace');
    },
    async getResult(candidateId) {
      const c = await client();
      try { return JSON.parse((await c.getEntity('result', candidateId)).data); }
      catch (e) { if (e.statusCode === 404) return null; throw e; }
    },
  };
}

export function createStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentCandidates' } = {}) {
  return connectionString ? azureStore(connectionString, tableName) : fileStore(filePath);
}
