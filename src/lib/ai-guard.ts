// PII-pseudonimisatie — Campai-standaard "AI guard".
//
// GEVENDORD uit Roland's hub-repo `tuxmanro/campai-portal-v2`
// (`packages/ai-guard` = `@cmp/ai-guard`). Dat is een private workspace-package
// (niet op npm), dus we houden hier een 1-op-1 kopie. Houd in sync met de hub.
//
// Hub-contract (docs/spoke-starter.md, regel 5): AI-prompts gaan ALTIJD eerst
// door deze guard zodat het model nooit rauwe klant-PII ziet. Zodra deze app
// een Claude/Anthropic-call toevoegt: sanitize() vóór verzenden, rehydrate()
// op het antwoord. De map (token → echte waarde) blijft lokaal.
//
// Heen: gevoelige waarden → tokens ([CATEGORIE_n]). Dezelfde waarde krijgt
// altijd hetzelfde token; tokens worden genummerd op volgorde van eerste
// voorkomen. Twee detectiebronnen: (1) deterministisch uit bekende entiteiten,
// (2) een regex-vangnet voor generieke PII. Terug: rehydrate() herstelt lokaal.

export interface KnownEntity {
  value: string;
  category: string;
}

/** token (bv. "[BEDRIJF_1]") → oorspronkelijke waarde. Blijft altijd lokaal. */
export type RedactionMap = Map<string, string>;

export interface SanitizeResult {
  text: string;
  map: RedactionMap;
}

interface Candidate {
  start: number;
  end: number;
  value: string; // canonieke waarde die teruggezet wordt
  category: string;
}

// Generiek vangnet voor PII die niet als entiteit bekend is.
const REGEX_PATTERNS: Array<{ category: string; re: RegExp }> = [
  { category: "EMAIL", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { category: "IBAN", re: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,8}\b/g },
  { category: "IP", re: /\b\d{1,3}(?:\.\d{1,3}){3}\b/g },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class PromptSanitizer {
  sanitize(text: string, entities: KnownEntity[] = []): SanitizeResult {
    const candidates: Candidate[] = [];

    // (1) Bekende entiteiten — hoofdletterongevoelig, op woordgrens.
    for (const entity of entities) {
      const value = entity.value?.trim();
      if (!value) continue;
      const re = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(value)}(?![A-Za-z0-9])`, "gi");
      for (let m = re.exec(text); m; m = re.exec(text)) {
        candidates.push({ start: m.index, end: m.index + m[0].length, value, category: entity.category });
      }
    }

    // (2) Regex-vangnet.
    for (const { category, re } of REGEX_PATTERNS) {
      re.lastIndex = 0;
      for (let m = re.exec(text); m; m = re.exec(text)) {
        candidates.push({ start: m.index, end: m.index + m[0].length, value: m[0], category });
      }
    }

    // Overlap oplossen: langste match wint per positie (geen substring-botsing).
    candidates.sort((a, b) => a.start - b.start || b.end - a.end);
    const accepted: Candidate[] = [];
    let consumedUntil = -1;
    for (const c of candidates) {
      if (c.start >= consumedUntil) {
        accepted.push(c);
        consumedUntil = c.end;
      }
    }

    // Tokens toekennen op volgorde van voorkomen; gelijke waarden hergebruiken token.
    const map: RedactionMap = new Map();
    const valueToToken = new Map<string, string>();
    const counters = new Map<string, number>();
    let out = "";
    let cursor = 0;
    for (const c of accepted) {
      const key = `${c.category} ${c.value}`;
      let token = valueToToken.get(key);
      if (!token) {
        const n = (counters.get(c.category) ?? 0) + 1;
        counters.set(c.category, n);
        token = `[${c.category}_${n}]`;
        valueToToken.set(key, token);
        map.set(token, c.value);
      }
      out += text.slice(cursor, c.start) + token;
      cursor = c.end;
    }
    out += text.slice(cursor);

    return { text: out, map };
  }

  rehydrate(text: string, map: RedactionMap): string {
    // Langste tokens eerst zodat [X_1] niet binnen [X_10] vervangt.
    const tokens = [...map.keys()].sort((a, b) => b.length - a.length);
    let out = text;
    for (const token of tokens) {
      out = out.split(token).join(map.get(token) as string);
    }
    return out;
  }
}
