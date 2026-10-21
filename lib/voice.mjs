// lib/voice.mjs
// Voice training (Oefenlijn, overgenomen uit VoiceAI/pipeline): een medewerker oefent een telefoongesprek met een
// AI-beller in Azure Voice Live (EU Data Zone) en krijgt daarna een korte terugblik (gpt-5.5-eu, EU Data Zone).
// Privacy (VoiceAI/docs/klantversie-eisen.md §5): de terugblik is een observatie voor de medewerker zelf, zonder
// cijfers of vergelijking; audio dient alleen het gesprek en de transcriptie; de server bewaart geen audio,
// transcript of terugblik (die staan alleen in de browser van de medewerker, 30 dagen).
// Scenario's: de handgeschreven fictieve kaarten (voice-basis.json) plus kaarten die een mens heeft goedgekeurd.
// Kaarten uit echte gesprekken staan nooit in deze (openbare) repo, alleen in de opslag van de site.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));

// Hoe een gesprek loopt, per gesprek willekeurig gekozen (gewicht = kans). Gelijk aan VERLOPEN in scenario_maak.py.
export const VERLOPEN = {
  soepel: [0.5, `Dit gesprek loopt SOEPEL. Je bent vriendelijk en werkt mee (hooguit een beetje gehaast, ook als je persona
hierboven anders is). Het probleem is op te lossen: stelt de medewerker een logische stap voor (bijvoorbeeld de spammap
bekijken, opnieuw versturen, opnieuw opstarten, een instelling aanpassen), dan doe je die en dan WERKT het ook. Geef de
verborgen informatie al bij de eerste redelijke vraag. Bedank aan het eind en hang op. Richttijd: 1 tot 3 minuten.`],
  gewoon: [0.35, `Dit gesprek loopt GEWOON. Speel je persona zoals beschreven, maar blijf redelijk. Een deel lukt meteen;
voor de rest is een ticket of een terugbelafspraak prima. Accepteer een duidelijke vervolgstap. Richttijd: 2 tot 4 minuten.`],
  lastig: [0.15, `Dit is een LASTIG gesprek. Speel je persona volledig uit en volg de stemmingsregels. Maar als de
medewerker rustig blijft, uitlegt wat er gebeurt en een concrete vervolgstap met een tijdstip biedt, word je rustiger
en rond je het gesprek af. Richttijd: hooguit 5 minuten.`],
};

const lijst = (xs) => (xs || []).map((x) => `- ${x}`).join('\n') || '- (geen)';

// System prompt voor de AI-beller, opgebouwd uit de kaart (vast sjabloon; gelijk aan bouw_instructie in scenario_maak.py).
export function bouwInstructie(k, verloop) {
  const p = k.persona, b = k.beller;
  return `Je bent een AI-oefenbeller voor de servicedesk van Campai. Een medewerker oefent een telefoongesprek met jou.
Je speelt een klant die belt. Blijf het hele gesprek in je rol; zeg nooit dat je een AI bent, tenzij de medewerker
expliciet vraagt om te stoppen met het rollenspel.

Wie je bent: ${b.naam}, ${b.functie} bij ${b.bedrijf} (een fictief bedrijf).
Hoe je praat: ${p.beschrijving} Persona: ${p.type}. Je spreekt de medewerker aan met '${p.aanspreekvorm}'.

Situatie: ${k.situatie}

Dit is een INKOMEND gesprek: jij belt de servicedesk van Campai. De medewerker neemt op en meldt zich eerst
(bijvoorbeeld "Goedemorgen, Campai, met ..."). Reageer daarop met ongeveer: "${k.openingszin}"
Noem jezelf daarbij zoals een beller dat doet (voornaam en bedrijf), tenzij de medewerker je al iets vroeg.

Dit vertel je uit jezelf (verspreid over het gesprek, niet alles tegelijk):
${lijst(k.watBellerWeet)}

Dit vertel je ALLEEN als de medewerker er gericht naar vraagt:
${lijst(k.verborgenInfo)}

Zo verandert je stemming:
${lijst(k.escalatieRegels)}

Gespreksregels (belangrijk): dit is een telefoongesprek. Praat in korte beurten van één of twee zinnen en wacht dan
tot de medewerker reageert. Na je openingszin stop je en wacht je. Begin nooit zelf te praten voordat de medewerker
iets gezegd heeft, behalve als je expliciet de opdracht krijgt om 'hallo?' te zeggen. Vertel nooit alles in één keer en herhaal jezelf
niet; word je onderbroken, ga dan in op wat de medewerker zei in plaats van je verhaal opnieuw te beginnen.
Spreekstijl: gewoon, gesproken Nederlands, korte zinnen, af en toe 'eh' of een korte stilte. Geef geen oplossingen
die de medewerker hoort te bedenken. Verzin geen wachtwoorden of echte persoonsgegevens; als je iets moet noemen
(klantnummer, telefoonnummer), verzin dan duidelijk fictieve gegevens. Blijf beleefd binnen je persona: geen
schelden, geen discriminatie.
Houd het kort, zoals echte telefoongesprekken: biedt de medewerker een redelijke oplossing of een duidelijke
vervolgafspraak, accepteer die dan, bevestig kort ("Prima, dank je, dan hoor ik het van jullie.") en rond af. Blijf niet
herhalen dat het niet werkt als er al een vervolgstap is afgesproken. Als de medewerker het gesprek afrondt, bedank en
neem afscheid.` + (verloop && VERLOPEN[verloop] ? `\n\nVERLOOP VAN DIT GESPREK (gaat vóór de stemmingsregels hierboven):\n${VERLOPEN[verloop][1]}` : '');
}

const VERPLICHT = ['titel', 'onderwerp', 'persona', 'beller', 'situatie', 'openingszin', 'watBellerWeet', 'verborgenInfo', 'escalatieRegels', 'afvinkpunten'];
export function geldigeKaart(k) {
  return Boolean(k && typeof k === 'object' && VERPLICHT.every((v) => k[v] != null)
    && k.persona.type && k.persona.beschrijving && k.persona.aanspreekvorm
    && k.beller.naam && k.beller.bedrijf && k.beller.functie
    && ['watBellerWeet', 'verborgenInfo', 'escalatieRegels', 'afvinkpunten'].every((v) => Array.isArray(k[v])));
}

// Wat de browser van een kaart krijgt: de instructie per verloop wordt hier gebouwd, niet in de browser.
export function voorBrowser(k) {
  return {
    id: k.id, titel: k.titel, onderwerp: k.onderwerp, persona: k.persona, moeilijkheid: k.moeilijkheid,
    beller: k.beller, situatie: k.situatie, afvinkpunten: k.afvinkpunten,
    instructies: Object.fromEntries(Object.keys(VERLOPEN).map((v) => [v, bouwInstructie(k, v)])),
  };
}

export async function basisKaarten() {
  return JSON.parse(await readFile(join(HIER, 'voice-basis.json'), 'utf8'));
}

// Opslag van geïmporteerde kaarten (uit VoiceAI/pipeline/out/scenarios) met hun beoordeling.
export const STATUS = ['concept', 'goedgekeurd', 'afgekeurd'];
function fileKaarten(filePath) {
  async function load() { try { return JSON.parse(await readFile(filePath, 'utf8')); } catch { return { kaarten: [] }; } }
  async function persist(d) { await mkdir(dirname(filePath), { recursive: true }); await writeFile(filePath, JSON.stringify(d, null, 2)); }
  return {
    async list() { return (await load()).kaarten; },
    async upsert(k) { const d = await load(); d.kaarten = [k, ...d.kaarten.filter((x) => x.id !== k.id)]; await persist(d); return k; },
    async get(id) { return (await load()).kaarten.find((x) => x.id === id) || null; },
  };
}
function azureKaarten(connectionString, tableName) {
  let clientPromise;
  async function client() {
    if (!clientPromise) clientPromise = (async () => {
      const { TableClient } = await import('@azure/data-tables');
      const c = TableClient.fromConnectionString(connectionString, tableName);
      await c.createTable().catch((e) => { if (e.statusCode !== 409) throw e; });
      return c;
    })();
    return clientPromise;
  }
  return {
    async list() { const c = await client(); const out = []; for await (const e of c.listEntities({ queryOptions: { filter: "PartitionKey eq 'voicekaart'" } })) out.push(JSON.parse(e.data)); return out; },
    async upsert(k) { const c = await client(); await c.upsertEntity({ partitionKey: 'voicekaart', rowKey: k.id, data: JSON.stringify(k) }, 'Replace'); return k; },
    async get(id) { const c = await client(); try { return JSON.parse((await c.getEntity('voicekaart', id)).data); } catch (e) { if (e.statusCode === 404) return null; throw e; } },
  };
}
export function createVoiceStore({ filePath, connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING, tableName = 'AssessmentVoiceKaarten' } = {}) {
  return connectionString ? azureKaarten(connectionString, tableName) : fileKaarten(filePath);
}

const veiligId = (s) => String(s || '').replace(/[^A-Za-z0-9_.-]/g, '-').slice(0, 120);

// Import: een kaart of lijst kaarten (zoals scenario_maak.py ze schrijft). Elke kaart begint als concept.
export async function importeer(store, input, door) {
  const items = Array.isArray(input) ? input : [input];
  let toegevoegd = 0, overgeslagen = 0;
  for (const raw of items) {
    if (!geldigeKaart(raw)) { overgeslagen++; continue; }
    const id = veiligId(raw.id || `${Date.now()}-${raw.titel}`);
    const { instructie, instructies, ...kaart } = raw; // instructies bouwt de server zelf
    await store.upsert({ ...kaart, id, status: 'concept', geimporteerdDoor: door, geimporteerdOp: new Date().toISOString(), goedgekeurdDoor: null, besluitOp: null });
    toegevoegd++;
  }
  return { toegevoegd, overgeslagen };
}

export async function besluit(store, id, status, door) {
  if (!STATUS.includes(status) || status === 'concept') throw new Error('ongeldige status');
  const k = await store.get(veiligId(id));
  if (!k) return null;
  return store.upsert({ ...k, status, goedgekeurdDoor: status === 'goedgekeurd' ? door : null, besluitDoor: door, besluitOp: new Date().toISOString() });
}

export async function oefenKaarten(store) {
  const goedgekeurd = (await store.list()).filter((k) => k.status === 'goedgekeurd');
  return [...(await basisKaarten()), ...goedgekeurd].map(voorBrowser);
}

// ---- terugblik (gelijk aan TERUGBLIK/SCHEMA in oefenlijn_test.py) ----
export const TERUGBLIK = `Je geeft een servicedeskmedewerker een korte terugblik op een OEFENgesprek met een AI-beller.
Regels: geen cijfers, scores of oordeel over de persoon; alleen observaties over wat er gezegd is (woordkeuze, structuur,
vragen, afspraken), elk met een kort citaat. Niets over toon, tempo of emotie van de medewerker (dat kun je niet weten).
Schrijf in het Nederlands, vriendelijk en concreet, voor de medewerker zelf.
Het is een inkomend gesprek: kijk ook naar hoe de medewerker opnam (begroeting, 'Campai', eigen naam).
Houd het KORT: het moet in tien seconden te lezen zijn. Maximaal 3 punten bij 'goed' en maximaal 3 bij 'aandacht';
de belangrijkste tip eerst. Een punt is één korte zin (max 12 woorden), een citaat max 10 woorden, 'beter' max 15 woorden.`;

export const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['kern', 'goed', 'aandacht', 'afvinkpunten', 'voorbeeldzin'],
  properties: {
    kern: { type: 'string', description: "de ene belangrijkste les uit dit gesprek, één zin van max 20 woorden, aanspreken met 'je'" },
    goed: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['punt', 'citaat'], properties: { punt: { type: 'string' }, citaat: { type: 'string' } } } },
    aandacht: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['punt', 'citaat', 'beter'], properties: { punt: { type: 'string' }, citaat: { type: 'string' }, beter: { type: 'string' } } } },
    afvinkpunten: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['punt', 'status'], properties: { punt: { type: 'string' }, status: { type: 'string', enum: ['ja', 'nee', 'niet van toepassing'] } } } },
    voorbeeldzin: { type: 'string', description: 'één zin die de medewerker de volgende keer kan gebruiken' },
  },
};

export function terugblikVraag({ titel, verloop, afvinkpunten, transcript }) {
  const regels = (Array.isArray(transcript) ? transcript : []).slice(0, 400)
    .map((r) => `${r && r.wie === 'jij' ? 'Medewerker' : 'Beller'}: ${String((r && r.tekst) || '').slice(0, 1000)}`).join('\n');
  return `Scenario: ${String(titel || '').slice(0, 200)} (verloop: ${VERLOPEN[verloop] ? verloop : '?'})\nAfvinkpunten: ${JSON.stringify(Array.isArray(afvinkpunten) ? afvinkpunten.slice(0, 10) : [])}\n\nTranscript:\n${regels}`;
}

export const voiceConfigured = (env = process.env) => Boolean(env.VOICE_LIVE_HOST && env.VOICE_LIVE_KEY);
export const terugblikConfigured = (env = process.env) => Boolean(env.FOUNDRY_ENDPOINT && env.FOUNDRY_KEY);

export async function maakTerugblik(body, { fetchImpl = fetch, env = process.env } = {}) {
  const deployment = env.FOUNDRY_DEPLOYMENT || 'gpt-5.5-eu';
  const res = await fetchImpl(`${env.FOUNDRY_ENDPOINT.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2025-04-01-preview`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': env.FOUNDRY_KEY },
    body: JSON.stringify({
      messages: [{ role: 'system', content: TERUGBLIK }, { role: 'user', content: terugblikVraag(body) }],
      response_format: { type: 'json_schema', json_schema: { name: 'terugblik', strict: true, schema: SCHEMA } },
      reasoning_effort: 'low',
    }),
  });
  if (!res.ok) throw new Error(`terugblik ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

// Directe verbinding vanuit de browser (minder vertraging dan via de server): de app haalt met zijn eigen
// identiteit (managed identity, alleen de rol Cognitive Services User op de Voice Live-resource) een Entra-token
// op en geeft de browser een URL met dat token. Zonder managed identity (lokaal) geeft dit null en gebruikt de
// browser de doorgifte via /api/voice/live.
export async function voiceTokenUrl({ fetchImpl = fetch, env = process.env } = {}) {
  if (!env.IDENTITY_ENDPOINT || !env.IDENTITY_HEADER || !env.VOICE_LIVE_HOST) return null;
  const res = await fetchImpl(`${env.IDENTITY_ENDPOINT}?resource=${encodeURIComponent('https://cognitiveservices.azure.com')}&api-version=2019-08-01`, {
    headers: { 'X-IDENTITY-HEADER': env.IDENTITY_HEADER },
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const { access_token: token, expires_on: verloopt } = await res.json();
  return { url: `${voiceLiveUrl(env)}&Authorization=${encodeURIComponent(`Bearer ${token}`)}`, verloopt: Number(verloopt) || null };
}

// Voice Live-URL voor de server-side proxy (de sleutel gaat als header mee, nooit naar de browser).
export function voiceLiveUrl(env = process.env) {
  const model = env.VOICE_MODEL || 'gpt-realtime-2.1-datazone'; // alleen -datazone: andere varianten verwerken mogelijk buiten de EU
  const versie = env.VOICE_API_VERSION || '2026-07-15';
  return `wss://${env.VOICE_LIVE_HOST}/voice-live/realtime?api-version=${versie}&model=${encodeURIComponent(model)}`;
}
