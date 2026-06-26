// Kandidaattest: antwoord-autosave + adaptieve fallbackvragen + gepromote
// conceptvragen. Behoudt de vanilla localStorage-sleutels.
import { fallbackQuestions, prepareAssessmentQuestions, testQuestions, type TestQuestion } from "./data";

export interface UnknownAnswer {
  choice: number;
  status: "unknown";
  knownSystems: string[];
  note: string;
}

export type StoredAnswer = number | UnknownAnswer;

const ANSWERS_KEY = "camaiAnswers";
const INDEX_KEY = "camaiQuestionIndex";
const CUSTOM_KEY = "camaiCustomQuestions";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* negeren */
  }
}

export function loadAnswers(): Record<string, StoredAnswer> {
  return load<Record<string, StoredAnswer>>(ANSWERS_KEY, {});
}

export function saveAnswers(answers: Record<string, StoredAnswer>): void {
  save(ANSWERS_KEY, answers);
}

export function loadQuestionIndex(): number {
  return Number(localStorage.getItem(INDEX_KEY) || 0);
}

export function saveQuestionIndex(index: number): void {
  save(INDEX_KEY, index);
}

export function loadCustomQuestions(): TestQuestion[] {
  const custom = load<TestQuestion[]>(CUSTOM_KEY, []);
  return custom;
}

// Bereidt de vraag éénmalig voor (shuffle + lengtebalans) en bewaart het
// resultaat. prepareAssessmentQuestion is niet idempotent, dus nooit opnieuw.
export function addCustomQuestion(q: TestQuestion): void {
  prepareAssessmentQuestions([q]);
  const custom = loadCustomQuestions();
  custom.push(q);
  save(CUSTOM_KEY, custom);
}

export function getFallbackQuestion(domain: string): TestQuestion {
  const base = fallbackQuestions[domain] || { ...fallbackQuestions.default, domain };
  return { ...base, id: `${base.id}-${domain.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` };
}

// Bouwt de actieve vragenlijst: basis + gepromote concepten, met na elke
// "onbekend"-beantwoorde vraag de algemenere fallbackvraag.
export function buildActiveQuestions(answers: Record<string, StoredAnswer>): TestQuestion[] {
  const custom = loadCustomQuestions(); // al voorbereid bij addCustomQuestion
  const base = [...testQuestions, ...custom];
  const active: TestQuestion[] = [];
  for (const question of base) {
    active.push(question);
    const stored = question.id ? answers[question.id] : undefined;
    if (stored && typeof stored === "object" && stored.status === "unknown") {
      const fallback = getFallbackQuestion(question.domain);
      if (!active.some((q) => q.id === fallback.id)) active.push(fallback);
    }
  }
  return active;
}
