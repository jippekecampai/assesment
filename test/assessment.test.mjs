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

test('selectQuestionsForRole kiest relevante domeinen en haalt het minimum', () => {
  const cloud = roles.find((r) => r.id === 'cloud');
  const qs = selectQuestionsForRole('cloud', { minQuestions: 10, weightThreshold: 0.1 });
  assert.ok(qs.length >= 10, `verwacht >= 10, kreeg ${qs.length}`);
  // alle gekozen vragen zitten in domeinen die voor cloud meewegen
  for (const q of qs) assert.ok(q.domain in cloud.weights);
  // elke vraag heeft een server-side answer
  for (const q of qs) assert.ok(Number.isInteger(q.answer));
});

test('toClientQuestion verwijdert de antwoordsleutel', () => {
  const qs = selectQuestionsForRole('servicedesk');
  const c = toClientQuestion(qs[0]);
  assert.ok(!('answer' in c));
  assert.deepEqual(Object.keys(c).sort(), ['domain','id','options','prompt','type']);
});

test('onbekende rol gooit', () => {
  assert.throws(() => selectQuestionsForRole('bestaat-niet'));
});
