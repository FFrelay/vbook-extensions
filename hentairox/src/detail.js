function execute(url) {
    var doc = Http.get(url + "/").html()
    var info = doc.select(".row.gallery_first")
    return Response.success({
        name: info.select(".col-md-7.col-sm-7.col-lg-8.right_details h1").text(),
        cover: info.select(".col-md-4.col a img").attr("data-src"),
        host: "https://hentairox.com/",
        author: info.select(".gallery_info li:nth-child(2) a:nth-child(2) span:nth-child(1)").text(),
        detail: doc.select(".col-md-7.col-sm-7.col-lg-8.right_details").html(),
        description: doc.select(".col-md-7.col-sm-7.col-lg-8.right_details .galleries_info a span.item_name").html(),
    })
}