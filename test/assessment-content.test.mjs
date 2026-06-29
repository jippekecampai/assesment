// test/assessment-content.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roles, domains, testQuestions, fallbackQuestions, knownSystemOptions } from '../lib/assessment-content.mjs';

test('roles, domains en vragenbank hebben de verwachte vorm', () => {
  assert.equal(roles.length, 5);
  assert.equal(domains.length, 13);
  assert.ok(testQuestions.length >= 65);
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

test('elke domein heeft minstens 5 seed-vragen', () => {
  for (const d of domains) {
    const n = testQuestions.filter((q) => q.domain === d).length;
    assert.ok(n >= 5, `domein "${d}" heeft maar ${n} vragen (>=5 vereist)`);
  }
});

test('elke vraag is goed gevormd', () => {
  for (const q of testQuestions) {
    assert.ok(domains.includes(q.domain));
    assert.equal(q.options.length, 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    // diepgang-heuristiek: prompt is een echte casus, niet één korte definitie-zin
    assert.ok(q.prompt.length >= 40, `te korte/oppervlakkige prompt: ${q.prompt}`);
  }
});

// Antwoorden mogen niet verraden welke de juiste is door lengte: kandidaten
// mogen niet kunnen gokken op "het langste antwoord is juist". Daarom moeten de
// vier opties per vraag qua lengte vergelijkbaar zijn én mag het juiste antwoord
// over de hele bank niet stelselmatig het langste zijn (zie Vragenfabriek-feature).
test('opties zijn lengte-gebalanceerd (geen "langste = juiste"-verraad)', () => {
  const lens = (q) => q.options.map((o) => o.length);
  let correctLongest = 0;
  let correctShortest = 0;
  for (const q of testQuestions) {
    const l = lens(q);
    const max = Math.max(...l);
    const min = Math.min(...l);
    // 1) per vraag: opties binnen een strakke lengte-band
    assert.ok(
      max / min <= 1.6,
      `vraag heeft te grote lengte-spreiding (max/min=${(max / min).toFixed(2)} > 1.6): "${q.prompt.slice(0, 60)}..."`,
    );
    const correctLen = l[q.answer];
    if (correctLen === max && l.filter((x) => x === max).length === 1) correctLongest += 1;
    if (correctLen === min && l.filter((x) => x === min).length === 1) correctShortest += 1;
  }
  // 2) over de bank: het juiste antwoord is hooguit in 30% van de vragen het langste
  const longestRatio = correctLongest / testQuestions.length;
  assert.ok(
    longestRatio <= 0.3,
    `juiste antwoord is te vaak het langste (${correctLongest}/${testQuestions.length} = ${Math.round(longestRatio * 100)}%, max 30%)`,
  );
  // 3) en in minstens 12% van de vragen is het juiste antwoord juist het kortste
  const shortestRatio = correctShortest / testQuestions.length;
  assert.ok(
    shortestRatio >= 0.12,
    `juiste antwoord is te zelden het kortste (${correctShortest}/${testQuestions.length} = ${Math.round(shortestRatio * 100)}%, min 12%)`,
  );
});
