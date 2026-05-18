load("config.js");

function execute(input, page) {
    // Validate input
    if (!input) {
        return null;
    }

    let response = fetch(BASE_URL + input);
    if (response.ok) {
        let doc = response.html();
        let booksList = doc.select(".mybox .newbox ul li");
        console.log(booksList);
        
        // Null check before accessing element
        let nextElement = doc.select(".next").first();
        let next = nextElement && nextElement.attr ? nextElement.attr("href") : null;
        
        let books = [];
        booksList.forEach(book => {
            books.push({
                name: book.select(".newnav h3 a").text(),
                link: book.select(".newnav h3 a").attr("href"),
                cover: book.select("img").attr("data-src"),
                description: book.select(".ellipsis_2").text().trim(),
                host: BASE_URL
            });
        });
        return Response.success(books, next);
    }
    return null;
}