load('libs.js');
load('config.js');

function execute(url, page) {
    url = String.format(BASE_URL + url);
    console.log(url)
    // log(url);
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('gbk');
        var data = [];
        var elems = doc.select("ul#article_list_content li")
        elems.forEach(function(e) {
            data.push({
                name: $.Q(e, '.newnav h3 > a:not([class])').text().trim(),
                link: $.Q(e, 'h3 > a').attr('href'),
                cover: $.Q(e, 'a.imgbox > img').attr('data-src').trim(),
                description: $.Q(e, '.ellipsis_2').text(),
                host: BASE_URL
            })
        })
        return Response.success(data);
    }
    return null;
}