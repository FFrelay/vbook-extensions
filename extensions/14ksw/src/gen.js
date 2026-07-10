load("config.js");
function execute(url, page) {
    page = page !== undefined ? page : "1";
    if (url.indexOf("?list=hot") >= 0) {
        return parseHot();
    } else if (url.indexOf("?list=new") >= 0) {
        return parseRecent();
    } else if (url.indexOf("/fenlei/") >= 0) {
        return parseCategory(url, page);
    } else {
        return parseCategory(url, page);
    }
}

function parseHot() {
    var response = fetch(BASE_URL + "/");
    if (!response.ok) return Response.error("Lỗi tải trang");
    var doc = response.html();
    var data = [];
    doc.select("#rmtj ul.xbk").forEach(function(e) {
        var name = e.select("span.xsm a").text() + "";
        var link = e.select("span.xsm a").attr("href") + "";
        var cover = e.select("li.tjimg img").attr("src") + "";
        if (link && link.indexOf("http") !== 0) link = BASE_URL + link;
        if (cover && cover.indexOf("http") !== 0 && cover.indexOf("//") === 0) cover = "https:" + cover;
        if (name && link) {
            data.push({name: name, link: link, cover: cover, host: BASE_URL});
        }
    });
    return Response.success(data);
}

function parseRecent() {
    var response = fetch(BASE_URL + "/");
    if (!response.ok) return Response.error("Lỗi tải trang");
    var doc = response.html();
    var data = [];
    var items = doc.select("#zjgx ul li");
    items.forEach(function(e) {
        var cls = e.attr("class") + "";
        if (cls.indexOf("zjgxjj") >= 0 || cls.indexOf("xxbk") >= 0) return;
        var a = e.select("span a");
        var name = a.text() + "";
        var link = a.attr("href") + "";
        if (link && link.indexOf("http") !== 0) link = BASE_URL + link;
        if (name && link) {
            data.push({name: name, link: link, host: BASE_URL});
        }
    });
    return Response.success(data);
}

function parseCategory(url, page) {
    var pageUrl = url;
    if (parseInt(page) > 1) {
        pageUrl = url.replace(/\/$/, "") + "/" + page + "/";
    }
    var response = fetch(pageUrl);
    if (!response.ok) return Response.error("Lỗi tải trang");
    var doc = response.html();
    var data = [];
    doc.select(".list.fk ul.xbk").forEach(function(e) {
        var name = e.select("span.xsm a").text() + "";
        var link = e.select("span.xsm a").attr("href") + "";
        var cover = e.select("li.tjimg img").attr("src") + "";
        var author = "";
        var spans = e.select("li.tjxs span");
        if (spans.size() > 1) {
            author = spans.get(1).text() + "";
        }
        if (link && link.indexOf("http") !== 0) link = BASE_URL + link;
        if (cover && cover.indexOf("http") !== 0 && cover.indexOf("//") === 0) cover = "https:" + cover;
        if (name && link) {
            data.push({name: name, link: link, cover: cover, description: author, host: BASE_URL});
        }
    });
    var nextPage = String(parseInt(page) + 1);
    if (data.length === 0) nextPage = null;
    return Response.success(data, nextPage);
}
