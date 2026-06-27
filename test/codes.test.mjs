import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateCode, isValidCodeFormat, CODE_ALPHABET } from '../lib/codes.mjs';

test('generateCode levert 6 niet-ambigue tekens', () => {
  for (let i = 0; i < 200; i += 1) {
    const c = generateCode();
    assert.equal(c.length, 6);
    for (const ch of c) assert.ok(CODE_ALPHABET.includes(ch), `ambigu teken ${ch}`);
  }
});

test('alfabet bevat geen I, O, 0 of 1', () => {
  for (const ch of 'IO01') assert.ok(!CODE_ALPHABET.includes(ch));
});

test('isValidCodeFormat accepteert geldige en weigert ongeldige', () => {
  assert.ok(isValidCodeFormat(generateCode()));
  assert.ok(!isValidCodeFormat('abc'));      // te kort / kleine letters
  assert.ok(!isValidCodeFormat('ABC1O0'));   // ambigu
  assert.ok(!isValidCodeFormat(''));
});
