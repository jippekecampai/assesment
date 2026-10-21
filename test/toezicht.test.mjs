// test/toezicht.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../lib/candidate-store.mjs';
import { startAssessment, submitAssessment, AssessmentError } from '../lib/assessment-service.mjs';
import { cleanEvents, summarize, recordEvents, canSeeLogboek } from '../lib/toezicht.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-tz-'));
  return { store: createStore({ filePath: join(dir, 'c.json') }), dir };
}
const fakeBank = { listApproved: async () => [] };
const principal = (claims) => Buffer.from(JSON.stringify({ claims })).toString('base64');

test('cleanEvents laat alleen bekende soorten door en begrenst de waarden', () => {
  const out = cleanEvents([
    { type: 'weg', sec: 99999999, reden: 'ander-venster', vraag: 3 },
    { type: 'weg', sec: -5, reden: 'iets-anders' },
    { type: 'hack', sec: 1 },
    { type: 'plak', vraag: 'drie' },
    null,
  ]);
  assert.equal(out.length, 3);
  assert.equal(out[0].sec, 86400);
  assert.equal(out[0].vraag, 3);
  assert.equal(out[1].sec, 0);
  assert.equal(out[1].reden, 'onbekend');
  assert.ok(!('vraag' in out[2]));
});

test('summarize telt weg, plakken en volledig scherm', () => {
  const s = summarize([
    { type: 'weg', sec: 10 }, { type: 'weg', sec: 30 }, { type: 'plak' }, { type: 'geen-volledig-scherm' }, { type: 'uitleg' },
  ]);
  assert.deepEqual(
    { weg: s.weg, wegSec: s.wegSec, langste: s.langsteWegSec, plak: s.plak, fs: s.volledigScherm, uitleg: s.uitleg },
    { weg: 2, wegSec: 40, langste: 30, plak: 1, fs: false, uitleg: 1 },
  );
});

test('recordEvents bewaart het logboek alleen zolang de assessment loopt en raakt de score niet', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    await assert.rejects(() => recordEvents(store, 'ABC234', [{ type: 'plak' }]), (e) => e instanceof AssessmentError && e.code === 'not_running');
    const { questions } = await startAssessment(store, 'ABC234', fakeBank);
    await Promise.all([
      recordEvents(store, 'ABC234', [{ type: 'weg', sec: 12, reden: 'ander-tabblad' }]),
      recordEvents(store, 'ABC234', [{ type: 'plak' }, { type: 'kopieer' }]),
    ]);
    const c = await store.getByCode('ABC234');
    assert.equal(c.toezicht.events.length, 3); // gelijktijdige batches gaan niet verloren
    assert.equal(c.toezicht.samenvatting.wegSec, 12);
    const answers = questions.map((q) => ({ questionId: q.id, choice: 0 }));
    const out = await submitAssessment(store, 'ABC234', answers);
    assert.ok(!('toezicht' in out));
    await assert.rejects(() => recordEvents(store, 'ABC234', [{ type: 'plak' }]), (e) => e.code === 'not_running');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('canSeeLogboek: alleen leden van LOGBOEK_GROUP_ID, zonder instelling niemand', () => {
  const lid = principal([{ typ: 'groups', val: 'g-1' }]);
  const geenLid = principal([{ typ: 'groups', val: 'g-2' }]);
  assert.equal(canSeeLogboek(lid, { LOGBOEK_GROUP_ID: 'g-1' }), true);
  assert.equal(canSeeLogboek(geenLid, { LOGBOEK_GROUP_ID: 'g-1' }), false);
  assert.equal(canSeeLogboek(lid, {}), false);
  assert.equal(canSeeLogboek(undefined, {}), false);
  assert.equal(canSeeLogboek(undefined, { AUTH_DEV_MODE: '1' }), true);
  assert.equal(canSeeLogboek('geen-base64-json', { LOGBOEK_GROUP_ID: 'g-1' }), false);
});
