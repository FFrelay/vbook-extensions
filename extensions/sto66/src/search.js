load("config.js");
function parsePage(url, data) {
    var response = fetch(url);
    if (!response.ok) return null;
    var doc = response.html();
    var items = doc.select("div.bookbox");
    for (var i = 0; i < items.size(); i++) {
        var item = items.get(i);
        var nameElem = item.select("h2.bookname a");
        var link = nameElem.attr("href") + "";
        var name = nameElem.text() + "";
        var authorElem = item.select("div.author").first();
        var author = authorElem ? (authorElem.text() + "") : "";
        if (link && name) {
            data.push({ name: name, link: link, author: author, host: BASE_URL });
        }
    }
    return doc;
}
function execute(key, page) {
    var firstUrl = BASE_URL + "/search/" + key + ".html";
    var data = [];
    var doc = parsePage(firstUrl, data);
    if (!doc) return null;
    var stats = doc.select("#pagestats").text() + "";
    var total = 1;
    var match = stats.match(/\/(\d+)/);
    if (match) total = parseInt(match[1], 10);
    for (var p = 2; p <= total; p++) {
        parsePage(BASE_URL + "/search/" + key + "/" + p + ".html", data);
    }
    if (data.length > 0) return Response.success(data);
    var titleElem = doc.select("h1.booktitle");
    if (titleElem.size() > 0) {
        var author = doc.select(".booktag a.red").text() + "";
        return Response.success([{
            name: titleElem.text() + "",
            link: firstUrl,
            author: author,
            host: BASE_URL
        }]);
    }
    return Response.success([]);
}
