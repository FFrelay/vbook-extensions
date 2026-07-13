load("config.js");
function execute(key, page) {
    var url = BASE_URL + "/search?searchkey=" + encodeURIComponent(key);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var items = doc.select("div.bookbox");
        if (items.size() > 0) {
            var data = [];
            for (var i = 0; i < items.size(); i++) {
                var item = items.get(i);
                var nameElem = item.select("h2.bookname a");
                var link = nameElem.attr("href") + "";
                var name = nameElem.text() + "";
                var author = "";
                var authorElem = item.select("div.author").first();
                if (authorElem) {
                    author = authorElem.text() + "";
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
            return Response.success(data);
        }
        var titleElem = doc.select("h1.booktitle");
        if (titleElem.size() > 0) {
            var author = doc.select(".booktag a.red").text() + "";
            return Response.success([{
                name: titleElem.text() + "",
                link: response.url + "",
                author: author,
                host: BASE_URL
            }]);
        }
        return Response.success([]);
    }
    return null;
}
