var BASE_URL = "https://www.14ksw.com";
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch (e) {}

function normalizeUrl(url) {
    url = url.replace(/\/\/m\.(14ksw|14kanshu)\./g, "//www.$1.");
    var parts = url.split("/");
    if (parts.length >= 5) {
        var domain = parts[2];
        var seg1 = parts[3];
        var seg2 = parts[4];
        if ((domain.indexOf("14ksw") >= 0 || domain.indexOf("14kanshu") >= 0) && !isNaN(seg1) && !isNaN(seg2)) {
            var bookId = seg2;
            var seg3 = parts[5];
            if (seg3 && !isNaN(seg3.replace(".html", "").replace(".htm", ""))) {
                var chapId = seg3.replace(".html", "").replace(".htm", "");
                url = "https://www.14ksw.com/xiaoshuo/" + bookId + "/" + chapId + ".html";
            } else {
                url = "https://www.14ksw.com/book/" + bookId + "/";
            }
        }
    }
    return url;
}
