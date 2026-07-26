load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    doc.select("script, style, ins, iframe, .ads, .advertisement, .banner, .quangcao").remove();
    doc.select("[class*='ads'], [id*='ads'], .fb-comments, #fb-comments, .dUAFnx, nag4bv, wjhu8i, v2uspe, d89e0n").remove();

    var contentEl = doc.select("#chaptercontent").first();
    if (!contentEl) return Response.error("No content found");

    var content = contentEl.html() + "";

    content = content.replace(/&nbsp;/g, " ");

    var endMarker = content.indexOf("《<a");
    if (endMarker >= 0) {
        content = content.substring(0, endMarker);
    }

    return Response.success(content);
}
