load("config.js");

function execute(url) {
    var response = fetch(url);
    if (!response.ok) return Response.error("Cannot load chapter");
    var doc = response.html();
    doc.select("script, style, noscript, iframe").remove();
    var content = doc.select("#nr").html() + "";
    if (!content) return Response.error("Chapter content not found");
    return Response.success(content);
}
