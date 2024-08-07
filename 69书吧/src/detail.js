load('libs.js');
load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    url = url.replace("/txt/","/book/")
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('gbk');
            var m, id, cover;
			var link = url;

            if ((m = link.match(BASE_URL + /.+\/book\/(.*?)\.htm/)) && m[1] && (id = m[1])) {
                cover = String.format('{0}/fengmian/{1}/{2}/{3}s.jpg', "https://cdn.shucdn.com", Math.floor(id / 1000), id, id);
            }
        return Response.success({
            name: $.Q(doc, 'div.booknav2 > h1 > a').text(),
            //cover: $.Q(doc, 'div.bookimg2 > img').attr('src'),
			cover: cover || '',
            author: $.Q(doc, 'div.booknav2 > p:nth-child(2) > a').text().trim(),
            description: $.Q(doc, 'div.content > p').html(),
            detail: $.QA(doc, 'div.booknav2 p', {m: x => x.text(), j: '<br>'}),
            host: BASE_URL
        })
    }
    return null;
}