load("config.js");
function execute(key, page) {
    var url = BASE_URL + "/search?searchkey=" + encodeURIComponent(key);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var data = [];
        var items = doc.select("#fengtui .item, .content-left .item");
        if (!items.size()) {
            items = doc.select(".bookinfo, .book");
        }
        var elems = doc.select(".item");
        for (var i = 0; i < elems.size(); i++) {
            var e = elems.get(i);
            var link = e.select(".image a").attr("href") + "";
            var name = "";
            name = e.select("dl dt a").text() + "";
            var cover = e.select(".image a img").attr("src") + "";
            var author = e.select("dl dt a span").text() + "";
            if (link && link.indexOf("/book/") >= 0) {
                data.push({
                    name: name,
                    link: link,
                    cover: cover,
                    author: author,
                    host: BASE_URL
                });
            }
        }
        return Response.success(data);
    }
    return null;
}
