// lib/assessment.mjs
import { roles, domains, testQuestions } from './assessment-content.mjs';

function seededRandom(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () { h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5; return (h >>> 0) / 4294967296; };
}
function shuffledIndices(length, seed) {
  const rng = seededRandom(seed); const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}
function expandDistractor(option, targetLength, domain) {
  if (option.length >= targetLength) return option;
  const suffixes = [
    ' waarbij loganalyse, impactbepaling en vervolgactie niet aantoonbaar worden vastgelegd.',
    ' en daarbij scope, risico, rollback en klantcommunicatie onvoldoende worden meegenomen.',
    ` waarbij de ${domain}-context, governance en auditspoor ontbreken.`,
    ' en pas achteraf beoordelen of dit bij het klantprobleem paste.',
  ];
  let expanded = option;
  for (const s of suffixes) { if (expanded.length >= targetLength) break; expanded += s; }
  return expanded;
}
function balanceOptionLengths(options, correctIndex, domain) {
  const correctLength = options[correctIndex].length;
  return options.map((o, i) => (i === correctIndex ? o : expandDistractor(o, Math.max(58, correctLength - 8), domain)));
}
export function prepareQuestion(question, index) {
  const id = question.id || `q-${index + 1}`;
  const original = question.options.map((text, i) => ({ text, originalIndex: i }));
  const correct = original.find((o) => o.originalIndex === question.answer);
  const distractors = original.filter((o) => o.originalIndex !== question.answer);
  const order = shuffledIndices(distractors.length, `${id}:distractors`).map((i) => distractors[i]);
  const target = [2, 0, 3, 1][index % 4];
  const prepared = [];
  for (let i = 0; i < 4; i += 1) prepared.push(i === target ? correct : order.shift());
  let options = prepared.map((o) => o.text);
  options = balanceOptionLengths(options, target, question.domain);
  return { id, domain: question.domain, type: question.type, prompt: question.prompt, options, answer: target };
}

// Relevantie: domeinen waarvan het rolgewicht >= drempel meeweegt; vul aan met
// de zwaarst-wegende overige domeinen tot het minimum gehaald is.
export function selectQuestionsForRole(roleId, { minQuestions = 10, weightThreshold = 0.07 } = {}) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw new Error(`onbekende rol: ${roleId}`);
  const weightOf = (d) => role.weights[d] ?? 0;
  const relevant = new Set(domains.filter((d) => weightOf(d) >= weightThreshold));
  let picked = testQuestions.filter((q) => relevant.has(q.domain));
  if (picked.length < minQuestions) {
    const extra = testQuestions
      .filter((q) => !relevant.has(q.domain))
      .sort((a, b) => weightOf(b.domain) - weightOf(a.domain));
    picked = [...picked, ...extra].slice(0, Math.max(minQuestions, picked.length));
  }
  return picked.map((q, i) => prepareQuestion({ ...q, id: q.id || `q-${i + 1}` }, i));
}

export function toClientQuestion(q) {
  const { answer, ...rest } = q; // answer eraf
  return rest;
}
