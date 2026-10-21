/* Campai Assessment — runtime voor claude.ai-artifacts op deze site (lib/artifacts.mjs).
 *
 * Bootst window.claude.use() na, zoals de klantportal-schil in campai-portal-v2 dat doet:
 *   sample    → POST /api/ai/sample (het AI-model van deze server, alleen na SSO-login)
 *   user      → GET /api/me (de ingelogde Campai-medewerker)
 *   downloads → een gewone browserdownload
 * Andere capabilities (mcp, db, …) geven null; een artifact verbergt die functies dan zelf.
 * In claude.ai bestaat window.claude al en doet deze laag niets.
 */
(() => {
  if (window.claude) return;
  const CFG = window.__cmpArtifact || {};
  const ALLOWED = new Set(CFG.capabilities || []);

  const fout = (code, message, extra) => Object.assign({ code, message }, extra || {});
  function vertaal(status, body) {
    if (status === 401 || status === 403) return fout('session_expired', 'Je sessie is verlopen. Laad de pagina opnieuw.');
    if (status === 429) return fout('rate_limited', 'Te veel vragen achter elkaar.');
    if (status === 503) return fout('sampling_disabled', 'AI is op deze site niet ingesteld.');
    if (status === 400) return fout('prompt_too_large', (body && body.error) || 'Ongeldige of te grote vraag.');
    return fout('upstream_error', 'Het AI-model gaf geen antwoord.');
  }

  async function vraag(input, opts) {
    let res;
    try {
      res = await fetch('/api/ai/sample', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ input, maxTokens: opts.maxTokens }),
        signal: opts.signal,
      });
    } catch (e) {
      if (e && e.name === 'AbortError') throw fout('cancelled', 'Afgebroken.');
      throw fout('upstream_error', 'Geen verbinding met de server.');
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw vertaal(res.status, body);
    return body;
  }

  const sample = async (input, opts = {}) => {
    const r = await vraag(input, opts);
    if (opts.onText) { try { opts.onText({ text: r.text, delta: r.text }); } catch { /* handler van de pagina */ } }
    return { text: r.text, truncated: Boolean(r.truncated) };
  };
  sample.json = async (input, opts = {}) => {
    const r = await vraag(input, opts);
    const t = String(r.text || '');
    const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fenced ? fenced[1] : t.slice(Math.min(...['{', '['].map((c) => (t.indexOf(c) < 0 ? Infinity : t.indexOf(c)))));
    try { return JSON.parse(raw); } catch { throw fout('invalid_json', 'Het antwoord was geen JSON.', { text: t }); }
  };
  sample.limits = async () => ({ tools: false, images: false, bron: 'campai-assessment' });

  let meP = null;
  const me = () => (meP ??= fetch('/api/me', { credentials: 'same-origin' }).then((r) => r.json()).catch(() => ({ authenticated: false })));
  const user = {
    async me() { const m = await me(); return { id: m.entraOid || null, name: m.name || '', email: m.email || null, avatarUrl: '', color: '#0bb4ed', isOwner: false, canEdit: false }; },
    async id() { return (await this.me()).id; },
    async name() { return (await this.me()).name; },
    async isOwner() { return false; },
    async canEdit() { return false; },
    async can() { return null; },
    async profiles(ids) { const m = await this.me(); const out = {}; for (const id of [].concat(ids || [])) out[id] = { id, name: id === m.id ? m.name : '', avatarUrl: '', color: '#0bb4ed', email: null, isMe: id === m.id, guest: false }; return out; },
  };

  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([typeof data === 'string' ? data : JSON.stringify(data)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename || 'download'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return { ok: true };
    },
  };

  const caps = { sample, user, downloads };
  window.claude = { use: async (naam) => (ALLOWED.has(naam) && caps[naam]) || null, runtime: 'campai-assessment' };
})();
