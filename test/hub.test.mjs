import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHubClient, HubError } from '../lib/hub.mjs';

test('createHubClient gooit zonder HUB_BASE_URL', () => {
  assert.throws(() => createHubClient({ baseUrl: '', appToken: 'x' }), /HUB_BASE_URL/);
});

test('createHubClient gooit zonder HUB_APP_TOKEN', () => {
  assert.throws(() => createHubClient({ baseUrl: 'http://h/api', appToken: '' }), /HUB_APP_TOKEN/);
});

test('hub.tickets.list roept /hub/v1/tickets met companyId en app-token aan', async () => {
  const calls = [];
  const fakeFetch = async (url, opts) => {
    calls.push({ url, opts });
    return { ok: true, status: 200, json: async () => [{ id: 't1' }] };
  };
  const hub = createHubClient({ baseUrl: 'http://h/api', appToken: 'tok', fetchImpl: fakeFetch });
  const rows = await hub.tickets.list({ companyId: 'c1' });
  assert.deepEqual(rows, [{ id: 't1' }]);
  assert.equal(calls[0].url, 'http://h/api/hub/v1/tickets?companyId=c1');
  assert.equal(calls[0].opts.headers['x-hub-app-token'], 'tok');
});

test('hub gooit HubError bij non-2xx', async () => {
  const fakeFetch = async () => ({ ok: false, status: 403, text: async () => 'nope' });
  const hub = createHubClient({ baseUrl: 'http://h/api', appToken: 'tok', fetchImpl: fakeFetch });
  await assert.rejects(() => hub.companies.list(), (e) => e instanceof HubError && e.status === 403);
});
