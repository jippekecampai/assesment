import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMe } from '../lib/hub-me.mjs';

test('getMe zonder token geeft null', async () => {
  assert.equal(await getMe(undefined, { fetchImpl: () => { throw new Error('niet aanroepen'); } }), null);
});
test('getMe normaliseert profiel', async () => {
  process.env.HUB_BASE_URL = 'http://hub.local/api';
  const fake = async () => ({ ok: true, json: async () => ({ name: 'Jip', email: 'jip@campai.nl', jobTitle: 'Cloud Engineer', entraOid: 'oid-1', departments: [{ key: 'cloud', name: 'Cloud' }] }) });
  const me = await getMe('tok', { fetchImpl: fake });
  assert.equal(me.entraOid, 'oid-1'); assert.equal(me.department, 'Cloud'); assert.equal(me.jobTitle, 'Cloud Engineer');
});
test('getMe bij non-2xx geeft null', async () => {
  process.env.HUB_BASE_URL = 'http://hub.local/api';
  const me = await getMe('tok', { fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({}) }) });
  assert.equal(me, null);
});
