// lib/ai-client.mjs
import { domains } from './assessment-content.mjs';
import { PromptSanitizer } from './ai-guard.mjs';

export class AiError extends Error { constructor(code, message) { super(message || code); this.name = 'AiError'; this.code = code; } }

export function isConfigured() {
  return Boolean(process.env.AI_ENDPOINT && process.env.AI_API_KEY && process.env.AI_MODEL);
}

function isValidQuestion(q) {
  return q && domains.includes(q.domain) && Array.isArray(q.options) && q.options.length === 4
    && q.options.every((o) => typeof o === 'string' && o.trim())
    && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    && typeof q.prompt === 'string' && q.prompt.trim().length >= 30;
}

export function parseQuestions(text) {
  const start = text.indexOf('['); const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) return [];
  let arr;
  try { arr = JSON.parse(text.slice(start, end + 1)); } catch { return []; }
  if (!Array.isArray(arr)) return [];
  return arr.filter(isValidQuestion).map((q) => ({
    domain: q.domain, type: q.type || 'Scenario', prompt: q.prompt.trim(),
    options: q.options.map((o) => o.trim()), answer: q.answer,
    uitleg: typeof q.uitleg === 'string' ? q.uitleg.trim() : '', source: 'AI',
  }));
}

function buildPrompt(domain, count) {
  return `Genereer ${count} hoogwaardige Nederlandstalige meerkeuzevragen voor een MSP-recruitmentassessment, domein "${domain}". `
    + `Toets toepassing/oordeel, GEEN definitievragen. Elke vraag: een korte realistische situatie + 4 PLAUSIBELE opties van vergelijkbare lengte, precies één duidelijk beste professionele antwoord (geen flauwe/overduidelijk foute opties). `
    + (domain === 'Engels' ? 'Voor dit domein zijn vraag en opties in het Engels (technisch leesbegrip). ' : '')
    + `Voeg per vraag een korte "uitleg" toe: waarom het juiste antwoord correct is en waarom de afleiders fout zijn. `
    + `Geen klantnamen/PII. Antwoord UITSLUITEND met een JSON-array van objecten: {"domain":"${domain}","type":"Scenario","prompt":"...","options":["..","..","..",".."],"answer":0-3,"uitleg":"..."}.`;
}

export async function generateQuestions({ domain, count = 5 }, { fetchImpl = fetch } = {}) {
  if (!domains.includes(domain)) throw new AiError('invalid_domain', `onbekend domein: ${domain}`);
  if (!isConfigured()) throw new AiError('not_configured');
  const guard = new PromptSanitizer();
  const userPrompt = buildPrompt(domain, count);
  const { text: safePrompt, map } = guard.sanitize(userPrompt); // no-op bij domein-only, compliant
  let res;
  try {
    res = await fetchImpl(process.env.AI_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ model: process.env.AI_MODEL, temperature: 0.7,
        messages: [
          { role: 'system', content: 'Je bent een ervaren MSP-assessmentauteur. Antwoord uitsluitend met geldige JSON.' },
          { role: 'user', content: safePrompt },
        ] }),
    });
  } catch (e) { throw new AiError('ai_error', e.message); }
  if (!res.ok) throw new AiError('ai_error', `endpoint ${res.status}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return parseQuestions(guard.rehydrate(content, map));
}
