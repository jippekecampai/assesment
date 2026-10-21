// lib/oefenen.mjs
// Oefensets voor medewerkers (Training → Oefenen → Oefentoetsen). Eén vraagvorm voor alle toetsen:
// { id, onderwerp, prompt, options[4], answer, uitleg, illustratie? }. Bronnen: de vaste set "Cloud en netwerken"
// (lib/oefensets) en per assessmentdomein de vragen uit de Vragenbank (seed + goedgekeurd).
// Medewerkers zien bij oefenen na hun antwoord het juiste antwoord en de uitleg; sollicitanten nooit (zie assessment.mjs).
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { domains, testQuestions } from './assessment-content.mjs';
import { tutorMessages, verklapt } from './uitleg.mjs';
import { chat as defaultChat } from './ai-client.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
// De uitleg-illustratie per domein: bij de start van de set en bij elke vraag zonder eigen illustratie.
export const DOMEIN_ILLUSTRATIE = {
  'Microsoft 365': 'ca', Azure: 'cloud', 'Kaseya Stack': 'rmm', Fortigate: 'pad', 'AI / Copilot': 'ai', VoIP: 'voip',
  Servers: 'rto', 'SharePoint / Teams': 'delen', 'SharePoint / Azure Migrations': 'migratie', Inforcer: 'baseline',
  'Basic IT & Troubleshooting': 'osi', 'Werkhouding & Communicatie': 'klantupdate',
};
const VAST = ['ai-geletterdheid', 'cloud-netwerken'];
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function vasteSet(id) {
  return JSON.parse(await readFile(join(HIER, 'oefensets', `${id}.json`), 'utf8'));
}

function domeinSet(domain, approved) {
  const seed = testQuestions.filter((q) => q.domain === domain).map((q, i) => ({ ...q, id: `seed-${slug(domain)}-${i + 1}` }));
  const goed = approved.filter((q) => q.domain === domain);
  const vragen = [...seed, ...goed].map((q) => ({ id: q.id, onderwerp: domain, prompt: q.prompt, options: q.options, answer: q.answer, uitleg: q.uitleg || '' }));
  return { id: `domein-${slug(domain)}`, titel: domain, domein: domain, omschrijving: 'Vragen uit de Vragenbank van het assessment.', onderwerpen: { [domain]: domain },
    ...(DOMEIN_ILLUSTRATIE[domain] ? { illustratiePerOnderwerp: { [domain]: DOMEIN_ILLUSTRATIE[domain] } } : {}), vragen };
}

export async function listSets(questionBank) {
  const approved = questionBank ? await questionBank.listApproved() : [];
  const vast = await Promise.all(VAST.map(vasteSet));
  const perDomein = domains.map((d) => domeinSet(d, approved)).filter((s) => s.vragen.length);
  return [...vast, ...perDomein].map(({ vragen, intro, onderwerpen, illustratiePerOnderwerp, bevestigingen, ...meta }) => ({ ...meta, aantal: vragen.length, soort: VAST.includes(meta.id) ? 'vast' : 'domein' }));
}

export async function getSet(questionBank, id) {
  if (VAST.includes(id)) return vasteSet(id);
  const approved = questionBank ? await questionBank.listApproved() : [];
  const d = domains.find((x) => `domein-${slug(x)}` === id);
  return d ? domeinSet(d, approved) : null;
}

// Uitleg bij oefenen: vóór het antwoord dezelfde regels als bij sollicitanten (niets verklappen, met controle);
// ná het antwoord mag de uitlegger het antwoord kennen en bespreken.
export async function oefenUitleg(set, { vraagId, vraag, history, gekozen }, { chat = defaultChat } = {}) {
  const q = set.vragen.find((x) => x.id === vraagId);
  if (!q) return { fout: 'onbekende_vraag' };
  const tekst = String(vraag || '').trim().slice(0, 300);
  if (!tekst) return { fout: 'leeg' };
  const hist = Array.isArray(history) ? history.slice(-6) : [];
  const vorm = { domain: set.onderwerpen?.[q.onderwerp] || q.onderwerp, prompt: q.prompt, options: q.options, answer: q.answer };
  if (Number.isInteger(gekozen)) {
    const L = 'ABCD';
    const msgs = tutorMessages(vorm, hist, tekst);
    msgs[0].content = msgs[0].content.split('Regels:')[0]
      + `De medewerker heeft gekozen: ${L[gekozen]}. Het juiste antwoord is ${L[q.answer]}. Uitleg bij de vraag: ${q.uitleg}\n`
      + 'Leg het helder en kort uit (hooguit 120 woorden), in het Nederlands, zonder inleiding.\n\n'
      + msgs[0].content.slice(msgs[0].content.indexOf('Vraag ('));
    return { antwoord: await chat(msgs) };
  }
  let antwoord = await chat(tutorMessages(vorm, hist, tekst));
  if (await verklapt(vorm, antwoord, chat)) {
    antwoord = await chat(tutorMessages(vorm, hist, tekst, true));
    if (await verklapt(vorm, antwoord, chat)) return { geblokkeerd: true };
  }
  return { antwoord };
}
