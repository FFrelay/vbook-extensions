load('libs.js');
load('config.js');

function execute(url, page) {
    // Validate input
    if (!url) {
        return Response.error('Invalid URL');
    }

    page = page || '1';
    
    // Check if the URL template supports pagination via {0}
    var hasPagination = url.indexOf('{0}') !== -1;
    var targetUrl = hasPagination ? String.format(BASE_URL + url, page) : (BASE_URL + url);

    console.log(targetUrl);
    let response = fetch(targetUrl);
    if (response.ok) {
        let doc = response.html('gbk');
        var data = [];
        var elems = $.QA(doc, '#article_list_content li');
        if (!elems.length) return Response.error(targetUrl);
        
        elems.forEach(function (e) {
            var link = $.Q(e, 'h3 > a').attr('href');
            
            // Null check for link
            if (!link) return;
            
            var m, id, cover;
            if ((m = link.match(/\/(?:book|b)\/(\d+)\.htm/)) && m[1]) {
                id = m[1];
                cover = String.format('{0}/files/article/image/{1}/{2}/{3}s.jpg',
                    CDN_URL,
                    Math.floor(id / 1000),
                    id,
                    id
                );
            }

            data.push({
                name: $.Q(e, '.newnav h3 > a:not([class])').text().trim(),
                link: link,
                cover: cover || '',
                description: $.Q(e, '.a', 1).text(),
                host: BASE_URL
            });
        });

        // Only return a next page token if the URL actually supports pagination
        if (hasPagination) {
            var next = parseInt(page, 10) + 1;
            return Response.success(data, next.toString());
        }
        // Return null for next to signal the app to stop paginating
        return Response.success(data, null);
    }
    return null;
}