// test/candidate-store-chunk.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packData, unpackData, DATA_CHUNK } from '../lib/candidate-store.mjs';

test('packData/unpackData round-trip voor klein object', () => {
  const obj = { id: 'x', naam: 'Test', serverQuestions: [{ prompt: 'p', options: ['a', 'b', 'c', 'd'], answer: 1 }] };
  const packed = packData(obj);
  assert.equal(packed.dataChunks, 1);
  assert.deepEqual(JSON.parse(unpackData(packed)), obj);
});

test('packData splitst groot object over meerdere chunks (Azure 64KB-limiet)', () => {
  // ~55 vragen met lange opties → groter dan één Table-property toelaat.
  const serverQuestions = Array.from({ length: 55 }, (_, i) => ({
    id: `q-${i}`, domain: 'Azure', type: 'Scenario',
    prompt: `Vraag ${i} `.padEnd(220, 'x'),
    options: Array.from({ length: 4 }, (_, j) => `Optie ${j} `.padEnd(140, 'y')),
    answer: i % 4,
  }));
  const obj = { id: 'big', naam: 'Groot', serverQuestions };
  const packed = packData(obj);
  assert.ok(packed.dataChunks > 1, `verwacht meerdere chunks, kreeg ${packed.dataChunks}`);
  for (let i = 0; i < packed.dataChunks; i += 1) {
    assert.ok(packed[`data${i}`].length <= DATA_CHUNK, `chunk ${i} te groot`);
  }
  assert.deepEqual(JSON.parse(unpackData(packed)), obj);
});

test('unpackData leest oud formaat (één data-veld)', () => {
  const obj = { id: 'oud', naam: 'Legacy' };
  assert.deepEqual(JSON.parse(unpackData({ data: JSON.stringify(obj) })), obj);
});
