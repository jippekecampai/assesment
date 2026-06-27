import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PromptSanitizer } from '../lib/ai-guard.mjs';

test('sanitize tokeniseert e-mail/IP en rehydrate is een round-trip', () => {
  const s = new PromptSanitizer();
  const original = 'Mail jan@acme.nl vanaf 10.0.0.5';
  const { text, map } = s.sanitize(original, [{ value: 'Acme', category: 'BEDRIJF' }]);
  assert.ok(!text.includes('jan@acme.nl') && !text.includes('10.0.0.5'));
  assert.equal(s.rehydrate(text, map), original);
});

test('sanitize zonder entiteiten en zonder PII laat tekst ongemoeid', () => {
  const s = new PromptSanitizer();
  const { text } = s.sanitize('Genereer 5 vragen voor het domein Azure');
  assert.equal(text, 'Genereer 5 vragen voor het domein Azure');
});
