load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);
    if (url.slice(-1) !== "/") url = url + "/";
    var response = fetch(url);
    if (!response.ok) return Response.error("Không thể tải mục lục");
    var doc = response.html();
    var chapters = [];
    doc.select("#ul_all_chapters li a").forEach(function(el) {
        var name = el.text() + "";
        var chapUrl = el.attr("href") + "";
        if (!name || !chapUrl) return;
        if (chapUrl.indexOf("http") !== 0) chapUrl = BASE_URL + chapUrl;
        chapters.push({name: name, url: chapUrl, host: BASE_URL});
    });
    if (chapters.length === 0) {
        doc.select(".chapter li a").forEach(function(el) {
            var name = el.text() + "";
            var chapUrl = el.attr("href") + "";
            if (!name || !chapUrl) return;
            if (chapUrl.indexOf("http") !== 0) chapUrl = BASE_URL + chapUrl;
            chapters.push({name: name, url: chapUrl, host: BASE_URL});
        });
    }
    if (chapters.length === 0) {
        return Response.error("Không tìm thấy danh sách chương");
    }
    return Response.success(chapters);
}
