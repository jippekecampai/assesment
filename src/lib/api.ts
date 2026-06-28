export type ClientQuestion = { id: string; domain: string; type: string; prompt: string; options: string[] };
export type StartResponse = { candidate: { naam: string; functie: string }; questions: ClientQuestion[] };
export type SubmitResponse = { totaalScore: number; domeinScores: Record<string, number> };
export type CandidateStatus = "uitgenodigd" | "bezig" | "afgerond";
export type Candidate = {
  id: string; naam: string; email: string | null; functie: string; code: string;
  status: CandidateStatus; aangemaaktOp: string; gestartOp: string | null; ingediendOp: string | null;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) { super(message); this.status = status; this.code = code; }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `HTTP ${res.status}`, data.error);
  return data as T;
}
async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  return data as T;
}
async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  return data as T;
}

export type MeProfile =
  | { authenticated: false }
  | { authenticated: true; name: string | null; email: string | null; jobTitle: string | null; entraOid: string | null; department: string | null };
export type LearningProgress = { entraOid: string; completedModules: string[]; updatedAt?: string };
export const getMe = () => get<MeProfile>("/api/me");
export const getLearningProgress = () => get<LearningProgress>("/api/learning/me");
export const saveLearningProgress = (completedModules: string[]) =>
  put<LearningProgress>("/api/learning/me", { completedModules });

export const startAssessment = (code: string) => post<StartResponse>("/api/assessment/start", { code });
export const submitAssessment = (code: string, answers: { questionId: string; choice: number }[]) =>
  post<SubmitResponse>("/api/assessment/submit", { code, answers });
export type GradeDetail = {
  questionId: string;
  domain: string;
  prompt: string;
  options: string[];
  chosenIndex: number;
  correctIndex: number;
  correct: boolean;
  uitleg?: string;
};

export type CandidateResult = {
  functie: string;
  domeinScores: Record<string, number>;
  totaalScore: number;
  roleFit: { score: number; state: string };
  details: GradeDetail[];
  ingediendOp: string;
};

export const listCandidates = () => get<Candidate[]>("/api/candidates");
export const createCandidate = (input: { naam: string; email?: string; functie: string; domeinen?: string[] }) =>
  post<{ candidate: Candidate; code: string }>("/api/candidates", input);
export const getCandidateResult = (id: string) => get<CandidateResult>(`/api/candidates/${id}/result`);
export const deleteCandidate = async (id: string): Promise<void> => {
  const res = await fetch(`/api/candidates/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  }
};

export type ApprovedQuestion = {
  id: string;
  domain: string;
  type: string;
  prompt: string;
  options: string[];
  answer: number;
  uitleg?: string;
  source: string;
  approvedBy: string;
  approvedAt: string;
};

export type DomainCoverage = Record<string, { seed: number; approved: number; total: number }>;

export const getCoverage = () => get<DomainCoverage>("/api/questions/coverage");
export const listQuestions = () => get<ApprovedQuestion[]>("/api/questions");

export type BankQuestion = {
  id: string;
  domain: string;
  type: string;
  prompt: string;
  options: string[];
  answer: number;
  origin: "seed" | "approved";
  source: string;
  uitleg?: string;
};
export const listAllQuestions = () => get<BankQuestion[]>("/api/questions/all");

export type PracticeResult = { domain: string; score: number; total: number; at: string };
export type PracticeProgress = { entraOid: string; results: PracticeResult[] };
export const getPracticeResults = () => get<PracticeProgress>("/api/learning/practice");
export const savePracticeResult = (input: { domain: string; score: number; total: number }) =>
  post<PracticeProgress>("/api/learning/practice", input);

export type CoachingEntry = {
  id: string;
  type: "1:1" | "Review";
  title: string;
  date: string;
  focus: string;
  action: string;
  createdBy: string;
  createdAt: string;
};
export type DevGoal = {
  id: string;
  title: string;
  metric: string;
  linkedDomain: string;
  progress: number;
  status: "todo" | "progress" | "completed";
  due: string;
  createdAt: string;
};
export type GoalsRecord = { entraOid: string; aspiration: string; goals: DevGoal[] };
export const getGoals = () => get<GoalsRecord>("/api/goals");
export const saveAspiration = (aspiration: string) =>
  put<GoalsRecord>("/api/goals/aspiration", { aspiration });
export const addGoal = (input: { title: string; metric: string; linkedDomain: string; due: string }) =>
  post<GoalsRecord>("/api/goals", input);
export const updateGoal = (id: string, patch: { progress?: number; status?: string }) =>
  put<GoalsRecord>(`/api/goals/${encodeURIComponent(id)}`, patch);
export const removeGoal = async (id: string): Promise<GoalsRecord> => {
  const res = await fetch(`/api/goals/${encodeURIComponent(id)}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  return data as GoalsRecord;
};

export type PolicyAcks = { entraOid: string; acks: Record<string, string> };
export const getPolicyAcks = () => get<PolicyAcks>("/api/policy/acks");
export const ackPolicy = (policyId: string) => post<PolicyAcks>("/api/policy/acks", { policyId });

export const listCoaching = (learnerId: string) =>
  get<CoachingEntry[]>(`/api/coaching/${encodeURIComponent(learnerId)}`);
export const addCoaching = (
  learnerId: string,
  input: { type: string; title: string; date: string; focus: string; action: string },
) => post<CoachingEntry>(`/api/coaching/${encodeURIComponent(learnerId)}`, input);
export const removeCoaching = async (learnerId: string, id: string): Promise<void> => {
  const res = await fetch(`/api/coaching/${encodeURIComponent(learnerId)}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  }
};
export const addQuestion = (q: { domain: string; type: string; prompt: string; options: string[]; answer: number; uitleg?: string; source?: string }) =>
  post<ApprovedQuestion>("/api/questions", q);
export type DraftQuestionInput = { domain: string; type: string; prompt: string; options: string[]; answer: number; uitleg?: string; source?: string };
export const generateQuestions = (domain: string, count: number) =>
  post<DraftQuestionInput[]>("/api/questions/generate", { domain, count });

export const removeQuestion = async (id: string): Promise<void> => {
  const res = await fetch(`/api/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  }
};

export type QuestionFlag = {
  id: string;
  prompt: string;
  domain: string;
  note: string;
  flaggedBy: string;
  flaggedAt: string;
};

export const listFlags = () => get<QuestionFlag[]>("/api/questions/flags");
export const flagQuestion = (input: { prompt: string; domain: string; note: string }) =>
  post<QuestionFlag>("/api/questions/flags", input);
export const resolveFlag = async (id: string): Promise<void> => {
  const res = await fetch(`/api/questions/flags/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  }
};
