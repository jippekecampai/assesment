import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { createHubClient, HubError } from "./lib/hub.mjs";
import { getUserToken } from "./lib/auth.mjs";
import { buildSourceMaterial } from "./lib/source-material.mjs";
import { createStore } from './lib/candidate-store.mjs';
import { startAssessment, submitAssessment, AssessmentError } from './lib/assessment-service.mjs';
import { generateCode } from './lib/codes.mjs';
import { roles, domains, testQuestions } from './lib/assessment-content.mjs';
import { createQuestionBank } from './lib/question-bank.mjs';
import { generateQuestions, isConfigured as aiConfigured, AiError } from './lib/ai-client.mjs';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const candidateStore = createStore({ filePath: join(root, 'data', 'candidates.json') });
const questionBank = createQuestionBank({ filePath: join(root, 'data', 'questions.json') });
function requireStaff(request, response) {
  if (!request.headers['x-ms-client-principal'] && !process.env.AUTH_DEV_MODE) {
    sendJson(response, 401, { error: 'auth_required' }); return false;
  }
  return true;
}
const host = process.env.HOST || (process.env.WEBSITE_SITE_NAME ? "0.0.0.0" : "127.0.0.1");
const dataPath = join(root, "data", "assessment-results.json");
const tableName = process.env.ASSESSMENT_TABLE || "AssessmentResults";

// React/Vite-build (npm run build → dist/). server.mjs serveert de statische
// build + SPA-fallback en proxyt /api naar de hub/Azure. In dev gebruik je
// `npm run dev` (Vite dev-server met HMR) — deze server is voor productie.
const distDir = join(root, "dist");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8"
};

async function getTableClient() {
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) return null;

  try {
    const { TableClient } = await import("@azure/data-tables");
    return TableClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, tableName);
  } catch (error) {
    console.warn(`Azure Table Storage is niet beschikbaar, lokale datastore actief: ${error.message}`);
    return null;
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readIdentity(request) {
  const principal = request.headers["x-ms-client-principal"];
  if (!principal) {
    return {
      authenticated: false,
      name: "Lokale tester",
      email: "local@campai.nl"
    };
  }

  try {
    const decoded = JSON.parse(Buffer.from(principal, "base64").toString("utf8"));
    const claims = decoded.claims || [];
    const claim = (type) => claims.find((item) => item.typ === type)?.val;

    return {
      authenticated: true,
      name: claim("name") || decoded.userDetails || "Campai gebruiker",
      email: decoded.userDetails || claim("preferred_username") || claim("email") || "",
      provider: decoded.auth_typ || "aad"
    };
  } catch {
    return {
      authenticated: true,
      name: "Campai gebruiker",
      email: ""
    };
  }
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function readLocalResults() {
  try {
    return JSON.parse(await readFile(dataPath, "utf8"));
  } catch {
    return [];
  }
}

async function writeLocalResult(entity) {
  const records = await readLocalResults();
  records.unshift(entity);
  await mkdir(join(root, "data"), { recursive: true });
  await writeFile(dataPath, JSON.stringify(records.slice(0, 250), null, 2));
}

async function listResults() {
  const client = await getTableClient();
  if (!client) return readLocalResults();

  const rows = [];
  for await (const entity of client.listEntities()) {
    rows.push({
      id: entity.rowKey,
      createdAt: entity.createdAt,
      user: entity.user,
      payload: JSON.parse(entity.payload || "{}")
    });
  }
  return rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 100);
}

async function saveResult(payload, identity) {
  const now = new Date().toISOString();
  const entity = {
    partitionKey: "campai",
    rowKey: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    id: "",
    createdAt: now,
    user: identity.email || identity.name,
    payload
  };
  entity.id = entity.rowKey;

  const client = await getTableClient();
  if (client) {
    await client.createTable().catch((error) => {
      if (error.statusCode !== 409) throw error;
    });
    await client.createEntity({
      partitionKey: entity.partitionKey,
      rowKey: entity.rowKey,
      createdAt: entity.createdAt,
      user: entity.user,
      payload: JSON.stringify(payload)
    });
    return entity;
  }

  await writeLocalResult(entity);
  return entity;
}

function hubConfigured() {
  return Boolean(process.env.HUB_BASE_URL && process.env.HUB_APP_TOKEN);
}

async function getHub() {
  const userToken = await getUserToken();
  return createHubClient({ userToken });
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, mode: "campai-only" });
    return true;
  }

  if (url.pathname === "/api/me") {
    sendJson(response, 200, readIdentity(request));
    return true;
  }

  if (url.pathname === "/api/results" && request.method === "GET") {
    sendJson(response, 200, await listResults());
    return true;
  }

  if (url.pathname === "/api/results" && request.method === "POST") {
    try {
      const entity = await saveResult(await readRequestBody(request), readIdentity(request));
      sendJson(response, 201, { id: entity.id, createdAt: entity.createdAt });
    } catch (error) {
      sendJson(response, 500, { error: "result_save_failed", message: error.message });
    }
    return true;
  }

  if (url.pathname === "/api/hub/companies" && request.method === "GET") {
    if (!hubConfigured()) { sendJson(response, 503, { error: "hub_unconfigured" }); return true; }
    try {
      const hub = await getHub();
      const companies = await hub.companies.list();
      sendJson(response, 200, companies.map((c) => ({ id: c.id, name: c.name, city: c.city ?? null })));
    } catch (error) {
      const status = error instanceof HubError ? 502 : 500;
      sendJson(response, status, { error: "hub_error", message: error.message });
    }
    return true;
  }

  if (url.pathname === "/api/hub/source-material" && request.method === "GET") {
    if (!hubConfigured()) { sendJson(response, 503, { error: "hub_unconfigured" }); return true; }
    const companyId = url.searchParams.get("companyId");
    if (!companyId) { sendJson(response, 400, { error: "companyId_required" }); return true; }
    try {
      const hub = await getHub();
      const items = await buildSourceMaterial(hub, companyId);
      sendJson(response, 200, { items });
    } catch (error) {
      const status = error instanceof HubError ? 502 : 500;
      sendJson(response, status, { error: "hub_error", message: error.message });
    }
    return true;
  }

  if (url.pathname === '/api/candidates' && request.method === 'GET') {
    if (!requireStaff(request, response)) return true;
    const list = (await candidateStore.listCandidates()).map(({ serverQuestions, ...c }) => c);
    sendJson(response, 200, list); return true;
  }
  if (url.pathname === '/api/candidates' && request.method === 'POST') {
    if (!requireStaff(request, response)) return true;
    const body = await readRequestBody(request);
    if (!body.naam || !roles.some((r) => r.id === body.functie)) { sendJson(response, 400, { error: 'naam_en_functie_vereist' }); return true; }
    const domeinen = Array.isArray(body.domeinen) ? body.domeinen.filter((d) => domains.includes(d)) : null;
    const code = generateCode();
    const identity = readIdentity(request);
    const candidate = await candidateStore.createCandidate({ naam: body.naam, email: body.email || null, functie: body.functie, code, aangemaaktDoor: identity.email || identity.name, domeinen: domeinen && domeinen.length ? domeinen : null });
    const { serverQuestions, ...safe } = candidate;
    sendJson(response, 201, { candidate: safe, code }); return true;
  }
  if (url.pathname === '/api/questions/generate' && request.method === 'POST') {
    if (!requireStaff(request, response)) return true;
    const b = await readRequestBody(request);
    if (!domains.includes(b.domain)) { sendJson(response, 400, { error: 'ongeldig_domein' }); return true; }
    if (!aiConfigured()) { sendJson(response, 503, { error: 'ai_not_configured' }); return true; }
    try {
      const count = Math.min(10, Math.max(1, Number(b.count) || 5));
      const concepts = await generateQuestions({ domain: b.domain, count });
      sendJson(response, 200, concepts);
    } catch (e) {
      sendJson(response, e instanceof AiError && e.code === 'not_configured' ? 503 : 502, { error: e.code || 'ai_error' });
    }
    return true;
  }
  if (url.pathname === '/api/assessment/start' && request.method === 'POST') {
    const body = await readRequestBody(request);
    try { sendJson(response, 200, await startAssessment(candidateStore, String(body.code || ''), questionBank)); }
    catch (e) { sendJson(response, e instanceof AssessmentError ? (e.code === 'already_done' ? 410 : 401) : 500, { error: e.code || 'server_error' }); }
    return true;
  }
  if (url.pathname === '/api/assessment/submit' && request.method === 'POST') {
    const body = await readRequestBody(request);
    try { sendJson(response, 200, await submitAssessment(candidateStore, String(body.code || ''), Array.isArray(body.answers) ? body.answers : [])); }
    catch (e) { sendJson(response, e instanceof AssessmentError ? (e.code === 'already_done' ? 410 : 401) : 500, { error: e.code || 'server_error' }); }
    return true;
  }

  const m = url.pathname.match(/^\/api\/candidates\/([^/]+)\/result$/);
  if (m && request.method === 'GET') {
    if (!requireStaff(request, response)) return true;
    const result = await candidateStore.getResult(decodeURIComponent(m[1]));
    if (!result) { sendJson(response, 404, { error: 'not_found' }); return true; }
    sendJson(response, 200, result);
    return true;
  }

  if (url.pathname === '/api/questions/coverage' && request.method === 'GET') {
    if (!requireStaff(request, response)) return true;
    const approved = await questionBank.listApproved();
    const coverage = {};
    for (const domain of domains) {
      const seed = testQuestions.filter((q) => q.domain === domain).length;
      const approvedCount = approved.filter((q) => q.domain === domain).length;
      coverage[domain] = { seed, approved: approvedCount, total: seed + approvedCount };
    }
    sendJson(response, 200, coverage); return true;
  }

  if (url.pathname === '/api/questions' && request.method === 'GET') {
    if (!requireStaff(request, response)) return true;
    sendJson(response, 200, await questionBank.listApproved()); return true;
  }
  if (url.pathname === '/api/questions' && request.method === 'POST') {
    if (!requireStaff(request, response)) return true;
    const b = await readRequestBody(request);
    if (!domains.includes(b.domain) || !Array.isArray(b.options) || b.options.length !== 4 || !Number.isInteger(b.answer) || b.answer < 0 || b.answer > 3 || !b.prompt) {
      sendJson(response, 400, { error: 'ongeldige_vraag' }); return true;
    }
    const identity = readIdentity(request);
    const q = await questionBank.addApproved({ domain: b.domain, type: b.type || 'Scenario', prompt: b.prompt, options: b.options, answer: b.answer, source: b.source || 'Handmatig', approvedBy: identity.email || identity.name });
    sendJson(response, 201, q); return true;
  }
  const dm = url.pathname.match(/^\/api\/questions\/([^/]+)$/);
  if (dm && request.method === 'DELETE') {
    if (!requireStaff(request, response)) return true;
    await questionBank.removeApproved(decodeURIComponent(dm[1]));
    sendJson(response, 200, { ok: true }); return true;
  }

  return false;
}

function serveFile(response, filePath) {
  response.writeHead(200, { "Content-Type": types[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${host}:${port}`);
  if (url.pathname.startsWith("/api/") && await handleApi(request, response, url)) return;

  if (!existsSync(distDir)) {
    response.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Build ontbreekt — draai eerst `npm run build` (of gebruik `npm run dev`).");
    return;
  }

  const safePath = normalize(decodeURIComponent(url.pathname))
    .replace(/^[/\\]+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  const filePath = join(distDir, safePath === "" ? "index.html" : safePath);

  // Bestaand asset serveren; anders SPA-fallback naar index.html.
  if (safePath !== "" && existsSync(filePath) && statSync(filePath).isFile()) {
    serveFile(response, filePath);
    return;
  }

  serveFile(response, join(distDir, "index.html"));
}).listen(port, host, () => {
  console.log(`Campai Assessment running at http://${host}:${port}`);
});
