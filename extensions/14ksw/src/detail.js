load("config.js");
function execute(url) {
    if (!url) return null;
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);
    if (url.slice(-1) !== "/") url = url + "/";
    var response = fetch(url);
    if (!response.ok) return Response.error("Không thể tải trang chi tiết");
    var doc = response.html();
    var name = doc.select('meta[property="og:novel:book_name"]').attr("content") + "";
    var author = doc.select('meta[property="og:novel:author"]').attr("content") + "";
    var category = doc.select('meta[property="og:novel:category"]').attr("content") + "";
    var status = doc.select('meta[property="og:novel:status"]').attr("content") + "";
    var cover = doc.select('meta[property="og:image"]').attr("content") + "";
    var desc = doc.select(".intro_info").html() + "";
    if (!desc) desc = doc.select('meta[property="og:description"]').attr("content") + "";
    var ongoing = true;
    if (status && (status.indexOf("全本") >= 0 || status.indexOf("完结") >= 0 || status.indexOf("Completed") >= 0)) {
        ongoing = false;
    }
    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: desc,
        detail: "Thể loại: " + category + "<br>Tình trạng: " + status,
        ongoing: ongoing
    });
}
