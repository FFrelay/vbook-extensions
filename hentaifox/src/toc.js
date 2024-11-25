function execute(url) {
    //var doc = Http.get(url + "/").html()
    var listChapter = []
    listChapter.push({
        name : "Read now",
        url : url,
        host : "https://hentairox.com"
    })

	return Response.success(listChapter)
}

//https://hentairox.com/gallery/88692/
//https://hentairox.com/g/88692/1/