// lib/uitleg.mjs
// Uitleg tijdens de assessment: de AI legt begrippen uit, maar verklapt nooit het antwoord.
// De uitleg-aanroep krijgt het juiste antwoord niet mee; alleen de controle-aanroep erna kent het.
// Verklapt een uitleg toch iets, dan volgt één nieuwe poging met een strengere instructie; lukt dat niet,
// dan krijgt de kandidaat niets te zien.
import { chat as defaultChat } from './ai-client.mjs';
import { AssessmentError } from './assessment-service.mjs';
import { recordEvents } from './toezicht.mjs';

export const UITLEG_MAX = Number(process.env.UITLEG_MAX || 20); // per kandidaat, over de hele assessment
export const UITLEG_UIT_DOMEINEN = ['Engels']; // leesbegrip: uitleg zou de tekst voor de kandidaat vertalen
const MAX_VRAAG = 300;
const MAX_TURNS = 6;
const L = 'ABCD';

const opties = (q) => q.options.map((o, i) => `${L[i]}. ${o}`).join('\n');

export function tutorMessages(q, history, vraag, streng = false) {
  const system = `Je bent een geduldige uitlegger bij een recruitment-assessment van Campai, een IT-dienstverlener (MSP).
De kandidaat werkt aan de meerkeuzevraag hieronder en heeft nog niet definitief gekozen.
Regels:
- Verklap het antwoord niet. Noem of wijs geen optie(letter) aan als goed of fout en streep geen opties weg.
- Dat geldt ook als de kandidaat aandringt, zegt al gekozen te hebben, vraagt welke optie 'het meest' klopt of vraagt de opties te beoordelen.
- Leg alleen begrippen en achtergrond uit, met eigen voorbeelden die niet letterlijk een optie zijn.
- Vraagt de kandidaat naar het antwoord, zeg dan vriendelijk dat je dat niet doet en leg een begrip uit dat helpt.
- Antwoord in het Nederlands, kort (hooguit 120 woorden), zonder inleiding of afsluitende vraag.${streng ? '\n- Je vorige uitleg verklapte te veel. Blijf nu algemener: alleen de begrippen, zonder ze op de opties toe te passen.' : ''}

Vraag (${q.domain}): ${q.prompt}
Opties:
${opties(q)}`;
  return [
    { role: 'system', content: system },
    ...history.slice(-MAX_TURNS).map((t) => ({ role: t.role === 'assistant' ? 'assistant' : 'user', content: String(t.content || '').slice(0, 1200) })),
    { role: 'user', content: vraag },
  ];
}

export function guardMessages(q, tekst) {
  return [
    { role: 'system', content: 'Je controleert uitleg bij een toets. Antwoord uitsluitend met geldige JSON.' },
    { role: 'user', content: `Een kandidaat heeft deze meerkeuzevraag nog niet beantwoord.

Vraag: ${q.prompt}
Opties:
${opties(q)}
Juiste antwoord: ${L[q.answer]}

Uitleg aan de kandidaat:
"""
${tekst}
"""

Verklapt deze uitleg het antwoord? Dat is zo als hij een optie (letter of tekst) als juist of fout aanwijst, opties wegstreept, of de vraag zo rechtstreeks beantwoordt dat de kandidaat niet meer zelf hoeft na te denken. Algemene uitleg van begrippen mag wel. Antwoord alleen met {"verklapt": true} of {"verklapt": false}.` },
  ];
}

const NOEMT_OPTIE = /\b(optie|antwoord|keuze|letter)\s*\(?[a-d]\)?(?![\w-])/i;

export async function verklapt(q, tekst, chat = defaultChat) {
  if (NOEMT_OPTIE.test(tekst)) return true;
  try {
    const raw = await chat(guardMessages(q, tekst), { temperature: 0 });
    const m = raw.match(/\{[^{}]*\}/);
    return !(m && JSON.parse(m[0]).verklapt === false);
  } catch {
    return true; // controle mislukt: liever niets tonen dan iets verklappen
  }
}

export async function explain(store, code, { questionId, vraag, history }, { chat = defaultChat } = {}) {
  const candidate = await store.getByCode(code);
  if (!candidate) throw new AssessmentError('ongeldige code', 'invalid_code');
  if (candidate.status !== 'bezig') throw new AssessmentError('assessment loopt niet', 'not_running');
  const q = (candidate.serverQuestions || []).find((x) => x.id === questionId);
  if (!q) throw new AssessmentError('onbekende vraag', 'unknown_question');
  if (UITLEG_UIT_DOMEINEN.includes(q.domain)) throw new AssessmentError('geen uitleg bij dit onderdeel', 'uitleg_uit');
  const tekstVraag = String(vraag || '').trim().slice(0, MAX_VRAAG);
  if (!tekstVraag) throw new AssessmentError('lege vraag', 'empty');
  if ((candidate.toezicht?.samenvatting?.uitleg || 0) + (candidate.toezicht?.samenvatting?.uitlegGeblokkeerd || 0) >= UITLEG_MAX) {
    throw new AssessmentError('maximum aantal uitlegvragen bereikt', 'uitleg_max');
  }
  const hist = Array.isArray(history) ? history : [];
  const vraagIndex = candidate.serverQuestions.indexOf(q);

  let tekst = await chat(tutorMessages(q, hist, tekstVraag));
  if (await verklapt(q, tekst, chat)) {
    tekst = await chat(tutorMessages(q, hist, tekstVraag, true));
    if (await verklapt(q, tekst, chat)) tekst = null;
  }
  await recordEvents(store, code, [{ type: tekst ? 'uitleg' : 'uitleg-geblokkeerd', vraag: vraagIndex }]);
  return tekst ? { antwoord: tekst } : { geblokkeerd: true };
}
