function execute(url) {
    var doc = Http.get(url + "/").html()
    var info = doc.select(".gallery_top")
    return Response.success({
        name: info.select(".gallery_right .info h1").text(),
        cover: info.select(".gallery_left .cover img").attr("src"),
        host: "https://hentaifox.com/",
        author: info.select(".gallery_right .artists li:nth-child(2) a").text(),
        detail: doc.select(".gallery_right .info").html(),
        description: doc.select(".gallery_right .categories").html(),
    })
}