function execute(url) {
    let response = fetch(url)
    if (response.ok) {
        let doc = response.html();
        console.log(doc)
        let book = doc.select(".main_box .content_box .left_box")
        let detail="";
        book.select(".info_box div").forEach( e=>{
                detail+=e.text()+"<br>"
        })
        return Response.success({
            name: book.select(".info_box h1").text(),
            cover: book.select(".cover").attr('src'),
            author: book.select(".info_box div").get(2).text().replace("作者：", ""),
            description: book.select(".detail_box").text().replace(/\r?\n|开始阅读|继续阅读|免费黄片|涩漫天堂|免费色漫|免费P站|（.*）/g,""),
            detail: detail,
            host: "https://www.uaa.com"
        });
    }
    return null;
}