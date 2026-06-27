import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

function build({ domain, type, prompt, options, answer, source = 'Handmatig', approvedBy = '' }) {
  return { id: randomUUID(), domain, type, prompt, options, answer, source, approvedBy, approvedAt: new Date().toISOString() };
}

function fileBank(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { questions: [] }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  return {
    async addApproved(input) { const d = await load(); const q = build(input); d.questions.unshift(q); await persist(d); return q; },
    async listApproved() { return (await load()).questions; },
    async removeApproved(id) { const d = await load(); d.questions = d.questions.filter((q) => q.id !== id); await persist(d); },
  };
}

function azureBank(connectionString, tableName) {
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
    async addApproved(input) { const c = await client(); const q = build(input); await c.createEntity({ partitionKey: 'question', rowKey: q.id, data: JSON.stringify(q) }); return q; },
    async listApproved() { const c = await client(); const out = []; for await (const e of c.listEntities({ queryOptions: { filter: "PartitionKey eq 'question'" } })) out.push(JSON.parse(e.data)); return out.sort((a, b) => String(b.approvedAt).localeCompare(String(a.approvedAt))); },
    async removeApproved(id) { const c = await client(); await c.deleteEntity('question', id).catch((e) => { if (e.statusCode !== 404) throw e; }); },
  };
}

export function createQuestionBank({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentQuestions' } = {}) {
  return connectionString ? azureBank(connectionString, tableName) : fileBank(filePath);
}
