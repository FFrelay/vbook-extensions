load("config.js");

function execute(key, page) {
    if (!page) page = "1";

    var url = BASE_URL + "/search.php?" + "keyword=" + encodeURIComponent(key);
    if (page !== "1") url = url + "&page=" + page;

    var res = fetch(url);
    if (!res.ok) return Response.error("Search failed: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    doc.select("#hotcontent .item").forEach(function (el) {
        var linkEl = el.select("dt a").first();
        var imgEl = el.select(".image img").first();
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

        data.push({
            name: linkEl.text().trim() + "",
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL
        });
    });

    var hasNext = doc.select(".pages .pagination li.next a").size() > 0;
    return Response.success(data, hasNext ? String(parseInt(page) + 1) : null);
}
