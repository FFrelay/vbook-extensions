load("config.js");
function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, BASE_URL);
    var response = fetch(url);
    if (response.ok) {
        var doc = response.html();
        var name = doc.select("h1.booktitle").text() + "";
        var author = doc.select(".booktag a.red").text() + "";
        var cover = doc.select(".bookcover img.thumbnail").attr("src") + "";
        var description = doc.select(".bookintro").html() + "";
        var category = doc.select(".booktag a.blue").text() + "";
        var statusText = doc.select(".booktag span.red").text() + "";
        var ongoing = statusText.indexOf("连载") >= 0;
        var newChap = doc.select("a.bookchapter").text() + "";
        var detail = "Thể loại: " + category + "<br>Tình trạng: " + statusText + "<br>Mới nhất: " + newChap;
        return Response.success({
            name: name,
            cover: cover,
            author: author,
            description: description,
            detail: detail,
            ongoing: ongoing,
            host: BASE_URL
        });
    }
    return null;
}
