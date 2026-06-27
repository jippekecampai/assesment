// test/assessment-content.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roles, domains, testQuestions, fallbackQuestions, knownSystemOptions } from '../lib/assessment-content.mjs';

test('roles, domains en vragenbank hebben de verwachte vorm', () => {
  assert.equal(roles.length, 5);
  assert.equal(domains.length, 13);
  assert.equal(testQuestions.length, 18);
  for (const r of roles) {
    assert.ok(typeof r.id === 'string' && typeof r.threshold === 'number');
    // elk rolgewicht hoort bij een bekend domein
    for (const d of Object.keys(r.weights)) assert.ok(domains.includes(d), `onbekend domein ${d}`);
  }
  for (const q of testQuestions) {
    assert.ok(domains.includes(q.domain), `vraag in onbekend domein ${q.domain}`);
    assert.ok(Array.isArray(q.options) && q.options.length === 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
  }
  assert.ok(fallbackQuestions.default && knownSystemOptions['Kaseya Stack']);
});
