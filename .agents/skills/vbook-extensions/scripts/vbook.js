#!/usr/bin/env node
// vbook extension CLI — build payload from disk, call the vBook local REST API directly
// (see extension_docs.md). No MCP. Lives in the skill dir but operates on the repo it's
// invoked from; run from the repo root:
//   node .claude/skills/vbook-extensions/scripts/vbook.js connect
//   node .claude/skills/vbook-extensions/scripts/vbook.js install <ext-dir> [--no-icon]
//   node .claude/skills/vbook-extensions/scripts/vbook.js build   <ext-dir> [outfile.zip]
//   node .claude/skills/vbook-extensions/scripts/vbook.js test    <ext-dir> <script.js> [arg1 arg2 ...]
//
// Server selection order:
//   1. --server <url>            (single explicit server, no probing)
//   2. env VBOOK_SERVER          (single explicit server, no probing)
//   3. scripts/servers.json      ({ "servers": ["http://ip:port", ...] }) — each is
//      probed via GET /connect; the FIRST that answers is used. If none answer, or
//      the file is missing/empty, it fails loudly telling you what to fix.
// Every command confirms the chosen server via /connect and prints its device.
// Icon is included for install/build if <ext-dir>/icon.png exists; omit with --no-icon.

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { URL } = require("url");

// servers.json lives next to this script (gitignored; copy servers.example.json).
const SERVERS_FILE = path.join(__dirname, "servers.json");
const SERVERS_EXAMPLE = path.join(__dirname, "servers.example.json");

function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

// The script lives under .claude/skills/vbook-extensions/scripts/ but operates on
// the repo it is invoked from — resolve everything against the current working dir.
function repoRoot() { return process.cwd(); }

// One HTTP request returning the raw response body as text (+ status).
function request(method, urlStr, bodyObj) {
  return new Promise(function (resolve, reject) {
    const u = new URL(urlStr);
    const lib = u.protocol === "https:" ? https : http;
    const body = bodyObj != null ? JSON.stringify(bodyObj) : null;
    const headers = { "Accept": "application/json" };
    if (body != null) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(body);
    }
    const req = lib.request({
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: u.pathname + u.search,
      method: method,
      headers: headers,
    }, function (res) {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", function (c) { data += c; });
      res.on("end", function () { resolve({ status: res.statusCode, text: data }); });
    });
    req.on("error", reject);
    if (body != null) req.write(body);
    req.end();
  });
}

function parseJson(text) {
  try { return JSON.parse(text); } catch (e) { return null; }
}

// Probe one server's GET /connect. Returns { ok, device, error } — never throws.
async function probeServer(server) {
  let res;
  try {
    res = await request("GET", new URL("/connect", server).toString());
  } catch (e) {
    return { ok: false, error: e.message };
  }
  const j = parseJson(res.text);
  const device = j && j.data != null ? String(j.data) : res.text.trim();
  if (res.status !== 200) {
    return { ok: false, error: "/connect returned " + res.status + " " + (device || "") };
  }
  return { ok: true, device: device };
}

// Read the server list from servers.json. Returns [] if missing/invalid.
function readServerList() {
  if (!fs.existsSync(SERVERS_FILE)) return null; // null = file not present
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(SERVERS_FILE, "utf8"));
  } catch (e) {
    die("servers.json is not valid JSON: " + e.message);
  }
  const list = Array.isArray(cfg.servers) ? cfg.servers.filter(function (s) { return typeof s === "string" && s.trim(); }) : [];
  return list;
}

// Resolve which server to use:
//   explicit (--server/env) -> probe it, use if OK
//   otherwise -> probe each in servers.json, use first that answers
// Prints the chosen device. Fails loudly with a fix hint otherwise.
async function resolveServer(explicit) {
  if (explicit) {
    const r = await probeServer(explicit);
    if (!r.ok) {
      die("cannot reach vBook server at " + explicit + " (" + r.error + ").\n" +
          "  -> On the phone, open the vBook app and turn ON debug/dev mode (starts the local server),\n" +
          "     then re-run with --server http://<ip>:<port> (or set VBOOK_SERVER).");
    }
    console.log("[connect] device: " + (r.device || "(unknown)") + "  @ " + explicit);
    return explicit;
  }

  const list = readServerList();
  if (list === null) {
    die("no server configured.\n" +
        "  -> Copy " + relToRepo(SERVERS_EXAMPLE) + " to " + relToRepo(SERVERS_FILE) + " and put your\n" +
        "     vBook dev-server URL(s) in it (open the vBook app, turn ON debug/dev mode to see the IP:port).\n" +
        "     Or pass --server http://<ip>:<port> / set VBOOK_SERVER.");
  }
  if (list.length === 0) {
    die("servers.json has no servers listed. Add at least one \"http://<ip>:<port>\" to its \"servers\" array,\n" +
        "  or pass --server http://<ip>:<port>.");
  }

  const failures = [];
  for (let i = 0; i < list.length; i++) {
    const server = list[i];
    const r = await probeServer(server);
    if (r.ok) {
      console.log("[connect] device: " + (r.device || "(unknown)") + "  @ " + server +
                  (failures.length ? "  (skipped " + failures.length + " unreachable)" : ""));
      return server;
    }
    failures.push(server + " -> " + r.error);
  }
  die("none of the " + list.length + " server(s) in servers.json responded:\n" +
      failures.map(function (f) { return "  - " + f; }).join("\n") + "\n" +
      "  -> Open the vBook app and turn ON debug/dev mode, confirm the IP:port matches servers.json.");
}

// Display a path relative to the repo root for friendlier messages.
function relToRepo(p) {
  const rel = path.relative(repoRoot(), p);
  return rel && !rel.startsWith("..") ? rel : p;
}

// Build { plugin, src, icon? } from an extension directory on disk.
function buildPayload(extDir, wantIcon) {
  const dir = path.resolve(repoRoot(), extDir);
  const pluginPath = path.join(dir, "plugin.json");
  const srcDir = path.join(dir, "src");
  if (!fs.existsSync(pluginPath)) die("plugin.json not found in " + dir);
  if (!fs.existsSync(srcDir)) die("src/ not found in " + dir);

  const src = {};
  for (const f of fs.readdirSync(srcDir)) {
    if (f.endsWith(".js")) src[f] = fs.readFileSync(path.join(srcDir, f), "utf8");
  }
  const payload = {
    plugin: fs.readFileSync(pluginPath, "utf8"),
    src: JSON.stringify(src),
  };
  if (wantIcon) {
    const iconPath = path.join(dir, "icon.png");
    if (fs.existsSync(iconPath)) payload.icon = fs.readFileSync(iconPath).toString("base64");
  }
  return payload;
}

// Pull an explicit --server <url> out of argv; else env VBOOK_SERVER; else null
// (null means "probe servers.json"). Splices --server out of args in place.
function extractServer(args) {
  const i = args.indexOf("--server");
  if (i !== -1) {
    const val = args[i + 1] || die("--server needs a URL");
    args.splice(i, 2);
    return val;
  }
  return process.env.VBOOK_SERVER || null;
}

async function main() {
  const argv = process.argv.slice(2);
  const noIcon = argv.indexOf("--no-icon") !== -1;
  let args = argv.filter(function (a) { return a !== "--no-icon"; });
  const explicit = extractServer(args);
  const cmd = args[0];

  if (cmd === "connect") {
    await resolveServer(explicit);
    return;
  }

  const extDir = args[1];
  if (!cmd || !extDir) {
    console.error("usage: node .claude/skills/vbook-extensions/scripts/vbook.js <connect|install|build|test> <ext-dir> [...] [--server <url>] [--no-icon]");
    process.exit(2);
  }

  // Resolve + confirm the target device first; every command runs against this server.
  const server = await resolveServer(explicit);

  if (cmd === "install") {
    const p = buildPayload(extDir, !noIcon);
    const res = await request("POST", new URL("/extension/install", server).toString(), p);
    const j = parseJson(res.text);
    if (res.status !== 200 || (j && j.code && j.code !== 200)) {
      die("install failed (" + res.status + "): " + res.text);
    }
    console.log("[install] OK  code=" + (j && j.code != null ? j.code : res.status));
  } else if (cmd === "build") {
    const outFile = args[2] || path.join(path.resolve(repoRoot(), extDir), "plugin.zip");
    const p = buildPayload(extDir, !noIcon);
    const res = await request("POST", new URL("/extension/build", server).toString(), p);
    const j = parseJson(res.text);
    if (res.status !== 200 || !j || j.code !== 200 || !j.data) {
      die("build failed (" + res.status + "): " + res.text);
    }
    fs.writeFileSync(outFile, Buffer.from(j.data, "base64"));
    console.log("[build] wrote " + outFile + " (" + fs.statSync(outFile).size + " bytes)");
  } else if (cmd === "test") {
    const script = args[2];
    if (!script) die("test needs a script name, e.g. detail.js");
    const vararg = args.slice(3);
    const p = buildPayload(extDir, false);
    p.input = JSON.stringify({ script: script, vararg: vararg });

    // Log exactly what we send so runs are reproducible.
    console.log("[test] script=" + script);
    console.log("[test] input=" + p.input);

    const res = await request("POST", new URL("/extension/test", server).toString(), p);
    const j = parseJson(res.text);
    if (res.status !== 200) {
      die("test HTTP " + res.status + ": " + res.text);
    }
    // Server shape: { code, log, data } on success; { code, log, message } on error.
    if (j) {
      if (j.log) console.log("[test] log:\n" + j.log);
      const out = j.data != null ? j.data : (j.message != null ? j.message : j);
      console.log("[test] output:\n" + (typeof out === "string" ? out : JSON.stringify(out, null, 2)));
      console.log("[test] code=" + j.code);
    } else {
      console.log("[test] raw:\n" + res.text);
    }
  } else {
    die("unknown command: " + cmd);
  }
}

main().catch(function (e) { die(e.message); });
