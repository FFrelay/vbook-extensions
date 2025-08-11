load('config.js');
function execute(input) {
    let doc = Html.parse(input);
    let books = [];
    doc.select(".itemr").forEach(e => {
        books.push({
            name: e.select(".hottitle").text(),
            link: e.select("a.hottitle").attr("href"),
            cover: e.select(".dover img").first().attr("src"),
            description: e.select(".multi-line").text(),
            host: BASE_URL
        })
    });

    return Response.success(books);

}