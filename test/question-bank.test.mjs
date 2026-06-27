import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createQuestionBank } from '../lib/question-bank.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-qb-'));
  return { bank: createQuestionBank({ filePath: join(dir, 'q.json') }), dir };
}

test('addApproved + listApproved round-trip', async () => {
  const { bank, dir } = fresh();
  try {
    const q = await bank.addApproved({ domain: 'Azure', type: 'Scenario', prompt: 'p', options: ['a','b','c','d'], answer: 1, source: 'Handmatig', approvedBy: 'senior@campai.nl' });
    assert.ok(q.id && q.approvedAt);
    const list = await bank.listApproved();
    assert.equal(list.length, 1);
    assert.equal(list[0].domain, 'Azure');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('removeApproved verwijdert', async () => {
  const { bank, dir } = fresh();
  try {
    const q = await bank.addApproved({ domain: 'Azure', type: 'T', prompt: 'p', options: ['a','b','c','d'], answer: 0, source: 'Handmatig', approvedBy: 's@c.nl' });
    await bank.removeApproved(q.id);
    assert.equal((await bank.listApproved()).length, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
