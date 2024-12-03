function execute(key, page) {
    //https://hitomi.la/search/?q=public&page=3
    if(!page) page="1"
    var doc = Http.get("https://hitomi.la/search/?s_key="+ key +"&page=" + page).html()

    if(doc){
        var books = doc.select(".box_thumbs > div")
        var listBook = []
        books.forEach(book => listBook.push({
            name: book.select(".thumb a .title").text(),
            link: book.select(".thumb a").attr("href"),
            cover: book.select(".thumb a .th_img img").attr("src"),
            description: book.select(".thumb .wrap.top .category a").text(),
            host: "https://hitomi.la"
        }))
        if (listBook.length == 0) next = ""; 
        else next = (parseInt(page) + 1).toString();

        return Response.success(listBook,next)
    }
}