load("config.js");

function execute(url) {
    url = normalizeUrl(url);
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);
    return Response.success([url]);
}
