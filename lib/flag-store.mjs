// lib/flag-store.mjs
// Staff kan een vraag tijdens het review markeren als onjuist/twijfelachtig.
// Vragen identificeren we op prompt+domein (vraag-id's zijn niet stabiel tussen
// assessments), met een optionele notitie.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

function build({ prompt, domain, note = '', flaggedBy = '' }) {
  return { id: randomUUID(), prompt, domain, note, flaggedBy, flaggedAt: new Date().toISOString() };
}

function fileStore(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { flags: [] }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  return {
    async addFlag(input) { const d = await load(); const f = build(input); d.flags.unshift(f); await persist(d); return f; },
    async listFlags() { return (await load()).flags; },
    async removeFlag(id) { const d = await load(); d.flags = d.flags.filter((f) => f.id !== id); await persist(d); },
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
    async addFlag(input) { const c = await client(); const f = build(input); await c.createEntity({ partitionKey: 'flag', rowKey: f.id, data: JSON.stringify(f) }); return f; },
    async listFlags() { const c = await client(); const out = []; for await (const e of c.listEntities({ queryOptions: { filter: "PartitionKey eq 'flag'" } })) out.push(JSON.parse(e.data)); return out.sort((a, b) => String(b.flaggedAt).localeCompare(String(a.flaggedAt))); },
    async removeFlag(id) { const c = await client(); await c.deleteEntity('flag', id).catch((e) => { if (e.statusCode !== 404) throw e; }); },
  };
}

export function createFlagStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentQuestionFlags' } = {}) {
  return connectionString ? azureStore(connectionString, tableName) : fileStore(filePath);
}
