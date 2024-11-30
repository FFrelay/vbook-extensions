function execute(url, page) {
    if(!page) page = "1"
    var url = "https://hentaienvy.com/"
	if(page!="1"){
        if(page=="2")
            url = "https://hentaienvy.com/?page=2"
        else
            url = "https://hentaienvy.com/?page=" + page
    }
	//var doc = Http.get(url + page + "/").html()
        
    var doc = Http.get(url).html()
	var books = doc.select(".box_thumbs > div")
	var listBook = []
	books.forEach(book => listBook.push({
		name: book.select(".thumb .title").text(),
		link: book.select(".thumb a").attr("href"),
		cover: book.select(".thumb a .th_img img").attr("src"),
		description: book.select(".thumb .wrap.top .category a").text(),
		host: "https://hentaienvy.com"
	}))
    if (listBook.length == 0) next = ""; 
    else next = (parseInt(page) + 1).toString();

    return Response.success(listBook,next)
}
//https://hentaienvy.com/gallery/88707/