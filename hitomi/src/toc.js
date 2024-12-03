function execute(url) {
    //var doc = Http.get(url + "/").html()
    var listChapter = []
    listChapter.push({
        name : "Read now",
        url : url,
        host : "https://hitomi.la"
    })

	return Response.success(listChapter)
}

//https://hitomi.la/gallery/88692/
//https://hitomi.la/g/88692/1/