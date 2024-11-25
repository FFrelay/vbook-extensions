function execute(url, page) {
    if(!page) page = "1"
    var url = "https://hentairox.com/"
	if(page!="1"){
        if(page=="2")
            url = "https://hentairox.com/page/2/"
        else
            url = "https://hentairox.com/pag/" + page + "/"
    }
	//var doc = Http.get(url + page + "/").html()

        
    var doc = Http.get(url).html()
	var books = doc.select(".lc_galleries > div")
	var listBook = []
	books.forEach(book => listBook.push({
		name: book.select(".caption a").text(),
		link: book.select(".caption a").attr("href"),
		cover: book.select(".inner_thumb img").attr("src"),
		description: "",
		host: "https://hentairox.com"
	}))
    if (listBook.length == 0) next = ""; 
    else next = (parseInt(page) + 1).toString();

    return Response.success(listBook,next)
}
//https://hentairox.com/gallery/88707/