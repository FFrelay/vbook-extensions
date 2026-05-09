load('libs.js');
load('config.js');
load('utils.js');

function execute(url) {
    // Normalize URL
    url = normalizeUrl(url);
    url = url.replace("/txt/", "/book/");
    
    if (!url) {
        return Response.error('URL không hợp lệ');
    }
    
    Console.log('[DETAIL] Loading: ' + url);
    
    let response = fetch(url);
    if (!response.ok) {
        return Response.error('Không thể tải trang chi tiết (HTTP ' + response.status + ')');
    }
    
    try {
        let doc = response.html('gbk');
        
        // Extract main information with validation
        let name = $.Q(doc, 'div.booknav2 > h1 > a').text().trim();
        let cover = $.Q(doc, 'div.bookimg2 > img').attr('src');
        let author = $.Q(doc, 'div.booknav2 > p:nth-child(3) > a').text().trim();
        let description = $.Q(doc, 'div.navtxt > p').html();
        
        // Validate required fields
        if (!name) {
            return Response.error('Không tìm thấy tên truyện');
        }
        
        // Clean up content
        cover = cover ? ensureProtocol(cover) : '';
        description = description ? cleanContent(description) : '';
        
        // Build detail info
        let detailInfo = [];
        $.QA(doc, 'div.booknav2 p', {
            m: function(x) { return x.text().trim(); },
            f: function(x) { return x.text().trim().length > 0; }
        }).forEach(function(text) {
            if (text && text.length > 0) {
                detailInfo.push(text);
            }
        });
        
        let detail = detailInfo.join('<br>');
        
        // Extract book ID for related content
        let bookId = extractId(url);
        
        // Build response
        let result = {
            name: name,
            cover: cover,
            author: author,
            description: description,
            detail: detail,
            host: BASE_URL,
            ongoing: true  // 69shuba doesn't clearly mark completion
        };
        
        // Add optional genres (clickable tags)
        if (bookId) {
            result.suggests = [{
                title: '同类小说',
                input: BASE_URL + '/novels/class/',
                script: 'gen.js'
            }];
        }
        
        Console.log('[DETAIL] Success: ' + name);
        return Response.success(result);
        
    } catch (e) {
        Console.log('[DETAIL] Exception: ' + e.toString());
        return Response.error('Lỗi xử lý trang chi tiết: ' + e.message);
    }
}