// Pure score-/wegings-/encodinglogica, 1-op-1 uit de vanilla app.js.
// Geen DOM, geen side effects — herbruikbaar in elke React-component.
import type { Role } from "./data";

interface Scoreable {
  scores: Record<string, number>;
}

export function roleScore(candidate: Scoreable, role: Role): number {
  const totalWeight = Object.values(role.weights).reduce((total, weight) => total + weight, 0);
  return Math.round(
    Object.entries(role.weights).reduce(
      (total, [domain, weight]) => total + candidate.scores[domain] * (weight / totalWeight),
      0,
    ),
  );
}

export type FitState = "Sterke fit" | "Geschikt" | "Borderline" | "Niet geschikt";

export function scoreState(score: number, threshold = 70): FitState {
  if (score >= threshold + 10) return "Sterke fit";
  if (score >= threshold) return "Geschikt";
  if (score >= threshold - 8) return "Borderline";
  return "Niet geschikt";
}

export type ScoreClass = "score-good" | "score-mid" | "score-risk";

export function scoreClass(score: number): ScoreClass {
  if (score >= 75) return "score-good";
  if (score >= 60) return "score-mid";
  return "score-risk";
}

// 5-staps sequentiële encoding voor de heatmap (echte lichtheidssprongen).
export type HeatClass = "hm-q0" | "hm-q1" | "hm-q2" | "hm-q3" | "hm-q4";

export function heatClass(score: number): HeatClass {
  if (score >= 80) return "hm-q4";
  if (score >= 70) return "hm-q3";
  if (score >= 60) return "hm-q2";
  if (score >= 50) return "hm-q1";
  return "hm-q0";
}

// Mantine-vertaling van de heatmap-encoding: kleur + shade per kwartiel.
export function heatColor(score: number): { color: string; shade: number } {
  if (score >= 80) return { color: "campaiLime", shade: 7 };
  if (score >= 70) return { color: "campaiLime", shade: 5 };
  if (score >= 60) return { color: "campaiCyan", shade: 4 };
  if (score >= 50) return { color: "campaiRed", shade: 3 };
  return { color: "campaiRed", shade: 6 };
}

export interface FitEncoding {
  ring: string;
  badge: string;
  risk: string;
  /** Mantine kleurnaam voor RingProgress/Badge */
  color: string;
}

// Fit-state → kleur/encoding voor de cockpit (ring + risico-badge).
// `ring`/`badge` blijven voor compat; `color` is de Mantine-kleurnaam.
export function fitEncoding(state: FitState): FitEncoding {
  switch (state) {
    case "Sterke fit":
      return { ring: "var(--good)", badge: "risk-strong", risk: "Laag risico", color: "campaiLime" };
    case "Geschikt":
      return { ring: "var(--cyan)", badge: "risk-ok", risk: "Beperkt risico", color: "campaiCyan" };
    case "Borderline":
      return { ring: "var(--warn)", badge: "risk-watch", risk: "Aandacht nodig", color: "yellow" };
    default:
      return { ring: "var(--risk)", badge: "risk-high", risk: "Hoog risico", color: "campaiRed" };
  }
}

export function initials(value: string): string {
  return value
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
