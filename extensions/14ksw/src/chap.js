load("config.js");

function execute(url) {
    url = normalizeUrl(url);
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    var response = fetch(url);
    if (!response.ok) return Response.error("Cannot load chapter");
    var doc = response.html();
    doc.select("script, style, noscript, iframe, .ads, .advertisement").remove();
    var content = doc.select("#content").html() + "";
    if (!content) return Response.error("Chapter content not found");
    return Response.success(content);
}
