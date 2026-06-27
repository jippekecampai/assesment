// test/assessment-service.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../lib/candidate-store.mjs';
import { startAssessment, submitAssessment, AssessmentError } from '../lib/assessment-service.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-svc-'));
  return { store: createStore({ filePath: join(dir, 'c.json') }), dir };
}

test('start levert vragen zonder antwoordsleutel en zet status bezig', async () => {
  const { store, dir } = fresh();
  try {
    const c = await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { candidate, questions } = await startAssessment(store, 'ABC234');
    assert.equal(candidate.functie, 'cloud');
    assert.ok(questions.length > 0);
    for (const q of questions) assert.ok(!('answer' in q));
    assert.equal((await store.getByCode('ABC234')).status, 'bezig');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('ongeldige code gooit invalid_code', async () => {
  const { store, dir } = fresh();
  try {
    await assert.rejects(() => startAssessment(store, 'ZZZZ99'), (e) => e instanceof AssessmentError && e.code === 'invalid_code');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('submit scoort, slaat op, zet afgerond en geeft GEEN roleFit terug', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { questions } = await startAssessment(store, 'ABC234');
    // we kennen de answers niet client-side; simuleer "alles eerste optie"
    const answers = questions.map((q) => ({ questionId: q.id, choice: 0 }));
    const out = await submitAssessment(store, 'ABC234', answers);
    assert.ok('totaalScore' in out && 'domeinScores' in out);
    assert.ok(!('roleFit' in out)); // kandidaat ziet geen fit
    const c = await store.getByCode('ABC234');
    assert.equal(c.status, 'afgerond');
    const saved = await store.getResult(c.id);
    assert.ok(saved.roleFit); // reviewer-data bevat wél de fit
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('start op afgeronde code gooit already_done', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { questions } = await startAssessment(store, 'ABC234');
    await submitAssessment(store, 'ABC234', questions.map((q) => ({ questionId: q.id, choice: 0 })));
    await assert.rejects(() => startAssessment(store, 'ABC234'), (e) => e.code === 'already_done');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
