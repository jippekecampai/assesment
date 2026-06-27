import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createLearningStore } from '../lib/learning-store.mjs';

const TEMP_FILE = join(tmpdir(), `test-learning-${randomUUID()}.json`);

test('learning-store file round-trip', async () => {
  const store = createLearningStore({ filePath: TEMP_FILE });

  // default: geen record → lege completedModules
  const def = await store.getProgress('oid-test');
  assert.equal(def.entraOid, 'oid-test');
  assert.deepEqual(def.completedModules, []);

  // save ['m1','m2'] → get geeft die terug
  await store.saveProgress('oid-test', ['m1', 'm2']);
  const after1 = await store.getProgress('oid-test');
  assert.deepEqual(after1.completedModules, ['m1', 'm2']);
  assert.ok(after1.updatedAt, 'updatedAt moet aanwezig zijn');

  // overschrijven met ['m3'] → get geeft ['m3']
  await store.saveProgress('oid-test', ['m3']);
  const after2 = await store.getProgress('oid-test');
  assert.deepEqual(after2.completedModules, ['m3']);

  // cleanup
  await unlink(TEMP_FILE).catch(() => {});
});
