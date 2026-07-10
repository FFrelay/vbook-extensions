load("config.js");

function execute(url, page) {
    page = page !== undefined ? page : "1";
    var hasPagination = url.indexOf("{0}") >= 0;
    var targetUrl = hasPagination ? url.replace("{0}", page) : url;
    var response = fetch(targetUrl);
    if (!response.ok) return Response.error("Cannot load: " + targetUrl);
    var doc = response.html();
    var data = [];
    doc.select(".list.fk ul.xbk").forEach(function(el) {
        var name = el.select(".xsm a").text() + "";
        var link = el.select(".xsm a").attr("href") + "";
        var cover = el.select(".tjimg img").attr("src") + "";
        var author = el.select(".tjxs span").get(1).text() + "";
        if (link && link.indexOf("http") !== 0) {
            link = link.indexOf("/") === 0 ? BASE_URL + link : BASE_URL + "/" + link;
        }
        if (cover && cover.indexOf("http") !== 0) {
            cover = cover.indexOf("/") === 0 ? BASE_URL + cover : BASE_URL + "/" + cover;
        }
        if (name && link) {
            data.push({
                name: name,
                link: link,
                cover: cover || "",
                description: author || "",
                host: BASE_URL
            });
        }
    });
    var nextPage = null;
    if (hasPagination && data.length > 0) {
        nextPage = String(parseInt(page) + 1);
    }
    return Response.success(data, nextPage);
}
