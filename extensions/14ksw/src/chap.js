load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);
    var response = fetch(url);
    if (!response.ok) return Response.error("Không thể tải chương");
    var doc = response.html();
    doc.select("script, style, iframe, .ads, .ad, noscript").remove();
    var content = doc.select("#nr").html() + "";
    if (!content) {
        return Response.error("Không tìm thấy nội dung chương");
    }
    content = content.replace(/&nbsp;/g, " ");
    return Response.success(content);
}
