load("config.js");

function execute(url) {
    url = url.replace(/_/g, "/");
    if (url.slice(-1) !== "/") url += "/";
    var response = fetch(url);
    if (!response.ok) return Response.error("Cannot load page: " + url);
    var doc = response.html();
    var pages = [];
    doc.select("#indexselect option").forEach(function(opt) {
        var val = opt.attr("value") + "";
        if (val) {
            var fullUrl = val.indexOf("http") === 0 ? val : BASE_URL + val;
            if (fullUrl.slice(-1) !== "/") fullUrl += "/";
            if (pages.indexOf(fullUrl) < 0) pages.push(fullUrl);
        }
    });
    if (pages.length === 0) pages.push(url);
    return Response.success(pages);
}
