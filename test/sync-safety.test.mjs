// test/sync-safety.test.mjs
// Regressie: een verse/lege staat mag NOOIT gevulde remote-data overschrijven,
// ook niet als zijn tijdstempel toevallig nieuwer is. (Datafamilie waardoor een
// zuster-app een week data verloor.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeMergeProgress, hasUserContent, freshProgress, canPushProgress } from '../lib/sync-safety.mjs';

test('lege seed met NIEUWER tijdstempel wint NOOIT van gevulde remote (de bug)', () => {
  const localLeegNieuw = { completedModules: [], updatedAt: '2026-12-31T23:59:59Z' }; // verse sessie, "nu"
  const remoteGevuldOud = { completedModules: ['m1', 'm2', 'm3'], updatedAt: '2026-01-01T00:00:00Z' };
  const result = safeMergeProgress(localLeegNieuw, remoteGevuldOud);
  assert.deepEqual(result.completedModules, ['m1', 'm2', 'm3'], 'gevulde remote moet behouden blijven');
});

test('gevuld-lokaal wint van leeg-remote', () => {
  const local = { completedModules: ['a'], updatedAt: '2026-01-01T00:00:00Z' };
  const remote = { completedModules: [], updatedAt: '2026-06-01T00:00:00Z' };
  assert.deepEqual(safeMergeProgress(local, remote).completedModules, ['a']);
});

test('beide gevuld -> nieuwste tijdstempel wint', () => {
  const ouder = { completedModules: ['a'], updatedAt: '2026-01-01T00:00:00Z' };
  const nieuwer = { completedModules: ['a', 'b'], updatedAt: '2026-06-01T00:00:00Z' };
  assert.deepEqual(safeMergeProgress(ouder, nieuwer).completedModules, ['a', 'b']);
  assert.deepEqual(safeMergeProgress(nieuwer, ouder).completedModules, ['a', 'b']);
});

test('verse staat heeft leegste tijdstempel en telt nooit als nieuwer', () => {
  const fresh = freshProgress('oid');
  assert.equal(fresh.updatedAt, '');
  assert.equal(hasUserContent(fresh.completedModules), false);
});

test('canPushProgress: alleen schrijven na succesvolle pull (hydrated)', () => {
  assert.equal(canPushProgress(false), false);
  assert.equal(canPushProgress(true), true);
});
