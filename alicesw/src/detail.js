load('config.js');
function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        var genres = [];
        doc.select("#detail-box  td  p a").forEach(e => {
            genres.push({
                title: e.text(),
                input: BASE_URL + e.attr("href"),
                script: "suggest1.js"
            });
        });
        genres.splice(1, 1);
        let author = doc.select(".box_info p:nth-child(2) > a:nth-child(1)").text();
    console.log("SDFsdf")
        return Response.success({
            name: doc.select(".box_info h1 ").text(),
            cover: doc.select(".lazyload_book_cover").attr("data-src"),
            author: author,
            description: doc.select(".intro").text(),
            detail: doc.select(".pic").last().html(),
            genres: genres,
            suggests: [
                {
                    title: "Đề cử",
                    input: doc.select(".ui-ranking ul").html(),
                    script: "suggest.js"
                }
            ],
            host: BASE_URL
        });
    }
    return null;
}