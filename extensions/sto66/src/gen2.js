load("config.js");
function execute(url, page) {
    page = page || "1";
    var targetUrl;
    if (url.indexOf("/ranking/update.html") >= 0) {
        targetUrl = page == "1" ? url : url.replace(".html", "/" + page + ".html");
    } else {
        if (page != "1") return Response.success([], null);
        targetUrl = url;
    }
    var response = fetch(targetUrl);
    if (response.ok) {
        var doc = response.html();
        var data = [];
        if (url.indexOf("/ranking/update.html") >= 0) {
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
        } else {
            var items = doc.select("#zuixin ul li");
            for (var i = 0; i < items.size(); i++) {
                var item = items.get(i);
                var links = item.select("a");
                if (links.size() >= 2) {
                    var bookLink = links.get(1);
                    var link = bookLink.attr("href") + "";
                    var name = bookLink.text() + "";
                    var author = "";
                    if (links.size() >= 3) {
                        var authorSpan = links.get(2).select("span").first();
                        if (authorSpan) author = authorSpan.text() + "";
                    }
                    if (link && name) {
                        data.push({
                            name: name,
                            link: link,
                            author: author,
                            host: BASE_URL
                        });
                    }
                }
            }
            return Response.success(data, null);
        }
    }
    return null;
}
