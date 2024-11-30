function execute(url) {
    var doc = Http.get(url + "/").html()
    var info = doc.select(".gt_top")
    return Response.success({
        name: info.select(".gt_right h1").text(),
        cover: info.select(".gt_left img").attr("src"),
        host: "https://hentaienvy.com/",
        author: info.select(".gt_right_tags ul3 li a").text(),
        detail: doc.select(".gt_right_tags").html(),
        description: "",
    })
}