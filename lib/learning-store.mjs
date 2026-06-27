// lib/learning-store.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

// --- file-fallback (dev/tests) ---
function fileStore(filePath) {
  async function load() {
    try { return JSON.parse(await readFile(filePath, 'utf8')); }
    catch { return { learning: {} }; }
  }
  async function persist(data) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2));
  }
  return {
    async getProgress(entraOid) {
      const data = await load();
      return data.learning[entraOid] ?? { entraOid, completedModules: [] };
    },
    async saveProgress(entraOid, completedModules) {
      const data = await load();
      const record = { entraOid, completedModules, updatedAt: new Date().toISOString() };
      data.learning[entraOid] = record;
      await persist(data);
      return record;
    },
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
    async getProgress(entraOid) {
      const c = await client();
      try {
        const e = await c.getEntity('learning', entraOid);
        return { entraOid, completedModules: JSON.parse(e.completedModules), updatedAt: e.updatedAt };
      } catch (e) {
        if (e.statusCode === 404) return { entraOid, completedModules: [] };
        throw e;
      }
    },
    async saveProgress(entraOid, completedModules) {
      const c = await client();
      const updatedAt = new Date().toISOString();
      await c.upsertEntity(
        { partitionKey: 'learning', rowKey: entraOid, completedModules: JSON.stringify(completedModules), updatedAt },
        'Replace',
      );
      return { entraOid, completedModules, updatedAt };
    },
  };
}

export function createLearningStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentLearning' } = {}) {
  return connectionString ? azureStore(connectionString, tableName) : fileStore(filePath);
}
