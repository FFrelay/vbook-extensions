# AGENTS.md — vbook-extensions

## Repo structure

```
vbook-extensions/
├── plugin.json          # Root registry (extension listing)
├── ExtensionMaker.jar   # Java tool for on-device testing (JDK ≥8)
├── vbook-tool/          # Node.js CLI for extension dev
│   ├── index.js         # Entry: `node index.js <command>` or `./vbook <command>`
│   ├── .env             # Config: author, VBOOK_IPS, VBOOK_PORT, GITHUB_REPO
│   ├── context/         # Detailed docs (read per task)
│   └── vbook-mcp-server.js  # MCP server for AI agent tool calling
├── extensions/69shuba/             # Example extension (chinese_novel)
└── <name>/              # Other extensions live at root level (not extensions/<name>)
```

## VBook runtime (Rhino ES5 — critical)

Scripts run on Rhino engine. **Never use:**
- `async/await`, `?.`, `??`, `...` spread, default params, `import/export`
- `String.matchAll`, `Promise.any`, `Promise.allSettled`

**Must do:**
- Every script exports `function execute(...)` returning `Response.success()` or `Response.error()`
- Convert Java strings: `.text() + ""`, `.attr("href") + ""`, `.html() + ""`
- `nextPage` must be `String(...)` or `null`, never a number
- `chap.js` returns HTML string (not object)
- Always close `Engine.newBrowser()` in `finally`
- `page.js` is required (minimum: `return Response.success([url])`)
- `config.js` must use `let BASE_URL` with `CONFIG_URL` override pattern
- `plugin.json` script values are filenames only, never `src/file.js`

## CLI commands

| Command | Description |
|---|---|
| `./vbook check-env` | Test device connectivity (run first) |
| `./vbook analyze <url>` | Auto-detect CSS selectors via VBook Browser |
| `./vbook create <name>` | Scaffold extension from template |
| `./vbook validate` | Check Rhino compat + extension structure |
| `./vbook debug <file>` | Run one script on device (`--json`, `-in <url>`) |
| `./vbook test-all` | Full chain test (`--from <step>`, `--skip <step>`) |
| `./vbook install` | Push extension to device |
| `./vbook build --bump` | Package `plugin.zip` + bump version |
| `./vbook publish` | Build + update root `plugin.json` registry |

Install deps: `npm install` in `vbook-tool/`. Run wrapper: `./vbook <cmd>` (Linux/macOS) or `.\vbook.ps1` (Windows).

## Required workflow order

```
check-env → (create|read extension) → diagnose/inspect → write scripts
→ validate → debug → test-all → build --bump → publish
```

Gates (enforced by MCP gate system):
- `validate` must pass before `debug`
- `debug` must pass before `test-all`
- `test-all` must pass before `build`/`publish`
- Version must be bumped before publish

## Dev setup

`.env` in `vbook-tool/`:
```
author=FFrelay
VBOOK_IPS=192.168.x.x     # From VBook app → Web Server
VBOOK_PORT=8080
GITHUB_REPO=user/repo
```

Device must be on same LAN. VBook → Settings → tap version 7× → Developer tools → Web Server.

## Context docs

Read these when working on extensions (`vbook-tool/context/`):
- `00_BOOTSTRAP.md` — session start
- `01_runtime.md` — Rhino rules (required reading)
- `01_runtime_api.md` — full API reference
- `02_workflow.md` — required AI workflow
- `03_HARD_SITES.md` — Cloudflare, Next.js, GBK, etc.
- `03_lessons.md` — accumulated lessons
- `04_demo.md` — extension contracts and return types
- `05_repair.md` — repair flow for broken extensions
- `Crypto_Bridge.md` — crypto API reference

## Key conventions

- Use `fetch()` before `Engine.newBrowser()`. Browser is only for JS-rendered or protected sites.
- For GBK Chinese sites: `response.html("gbk")`
- `regexp` in `plugin.json` should match detail URLs only
- Extensions use `load("config.js")` at top of each script for `BASE_URL`
- Playwright/Chrome discovery guides code; VBook `debug` is the final runtime check
- No guessing selectors — inspect or analyze real pages
