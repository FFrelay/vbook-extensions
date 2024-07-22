function execute(url) {
    const doc = Http.get(url).html()

    return Response.success({
        name: doc.select(".title .pretty").first().text(),
        cover: doc.select("#cover img").first().attr("data-src"),
        author: doc.select("a[href^=/artist/]").first().text(),
        detail: doc.select("#tags").html(),
		description: doc.select("#info").html(),
        host: "https://nhentai.net",
        ongoing: false,
        nsfw: true
    });
}