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
export function prepareQuestion(question, index) {
  const id = question.id || `q-${index + 1}`;
  const original = question.options.map((text, i) => ({ text, originalIndex: i }));
  const correct = original.find((o) => o.originalIndex === question.answer);
  const distractors = original.filter((o) => o.originalIndex !== question.answer);
  const order = shuffledIndices(distractors.length, `${id}:distractors`).map((i) => distractors[i]);
  const target = [2, 0, 3, 1][index % 4];
  const prepared = [];
  for (let i = 0; i < 4; i += 1) prepared.push(i === target ? correct : order.shift());
  // Geen kunstmatige lengte-opvulling: afleiders moeten van nature plausibel en
  // even lang zijn (auteur-/AI-verantwoordelijkheid, zie vragenbank-feature).
  const options = prepared.map((o) => o.text);
  return { id, domain: question.domain, type: question.type, prompt: question.prompt, options, answer: target };
}

// Relevante domeinen = rolgewicht >= drempel. Per relevant domein min(N, beschikbaar)
// vragen uit seed + goedgekeurd (seed eerst, dan goedgekeurd; stabiele volgorde).
export function selectQuestionsForRole(roleId, approved = [], { domains: override, minPerDomain = 5, weightThreshold = 0.07 } = {}) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw new Error(`onbekende rol: ${roleId}`);
  const weightOf = (d) => role.weights[d] ?? 0;
  const relevant = Array.isArray(override) && override.length
    ? override.filter((d) => domains.includes(d))
    : domains.filter((d) => weightOf(d) >= weightThreshold).sort((a, b) => weightOf(b) - weightOf(a));
  const seed = testQuestions.map((q, i) => ({ ...q, id: q.id ?? `seed-${i}` }));
  const pool = [...seed, ...approved];
  const chosen = [];
  for (const domain of relevant) chosen.push(...pool.filter((q) => q.domain === domain).slice(0, minPerDomain));
  return chosen.map((q, i) => prepareQuestion(q, i));
}

export function toClientQuestion(q) {
  const { answer, ...rest } = q; // answer eraf
  return rest;
}

function scoreState(score, threshold = 70) {
  if (score >= threshold + 10) return 'Sterke fit';
  if (score >= threshold) return 'Geschikt';
  if (score >= threshold - 8) return 'Borderline';
  return 'Niet geschikt';
}
function roleScoreFromDomains(domeinScores, role) {
  const entries = Object.entries(role.weights).filter(([d]) => d in domeinScores);
  const total = entries.reduce((t, [, w]) => t + w, 0) || 1;
  return Math.round(entries.reduce((t, [d, w]) => t + domeinScores[d] * (w / total), 0));
}
export function gradeDetails(answers, questions) {
  const byId = new Map(answers.map((a) => [a.questionId, a.choice]));
  return questions.map((q) => {
    const chosenIndex = byId.has(q.id) ? byId.get(q.id) : -1;
    return { questionId: q.id, domain: q.domain, prompt: q.prompt, options: q.options, chosenIndex, correctIndex: q.answer, correct: chosenIndex === q.answer };
  });
}

export function scoreAssessment(answers, questions, roleId) {
  const role = roles.find((r) => r.id === roleId);
  if (!role) throw new Error(`onbekende rol: ${roleId}`);
  const byId = new Map(answers.map((a) => [a.questionId, a.choice]));
  const perDomain = new Map(); // domain -> {goed, totaal}
  for (const q of questions) {
    const bucket = perDomain.get(q.domain) || { goed: 0, totaal: 0 };
    bucket.totaal += 1;
    if (byId.get(q.id) === q.answer) bucket.goed += 1;
    perDomain.set(q.domain, bucket);
  }
  const domeinScores = {};
  for (const [d, b] of perDomain) domeinScores[d] = Math.round((100 * b.goed) / b.totaal);
  const vals = Object.values(domeinScores);
  const totaalScore = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  const fitScore = roleScoreFromDomains(domeinScores, role);
  return { domeinScores, totaalScore, roleFit: { score: fitScore, state: scoreState(fitScore, role.threshold) } };
}
