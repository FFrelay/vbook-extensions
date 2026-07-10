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
    content = content.replace(/[\uFF41-\uFF5A\uFF21-\uFF3A][\uFF41-\uFF5A\uFF21-\uFF3Aa-zA-Z0-9|^$~*+\-!.#@\/\\]{5,}[\uFF41-\uFF5A\uFF21-\uFF3Aa-zA-Z0-9]/g, "");
    content = content.replace(/：(?=[‘"'"])/g, "：</p>");
    return Response.success(content);
}
