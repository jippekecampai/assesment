// test/examens.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { listExamens, laadExamen, voorBrowser, beoordeel, createExamenStore, startPoging, logEvents, examenUitleg, inleveren, resultaten, mijnPogingen } from '../lib/examens.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-ex-'));
  return { store: createExamenStore({ filePath: join(dir, 'e.json') }), dir };
}
const jan = { entraOid: 'o1', naam: 'Jan', email: 'jan@campai.nl' };

test('elk examen is geldig: 4 opties, antwoord 0-3, bekend onderwerp, unieke ids', async () => {
  const lijst = await listExamens();
  assert.ok(lijst.find((e) => e.id === 'cloud-engineer' && e.aantal === 45));
  for (const meta of lijst) {
    const e = await laadExamen(meta.id);
    const ids = new Set();
    for (const v of e.vragen) {
      assert.ok(v.options.length === 4 && Number.isInteger(v.answer) && v.answer >= 0 && v.answer <= 3, `${meta.id}/${v.id}`);
      assert.ok(e.onderwerpen[v.onderwerp], `${meta.id}/${v.id} onderwerp`);
      assert.ok(!ids.has(v.id)); ids.add(v.id);
    }
  }
  assert.equal(await laadExamen('../examens'), null);
});

test('de browser krijgt geen antwoorden of uitleg', async () => {
  const e = voorBrowser(await laadExamen('cloud-engineer'));
  for (const v of e.vragen) assert.ok(!('answer' in v) && !('uitleg' in v));
});

test('beoordeel: geslaagd met hooguit 1 fout', async () => {
  const e = await laadExamen('cloud-engineer');
  const alles = Object.fromEntries(e.vragen.map((v) => [v.id, v.answer]));
  assert.equal(beoordeel(e, alles).geslaagd, true);
  const eenFout = { ...alles, [e.vragen[0].id]: (e.vragen[0].answer + 1) % 4 };
  assert.deepEqual([beoordeel(e, eenFout).fout, beoordeel(e, eenFout).geslaagd], [1, true]);
  const { [e.vragen[1].id]: _weg, ...tweeFout } = eenFout;
  assert.deepEqual([beoordeel(e, tweeFout).fout, beoordeel(e, tweeFout).geslaagd], [2, false]);
});

test('poging: start, logboek, uitleg met controle, inleveren één keer, alleen eigen poging', async () => {
  const { store, dir } = fresh();
  try {
    const { poging, examen } = await startPoging(store, 'cloud-engineer', jan);
    assert.ok(poging && examen.vragen.length === 45);
    assert.equal(await logEvents(store, poging, jan, [{ type: 'weg', sec: 9, reden: 'ander-tabblad' }]), true);
    assert.equal(await logEvents(store, poging, { email: 'ander@campai.nl' }, [{ type: 'plak' }]), false);
    const chat = async (m) => (m[0].content.startsWith('Je controleert') ? '{"verklapt": false}' : 'uitleg');
    assert.deepEqual(await examenUitleg(store, poging, jan, { vraagId: examen.vragen[0].id, vraag: 'wat is IaaS?' }, { chat }), { antwoord: 'uitleg' });
    const e = await laadExamen('cloud-engineer');
    const r = await inleveren(store, poging, jan, Object.fromEntries(e.vragen.map((v) => [v.id, v.answer])), [{ type: 'plak' }]);
    assert.equal(r.geslaagd, true);
    assert.ok(r.details[0].uitleg);
    assert.deepEqual(await inleveren(store, poging, jan, {}, []), { fout: 'al_ingeleverd' });
    const [rij] = await resultaten(store);
    assert.deepEqual([rij.naam, rij.geslaagd, rij.toezicht.weg, rij.toezicht.plak, rij.uitleg], ['Jan', true, 1, 1, 1]);
    assert.ok(!('details' in rij));
    assert.equal((await mijnPogingen(store, jan)).length, 1);
    assert.equal((await mijnPogingen(store, { email: 'ander@campai.nl' })).length, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
