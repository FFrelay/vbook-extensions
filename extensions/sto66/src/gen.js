load("config.js");
function execute(url, page) {
    page = page || "1";
    var targetUrl = url.indexOf("{0}") >= 0 ? url.replace("{0}", page) : (page == "1" ? url : null);
    if (!targetUrl) return Response.success([], null);
    var response = fetch(targetUrl);
    if (response.ok) {
        var doc = response.html();
        var data = [];
        if (targetUrl.indexOf("/ranking/update.html") >= 0) {
            var elems = doc.select("#gengxin ul li");
            for (var i = 0; i < elems.size(); i++) {
                var e = elems.get(i);
                var link = e.select(".s2 a").attr("href") + "";
                var name = e.select(".s2 a").text() + "";
                var author = e.select(".s4").text() + "";
                if (link) {
                    data.push({
                        name: name,
                        link: link,
                        author: author,
                        host: BASE_URL
                    });
                }
            }
        } else {
            var elems = doc.select("#fengtui .item");
            for (var i = 0; i < elems.size(); i++) {
                var e = elems.get(i);
                var link = e.select(".image a").attr("href") + "";
                var name = "";
                var nameElems = e.select("dl dt a");
                for (var j = 0; j < nameElems.size(); j++) {
                    var a = nameElems.get(j);
                    if (!a.select("span").size()) {
                        name = a.text() + "";
                    }
                }
                var cover = e.select(".image a img").attr("src") + "";
                var author = e.select("dl dt a span").text() + "";
                if (link) {
                    data.push({
                        name: name,
                        link: link,
                        cover: cover,
                        author: author,
                        host: BASE_URL
                    });
                }
            }
        }
        return Response.success(data, null);
    }
    return null;
}
