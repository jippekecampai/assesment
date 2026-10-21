// test/artifacts.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARTIFACTS, injectRuntime, loadArtifactPage, createRateLimiter, toMessages } from '../lib/artifacts.mjs';

const art = { slug: 'x', capabilities: ['sample'] };

test('injectRuntime zet de runtime direct na <body>, vóór de scripts van het artifact', () => {
  const out = injectRuntime('<html><head></head><body class="a"><script>claude.use("sample")</script></body></html>', art);
  assert.ok(out.indexOf('/apps/runtime.js') < out.indexOf('claude.use'));
  assert.ok(out.includes('"capabilities":["sample"]'));
});

test('injectRuntime geeft een fragment zonder skelet een eigen skelet', () => {
  const out = injectRuntime('<title>T</title><script>1</script>', art);
  assert.ok(out.startsWith('<!doctype html>'));
  assert.ok(out.indexOf('/apps/runtime.js') < out.indexOf('<title>'));
});

test('elk geregistreerd artifact bestaat en laadt met runtime', async () => {
  for (const a of ARTIFACTS) {
    const page = await loadArtifactPage(process.cwd(), a.slug);
    assert.ok(page && page.includes('/apps/runtime.js'), a.slug);
  }
  assert.equal(await loadArtifactPage(process.cwd(), '../server.mjs'), null);
});

test('createRateLimiter begrenst per sleutel binnen het venster', () => {
  let t = 0;
  const ok = createRateLimiter({ max: 2, windowMs: 1000, now: () => t });
  assert.deepEqual([ok('a'), ok('a'), ok('a'), ok('b')], [true, true, false, true]);
  t = 1500;
  assert.equal(ok('a'), true);
});

test('toMessages volgt het sample-contract (eindigt op een user-beurt, begrensd)', () => {
  assert.deepEqual(toMessages('hoi'), [{ role: 'user', content: 'hoi' }]);
  assert.equal(toMessages(''), null);
  assert.equal(toMessages([{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }]), null);
  assert.equal(toMessages('x'.repeat(40001)), null);
  assert.equal(toMessages([{ role: 'system', content: 'a' }])[0].role, 'user');
});
