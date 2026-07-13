load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var htm = doc.select("#content.readcontent").html() + "";
        return Response.success(htm);
    }
    return null;
}
