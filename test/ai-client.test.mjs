// test/ai-client.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateQuestions, parseQuestions, AiError } from '../lib/ai-client.mjs';

test('parseQuestions haalt geldige vragen uit modeltekst en dropt ongeldige', () => {
  const raw = 'Hier:\n[{"domain":"Azure","type":"Scenario","prompt":"Een lange genoeg prompt over azure governance?","options":["a","b","c","d"],"answer":2},{"domain":"Onzin","prompt":"x","options":["a"],"answer":9}]';
  const qs = parseQuestions(raw);
  assert.equal(qs.length, 1);
  assert.equal(qs[0].domain, 'Azure');
  assert.equal(qs[0].source, 'AI');
});

test('generateQuestions gebruikt de fake fetch en levert concepten', async () => {
  const fake = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: '[{"domain":"Azure","type":"Scenario","prompt":"Een voldoende lange scenariovraag over Azure?","options":["a","b","c","d"],"answer":1}]' } }] }) });
  // forceer config via env in de test
  process.env.AI_ENDPOINT = 'http://x'; process.env.AI_API_KEY = 'k'; process.env.AI_MODEL = 'm';
  const qs = await generateQuestions({ domain: 'Azure', count: 1 }, { fetchImpl: fake });
  assert.equal(qs.length, 1);
  assert.equal(qs[0].domain, 'Azure');
});

test('generateQuestions zonder config gooit not_configured', async () => {
  delete process.env.AI_ENDPOINT; delete process.env.AI_API_KEY; delete process.env.AI_MODEL;
  await assert.rejects(() => generateQuestions({ domain: 'Azure' }), (e) => e instanceof AiError && e.code === 'not_configured');
});
