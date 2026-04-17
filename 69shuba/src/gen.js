load('libs.js');
load('config.js');

function execute(url, page) {
    page = page || '1';
    url = String.format(BASE_URL + url, page);
    console.log(url);
    
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('gbk');
        var data = [];
        var elems = $.QA(doc, 'li');
        
        if (elems.length === 0) {
            return Response.error("Không tìm thấy dữ liệu");
        }
        
        elems.forEach(function(e) {
            data.push({
                name: $.Q(e, '.newnav h3 > a:not([class])').text().trim(),
                link: $.Q(e, 'h3 > a').attr('href'),
                cover: $.Q(e, 'a.imgbox > img').attr('data-src').trim(),
                description: $.Q(e, '.ellipsis_2').text(),
                host: BASE_URL
            });
        });
        
        let nextPage = String(parseInt(page) + 1);
        return Response.success(data, nextPage);
    }
    return Response.error("Lỗi kết nối");
}