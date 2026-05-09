load('libs.js');
load('config.js');
load('utils.js');

function execute(key, page) {
    // Ensure page is string
    if (!page) page = '1';
    page = String(page);
    
    if (!key || key.trim() === '') {
        return Response.error('Từ khóa tìm kiếm không hợp lệ');
    }
    
    Console.log('[SEARCH] Query: ' + key + ' (page ' + page + ')');
    
    let response = fetch(BASE_URL + '/modules/article/search.php', {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "searchkey=" + encodeURIComponent(key) + "&submit=Search"
    });
    
    if (!response.ok) {
        return Response.error('Không thể kết nối tới máy chủ (HTTP ' + response.status + ')');
    }
    
    try {
        let doc = response.html('gbk');
        
        // Check if result is a direct match (detail page)
        let titleElem = doc.select("h1, .title, .book-title");
        let contentElem = doc.select("#content, .chapter-content, .txtnav");
        
        if (titleElem && titleElem.size() > 0 && contentElem && contentElem.size() > 0) {
            // This is a detail page - return as single result
            Console.log('[SEARCH] Direct match found');
            return Response.success([{
                name: titleElem.text().trim(),
                link: response.request.url || url,
                cover: doc.select(".bookimg2 > img, .cover img").attr("src"),
                description: doc.select(".navtxt > p, .description").text().substring(0, 100),
                host: BASE_URL
            }], null);
        }
        
        // Otherwise parse as search results list
        let data = [];
        let resultElems = doc.select(".mybox");
        
        if (!resultElems || resultElems.size() === 0) {
            Console.log('[SEARCH] Primary selector failed, trying fallbacks...');
            resultElems = doc.select(".search-result, .book-item, li.item");
        }
        
        if (!resultElems || resultElems.size() === 0) {
            return Response.error('Không tìm thấy kết quả tìm kiếm');
        }
        
        Console.log('[SEARCH] Found ' + resultElems.size() + ' results');
        
        // Process each result
        resultElems.forEach(function(e) {
            try {
                let name = $.Q(e, '.newnav h3 > a:not([class])').text().trim();
                if (!name) {
                    name = $.Q(e, 'h3 > a, .title > a, .name').text().trim();
                }
                
                let link = $.Q(e, '.newnav > a, h3 > a, .title > a').attr('href');
                
                if (!name || !link) {
                    return;
                }
                
                let cover = $.Q(e, '.imgbox > img, img[src*=fengmian], img').attr('data-src');
                if (!cover) {
                    cover = $.Q(e, 'img').attr('src');
                }
                
                let description = $.Q(e, '.newnav > ol.ellipsis_2, .description, .summary').text();
                
                // Normalize URLs
                cover = ensureProtocol(cover);
                link = ensureProtocol(link);
                
                data.push({
                    name: name,
                    link: link,
                    cover: cover,
                    description: description,
                    host: BASE_URL
                });
                
            } catch (itemError) {
                Console.log('[SEARCH] Error processing result: ' + itemError.toString());
            }
        });
        
        if (data.length === 0) {
            return Response.error('Không tìm thấy kết quả hợp lệ');
        }
        
        // Detect next page
        let nextPage = null;
        let nextLink = doc.select("a.next, a:contains(下一页)");
        
        if (nextLink && nextLink.size() > 0) {
            nextPage = String(parseInt(page) + 1);
        }
        
        Console.log('[SEARCH] Success - got ' + data.length + ' results');
        return Response.success(data, nextPage);
        
    } catch (e) {
        Console.log('[SEARCH] Exception: ' + e.toString());
        return Response.error('Lỗi xử lý kết quả tìm kiếm: ' + e.message);
    }
}