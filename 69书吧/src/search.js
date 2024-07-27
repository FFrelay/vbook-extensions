load('libs.js');
load('config.js');

function execute(key, page) {

    let response = fetch(BASE_URL + '/modules/article/search.php', {
        method: "POST",
        body: {
            "searchkey={{key}}&searchtype=all"
        }
		});
    if (response.ok) {
        let doc = response.html('gbk');

        var data = [];

        var elems = $.QA(doc, '.newbox li');
        if (elems.length) {
            elems.forEach(function(e) {
                data.push({
                    name: $.Q(e, '.newnav h3 > a:not([class])').text().trim(),
                    link: $.Q(e, '.newnav > a').attr('href'),
                    cover: $.Q(e, '.imgbox > img').attr('data-src').trim(),
                    description: $.Q(e, '.zxzj > p').text().replace('最近章节', ''),
                    host: BASE_URL
                })
            })

            return Response.success(data);
        }
return Response.error(key);
    }
    
    return null;
}