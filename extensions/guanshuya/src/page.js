load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var pages = [];
    var seen = {};

    doc.select("#indexselect option").forEach(function (el) {
        var href = (el.attr("value") || "") + "";
        if (!href || href.indexOf("javascript:") >= 0) return;
        if (!href.startsWith("http")) href = BASE_URL + href;
        if (seen[href]) return;
        seen[href] = true;
        pages.push(href);
    });

    if (pages.length === 0) return Response.success([url]);

    return Response.success(pages);
}
