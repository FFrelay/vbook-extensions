---
name: vbook-extensions
description: Create, fix, test, or refactor vBook extensions against the current engine API (extension-api.md + the real ScriptExecutor runtime) — novel/comic/video/tts/translate types, explore sections, richer detail/config schema. Tests, builds, and installs via the `scripts/vbook.js` CLI against the vBook local REST API. Trigger when the user wants a new extension built, an existing one fixed/updated, audited/tested for which script is failing, or refactored to the current template style, and mentions the vBook server / extension-api.md / newer script fields (explore, tags, format, track).
---

# vBook extensions (current engine, REST-API-driven)

Read before writing any script:

- **`reference/extension-api.md`** — field/script contract, `plugin.json` shape, JS API surface. Copy of the repo-root `extension-api.md` — re-copy if it changes.

The Constraints and JS engine/HTML parser sections below are distilled from the engine's `ScriptExecutor.kt` and Rhino/jsoup setup directly — treat them as verified ground truth, not guesses.

A prior engine version used a different contract (flat `code:200/403`, no `explore`, no video/tts/translate, `let BASE_URL = ...; try { if (CONFIG_URL) ... }` config override, `detail.js` fields named `genres/suggests/comments` instead of `tags/genres/suggests/reviews/comments`). Repo-root folders like `wikidich/`, `truyenqq/` are old-contract examples — never mix that contract into a new extension.

## Constraints

1. **`load('file.js')`** — literal string only, exactly `load('name.js');`. Not recursive: a loaded library must not itself contain a `load(...)` call. `crypto.js` is reserved — always resolves to the bundled CryptoJS, ignoring any `src/crypto.js`.

2. **Never declare a variable with the same name as a `plugin.json.config` key** (`let DOMAIN = ...`). Every config key is injected as `const KEY = "..."` before the script runs — redeclaring is a `SyntaxError` that kills the whole script. No override boilerplate. Config values are always strings — parse yourself: `parseInt(THREAD_NUM, 10)`, `IS_TOGGLE === "true"`.
   - Reserved key names — never declare in `plugin.json.config`: `thread_num`, `timeout`, `delay` (own UI section, read-only), `ignore` (app-injected enable/disable flag).

3. **Every `execute(...)` argument is a string.** Guard with `param || default`, parse with `parseInt`/string-compare — never assume a real number or boolean.

4. **The next-page token (`data2` in `Response.success(items, next)`) must be a string.** Convert with `.toString()` if computed as a number. `""` means no more pages — never `null`/`0`/a bare number.

5. **Uncaught JS exceptions kill the whole call, not `Response.error`.** Check `.isEmpty()`/`.size()` before chaining `.attr()`/`.text()` into a selector that might not match. Use explicit `Response.error("...")` for expected failure paths.

6. **One script file = one `execute` function.** No multi-function exports.

7. **The app strips a trailing `/` off `url` before calling `execute(url)`.** Re-add it inside the script if the site needs it.

8. **Normalize the incoming `url`'s host to `BASE_URL` before fetching, in every `url`-receiving script** (`detail`/`toc`/`chap`/`page` in the `novel`/`comic` templates): `url = normalizeUrl(url);` — the function lives once in `config.js` (`load('config.js');` required), not repeated per script. The incoming url may carry an old/mirror/www-prefixed host (from a stale library entry, a redirect, or a config-selected mirror) — rewriting the host to `BASE_URL` before `fetch()` keeps requests on the currently-configured domain regardless of where the url came from.

## JS engine & HTML parser (Rhino / jsoup)

Engine: Rhino `1.8.1`, `languageVersion = Context.VERSION_ES6`, `initSafeStandardObjects()`. HTML: jsoup `Document`/`Elements`/`Element` behind `Html`/`fetch(...).html()`.

**Rhino:**

- Do not use: `async`/`await`, `?.`, `??`, object/array spread (`{...obj}`), `Array.prototype.flat`/`flatMap`, numeric separators (`1_000`).
- Use instead: sequential calls, `obj && obj.prop`, `x || default`, `Object.assign`/`.concat()`/`for` loops.
- Write `function (el) { ... }` + `+` concatenation — not arrow functions, not template literals.
- No Java interop: `java.*`, `Packages.*`, `importClass`/`importPackage` unavailable. Only the bridged surface in `reference/extension-api.md` exists.
- Coerce host-returned values explicitly: `String(x)`, `parseInt(x, 10)`, `Number(x)`. Never branch on `typeof` across the JS/host boundary.
- Regex: no named capture groups `(?<name>...)`, no lookbehind `(?<=...)`/`(?<!...)`. Plain capture groups only.

**jsoup:**

- Selectors are jsoup's own dialect (`:contains()`, `:has()`, `a[href^=http]`), not `document.querySelector` — no `:visible`, no XPath.
- jsoup inserts implied tags (e.g. `<tbody>`) and auto-closes unclosed ones — if a selector matching raw view-source doesn't match `.select(...)`, log `doc.html()` and check the parsed structure.
- `Element.attr("name")` returns `""` when missing — never `null`/`undefined`.
- `Elements.first()` on an empty selection returns `null` — guard with `.isEmpty()`/`.size()` before chaining.
- `.attr()` on an `Elements` collection reads the first element; `.text()` on the same collection concatenates every matched element's text. Add `.first()` explicitly for one element.
- `.attr("href")` returns the raw value, not absolute — prepend `DOMAIN` yourself, or use `.absUrl("href")`.

## Hard rule: always check `response.ok`

`fetch()`/`Http.get()` never throws on HTTP error status. Never call `.html()`/`.json()`/`.text()`/`.base64()` before checking `.ok`:

```js
let response = fetch(url);
if (!response.ok) return Response.error("HTTP " + response.status);
let doc = response.html();
```

## Templates

`templates/<type>/` — full starter set per content type, every script in `extension-api.md`'s "Required scripts per type" table (✓ and ○), not just the mandatory core. `SELECTOR_*` placeholders get filled from real fetched HTML. Delete a file only if the site genuinely can't support it.

**Strip the template's teaching comments when shipping a real extension.** The `//` comments in template files (the file-header explainer in `config.js`, `page.js`, `chap.js`, `comments.js`, the inline `// browsing a tab: ...` / `// Many comic sites lazy-load ...` notes, etc.) exist to guide you while filling the template — they are not part of a finished extension. Remove them from every script before build/install; keep only comments that document genuinely non-obvious site-specific logic you added yourself.

- `templates/novel/` — config, home, explore, genre, search, detail, toc, chap, similar, comments
- `templates/comic/` — config, home, explore, genre, search, detail, toc, page, chap, similar, comments — `page`/`chap` are alternative implementations of the **required** per-chapter image list. Exactly one must remain (and be declared in `plugin.json.script`) — never ship both, never delete both.
- `templates/video/` — config, home, explore, genre, search, detail, toc, chap, track, similar, comments — video playback is a `chap`→`track` chain: `chap.js` lists an episode's servers `[{title, data}]`, `track.js` resolves a chosen `data` to the stream (see `reference/extension-api.md`)
- `templates/tts/` — voice, tts
- `templates/translate/` — language, translate

`novel`/`comic`/`video` only: `config.js` hardcodes the current site URL as `let BASE_URL = "https://...";`, then overrides it with the `DOMAIN` config key inside a `try/catch` (`if (DOMAIN) BASE_URL = DOMAIN;`). This order is deliberate — the hardcoded default keeps `BASE_URL` valid even if the app doesn't inject `DOMAIN` (the `ReferenceError` on the bare `DOMAIN` read is caught, `BASE_URL` stays the hardcode); if `DOMAIN` is injected, it wins. Never write `let BASE_URL = DOMAIN;` at top level — that throws an uncaught `ReferenceError` and kills the script when `DOMAIN` is absent. Scripts that need the site's base URL do `load('config.js');` and use `BASE_URL`, never `DOMAIN` directly. Safe under constraint 2 because the name (`BASE_URL`) differs from the config key (`DOMAIN`) it aliases — no redeclaration collision. `tts`/`translate` templates use a hardcoded engine URL directly, no alias, no shim.

`similar.js`/`comments.js` aren't in `plugin.json.script` — referenced dynamically from `detail.js`'s `genres`/`suggests`/`reviews`/`comments` fields by filename. `search.js` doubles as the target for `home.js`/`genre.js` tabs (branches on whether `query` looks like a path/URL vs. a keyword) — a real site's tabs may need dedicated listing scripts if their endpoints don't fit that branch.

## Pick the mode

Read only the file for the mode you're in.

- **CREATE** — new extension from a story/video/comic-site URL. Read `modes/create.md`.
- **FIX** — update an existing extension (domain change, broken selector, old→new contract migration). Read `modes/fix.md`.
- **TEST** — check an existing extension, read-only, no edits. Test all (every script, full report) or test one (single named script). Read `modes/test.md`.
- **REFACTOR** — align an existing, working extension to the current template style (config.js/BASE_URL/normalizeUrl, encrypt, field contract, comment stripping) **without changing behavior**. Read `modes/refactor.md`.

If unclear, ask. Bare URL with no verb → assume CREATE.

## Test / build / install — always via `scripts/vbook.js` (REST API, no MCP)

**Do not use MCP tools. Always use this CLI.** It talks to the vBook local REST API (`extension_docs.md`: `POST /extension/{test,build,install}`), reading `plugin.json` + `src/*.js` from disk itself so you never paste the ~20KB src map into a tool call. Run from the repo root:

```
node .claude/skills/vbook-extensions/scripts/vbook.js connect
node .claude/skills/vbook-extensions/scripts/vbook.js install <ext-dir> [--no-icon]
node .claude/skills/vbook-extensions/scripts/vbook.js test    <ext-dir> <script.js> [arg1 arg2 ...]
node .claude/skills/vbook-extensions/scripts/vbook.js build   <ext-dir> [out.zip]
```

`<ext-dir>` is repo-relative (e.g. `hhtqvietsub`). Args after the script name map to `vararg` (detail/toc/chap → `[url]`, search → `[query, page]`, track → `[episodeUrl]`, tts → `[text, voiceId]`, translate → `[text, from, to, source]`). Icon auto-included from `<ext-dir>/icon.png`; pass `--no-icon` for faster installs.

**Server URL:** the CLI picks a server in this order:
1. `--server <url>` (explicit, single, no probing)
2. env `VBOOK_SERVER` (explicit, single)
3. `scripts/servers.json` — `{ "servers": ["http://ip:port", ...] }`, each probed via `/connect`, **first that answers is used** (prints `(skipped N unreachable)` if it fell through). This file is gitignored/per-machine — copy `scripts/servers.example.json` to `scripts/servers.json` and put the real dev-server URL(s) in it.

Failure messages tell the user what to fix:
- **no server configured** (servers.json missing, no `--server`/env) → copy the example file and fill it in.
- **none responded** (all servers in the list unreachable) → the CLI lists each URL + error; tell the user to open the vBook app and turn ON debug/dev mode (that starts the server) and confirm the IP:port matches `servers.json`.
- **explicit server unreachable** → same dev-mode hint, re-run with the right `--server http://<ip>:<port>`.

Don't guess other hosts — only what's in `servers.json`/`--server`/`VBOOK_SERVER`.

**`/connect` runs first, every time.** Before any test/build/install the CLI calls `GET /connect` and prints `[connect] device: <name>` — always eyeball which device you're about to hit (e.g. installing to the wrong phone). Run `connect` alone to just check. `/connect` returns `{"code":200,"data":"<deviceName>"}`.

**`test` logs input and output.** It prints `[test] input=<the exact {script,vararg} JSON>`, then the server `log`, then `[test] output=<data>` and `[test] code=`. `code:0` in the output is the success marker for the script itself (not the HTTP status). Keep these logs when reporting — they make a run reproducible.

Since the CLI reads from disk, **save edits before running it**. For a throwaway probe, write it into the ext's `src/` dir, run, then revert.

## Done criteria

See "Done criteria" in whichever `modes/*.md` file you followed.
