load('libs.js');
load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    url = url.replace("/txt/","/book/")
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('gbk');
            
        return Response.success({
            name: $.Q(doc, 'div.booknav2 > h1 > a').text(),
            cover: $.Q(doc, 'div.bookimg2 > img').attr('src'),
            author: $.Q(doc, 'div.booknav2 > p:nth-child(3) > a').text().trim(),
            //description: $.Q(doc, 'div.content > p').html(), //69shuba.cx
			description: $.Q(doc, 'div.navtxt > p').html(), //69shuba.com
            detail: $.QA(doc, 'div.booknav2 p', {m: x => x.text(), j: '<br>'}),
            host: BASE_URL
        })
    }
    return null;
}