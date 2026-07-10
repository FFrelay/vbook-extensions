load("config.js");

function execute(url) {
    if (!url) return null;
    url = url.replace(/_/g, "/");
    var response = fetch(url);
    if (!response.ok) return Response.error("Cannot load detail page");
    var doc = response.html();
    var name = doc.select("meta[property=\"og:novel:book_name\"]").attr("content") + "";
    var author = doc.select("meta[property=\"og:novel:author\"]").attr("content") + "";
    var cover = doc.select("meta[property=\"og:image\"]").attr("content") + "";
    var category = doc.select("meta[property=\"og:novel:category\"]").attr("content") + "";
    var status = doc.select("meta[property=\"og:novel:status\"]").attr("content") + "";
    var updateTime = doc.select("meta[property=\"og:novel:update_time\"]").attr("content") + "";
    var newChap = doc.select("meta[property=\"og:novel:latest_chapter_name\"]").attr("content") + "";
    var description = doc.select(".intro_info").text() + "";
    var idx = description.indexOf("\u63a8\u8350\u5730\u5740");
    if (idx > 0) description = description.substring(0, idx);
    if (cover && cover.indexOf("//") === 0) cover = "https:" + cover;
    var ongoing = true;
    if (status.indexOf("完结") >= 0 || status.indexOf("Full") >= 0) {
        ongoing = false;
    }
    var detail = "";
    if (category) detail += "Th\u1ec3 lo\u1ea1i: " + category;
    if (status) detail += "<br>T\xecnh tr\u1ea1ng: " + status;
    if (newChap) detail += "<br>M\u1edbi nh\u1ea5t: " + newChap;
    if (updateTime) detail += "<br>C\u1eadp nh\u1eadt: " + updateTime;
    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        detail: detail,
        ongoing: ongoing
    });
}
