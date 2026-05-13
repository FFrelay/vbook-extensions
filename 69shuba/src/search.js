load('libs.js');
load('config.js');
load('gbk.js'); // Load once at the top to avoid memory leak

function execute(key, page) {
    // Validate input
    if (!key) {
        return Response.error('Invalid search key');
    }

    // GBK URI encode: '打更人' --> '%B4%F2%B8%FC%C8%CB'
    // https://www.69shu.com/modules/article/search.php?searchkey=%B4%F2%B8%FC%C8%CB&searchtype=all
    var url = String.format('{0}/modules/article/search.php?searchkey={1}&searchtype=all', 
        BASE_URL, 
        GBK.encode(key)
    );

    let response = fetch(url);
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
                });
            });

            return Response.success(data);
        }

        // Single result case - '大奉'
        // https://www.69shu.com/modules/article/search.php?searchkey=%B4%F3%B7%EE&searchtype=all
        var titleElement = $.Q(doc, 'div.booknav2 > h1 > a');
        if (titleElement && titleElement.text()) {
            return Response.success([{
                name: titleElement.text(),
                link: titleElement.attr('href'),
                cover: $.Q(doc, 'div.bookimg2 > img').attr('src'),
                description: $.Q(doc, 'div.booknav2 > p:nth-child(2) > a').text().trim(),
                host: BASE_URL
            }]);
        }

        return Response.error(key);
    }
    
    return null;
}