load('config.js');
load('search0.js');

function execute(key, page) {
    let token = getToken()
    console.log(JSON.stringify(token))

    if (!page) page = '1';
    let response = fetch(BASE_URL + '/modules/article/search.php', {
        method: "POST",
        body: {
            "searchkey" : key,
			"searchtype" : "all"
        }
    });
    if (response.ok) {
        const data = [];
		let doc = response.html();
        console.log(doc.html())
        let book_list = doc.select(".result_list .book");
        book_list.forEach(e => {
            data.push({
                    name: $.Q(e, '.newnav h3 > a:not([class])').text().trim(),
                    link: $.Q(e, '.newnav > a').attr('href'),
                    cover: $.Q(e, '.imgbox > img').attr('data-src').trim(),
                    description: $.Q(e, '.zxzj > p').text().replace('最近章节', ''),
                    host: BASE_URL
            });
        });
        var next = parseInt(page, 10) + 1;
        return Response.success(data, next)
    }
    return null;
}