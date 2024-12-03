function execute(url, page) {
    if(!page) page = "1"
    var url = "https://hitomi.la/"
	if(page!="1"){
        if(page=="2")
            url = "https://hitomi.la/?page=2"
        else
            url = "https://hitomi.la/?page=" + page
    }
	//var doc = Http.get(url + page + "/").html()
        
    var doc = Http.get(url).html()
	var books = doc.select(".gallery-content > div")
	var listBook = []
	books.forEach(book => listBook.push({
		name: book.select(".dj h1 a").text(),
		link: book.select(".dj h1 a").attr("href"),
		cover: "https:" + book.select(".thumb a .th_img img").attr("data-src"),
		description: book.select(".thumb .wrap.top .category a").text(),
		host: "https://hitomi.la"
	}))
    if (listBook.length == 0) next = ""; 
    else next = (parseInt(page) + 1).toString();

    return Response.success(listBook,next)
}
//https://hitomi.la/gallery/88707/