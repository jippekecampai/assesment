// test/oefenen.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listSets, getSet, oefenUitleg } from '../lib/oefenen.mjs';

const bank = { listApproved: async () => [] };

test('sets: vaste set plus één per domein, elke vraag in de gedeelde vorm', async () => {
  const sets = await listSets(bank);
  assert.ok(sets.find((s) => s.id === 'ai-geletterdheid' && s.aantal === 12));
  assert.ok(sets.find((s) => s.id === 'domein-microsoft-365'));
  for (const meta of sets) {
    const set = await getSet(bank, meta.id);
    assert.equal(set.vragen.length, meta.aantal, meta.id);
    for (const v of set.vragen) {
      assert.ok(v.id && v.prompt && v.options.length === 4 && Number.isInteger(v.answer), `${meta.id}/${v.id}`);
      assert.ok(set.onderwerpen[v.onderwerp], `${meta.id}/${v.id} onderwerp`);
    }
  }
  assert.equal(await getSet(bank, 'bestaat-niet'), null);
});

test('oefenUitleg: vóór het antwoord met controle, ná het antwoord mét het juiste antwoord in de context', async () => {
  const set = await getSet(bank, 'ai-geletterdheid');
  const v = set.vragen[0];
  const calls = [];
  const chat = async (m) => { calls.push(m); return m[0].content.startsWith('Je controleert') ? '{"verklapt": false}' : 'uitleg'; };
  assert.deepEqual(await oefenUitleg(set, { vraagId: v.id, vraag: 'wat is een taalmodel?' }, { chat }), { antwoord: 'uitleg' });
  assert.ok(!calls[0][0].content.includes('juiste antwoord is'));
  calls.length = 0;
  await oefenUitleg(set, { vraagId: v.id, vraag: 'waarom?', gekozen: 0 }, { chat });
  assert.equal(calls.length, 1);
  assert.ok(calls[0][0].content.includes('Het juiste antwoord is'));
  assert.deepEqual(await oefenUitleg(set, { vraagId: 'x', vraag: 'a' }, { chat }), { fout: 'onbekende_vraag' });
});
