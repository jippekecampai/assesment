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
export const createCandidate = (input: { naam: string; email?: string; functie: string }) =>
  post<{ candidate: Candidate; code: string }>("/api/candidates", input);
export const getCandidateResult = (id: string) => get<CandidateResult>(`/api/candidates/${id}/result`);

export type ApprovedQuestion = {
  id: string;
  domain: string;
  type: string;
  prompt: string;
  options: string[];
  answer: number;
  source: string;
  approvedBy: string;
  approvedAt: string;
};

export type DomainCoverage = Record<string, { seed: number; approved: number; total: number }>;

export const getCoverage = () => get<DomainCoverage>("/api/questions/coverage");
export const listQuestions = () => get<ApprovedQuestion[]>("/api/questions");
export const addQuestion = (q: { domain: string; type: string; prompt: string; options: string[]; answer: number; source?: string }) =>
  post<ApprovedQuestion>("/api/questions", q);
export const removeQuestion = async (id: string): Promise<void> => {
  const res = await fetch(`/api/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as any).error || `HTTP ${res.status}`, (data as any).error);
  }
};
