load('libs.js');
load('config.js');

function execute(url, page) {
    // Some inputs are relative genre paths like "/novels/class/2.htm"
    // Ensure absolute url
    url = String.format(BASE_URL + url);
    console.log('GEN URL:', url);

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('gbk');
        var data = [];

        // Try multiple list selectors to handle different page layouts
        var elems = doc.select("ul#article_list_content li");
        if (elems == '' || elems.size() == 0) {
            elems = doc.select("div.mybox, div.bookbox, .book-list .item, .booklist li, .list_r li");
        }

        elems.forEach(function(e) {
            // Name -> try multiple places (h3 a, .newnav h3>a, h2, .title)
            var name = $.Q(e, '.newnav h3 > a:not([class])').text().trim() ||
                       $.Q(e, 'h3 > a').text().trim() ||
                       $.Q(e, '.title a').text().trim() ||
                       $.Q(e, 'h2 > a').text().trim();

            // Link -> prefer anchor href in title area
            var link = $.Q(e, '.newnav h3 > a, h3 > a, .title a, h2 > a').attr('href') || '';

            // Cover -> support data-src, src, lazy attributes
            var cover = $.Q(e, 'a.imgbox > img').attr('data-src') ||
                        $.Q(e, 'a.imgbox > img').attr('src') ||
                        $.Q(e, '.imgbox img').attr('data-src') ||
                        $.Q(e, '.imgbox img').attr('src') ||
                        $.Q(e, 'img').attr('data-src') || '';

            if (cover) {
                cover = cover.trim();
                if (cover.startsWith('//')) cover = 'https:' + cover;
                if (cover.startsWith('/')) cover = BASE_URL.replace(/\/$/, '') + cover;
            }

            var description = $.Q(e, '.ellipsis_2, .desc, .summary, p').text().trim();

            // Normalize link: if relative, prepend host
            if (link && !link.startsWith('http')) {
                if (link.startsWith('/')) link = BASE_URL.replace(/\/$/, '') + link;
                else link = BASE_URL.replace(/\/$/, '') + '/' + link;
            }

            // Skip if name or link missing
            if (!name || !link) return;

            data.push({
                name: name,
                link: link,
                cover: cover,
                description: description,
                host: BASE_URL
            });
        });

        return Response.success(data);
    }
    return null;
}