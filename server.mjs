import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || (process.env.WEBSITE_SITE_NAME ? "0.0.0.0" : "127.0.0.1");
const dataPath = join(root, "data", "assessment-results.json");
const tableName = process.env.ASSESSMENT_TABLE || "AssessmentResults";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
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

  return false;
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${host}:${port}`);
  if (url.pathname.startsWith("/api/") && await handleApi(request, response, url)) return;

  const safePath = normalize(decodeURIComponent(url.pathname))
    .replace(/^[/\\]+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath === "" ? "index.html" : safePath);

  if (!existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": types[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Campai Assessment running at http://${host}:${port}`);
});
