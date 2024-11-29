function execute(url) {
    //var doc = Http.get(url + "/").html()
    var listChapter = []
    listChapter.push({
        name : "Read now",
        url : url,
        host : "https://hentaienvy.com"
    })

	return Response.success(listChapter)
}

//https://hentaienvy.com/gallery/88692/
//https://hentaienvy.com/g/88692/1/