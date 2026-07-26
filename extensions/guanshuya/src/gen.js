load("config.js");

function execute(url, page) {
    if (!page) page = "1";
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var pageUrl = url.replace(/-(\d+)\.html/, "-" + page + ".html");
    if (pageUrl.indexOf("{{page}}") >= 0) {
        pageUrl = pageUrl.replace("{{page}}", page);
    }

    var res = fetch(pageUrl);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    doc.select("#hotcontent .item").forEach(function (el) {
        var linkEl = el.select("dt a").first();
        var imgEl = el.select(".image img").first();
        var authorEl = el.select(".btm a").first();
        var descEl = el.select("dd").first();

        if (!linkEl) return;

        var link = (linkEl.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;

        if (!link.startsWith("http")) link = BASE_URL + link;

        var cover = "";
        if (imgEl) {
            cover = (imgEl.attr("data-original") || imgEl.attr("src") || "") + "";
        }
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;

        try {
            var urlObj = new URL(cover);
            urlObj.pathname = urlObj.pathname.split("/").map(function (p) { return encodeURIComponent(p); }).join("/");
            cover = urlObj.toString();
        } catch (e) {
            cover = encodeURI(cover);
        }

        data.push({
            name: linkEl.text().trim() + "",
            link: link,
            cover: cover,
            description: descEl ? (descEl.text().trim() + "") : "",
            host: BASE_URL
        });
    });

    var hasNext = doc.select(".pages .pagination li.next a").size() > 0;
    if (!hasNext) hasNext = doc.select(".pages .pagination li:not(.active):not(.first):not(.last):not(.prev):not(.next) a").size() > 0;
    var nextPage = hasNext ? String(parseInt(page) + 1) : null;

    return Response.success(data, nextPage);
}
