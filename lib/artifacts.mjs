// lib/artifacts.mjs
// Artifacts uit claude.ai die hier achter SSO draaien (hetzelfde principe als de klantportal-schil in
// campai-portal-v2): de pagina blijft byte-gelijk aan het artifact, en artifacts/runtime.js bootst
// window.claude.use() na op deze server. Alleen wat de runtime kan leveren werkt; de rest geeft null,
// net als in claude.ai wanneer een capability ontbreekt.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Nog geen artifacts: de oefentoetsen draaien nu als gewone oefensets (lib/oefenen.mjs). Een nieuw artifact
// zet je in artifacts/ en registreer je hier met de capabilities die de runtime kan leveren.
export const ARTIFACTS = [];

const SKELET_START = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>';

// De runtime moet vóór de scripts van het artifact staan: direct na <body>. Een fragment zonder eigen
// skelet (zoals de klantconsole) krijgt er een.
export function injectRuntime(html, artifact) {
  const cfg = `<script>window.__cmpArtifact=${JSON.stringify({ slug: artifact.slug, capabilities: artifact.capabilities })};</script><script src="/apps/runtime.js"></script>`;
  const m = html.match(/<body[^>]*>/i);
  if (m) return html.slice(0, m.index + m[0].length) + cfg + html.slice(m.index + m[0].length);
  return SKELET_START + cfg + html + '</body></html>';
}

export async function loadArtifactPage(root, slug) {
  const artifact = ARTIFACTS.find((a) => a.slug === slug);
  if (!artifact) return null;
  const html = await readFile(join(root, 'artifacts', artifact.bestand), 'utf8');
  return injectRuntime(html, artifact);
}

// Eenvoudige limiet per gebruiker voor de AI-aanroepen van artifacts (de app draait als één instantie).
export function createRateLimiter({ max = 60, windowMs = 3600_000, now = () => Date.now() } = {}) {
  const hits = new Map();
  return (key) => {
    const t = now();
    const recent = (hits.get(key) || []).filter((x) => t - x < windowMs);
    if (recent.length >= max) { hits.set(key, recent); return false; }
    recent.push(t); hits.set(key, recent); return true;
  };
}

const MAX_TEKENS = 40000;

// Invoer van sample(): een string of een lijst beurten die op een user-beurt eindigt (contract van claude.ai).
export function toMessages(input) {
  if (typeof input === 'string') {
    if (!input.trim() || input.length > MAX_TEKENS) return null;
    return [{ role: 'user', content: input }];
  }
  if (!Array.isArray(input) || !input.length) return null;
  const msgs = input.map((t) => ({ role: t && t.role === 'assistant' ? 'assistant' : 'user', content: typeof t?.content === 'string' ? t.content : '' }));
  if (msgs[msgs.length - 1].role !== 'user') return null;
  if (msgs.reduce((n, m) => n + m.content.length, 0) > MAX_TEKENS) return null;
  return msgs;
}
