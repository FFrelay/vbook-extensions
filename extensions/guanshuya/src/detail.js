load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    var nameEl = doc.select("#info h1").first();
    var name = (nameEl ? nameEl.text() : "") + "";

    var coverEl = doc.select("#fmimg img.lazy").first();
    var cover = "";
    if (coverEl) {
        cover = (coverEl.attr("data-original") || coverEl.attr("src") || "") + "";
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
        if (cover) {
            try {
                var urlObj = new URL(cover);
                urlObj.pathname = urlObj.pathname.split("/").map(function (p) { return encodeURIComponent(p); }).join("/");
                cover = urlObj.toString();
            } catch (e) {
                cover = encodeURI(cover);
            }
        }
    }

    var authorEl = doc.select("#info p a[href*='/author/']").first();
    var author = (authorEl ? authorEl.text() : "") + "";

    var statusText = "";
    doc.select("#info p.visible-xs").forEach(function (el) {
        var t = (el.text() + "").trim();
        if (t.indexOf("状态") >= 0) {
            statusText = t;
        }
    });
    if (!statusText) {
        doc.select("#info p.hidden-xs").forEach(function (el) {
            var t = (el.text() + "").trim();
            if (t.indexOf("|") >= 0) {
                var parts = t.split("|");
                statusText = parts[parts.length - 1] + "";
            }
        });
    }
    var ongoing = statusText.indexOf("完结") === -1 && statusText.indexOf("Completed") === -1 && statusText.indexOf("完本") === -1;

    var descEl = doc.select("#intro").first();
    var description = (descEl ? descEl.html() : "") + "";

    var genres = [];
    var breadcrumbLinks = doc.select(".con_top a");
    if (breadcrumbLinks.size() >= 2) {
        var genreEl = breadcrumbLinks.get(1);
        var gTitle = (genreEl.text() + "").trim();
        var gHref = (genreEl.attr("href") || "") + "";
        if (gTitle && gHref) {
            if (!gHref.startsWith("http")) gHref = BASE_URL + gHref;
            genres.push({ title: gTitle, input: gHref, script: "gen.js" });
        }
    }

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        ongoing: ongoing,
        genres: genres.length > 0 ? genres : undefined
    });
}
