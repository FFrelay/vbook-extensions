load('libs.js');
load('config.js');

function execute(url) {
    const regex = /\/(\d+)\.htm/;
    const match = url.match(regex);
    
    if (!match || !match[1]) {
        return Response.error("Không thể trích xuất ID từ URL");
    }
    
    let book_id = match[1];
    console.log(book_id);
    
    let response = fetch(BASE_URL + "/book/" + book_id + "/");
    if (response.ok) {
        let doc = response.html('gbk');
        var data = [];
        var elems = $.QA(doc, 'div#catalog.catalog > ul > li > a', {reverse: true});
        
        elems.forEach(function(e) {
            data.push({
                name: formatName(e.text()),
                url: e.attr('href'),
                host: BASE_URL
            });
        });

        return Response.success(data);
    }
    return Response.error("Không thể tải mục lục");
}

function formatName(name) {
    var re = /^(\d+)\.第(\d+)章/;
    return name.replace(re, '第$2章');
}