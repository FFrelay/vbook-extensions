load("config.js");
function execute(url, page) {
    page = page || "1";
    var targetUrl = page == "1" ? url : url.replace(".html", "/" + page + ".html");
    var response = fetch(targetUrl);
    if (response.ok) {
        var doc = response.html();
        var data = [];
        var items = doc.select("div.bookbox");
        for (var i = 0; i < items.size(); i++) {
            var item = items.get(i);
            var nameElem = item.select("h2.bookname a");
            var link = nameElem.attr("href") + "";
            var name = nameElem.text() + "";
            var authorElem = item.select("div.author").first();
            var author = authorElem ? (authorElem.text() + "") : "";
            if (link && name) {
                data.push({
                    name: name,
                    link: link,
                    author: author,
                    host: BASE_URL
                });
            }
        }
        var nextPage = doc.select(".pagelink a.next").attr("href") + "";
        return Response.success(data, nextPage ? String(Number(page) + 1) : null);
    }
    return null;
}
