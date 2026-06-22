import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrubText, anonymizeTicket, anonymizeDevice, anonymizeLive } from '../lib/anonymize.mjs';

test('scrubText verwijdert e-mail, IP, domein en bedrag', () => {
  const out = scrubText('Mail jan@klantbv.nl vanaf 10.0.12.34 op klantbv.sharepoint.com, factuur EUR 1.250,00');
  assert.ok(!out.includes('jan@klantbv.nl'));
  assert.ok(!out.includes('10.0.12.34'));
  assert.ok(!out.includes('klantbv.sharepoint.com'));
  assert.ok(!/1\.250,00/.test(out));
  assert.ok(out.includes('[gebruiker]') && out.includes('[ip]') && out.includes('[host]') && out.includes('[bedrag]'));
});

test('scrubText laat onschuldige tekst staan', () => {
  assert.equal(scrubText('Backup faalt drie nachten op de fileserver'), 'Backup faalt drie nachten op de fileserver');
});

test('anonymizeTicket houdt alleen veilige, geschoonde velden', () => {
  const t = anonymizeTicket({ id: 't1', companyId: 'c1', psaNumber: 'T20240001', title: 'VPN down bij klantbv.nl', status: 'Open', priority: 'High', queue: 'Tier2', category: 'Network' });
  assert.deepEqual(Object.keys(t).sort(), ['category', 'priority', 'status', 'title']);
  assert.ok(!t.title.includes('klantbv.nl'));
});

test('anonymizeDevice dropt hostname en companyId', () => {
  const d = anonymizeDevice({ id: 'd1', companyId: 'c1', hostname: 'KLANT-DC01', os: 'Windows Server 2022', type: 'Server', category: 'Server', eolStatus: 'OK', warrantyDate: '2027-01-01' });
  assert.ok(!('hostname' in d) && !('companyId' in d));
  assert.equal(d.os, 'Windows Server 2022');
});

test('scrubText vangt hostname, IPv6, telefoon en MAC', () => {
  assert.ok(!scrubText('server KLANT-DC01 herstart').includes('KLANT-DC01'));
  assert.ok(!scrubText('alert van srv-db01').includes('srv-db01'));
  assert.ok(!scrubText('adres 2001:db8::ff00:42:8329 onbereikbaar').includes('2001:db8'));
  assert.ok(!scrubText('bel 06-12345678 voor terugkoppeling').includes('06-12345678'));
  assert.ok(!scrubText('mac 00:1A:2B:3C:4D:5E geblokkeerd').includes('00:1A:2B:3C:4D:5E'));
});

test('scrubText laat generieke technische termen en tijden staan', () => {
  assert.equal(scrubText('M365-security baseline'), 'M365-security baseline');
  assert.equal(scrubText('incident om 14:30:05 gemeld'), 'incident om 14:30:05 gemeld');
  assert.equal(scrubText('Windows Server 2022 patchen'), 'Windows Server 2022 patchen');
});

test('anonymizeDevice scrubt PII in os/type/category', () => {
  const d = anonymizeDevice({ os: 'Windows 11 op KLANT-LT07', type: 'Laptop van jan@klantbv.nl', category: 'Endpoint' });
  assert.ok(!d.os.includes('KLANT-LT07'));
  assert.ok(!d.type.includes('jan@klantbv.nl'));
  assert.equal(d.category, 'Endpoint');
});

test('anonymizeLive scrubt strings diep en behoudt structuur', () => {
  const out = anonymizeLive({ configured: true, items: [{ note: 'reset wachtwoord voor piet@klantbv.nl' }] });
  assert.equal(out.configured, true);
  assert.ok(!JSON.stringify(out).includes('piet@klantbv.nl'));
});
