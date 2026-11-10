# vBook Extension JS API

Extensions are JavaScript files that tell vBook how to fetch content from websites. Each extension declares a set of named scripts in `plugin.json`; each script is one `.js` file with one `execute(...)` function that vBook calls with specific arguments and expects a `Response.success`/`Response.error` return.

Working starter code (full script sets per type, with error handling already applied) lives in `.claude/skills/vbook-extensions/templates/<type>/` — this document is the field/API contract, not a copy-paste source.

## Quick reference

**Response format** — every script returns via the `Response` helper, never a raw value:

```js
return Response.success(data, data2);   // -> { "code": 0, "data": ..., "data2": ... }
return Response.error("message");       // -> { "code": 1, "data": "message" }
```

**`type` values** (`plugin.json.metadata.type`):

| Value | Description |
|-------|-------------|
| `novel` | Text-based books (novel, light novel, web novel) |
| `comic` | Image-based comics (manga, manhwa, manhua) |
| `video` | Video content (series, anime). Playable formats: `series`, `stream` |
| `audio` | Audio content — parsed but **not yet playable** (no audio player) |
| `tts` | Text-to-speech engine |
| `translate` | Translation engine |

**Script signatures** — every argument arrives as a **string**, always; guard optionals with `param || defaultValue`:

| Key | Purpose | `execute(...)` signature |
|-----|---------|--------------------------|
| `home` | Home page tabs | `execute()` |
| `explore` | Explore page sections | `execute()` |
| `genre` | Genre/tag list | `execute()` |
| `search` | Search items | `execute(query, page)` |
| `detail` | Item detail page | `execute(url)` |
| `toc` | Chapter list | `execute(url)` |
| `chap` | Chapter content | `execute(url)` |
| `track` | Video/audio track | `execute(data)` |
| `page` | Comic page list | `execute(url)` |
| `voice` | TTS voice + language list | `execute()` |
| `tts` | TTS synthesis | `execute(text, voiceId)` |
| `language` | Translate language list | `execute()` |
| `translate` | Translate text | `execute(text, from, to, source)` |

**Required scripts per `type`** — `✓` required, `○` optional, `—` not used. Any script listed in `plugin.json.script` must exist in `src/`; scripts never called for a type can be omitted from both.

| Script | `novel` | `comic` | `audio` | `video` | `tts` | `translate` |
|--------|:------:|:------:|:------:|:------:|:----:|:----------:|
| `search` (+ scripts it references) | ✓ | ✓ | ✓ | ✓ | — | — |
| `detail` | ✓ | ✓ | ✓ | ✓ | — | — |
| `toc` | ✓ | ✓ | ✓ | ✓ | — | — |
| `chap` | ✓ | ○¹ | ○² | ○² | — | — |
| `page` | — | ○¹ | — | — | — | — |
| `track` | — | — | ✓ | ✓ | — | — |
| `home` | ○ | ○ | ○ | ○ | — | — |
| `explore` | ○ | ○ | ○ | ○ | — | — |
| `genre` | ○ | ○ | ○ | ○ | — | — |
| `voice` | — | — | — | — | ✓ | — |
| `tts` | — | — | — | — | ✓ | — |
| `language` | — | — | — | — | — | ✓ |
| `translate` | — | — | — | — | — | ✓ |

¹ **comic** needs *either* `page` (dedicated image list) *or* `chap` returning an array. Declare at least one; if both are omitted the raw chapter URL is used as a single page.

² **video/audio** `track` is required; `chap` is optional and declares the `chap`→`track` chain (`chap` lists an episode's servers, `track` resolves the chosen one). Omit `chap` and the episode url is passed straight to `track` — fine for a single-source site, but you lose per-episode server selection.

- **Content types** (`novel`/`comic`/`audio`/`video`): required core is `search` + `detail` + `toc` + the per-chapter content script (`chap`/`page`/`track`). Optional discovery scripts (`home`/`explore`/`genre`) just get hidden from the UI if omitted — `search` itself is still required (it powers both search and listing).
- **`tts`** (engine, not a content source): required `voice` (voice + language list) + `tts` (synthesize a sentence → base64 audio). Does not use the fetch scripts.
- **`translate`** (engine): required `language` (from/to list) + `translate` (translate text → string or `{ segments }`). Also skips the fetch scripts.

**Per-chapter content script by type:**

| `type` | Chapter list | Per-chapter content | Notes |
|--------|-------------|---------------------|-------|
| `novel` | `toc` | `chap` → HTML string (+ title in `data2`) | Rendered as styled HTML |
| `comic` | `toc` | `page` → image URL array; falls back to `chap` if `page` isn't declared | If both absent, the chapter URL is used as the single page |
| `video` | `toc` | `chap` → server list, then `track` → playback object | Each TOC entry is an episode. Formats: `series`, `stream` |
| `audio` | `toc` | `chap` → server list, then `track` | Parsed but **not yet playable** — no audio player wired |
| `tts` | `voice` → voices/languages | `tts` → base64 audio | Engine, not a content source |
| `translate` | `language` → from/to list | `translate` → text/segments | Engine, not a content source |

**Video/audio playback is a two-step chain, `chap` → `track`:**
1. The app calls **`chap(episodeUrl)`** first — return the list of playable **servers/sources** for that episode as `[{ title, data }, ...]` (e.g. one entry per "VIP"/"FBK" server button). `title` is shown to the user as a selectable source; `data` is an opaque handle (an embed URL, a stream URL, or any string) passed straight to `track`. A single-server episode still returns a one-element list.
2. When the user picks a source (or the first is auto-selected), the app calls **`track(data)`** with that entry's `data` — resolve it to the final playback object (`{ type, data, headers, ... }`, see track.js below). Prefer resolving to a direct `native` stream; when the real link can't be extracted, fall back to `auto` (let the app sniff it) — use `webview` only if `auto` also fails. Order: `native` → `auto` → `webview`.

Declaring only `track` (no `chap`) also works for a single-source site — the episode url is passed straight to `track` — but `chap` is what lets a site expose multiple servers per episode.

`chap`'s return shape is runtime-dispatched, not type-dispatched — a `comic` source may implement either `page` or return an array straight from `chap`, both work:

| Runtime shape | Treated as |
|---|---|
| **string** | HTML novel content (`data2` = title) |
| **array** | Comic page list (image URLs) |
| **object** | Passed through as-is (structured audio/video payloads) |

---

## Extension package layout

```
extension.zip
  plugin.json       <- manifest
  icon.png          <- extension icon (200x200, optional)
  src/
    search.js       <- script files
    detail.js
    toc.js
    chap.js
    ...
```

## plugin.json

```json
{
  "metadata": {
    "name": "Example Source",
    "author": "Author Name",
    "version": 1,
    "source": "https://example.com",
    "description": "Extension description",
    "locale": "vi",
    "regexp": "example\\.com",
    "type": "novel",
    "nsfw": false
  },
  "script": {
    "home": "home.js",
    "explore": "explore.js",
    "genre": "genre.js",
    "search": "search.js",
    "detail": "detail.js",
    "toc": "toc.js",
    "chap": "chap.js",
    "track": "track.js",
    "page": "page.js"
  },
  "config": {
    "DOMAIN": {
      "title": "Domain",
      "subtitle": "Select mirror",
      "default": "https://example.com",
      "values": ["https://example.com", "https://mirror.example.com"],
      "mode": "select",
      "format": "single"
    },
    "thread_num": {
      "title": "Threads",
      "default": "3",
      "mode": "input",
      "format": "number"
    }
  }
}
```

### metadata fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Extension display name |
| `author` | string | yes | Author name |
| `version` | int | yes | Version number (increment on update) |
| `source` | string | yes | Base URL of the website |
| `description` | string | yes | Short description |
| `locale` | string | yes | Language tag: `vi`, `en`, `zh-CN`, `global` |
| `regexp` | string | yes | Regex pattern for URL matching |
| `type` | string | yes | Content type — see Quick reference |
| `nsfw` | boolean | no | Adult content flag (default: false) |
| `encrypt` | boolean | no | Script encryption flag |

### config fields

Each key in `config` becomes a JS `const` injected at script load time — see "Extension settings" below.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Setting label shown to user |
| `subtitle` | string | Description/hint |
| `default` | string | Default value |
| `values` | array | Options (for `select` mode) |
| `mode` | string | Input mode — see below |
| `format` | string | Value format — see below |

**`mode` + `format` combinations:**

| mode | format | Description |
|------|--------|-------------|
| `input` | `text` | Free text input field |
| `input` | `number` | Numeric input field |
| `select` | `single` | Dropdown, pick one from `values` |
| `select` | `multiple` | Multi-select, pick multiple from `values` (comma-separated) |
| `toggle` | _(ignored)_ | On/off switch (value is `"true"` / `"false"`) |

**Built-in connection settings** (recognized by the app, shown in a dedicated UI section rather than the generic config list — see `SKILL.md` for the reserved-key implications):

| Key | Description | Default |
|-----|-------------|---------|
| `thread_num` | Max concurrent requests | `"3"` |
| `timeout` | Request timeout in ms | `"30000"` |
| `delay` | Delay between requests in ms | `"0"` |

---

## Script contracts

### home.js — home page tabs

```js
function execute() {
    return Response.success([
        { title: "Latest", input: "", script: "latest.js" },
        { title: "Popular", input: "", script: "popular.js" },
        { title: "Completed", input: "", script: "completed.js" }
    ]);
}
```

Each tab: `{ title, input, script }` — tapping it calls `script` with `input` as `args[0]`.

### explore.js — sectioned discover page

```js
function execute() {
    let doc = fetch("https://example.com").html();

    let latestItems = doc.select(".latest .book-item").map(function (el) {
        return {
            name: el.select(".title").text(),
            cover: el.select("img").attr("src"),
            link: el.select("a").attr("href"),
            description: el.select(".desc").text(),
            tag: el.select(".status").text()
        };
    });

    return Response.success([
        { id: "banner", title: "", subtitle: "", type: "banner", items: [] },
        {
            id: "latest",
            title: "Latest Updates",
            subtitle: "Recently updated books",
            type: "grid",
            items: latestItems,
            action: { type: "list", script: "latest.js", input: "", data: "" }
        }
    ]);
}
```

**Section fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | yes | Layout type — see below. Empty = skipped |
| `title` | string | no | Section header text |
| `subtitle` | string | no | Section subtitle text |
| `id` | string | no | Unique ID (auto-generated from `type` + index if empty) |
| `items` | array | no | List of explore items |
| `action` | object | no | "See more" action on the section header |

**Section `type` values:** `banner` (full-width carousel), `horizontal_list`, `grid`, `list`, `ranking` (numbered), `chip` (tag buttons row).

**Action fields** (section `action` and item `action` share this shape):

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `list` (open paginated list, "See all") or `detail` (open item detail page, `input` = item URL) |
| `script` | string | JS filename to execute |
| `input` | string | Passed as `args[0]` |
| `data` | string | Passed as `args[1]` |

**Explore item fields:** `name`, `cover`, `link` (auto-creates a `detail` action if no explicit `action`), `description`, `tag`, `host` (base-URL override for relative links), `action` (overrides the default link→detail behavior).

### genre.js — genre/tag list

```js
function execute() {
    let doc = fetch("https://example.com/genres").html();
    let genres = doc.select(".genre-item").map(function (el) {
        return { title: el.text(), input: el.attr("href"), script: "genre_items.js" };
    });
    return Response.success(genres);
}
```

### search.js — paginated item list

Also the target for `home.js`/`genre.js` tab entries (they pass a category/filter value as `query`).

| Param | Description |
|-------|-------------|
| `query` | Search text, or a filter/category `input` from a `genre`/`home` tab. Empty string when just browsing a tab |
| `page` | Next-page token — whatever the previous call returned as `data2`. Empty on the first page. Opaque: number, cursor, or full URL, your choice |

Return items as `data`, next-page token as `data2` (empty string when there's no more).

```js
function execute(query, page) {
    query = query || "";
    page = page || "1";

    let url = "https://example.com/search?q=" + query + "&page=" + page;
    let doc = fetch(url).html();

    let items = doc.select(".book-item").map(function (el) {
        return {
            name: el.select(".title").text(),
            cover: el.select("img").attr("src"),
            link: el.select("a").attr("href"),
            description: el.select(".info").text(),
            tag: el.select(".tag").text()
        };
    });

    let hasNext = doc.select(".pagination .next").size() > 0;
    return Response.success(items, hasNext ? (parseInt(page) + 1).toString() : "");
}
```

**Item fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Item title |
| `cover` | string | no | Cover image URL |
| `link` | string | yes | URL to the detail page |
| `description` | string | no | Short description or latest chapter |
| `tag` | string | no | Tag text (e.g. "Completed", "Hot") |
| `host` | string | no | Base-URL override for relative links |

### detail.js — item detail page

| Param | Description |
|-------|-------------|
| `url` | The item URL — the `link` a search/explore item pointed to. Note: the app strips any trailing `/` before calling this — re-add it in-script if the site needs it |

```js
function execute(url) {
    let doc = fetch(url).html();

    return Response.success({
        name: doc.select("h1.title").text(),
        author: doc.select(".author").text(),
        cover: doc.select(".cover img").attr("src"),
        description: doc.select(".description").html(),
        detail: doc.select(".info").html(),
        url: url,
        type: "novel",
        format: "novel",
        ongoing: true,
        nsfw: false,
        locale: "vi",
        tags: doc.select(".tag").map(function (el) {
            return { title: el.text(), input: el.attr("href"), script: "genre_items.js" };
        }),
        genres: [],
        suggests: [],
        reviews: [],
        comments: []
    });
}
```

**Detail fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Title |
| `author` | string | Author name |
| `cover` | string | Cover image URL |
| `description` | string | HTML description (rendered as styled text) |
| `detail` | string | HTML detail info |
| `url` | string | Canonical URL. Defaults to the requested URL if omitted |
| `type` | string | `novel`/`comic`/`video`. Defaults to the extension's declared `type` |
| `format` | string | Content format — see table below. Defaults per type when omitted |
| `ongoing` | boolean | `true` if ongoing, `false` if completed. Default `true` |
| `nsfw` | boolean | Adult content flag. Default `false` |
| `locale` | string | ISO language code |
| `tags` | array | `{ title, input, script }` |
| `genres` | array | `{ title, input, script }` |
| `suggests` | array | Similar items, `{ title, input, script }` |
| `reviews` | array | Review sources, `{ title, input, script }` |
| `comments` | array | Comment sources, `{ title, input, script }` |

Each `tags`/`genres`/`suggests`/`reviews`/`comments` entry is `{ title, input, script }` — `script` is called with `input` as `args[0]` to fetch that list.

**`format` values by `type`:**

| Type | Format | Description |
|------|--------|-------------|
| novel | `novel` | Web novel (HTML chapters) |
| novel | `epub` | EPUB file |
| novel | `mobi` | MOBI/AZW/AZW3/PRC file |
| novel | `txt` | Plain text file |
| novel | `html` | HTML/XHTML file |
| novel | `docx` | DOCX file |
| novel | `fb2` | FB2 file |
| novel | `zip` | ZIP archive |
| novel | `umd` | UMD file |
| comic | `comic` | Web comic (image list per chapter) |
| comic | `cbz` | CBZ archive |
| comic | `pdf` | PDF file |
| video | `series` | TV series (episodes as chapters) |
| video | `stream` | Live stream |

### toc.js — chapter/episode list

| Param | Description |
|-------|-------------|
| `url` | The item URL (usually the same one `detail` received) — same trailing-`/`-stripped caveat as `detail` |

```js
function execute(url) {
    let doc = fetch(url).html();

    let chapters = doc.select(".chapter-list a").map(function (el) {
        return { name: el.text(), url: el.attr("href"), description: "", lock: false, pay: false };
    });

    return Response.success(chapters);
}
```

**Chapter fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Chapter title |
| `url` | string | Chapter URL |
| `description` | string | Optional description |
| `lock` | boolean | Locked chapter |
| `pay` | boolean | Paid chapter |
| `type` | string | `"chapter"` (default) or `"section"` (group header) |
| `host` | string | Base-URL override |

### chap.js — chapter content

| Param | Description |
|-------|-------------|
| `url` | The chapter/episode URL a TOC entry pointed to. Same `url` is passed to `page` when that script is declared |

Return shape depends on type (runtime-dispatched — see the Quick reference table):

```js
// Novel — return an HTML string, chapter title in data2
function execute(url) {
    let doc = fetch(url).html();
    return Response.success(doc.select(".chapter-content").html(), doc.select("h1.chapter-title").text());
}
```

```js
// Comic — return an array of image URLs
function execute(url) {
    let doc = fetch(url).html();
    let images = doc.select(".page-image img").map(function (el) { return el.attr("src"); });
    return Response.success(images);
}
```

```js
// Video/audio — return the episode's server list [{ title, data }] (step 1 of the
// chap->track chain). Each `data` is passed to track.js to resolve the stream.
function execute(url) {
    let doc = fetch(url).html();
    let servers = doc.select(".server-item").map(function (el) {
        return { title: el.text(), data: el.attr("data-link") };  // data = embed/stream handle
    });
    return Response.success(servers);   // one-element list for a single-server site
}
```

### page.js — comic page list (alternative to array-returning `chap.js`)

Same signature and return shape as the comic `chap.js` variant above — declare whichever one fits; see the Quick reference table for the fallback rule.

### track.js — video/audio playback (step 2 of the `chap`→`track` chain)

Called for `video`/`audio` sources. Receives the `data` handle from a `chap` server entry and resolves it to a playback object. (If a site declares `track` but not `chap`, the episode url is passed straight in.)

| Param | Description |
|-------|-------------|
| `data` | The chosen server's `data` from `chap.js` — an embed URL, a direct stream URL, or any handle. Resolve it to a playable stream |

```js
function execute(data) {
    // If `data` is a 3rd-party embed, fetch it and extract the direct stream.
    // Prefer a native direct URL; when it can't be extracted fall back to "auto"
    // (webview only if auto fails too). Order: native -> auto -> webview.
    let videoUrl = data;
    if (data.indexOf(".m3u8") === -1 && data.indexOf(".mp4") === -1) {
        let text = fetch(data, { headers: { "Referer": "https://example.com" } }).text();
        let m = text.match(/https?[:\\\/]+[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        videoUrl = m ? m[0].replace(/\\/g, "") : data;
    }

    return Response.success({
        type: "native",
        data: videoUrl,
        host: "",
        mimeType: "application/x-mpegURL",
        headers: { "Referer": "https://example.com" },
        timeSkip: [{ fromTime: 0, toTime: 90000 }],
        subtitles: [
            { data: "https://example.com/sub.vtt", type: "vtt", label: "Vietnamese", language: "vi" }
        ],
        audios: [
            { data: "https://example.com/audio-en.m3u8", type: "", label: "English", language: "en", headers: {} }
        ]
    });
}
```

**Track fields:**

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Resolver: `native` (direct URL), `auto` (app sniffs the stream), `webview` (resolve in headless page). Required. Prefer in order `native` → `auto` → `webview` |
| `data` | string | URL to resolve/play. Required |
| `host` | string | Base URL for relative links (default = source) |
| `mimeType` | string | MIME hint; the resolver's inferred type wins if it has one |
| `headers` | object | Request headers applied to the stream |
| `timeSkip` | array | Skip ranges `{ fromTime, toTime }` in ms (intro/outro) |
| `subtitles` | array | `{ data, type, label, language }` — `data` required |
| `audios` | array | Alternate audio tracks `{ data, type, label, language, headers }` — `data` required |

Legacy single-value fields still accepted: `audio` (string), `subtitle` + `subtitleType` (strings). Prefer the `audios`/`subtitles` arrays.

### comment scripts — referenced from `detail.js`'s `comments`

Not a fixed script key in `plugin.json.script`. `detail.js` returns `comments: [{ title, input, script }]` (and optionally `reviews: [...]` with the same shape); the app calls each entry's `script` with `input` as `args[0]` and the next-page token as `args[1]` to fetch that comment/review list. Name the file whatever you referenced (e.g. `comments.js`).

| Param | Description |
|-------|-------------|
| `input` | The `input` from the `detail.js` `comments`/`reviews` entry (a URL or handle) |
| `page` | Next-page token — whatever the previous call returned as `data2`. Empty on the first page |

Return the comments as `data` and the next-page token as `data2` (empty string when there are no more).

```js
function execute(input, page) {
    page = page || "1";
    let doc = fetch(input + "?page=" + page).html();

    let comments = doc.select(".comment-item").map(function (el) {
        return {
            name: el.select(".author").text(),
            avatar: el.select(".avatar img").attr("src"),
            content: el.select(".content").html(),      // HTML is converted to text by the app
            description: el.select(".time").text(),      // secondary line, e.g. timestamp
            replies: el.select("> .replies > .comment-item").map(function (r) {
                return {
                    name: r.select(".author").text(),
                    avatar: r.select(".avatar img").attr("src"),
                    content: r.select(".content").html(),
                    description: r.select(".time").text(),
                    replies: []
                };
            })
        };
    });

    let hasNext = !doc.select(".pagination .next").isEmpty();
    return Response.success(comments, hasNext ? (parseInt(page) + 1).toString() : "");
}
```

**Comment fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Commenter's display name |
| `avatar` | string | Commenter's avatar image URL |
| `content` | string | Comment body (HTML accepted — rendered as text) |
| `description` | string | Secondary line (timestamp, likes, etc.) |
| `replies` | array | Nested child comments, **same shape recursively** (a reply can have its own `replies`). Empty array or omit when there are none |

`reviews` entries use the same paginated list contract; shape the items to whatever the review UI expects (typically the same comment fields).

### voice.js — TTS voice list (`type: "tts"`)

```js
function execute() {
    return Response.success([
        { id: "vi-VN-Standard-A", name: "Standard A", language: "vi-VN" },
        { id: "en-US-Standard-C", name: "Standard C", language: "en-US" }
    ]);
}
```

Each voice: `{ id, name, language }` — `language` is a BCP-47 tag.

Engine-specific `config` keys the app reads: `preload_size` (sentences to pre-synthesize ahead, default `"0"`), `preload_parallel` (`"true"`/`"false"`), `max_length` (max chars per request, default `"0"`), `required_api_key`, `support_url`.

### tts.js — synthesize one sentence (`type: "tts"`)

| Param | Description |
|-------|-------------|
| `text` | One sentence to synthesize |
| `voiceId` | The selected voice's `id` from your `voice` list |

```js
function execute(text, voiceId) {
    let audioBase64 = fetch("https://engine.com/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, voice: voiceId })
    }).base64();

    return Response.success(audioBase64);
}
```

### language.js — translate language list (`type: "translate"`)

```js
function execute() {
    return Response.success([
        { id: "en", name: "English" },
        { id: "vi", name: "Vietnamese" },
        { id: "zh", name: "Chinese", type: "from" }
    ]);
}
```

`type` limits direction: `"from"` = source only, `"to"` = target only, omitted = both.

Engine-specific `config` keys: `support_auto_detect` (offer an "auto" source language), `max_line`, `max_length`, `required_api_key`, `support_url`.

### translate.js — translate text (`type: "translate"`)

| Param | Description |
|-------|-------------|
| `text` | The text block to translate |
| `from` | Source language `id`, or `""`/`"auto"` when auto-detect is on |
| `to` | Target language `id` |
| `source` | Which part of the app asked — see below. `""` when untagged |

**`source` values:** `chapterContent` (chapter body being read), `tableOfContent` (chapter/episode titles), `detail` (detail-page text: name/author/description/suggestions/comments), `discovery` (search/genre listing text), `""` (untagged). Treat an unrecognized value as "translate normally" — new sources may be added later.

```js
function execute(text, from, to, source) {
    from = from || "auto";

    let translated = fetch("https://engine.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source: from, target: to })
    }).json();

    return Response.success(translated.text);   // or { translateText, segments: [...] }
}
```

---

## Available JS APIs

### fetch (HTTP)

```js
let response = fetch(url, {
    method: "POST",                   // "GET" (default), "POST"
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),       // string body
    queries: { "page": "1" },         // URL query parameters
    timeout: 30000                    // timeout in ms
});

response.status;             // HTTP status code (int)
response.statusText;
response.ok;                 // true if status 2xx — ALWAYS check before reading the body
response.url;                // final URL after redirects
response.headers;            // all headers as object
response.header("key");      // single header value

response.text();             // body as string
response.text("gbk");        // body with specific charset
response.json();             // body parsed as JSON object
response.html();             // body parsed as HtmlElement
response.html("gbk");
response.base64();           // body as base64 string
response.blob();             // { size, type, base64() }

response.request.url;
response.request.headers;
```

```js
// GET
let doc = fetch("https://example.com/page").html();

// GET with query params
let json = fetch("https://api.example.com/search", { queries: { q: "hello", page: "1" } }).json();

// POST JSON
let result = fetch("https://api.example.com/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: "admin", pass: "123" })
}).json();
```

### HTML parsing

```js
let doc = Html.parse("<html>...</html>");

let elements = doc.select("div.class > a");
let first = elements.first();
let last = elements.last();
let item = elements.get(0);

let text = element.text();
let html = element.html();
let attr = element.attr("href");
let attrs = element.attributes();
element.remove();

elements.forEach(function (el) { /* ... */ });
let arr = elements.map(function (el) { return el.text(); });
let count = elements.size();
let empty = elements.isEmpty();

let nested = elements.select(".sub-item");   // chain selects
```

### Storage

```js
localStorage.setItem("key", "value");   // persistent per-extension
let val = localStorage.getItem("key");
localStorage.removeItem("key");
localStorage.clear();

cacheStorage.setItem("key", "value");   // may be cleared by system
let cached = cacheStorage.getItem("key");

let setting = localConfig.getItem("settingKey");   // read-only, user-configured

localCookie.setCookie("name=value; path=/");        // cookies for the extension's source domain
let cookie = localCookie.getCookie();
```

### Browser (headless WebView)

For sites that require JS rendering:

```js
let browser = Engine.newBrowser();

let doc = browser.launch("https://example.com", 10000);   // load + wait for render

browser.launchAsync("https://example.com");
browser.waitUrl(["api.example.com/data"], 15000);         // wait for a network request
let doc2 = browser.html(5000);

let result = browser.callJs("document.title", 5000);
browser.block(["ads.example.com", "tracker.js"]);          // ad blocking
let urls = browser.urls();                                 // intercepted network URLs
let token = browser.getVariable("window.__TOKEN__");

browser.close();
```

### Graphics (image manipulation)

```js
let canvas = Graphics.createCanvas(800, 600);
let image = Graphics.createImage(base64String);

canvas.drawImage(image, 0, 0);
canvas.drawImage(image, 0, 0, 400, 300);
canvas.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);

let resultBase64 = canvas.capture();
```

### WebSocket

```js
let ws = WebSocket("wss://example.com/ws", { "Origin": "https://example.com" });
ws.connect();
ws.send("hello");
let frame = ws.message();   // blocking receive; frame.type = "text"|"binary", frame.data = payload
ws.close();
```

### Translation (Quick Translator — offline Chinese → Vietnamese)

```js
let result = Qt.translate("你好世界", "vi");
// { translateText: "Xin chào thế giới", segments: [{ srcStart, srcLen, transStart, transLen, type }, ...] }

let title = Qt.translate("第一章 新的开始", "vi", { chapter_name: true, first_capitalize: true });
let name = Qt.translate("张三", "vp", { person_name: true, first_capitalize: false });
```

**`Qt.translate(text, to, extras)`** — `to`: `"vp"` (VietPhrase, full dictionary translation) or `"hv"` (Hán Việt, Sino-Vietnamese transliteration).

**`extras`** (all optional): `chapter_name`, `first_line_chapter_name`, `first_capitalize`, `convert_simplified` (Traditional→Simplified before translating), `person_name`, `ner` (int, Named Entity Recognition mode).

**Return:** `{ translateText, segments }` — `segments` (`{ srcStart, srcLen, transStart, transLen, type }`, `type`: 0=None/1=Name/2=VietPhrase/…) is `undefined` if unavailable.

### Utilities

```js
Log.log("debug message");
console.log("debug message");

sleep(1000);   // ms

let result = Script.execute("scriptName", "functionName", "input");   // call another extension script

let ua = UserAgent.system();
let chrome = UserAgent.chrome();
let android = UserAgent.android();
let ios = UserAgent.ios();
```

### Crypto

```js
load('crypto.js');
// Provides CryptoJS: AES, MD5, SHA256, Base64, etc.
```

---

## Extension settings (config injection)

Every key in `plugin.json.config` becomes a JS `const` at script load time:

```js
// config has key "DOMAIN" with value "https://example.com":
const DOMAIN = "https://example.com";
```

Use the constant directly, or `localConfig.getItem("DOMAIN")` for dynamic access. See `SKILL.md`'s constraints section for injection details that affect how you write scripts (always-string values, reserved key names, no redeclaration).

## Loading external scripts

```js
load('crypto.js');   // built-in crypto library
load('utils.js');    // your own shared script, must be in the extension package
```

See `SKILL.md`'s constraints section for how `load()` actually behaves at runtime (not a real function call, not recursive).
