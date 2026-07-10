load("config.js");

function execute(url) {
    if (!url) return null;
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    url = url.replace(/\/(\d+)\/(\d+)\/$/, "/book/$2/");
    if (url.slice(-1) === "/") url = url.slice(0, -1);
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
    var description = doc.select("#intro").html() + "";
    if (!cover) {
        cover = doc.select("#fmimg img").attr("src") + "";
    }
    if (cover && cover.indexOf("//") === 0) cover = "https:" + cover;
    var ongoing = true;
    if (status.indexOf("完结") >= 0 || status.indexOf("Full") >= 0) {
        ongoing = false;
    }
    var detail = "";
    if (category) detail += "Thể loại: " + category;
    if (status) detail += "<br>Tình trạng: " + status;
    if (newChap) detail += "<br>Mới nhất: " + newChap;
    if (updateTime) detail += "<br>Cập nhật: " + updateTime;
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
