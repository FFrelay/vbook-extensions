load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, BASE_URL);
    var regex = /\/book\/([a-zA-Z0-9]+)\.html/;
    var match = url.match(regex);
    if (!match || !match[1]) return null;
    var bookId = match[1];
    var pageUrls = [];
    var firstUrl = BASE_URL + "/chapter/" + bookId + ".html";
    var response = fetch(firstUrl);
    if (!response.ok) return null;
    var doc = response.html();
    var pageSelect = doc.select("#linkIndex option");
    if (pageSelect.size() > 0) {
        for (var p = 0; p < pageSelect.size(); p++) {
            pageUrls.push(pageSelect.get(p).attr("value") + "");
        }
    } else {
        pageUrls.push(firstUrl);
    }
    var data = [];
    for (var pi = 0; pi < pageUrls.length; pi++) {
        var pageUrl = pageUrls[pi];
        if (pageUrl.indexOf("/") === 0) {
            pageUrl = BASE_URL + pageUrl;
        }
        var pageResp = fetch(pageUrl);
        if (!pageResp.ok) continue;
        var pageDoc = pageResp.html();
        var elems = pageDoc.select("#allchapter dd a");
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
    }
    return Response.success(data);
}
