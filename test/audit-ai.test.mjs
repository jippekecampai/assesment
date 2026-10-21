// test/audit-ai.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aiBewijs } from '../lib/audit-ai.mjs';

test('aiBewijs: compleet alleen met beide bevestigingen en minstens 70% op AI / Copilot', () => {
  const policies = [
    { entraOid: 'a', acks: { 'ai-geletterdheid': '2026-10-01T10:00:00Z', 'gouden-regels': '2026-10-01T10:05:00Z' } },
    { entraOid: 'b', acks: { 'ai-geletterdheid': '2026-10-02T10:00:00Z' } },
  ];
  const practice = [
    { entraOid: 'a', results: [{ domain: 'AI / Copilot', score: 6, total: 12, at: '2026-10-01T11:00:00Z' }, { domain: 'AI / Copilot', score: 10, total: 12, at: '2026-10-03T11:00:00Z', naam: 'Anna', email: 'anna@campai.nl' }] },
    { entraOid: 'b', results: [{ domain: 'AI / Copilot', score: 12, total: 12, at: '2026-10-02T11:00:00Z' }] },
    { entraOid: 'c', results: [{ domain: 'Azure', score: 5, total: 5, at: '2026-10-02T11:00:00Z' }] },
  ];
  const rows = aiBewijs(policies, practice);
  assert.equal(rows.length, 2); // c heeft niets met AI-geletterdheid te maken
  const a = rows.find((r) => r.entraOid === 'a');
  assert.deepEqual([a.compleet, a.besteScore, a.scoreOp, a.pogingen, a.naam], [true, 83, '2026-10-03T11:00:00Z', 2, 'Anna']);
  const b = rows.find((r) => r.entraOid === 'b');
  assert.deepEqual([b.compleet, b.besteScore, b.goudenRegels], [false, 100, null]);
  assert.equal(rows[0].entraOid, 'a'); // complete medewerkers eerst
});
