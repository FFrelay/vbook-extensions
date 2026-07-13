load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var htm = doc.select("#content.readcontent").html() + "";
        htm = htm.replace(/：“/g, "：</p><p>“");
        htm = htm.replace(/：‘/g, "：</p><p>‘");
        htm = htm.replace(/·{3}/g, "…");
        return Response.success(htm);
    }
    return null;
}