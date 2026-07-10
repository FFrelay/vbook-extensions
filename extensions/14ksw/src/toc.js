load("config.js");

function execute(url) {
    var response = fetch(url);
    if (!response.ok) return Response.error("Cannot load TOC: " + url);
    var doc = response.html();
    var chapters = [];
    doc.select("#ul_all_chapters li a").forEach(function(el) {
        var name = el.text() + "";
        var chapUrl = el.attr("href") + "";
        if (!name || !chapUrl) return;
        if (chapUrl.indexOf("http") !== 0) {
            chapUrl = chapUrl.indexOf("/") === 0 ? BASE_URL + chapUrl : BASE_URL + "/" + chapUrl;
        }
        chapters.push({
            name: name,
            url: chapUrl,
            host: BASE_URL
        });
    });
    if (chapters.length === 0) return Response.success([]);
    return Response.success(chapters);
}
