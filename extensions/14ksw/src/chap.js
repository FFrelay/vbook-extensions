load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    url = url.replace(/\/(\d+)\/(\d+)\/(\d+)\.html/, "/xiaoshuo/$2/$3.html");
    var response = fetch(url);
    if (!response.ok) return Response.error("Cannot load chapter");
    var doc = response.html();
    doc.select("script, style, noscript, iframe, .ads, .advertisement").remove();
    var content = doc.select("#content").html() + "";
    if (!content) return Response.error("Chapter content not found");
    return Response.success(content);
}
