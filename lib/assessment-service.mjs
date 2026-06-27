// lib/assessment-service.mjs
import { selectQuestionsForRole, toClientQuestion, scoreAssessment, gradeDetails } from './assessment.mjs';

export class AssessmentError extends Error {
  constructor(message, code) { super(message); this.name = 'AssessmentError'; this.code = code; }
}

export async function startAssessment(store, code) {
  const candidate = await store.getByCode(code);
  if (!candidate) throw new AssessmentError('ongeldige code', 'invalid_code');
  if (candidate.status === 'afgerond') throw new AssessmentError('al ingeleverd', 'already_done');
  const questions = selectQuestionsForRole(candidate.functie);
  await store.updateCandidate(candidate.id, {
    status: 'bezig',
    gestartOp: candidate.gestartOp || new Date().toISOString(),
    serverQuestions: questions, // met answer; nooit naar de client
  });
  return { candidate: { naam: candidate.naam, functie: candidate.functie }, questions: questions.map(toClientQuestion) };
}

export async function submitAssessment(store, code, answers) {
  const candidate = await store.getByCode(code);
  if (!candidate) throw new AssessmentError('ongeldige code', 'invalid_code');
  if (candidate.status === 'afgerond') throw new AssessmentError('al ingeleverd', 'already_done');
  const questions = candidate.serverQuestions || selectQuestionsForRole(candidate.functie);
  const { domeinScores, totaalScore, roleFit } = scoreAssessment(answers, questions, candidate.functie);
  const details = gradeDetails(answers, questions);
  await store.saveResult(candidate.id, {
    functie: candidate.functie, details, domeinScores, totaalScore, roleFit,
    ingediendOp: new Date().toISOString(),
  });
  await store.updateCandidate(candidate.id, { status: 'afgerond', ingediendOp: new Date().toISOString() });
  return { totaalScore, domeinScores }; // GEEN roleFit naar de kandidaat
}
