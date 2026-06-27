const REGEX_PATTERNS = [
  { category: 'EMAIL', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { category: 'IBAN', re: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,8}\b/g },
  { category: 'IP', re: /\b\d{1,3}(?:\.\d{1,3}){3}\b/g },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class PromptSanitizer {
  sanitize(text, entities = []) {
    const candidates = [];
    for (const entity of entities) {
      const value = entity.value?.trim();
      if (!value) continue;
      const re = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(value)}(?![A-Za-z0-9])`, 'gi');
      for (let m = re.exec(text); m; m = re.exec(text)) {
        candidates.push({
          start: m.index,
          end: m.index + m[0].length,
          value,
          category: entity.category,
        });
      }
    }
    for (const { category, re } of REGEX_PATTERNS) {
      re.lastIndex = 0;
      for (let m = re.exec(text); m; m = re.exec(text)) {
        candidates.push({
          start: m.index,
          end: m.index + m[0].length,
          value: m[0],
          category,
        });
      }
    }
    candidates.sort((a, b) => a.start - b.start || b.end - a.end);
    const accepted = [];
    let consumedUntil = -1;
    for (const c of candidates) {
      if (c.start >= consumedUntil) {
        accepted.push(c);
        consumedUntil = c.end;
      }
    }
    const map = new Map();
    const valueToToken = new Map();
    const counters = new Map();
    let out = '';
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

  rehydrate(text, map) {
    const tokens = [...map.keys()].sort((a, b) => b.length - a.length);
    let out = text;
    for (const token of tokens) {
      out = out.split(token).join(map.get(token));
    }
    return out;
  }
}
