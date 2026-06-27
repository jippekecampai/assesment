// test/assessment-scoring.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectQuestionsForRole, scoreAssessment } from '../lib/assessment.mjs';

test('alles goed → 100 per domein en rol-fit Sterke fit', () => {
  const qs = selectQuestionsForRole('cloud');
  const answers = qs.map((q) => ({ questionId: q.id, choice: q.answer }));
  const res = scoreAssessment(answers, qs, 'cloud');
  for (const d of Object.keys(res.domeinScores)) assert.equal(res.domeinScores[d], 100);
  assert.equal(res.totaalScore, 100);
  assert.equal(res.roleFit.state, 'Sterke fit');
});

test('alles fout → 0 en Niet geschikt', () => {
  const qs = selectQuestionsForRole('cloud');
  const answers = qs.map((q) => ({ questionId: q.id, choice: (q.answer + 1) % 4 }));
  const res = scoreAssessment(answers, qs, 'cloud');
  assert.equal(res.totaalScore, 0);
  assert.equal(res.roleFit.state, 'Niet geschikt');
});

test('onbeantwoorde vraag telt als fout', () => {
  const qs = selectQuestionsForRole('servicedesk');
  const res = scoreAssessment([], qs, 'servicedesk'); // niets beantwoord
  assert.equal(res.totaalScore, 0);
});
