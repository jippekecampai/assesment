// test/candidate-store.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../lib/candidate-store.mjs';

function tmpStore() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-store-'));
  return { store: createStore({ filePath: join(dir, 'candidates.json') }), dir };
}

test('createCandidate + getByCode round-trip', async () => {
  const { store, dir } = tmpStore();
  try {
    const c = await store.createCandidate({ naam: 'Test Persoon', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'reviewer@campai.nl' });
    assert.ok(c.id);
    assert.equal(c.status, 'uitgenodigd');
    const found = await store.getByCode('ABC234');
    assert.equal(found.id, c.id);
    assert.equal(await store.getByCode('NOPE99'), null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('updateCandidate en saveResult/getResult', async () => {
  const { store, dir } = tmpStore();
  try {
    const c = await store.createCandidate({ naam: 'X', functie: 'sales', code: 'ABC235', aangemaaktDoor: 'r@c.nl' });
    const upd = await store.updateCandidate(c.id, { status: 'afgerond', ingediendOp: '2026-06-26T12:00:00Z' });
    assert.equal(upd.status, 'afgerond');
    await store.saveResult(c.id, { totaalScore: 80, domeinScores: { Azure: 80 }, antwoorden: [] });
    const r = await store.getResult(c.id);
    assert.equal(r.totaalScore, 80);
    const list = await store.listCandidates();
    assert.equal(list.length, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
