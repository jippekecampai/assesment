// test/voice.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { basisKaarten, bouwInstructie, geldigeKaart, createVoiceStore, importeer, besluit, oefenKaarten, terugblikVraag, maakTerugblik, voiceLiveUrl, voiceTokenUrl } from '../lib/voice.mjs';

function fresh() {
  const dir = mkdtempSync(join(tmpdir(), 'camai-voice-'));
  return { store: createVoiceStore({ filePath: join(dir, 'v.json') }), dir };
}

test('basiskaarten zijn geldig en de instructie bevat persona, situatie en verloop', async () => {
  const basis = await basisKaarten();
  assert.ok(basis.length >= 1);
  for (const k of basis) assert.ok(geldigeKaart(k), k.id);
  const inst = bouwInstructie(basis[0], 'lastig');
  assert.ok(inst.includes(basis[0].beller.naam));
  assert.ok(inst.includes(basis[0].situatie));
  assert.ok(inst.includes('LASTIG'));
});

test('geïmporteerde kaarten worden pas aangeboden na goedkeuring', async () => {
  const { store, dir } = fresh();
  try {
    const [voorbeeld] = await basisKaarten();
    const kaart = { ...voorbeeld, id: 'echt-01', titel: 'Uit echt gesprek', instructie: 'oude tekst die de server negeert' };
    assert.deepEqual(await importeer(store, [kaart, { titel: 'kapot' }], 'j@campai.nl'), { toegevoegd: 1, overgeslagen: 1 });
    const aantalBasis = (await basisKaarten()).length;
    assert.equal((await oefenKaarten(store)).length, aantalBasis);
    await besluit(store, 'echt-01', 'goedgekeurd', 'j@campai.nl');
    const kaarten = await oefenKaarten(store);
    assert.equal(kaarten.length, aantalBasis + 1);
    const echt = kaarten.find((k) => k.id === 'echt-01');
    assert.ok(echt.instructies.soepel && !('instructie' in echt));
    await besluit(store, 'echt-01', 'afgekeurd', 'j@campai.nl');
    assert.equal((await oefenKaarten(store)).length, aantalBasis);
    await assert.rejects(() => besluit(store, 'echt-01', 'concept', 'x'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('terugblikVraag begrenst het transcript en noemt de medewerker zo', () => {
  const t = terugblikVraag({ titel: 'VPN', verloop: 'onzin', afvinkpunten: ['a'], transcript: [{ wie: 'jij', tekst: 'Goedemorgen, Campai' }, { wie: 'beller', tekst: 'x'.repeat(5000) }] });
  assert.ok(t.includes('verloop: ?'));
  assert.ok(t.includes('Medewerker: Goedemorgen, Campai'));
  assert.ok(t.length < 2000);
});

test('maakTerugblik stuurt naar de EU-deployment met de sleutel als header', async () => {
  let seen;
  const fetchImpl = async (u, o) => { seen = { u, o }; return { ok: true, json: async () => ({ choices: [{ message: { content: '{"kern":"k","goed":[],"aandacht":[],"afvinkpunten":[],"voorbeeldzin":"z"}' } }] }) }; };
  const out = await maakTerugblik({ titel: 'x', transcript: [] }, { fetchImpl, env: { FOUNDRY_ENDPOINT: 'https://f.example/', FOUNDRY_KEY: 'geheim' } });
  assert.equal(out.kern, 'k');
  assert.ok(seen.u.startsWith('https://f.example/openai/deployments/gpt-5.5-eu/'));
  assert.equal(seen.o.headers['api-key'], 'geheim');
  assert.ok(!seen.u.includes('geheim'));
});

test('voiceTokenUrl: zonder managed identity null, met identiteit een URL met Bearer-token', async () => {
  assert.equal(await voiceTokenUrl({ env: { VOICE_LIVE_HOST: 'x' } }), null);
  let gevraagd;
  const fetchImpl = async (u, o) => { gevraagd = { u, o }; return { ok: true, json: async () => ({ access_token: 'tok', expires_on: '123' }) }; };
  const r = await voiceTokenUrl({ fetchImpl, env: { IDENTITY_ENDPOINT: 'http://mi', IDENTITY_HEADER: 'h', VOICE_LIVE_HOST: 'x.cognitiveservices.azure.com', VOICE_LIVE_KEY: 'geheim' } });
  assert.ok(gevraagd.u.includes('resource=https%3A%2F%2Fcognitiveservices.azure.com'));
  assert.equal(gevraagd.o.headers['X-IDENTITY-HEADER'], 'h');
  assert.ok(r.url.includes('Authorization=Bearer%20tok'));
  assert.ok(!r.url.includes('geheim'));
});

test('voiceLiveUrl gebruikt alleen het datazone-model en bevat geen sleutel', () => {
  const u = voiceLiveUrl({ VOICE_LIVE_HOST: 'x.cognitiveservices.azure.com', VOICE_LIVE_KEY: 'geheim' });
  assert.ok(u.startsWith('wss://x.cognitiveservices.azure.com/voice-live/realtime?'));
  assert.ok(u.includes('datazone'));
  assert.ok(!u.includes('geheim'));
});
