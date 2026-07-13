load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, BASE_URL);
    var regex = /\/book\/([a-zA-Z0-9]+)\.html/;
    var match = url.match(regex);
    if (!match || !match[1]) return null;
    var bookId = match[1];
    var tocUrl = BASE_URL + "/chapter/" + bookId + ".html";
    var response = fetch(tocUrl);
    if (response.ok) {
        var doc = response.html();
        var data = [];
        var elems = doc.select("#allchapter dd a");
        for (var i = 0; i < elems.size(); i++) {
            var e = elems.get(i);
            var href = e.attr("href") + "";
            if (href.indexOf("/chapter/" + bookId + "/") >= 0) {
                data.push({
                    name: e.text() + "",
                    url: href,
                    host: BASE_URL
                });
            }
        }
        return Response.success(data);
    }
    return null;
}
