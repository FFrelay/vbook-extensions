load('libs.js');
load('config.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, BASE_URL);
    url = url.replace("/txt/", "/book/");
    
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html('gbk');

        // Helpers / fallbacks
        function textOf(selector, fallback) {
            let el = $.Q(doc, selector);
            if (el && el.text && el.text().trim()) return el.text().trim();
            return fallback || '';
        }
        function attrOf(selector, attr, fallback) {
            let el = $.Q(doc, selector);
            if (el && el.attr) {
                let v = el.attr(attr);
                if (v && v.trim()) return v.trim();
            }
            return fallback || '';
        }
        function normalizeCover(src) {
            if (!src) return '';
            src = src.trim();
            if (src.startsWith('//')) return 'https:' + src;
            if (src.startsWith('/')) return BASE_URL.replace(/\/$/, '') + src;
            if (!/^https?:\/\//i.test(src)) return BASE_URL.replace(/\/$/, '') + '/' + src.replace(/^\//, '');
            return src;
        }

        // Name: prefer structured selector, then meta
        let name = textOf('div.booknav2 > h1 > a');
        if (!name) name = textOf('div.booknav2 > h1');
        if (!name) name = textOf('h1');
        if (!name) name = doc.select('meta[property=og:novel:book_name]').attr('content') || '';

        // Cover: try several attributes and meta
        let cover = attrOf('div.bookimg2 > img', 'src') ||
                    attrOf('div.bookimg2 > img', 'data-src') ||
                    doc.select('meta[property=og:image]').attr('content') || '';
        cover = normalizeCover(cover);

        // Author: robust lookups
        let author = textOf('div.booknav2 > p:contains(作者) > a') ||
                     textOf('div.booknav2 > p:nth-child(3) > a') ||
                     textOf('div.booknav2 .bookinfo a') ||
                     doc.select('meta[property=og:novel:author]').attr('content') || '';
        author = author.trim();

        // Description: prefer visible description block, fallback to meta description
        let descriptionHtml = $.Q(doc, 'div.navtxt > p').html();
        if (!descriptionHtml) descriptionHtml = $.Q(doc, 'div.intro, div.bookintro, .bookintro > p').html();
        if (!descriptionHtml) descriptionHtml = doc.select('meta[name=description]').attr('content') || '';
        descriptionHtml = descriptionHtml ? cleanHtml(descriptionHtml) : '';

        // Detail block: collect plain text from relevant p tags
        let detailText = $.QA(doc, 'div.booknav2 p', { m: function(x) { return x.text(); }, j: '<br>' });
        if (!detailText) {
            // fallback: collect .booknav2 .info lines or .bookinfo
            detailText = $.QA(doc,
