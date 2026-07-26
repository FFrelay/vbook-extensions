load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var chapters = [];
    var seen = {};

    var dlHtml = doc.select("#list dl").html() + "";

    var marker = "章节目录";
    var markerIndex = dlHtml.indexOf(marker);
    if (markerIndex >= 0) {
        dlHtml = dlHtml.substring(markerIndex);
    }

    var sectionDoc = Html.parse(dlHtml);
    sectionDoc.select("a").forEach(function (el) {
        var name = (el.text() + "").trim();
        var chapUrl = (el.attr("href") || "") + "";

        if (!name || !chapUrl) return;
        if (chapUrl.indexOf("javascript:") >= 0) return;
        if (chapUrl.indexOf("#") >= 0) return;
        if (chapUrl.indexOf(".html") < 0) return;
        if (seen[chapUrl]) return;
        seen[chapUrl] = true;

        if (!chapUrl.startsWith("http")) {
            chapUrl = chapUrl.startsWith("/") ? BASE_URL + chapUrl : BASE_URL + "/" + chapUrl;
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
