// chap.js — alternative to page.js: return the comic page image list straight
// from chap.js instead of a dedicated page.js. Use ONE of the two, not both —
// pick this file and drop page.js (remove "page" from plugin.json.script) if
// the site has no separate page-list endpoint; otherwise keep page.js and
// delete this file.
load('config.js');
function execute(url) {
    url = normalizeUrl(url);
    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html();

    let images = doc.select("SELECTOR_PAGE_IMAGES img").map(function (el) {
        // Many comic sites lazy-load — prefer data-src over src.
        return el.attr("data-src") || el.attr("src");
    });

    return Response.success(images);
}
