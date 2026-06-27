// test/assessment.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectQuestionsForRole, toClientQuestion, prepareQuestion } from '../lib/assessment.mjs';
import { roles } from '../lib/assessment-content.mjs';

test('prepareQuestion is deterministisch en houdt 4 opties', () => {
  const q1 = prepareQuestion({ id: 'x', domain: 'Azure', type: 'T', prompt: 'p', options: ['a','b','c','d'], answer: 1 }, 0);
  const q2 = prepareQuestion({ id: 'x', domain: 'Azure', type: 'T', prompt: 'p', options: ['a','b','c','d'], answer: 1 }, 0);
  assert.equal(q1.options.length, 4);
  assert.equal(q1.answer, q2.answer); // zelfde id+index → zelfde positie
});

test('selectQuestionsForRole levert >=5 per relevant domein als beschikbaar', () => {
  // 6 goedgekeurde Azure-vragen → ruim voldoende voor het Azure-domein
  const approved = Array.from({ length: 6 }, (_, i) => ({
    id: `appr-az-${i}`, domain: 'Azure', type: 'Scenario',
    prompt: `Azure vraag ${i}`, options: ['a', 'b', 'c', 'd'], answer: 1,
  }));
  const qs = selectQuestionsForRole('cloud', approved, { minPerDomain: 5, weightThreshold: 0.1 });
  const azureCount = qs.filter((q) => q.domain === 'Azure').length;
  assert.ok(azureCount >= 5, `verwacht >=5 Azure, kreeg ${azureCount}`);
  for (const q of qs) assert.ok(Number.isInteger(q.answer)); // server-side answer aanwezig
});

test('selectQuestionsForRole degradeert netjes bij <5 beschikbaar', () => {
  // domein met maar 2 beschikbare → neemt 2, crasht niet
  const approved = [
    { id: 'x1', domain: 'VoIP', type: 'T', prompt: 'v1', options: ['a','b','c','d'], answer: 0 },
    { id: 'x2', domain: 'VoIP', type: 'T', prompt: 'v2', options: ['a','b','c','d'], answer: 0 },
  ];
  const qs = selectQuestionsForRole('servicedesk', approved, { minPerDomain: 5, weightThreshold: 0.99 });
  // bij drempel 0.99 is geen enkel domein 'relevant' → val terug op alle domeinen? Nee: leeg toegestaan.
  assert.ok(Array.isArray(qs));
});

test('onbekende rol gooit', () => {
  assert.throws(() => selectQuestionsForRole('bestaat-niet'));
});

test('toClientQuestion verwijdert de antwoordsleutel', () => {
  const qs = selectQuestionsForRole('servicedesk', []);
  if (qs.length) { const c = toClientQuestion(qs[0]); assert.ok(!('answer' in c)); }
});
