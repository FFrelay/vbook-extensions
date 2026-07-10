load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);
    var response = fetch(url);
    if (!response.ok) return Response.error("Cannot load TOC");
    var doc = response.html();
    var chapters = [];
    doc.select("#list dl dd a").forEach(function(el) {
        var name = el.attr("title") + "";
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
    if (chapters.length === 0) return Response.error("No chapters found");
    return Response.success(chapters);
}
