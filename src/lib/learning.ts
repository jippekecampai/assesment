// Skills Academy: persistente leerstate (localStorage) + pure module-helpers.
// Behoudt de vanilla-sleutels zodat bestaande voortgang blijft werken.
import { roles, trainingModules, type Learner, type Role, type TrainingModule } from "./data";

export interface ModuleUpdate {
  status?: string;
  comment?: string;
  updatedAt?: string;
}

const COMPLETED_KEY = "camaiCompletedModules";
const UPDATES_KEY = "camaiModuleUpdates";
const AUDIT_KEY = "camaiAuditLog";

export interface AuditEntry {
  at: string;
  action: string;
  detail: string;
  actor: string;
}

const AUDIT_ACTOR = "local@campai.nl";

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
    /* localStorage niet beschikbaar — stil negeren */
  }
}

export function loadCompleted(): Record<string, string[]> {
  return load<Record<string, string[]>>(COMPLETED_KEY, {});
}

export function saveCompleted(value: Record<string, string[]>): void {
  save(COMPLETED_KEY, value);
}

export function loadUpdates(): Record<string, Record<string, ModuleUpdate>> {
  return load<Record<string, Record<string, ModuleUpdate>>>(UPDATES_KEY, {});
}

export function saveUpdates(value: Record<string, Record<string, ModuleUpdate>>): void {
  save(UPDATES_KEY, value);
}

// --- Auditlog (gedeeld met Beheer-scherm) ---
export function loadAudit(): AuditEntry[] {
  return load<AuditEntry[]>(AUDIT_KEY, []);
}

export function recordAudit(action: string, detail: string): void {
  const log = loadAudit();
  log.unshift({ at: new Date().toISOString(), action, detail, actor: AUDIT_ACTOR });
  save(AUDIT_KEY, log.slice(0, 100));
}

export function clearAudit(): void {
  save(AUDIT_KEY, []);
}

export function formatAuditTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// --- Pure module-helpers (gedrag uit app.js) ---
export function moduleType(module: TrainingModule): string {
  if (module.format.includes("Praktijk") || module.format.includes("simulatie")) return "Course";
  if (module.format.includes("Workflow") || module.format.includes("Policy")) return "Path";
  if (module.format.includes("Schrijf")) return "Other";
  return "Article";
}

export function moduleSourceLink(module: TrainingModule): string {
  return `https://campai.eu.itglue.com/search?query=${encodeURIComponent(module.title)}`;
}

export function statusLabel(status: string): string {
  if (status === "completed") return "Completed";
  if (status === "progress") return "In progress";
  return "To do";
}

export function statusColor(status: string): string {
  if (status === "completed") return "campaiLime";
  if (status === "progress") return "campaiCyan";
  return "gray";
}

export function learnerLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export interface DomainGap {
  domain: string;
  current: number;
  target: number;
  gap: number;
  weight: number;
}

export function recommendedDomains(learner: Learner, learningRole: Role, domains: string[]): DomainGap[] {
  return domains
    .map((domain) => {
      const weight = learningRole.weights[domain] || 0;
      const target = Math.round(learningRole.threshold - 4 + weight * 70);
      const current = learner.scores[domain] || 0;
      return { domain, current, target, gap: Math.max(0, target - current), weight };
    })
    .sort((a, b) => b.gap + b.weight * 10 - (a.gap + a.weight * 10));
}

export interface RecommendedModule extends TrainingModule {
  completed: boolean;
  gap: number;
  current: number;
  target: number;
  priority: number;
}

export function recommendedModules(
  learner: Learner,
  learningRole: Role,
  domains: string[],
  completedIds: string[],
): RecommendedModule[] {
  const priority = recommendedDomains(learner, learningRole, domains);
  return trainingModules
    .map((module) => {
      const domain = priority.find((item) => item.domain === module.domain);
      const completed = completedIds.includes(module.id);
      return {
        ...module,
        completed,
        gap: domain?.gap || 0,
        current: domain?.current || 0,
        target: domain?.target || learningRole.threshold,
        priority: completed ? -1 : (domain?.gap || 0) + (domain?.weight || 0) * 80,
      };
    })
    .sort((a, b) => b.priority - a.priority || b.xp - a.xp);
}

export function learningRoleFor(learner: Learner): Role {
  return roles.find((role) => role.name === learner.targetRole) || roles[1];
}
