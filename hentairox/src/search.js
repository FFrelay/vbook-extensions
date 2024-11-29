function execute(key, page) {
    //https://hentairox.com/search/?q=public&page=3
    if(!page) page="1"
    var doc = Http.get("https://hentairox.com/search/?key="+ key +"&page=" + page).html()

    if(doc){
        var books = doc.select(".thumbs_container > div")
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
}