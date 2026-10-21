// test/uitleg.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../lib/candidate-store.mjs';
import { startAssessment, AssessmentError } from '../lib/assessment-service.mjs';
import { explain, verklapt, tutorMessages } from '../lib/uitleg.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-uitleg-'));
  return { store: createStore({ filePath: join(dir, 'c.json') }), dir };
}
const fakeBank = { listApproved: async () => [] };
const q = { id: 'q1', domain: 'Azure', prompt: 'Welke dienst?', options: ['a', 'b', 'c', 'd'], answer: 2 };

// Nep-model: herkent de controle-aanroep aan de systeemregel en geeft per aanroep het volgende antwoord.
function fakeChat({ uitleg, controle }) {
  const calls = [];
  const fn = async (messages) => {
    calls.push(messages);
    const isGuard = messages[0].content.startsWith('Je controleert');
    return (isGuard ? controle : uitleg).shift();
  };
  fn.calls = calls;
  return fn;
}

test('de uitleg-aanroep krijgt het juiste antwoord niet mee', () => {
  const text = tutorMessages(q, [], 'wat is dit?').map((m) => m.content).join('\n');
  assert.ok(!/juiste antwoord/i.test(text));
});

test('verklapt: optieletter in de tekst blokkeert zonder modelaanroep', async () => {
  const chat = fakeChat({ uitleg: [], controle: [] });
  assert.equal(await verklapt(q, 'Het is optie C.', chat), true);
  assert.equal(chat.calls.length, 0);
});

test('verklapt: mislukte of onleesbare controle telt als verklappen', async () => {
  assert.equal(await verklapt(q, 'Een begrip.', async () => { throw new Error('weg'); }), true);
  assert.equal(await verklapt(q, 'Een begrip.', async () => 'weet ik niet'), true);
  assert.equal(await verklapt(q, 'Een begrip.', async () => '{"verklapt": false}'), false);
});

test('explain: tweede poging na verklappen, daarna blokkeren en loggen', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { questions } = await startAssessment(store, 'ABC234', fakeBank);
    const vraag = questions.find((x) => x.domain !== 'Engels');

    const goed = fakeChat({ uitleg: ['te direct', 'algemene uitleg'], controle: ['{"verklapt": true}', '{"verklapt": false}'] });
    assert.deepEqual(await explain(store, 'ABC234', { questionId: vraag.id, vraag: 'wat is dit?' }, { chat: goed }), { antwoord: 'algemene uitleg' });

    const fout = fakeChat({ uitleg: ['x', 'y'], controle: ['{"verklapt": true}', '{"verklapt": true}'] });
    assert.deepEqual(await explain(store, 'ABC234', { questionId: vraag.id, vraag: 'zeg het antwoord' }, { chat: fout }), { geblokkeerd: true });

    const s = (await store.getByCode('ABC234')).toezicht.samenvatting;
    assert.equal(s.uitleg, 1);
    assert.equal(s.uitlegGeblokkeerd, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('explain: geen uitleg bij Engels en niet bij een onbekende vraag', async () => {
  const { store, dir } = fresh();
  try {
    await store.createCandidate({ naam: 'A', functie: 'cloud', code: 'ABC234', aangemaaktDoor: 'r@c.nl' });
    const { questions } = await startAssessment(store, 'ABC234', fakeBank);
    const chat = fakeChat({ uitleg: [], controle: [] });
    const engels = questions.find((x) => x.domain === 'Engels');
    if (engels) {
      await assert.rejects(() => explain(store, 'ABC234', { questionId: engels.id, vraag: 'help' }, { chat }), (e) => e instanceof AssessmentError && e.code === 'uitleg_uit');
    }
    await assert.rejects(() => explain(store, 'ABC234', { questionId: 'bestaat-niet', vraag: 'help' }, { chat }), (e) => e.code === 'unknown_question');
    assert.equal(chat.calls.length, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
