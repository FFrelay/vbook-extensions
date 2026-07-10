load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);
    var response = fetch(url + "/");
    if (!response.ok) return Response.success([url + "/"]);
    var doc = response.html();
    var pages = [];
    pages.push(url + "/");
    var select = doc.select("#indexselect");
    if (select.size() > 0) {
        select.select("option").forEach(function(opt) {
            var val = opt.attr("value") + "";
            if (val) {
                if (val.indexOf("http") !== 0) val = BASE_URL + val;
                if (pages.indexOf(val) < 0) pages.push(val);
            }
        });
    }
    return Response.success(pages);
}
