load('libs.js');
load('config.js');

function execute(url, page) {
    url = BASE_URL + url;

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('gbk');
        var data = [];

        var elems = $.QA(doc, 'div.recentupdate2 > ul > li');
        if (!elems.length) return Response.error(url);

        elems.forEach(function(e) {
            var link = $.Q(e, 'a').attr('href');
            var m, id, cover;

            if ((m = link.match(BASE_URL + /.+\/b\/(.*?)\.htm/)) && m[1] && (id = m[1])) {
                cover = String.format('{0}/fengmian/{1}/{2}/{3}s.jpg', "https://cdn.shucdn.com", Math.floor(id / 1000), id, id);
            }

            data.push({
                name: $.Q(e, '.newnav h3 > a:not([class])').text().trim(),
                link: $.Q(e, 'h3 > a').attr('href'),
                cover: $.Q(e, '.imgbox > img').attr('data-src').trim(),
                description: $.Q(e, '.ellipsis_2').text(),
                host: BASE_URL
            })
        })

        return Response.success(data);
    }
    return null;
}