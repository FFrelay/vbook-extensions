load('libs.js');
load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    
    let response = fetch(BASE_URL + '/modules/article/search.php', {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "searchkey=" + encodeURIComponent(key) + "&submit=Search"
    });
    
    if (response.ok) {
        const data = [];
        let doc = response.html();
        let book_list = doc.select(".mybox");
        
        book_list.forEach(function(e) {
            data.push({
                name: $.Q(e, '.newnav h3 > a:not([class])').text().trim(),
                link: $.Q(e, '.newnav > a').attr('href'),
                cover: $.Q(e, '.imgbox > img').attr('data-src').trim(),
                description: $.Q(e, '.newnav > ol.ellipsis_2').text(),
                host: BASE_URL
            });
        });
        
        let nextPage = String(parseInt(page) + 1);
        return Response.success(data, nextPage);
    }
    return Response.error("Tìm kiếm thất bại");
}