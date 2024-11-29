function execute(url) {
    var doc = Http.get(url + "/").html()
    var info = doc.select(".gallery_top")
    return Response.success({
        name: info.select(".gt_top gt_right h1").text(),
        cover: info.select(".gt_top .gt_left img").attr("src"),
        host: "https://hentaienvy.com/",
        author: info.select(".gt_right_tags > ul:nth-child(3) > span:nth-child(1) a").text(),
        detail: doc.select(".gt_top .gt_right .gt_right_tags").html(),
        description: doc.select(".gt_right_tags").html(),
    })
}