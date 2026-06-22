import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSourceMaterial } from '../lib/source-material.mjs';

function fakeHub() {
  return {
    tickets: { list: async () => [{ id: 't1', companyId: 'c1', title: 'Backup faalt op DC bij klantbv.nl', status: 'Open', priority: 'High', category: 'Servers' }] },
    devices: { list: async () => [{ id: 'd1', hostname: 'KLANT-DC01', os: 'Windows Server 2022', type: 'Server', category: 'Server', eolStatus: 'OK' }] },
    live: {
      rmmAlerts: async () => ({ configured: true, alerts: [{ message: 'CPU 99% op host 10.0.0.5' }] }),
      autotask: async () => ({ configured: false }),
    },
  };
}

test('buildSourceMaterial levert geanonimiseerde conceptvragen', async () => {
  const out = await buildSourceMaterial(fakeHub(), 'c1');
  assert.ok(Array.isArray(out) && out.length >= 1);
  for (const item of out) {
    assert.ok(item.domain && item.role && item.source && item.prompt);
  }
  const blob = JSON.stringify(out);
  assert.ok(!blob.includes('klantbv.nl') && !blob.includes('KLANT-DC01') && !blob.includes('10.0.0.5'));
});

test('buildSourceMaterial vereist companyId', async () => {
  await assert.rejects(() => buildSourceMaterial(fakeHub(), ''), /companyId/);
});

test('buildSourceMaterial overleeft een falende bron', async () => {
  const hub = fakeHub();
  hub.devices.list = async () => { throw new Error('scope mist'); };
  const out = await buildSourceMaterial(hub, 'c1');
  assert.ok(out.length >= 1); // tickets + live blijven werken
});
