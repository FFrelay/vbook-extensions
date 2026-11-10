// page.js — dedicated comic image list. Use ONE of page.js/chap.js, not both —
// keep this file and delete chap.js if the site has a separate page-list
// endpoint; otherwise use chap.js instead (see that file) and remove "page"
// from plugin.json.script.
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
