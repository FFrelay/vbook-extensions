load('libs.js');
load('config.js');
load('utils.js');

function execute(url, page) {
    // Ensure page is string
    if (!page) page = '1';
    page = String(page);
    
    // Normalize URL
    url = normalizeUrl(url);
    
    if (!url) {
        return Response.error('URL không hợp lệ');
    }
    
    Console.log('[GEN] Loading page ' + page + ' from ' + url);
    
    let response = fetch(url);
    if (!response.ok) {
        return Response.error('Không thể tải dữ liệu (HTTP ' + response.status + ')');
    }
    
    try {
        let doc = response.html('gbk');
        let data = [];
        
        // Try primary selector first (from gen2.js - more reliable)
        let elems = doc.select("ul#article_list_content li");
        
        // Fallback selectors if primary fails
        if (!elems || elems.size() === 0) {
            Console.log('[GEN] Primary selector failed, trying fallbacks...');
            elems = doc.select("li.newnav_img, .item, .newnav-item, li[class*=item]");
        }
        
        // If still nothing found
        if (!elems || elems.size() === 0) {
            Console.log('[GEN] No elements found');
            return Response.error('Không tìm thấy dữ liệu truyện trên trang');
        }
        
        Console.log('[GEN] Found ' + elems.size() + ' items');
        
        // Process each element
        elems.forEach(function(e) {
            try {
                // Try multiple selectors for name and link
                let nameElem = $.Q(e, '.newnav h3 > a:not([class])');
                if (!nameElem || !nameElem.text()) {
                    nameElem = $.Q(e, 'h3 > a, .title > a, a.title');
                }
                
                let linkElem = $.Q(e, 'h3 > a');
                if (!linkElem || !linkElem.attr('href')) {
                    linkElem = $.Q(e, '.newnav h3 > a:not([class])');
                }
                
                let name = nameElem ? nameElem.text().trim() : '';
                let link = linkElem ? linkElem.attr('href') : '';
                
                // Skip if missing required fields
                if (!name || !link) {
                    Console.log('[GEN] Skipping item - missing name or link');
                    return;
                }
                
                // Extract cover image
                let coverElem = $.Q(e, 'a.imgbox > img, img[src*=fengmian], img');
                let cover = '';
                if (coverElem) {
                    cover = coverElem.attr('data-src');
                    if (!cover) cover = coverElem.attr('src');
                }
                
                // Extract description
                let description = $.Q(e, '.ellipsis_2, .description, .summary').text();
                
                // Normalize URLs
                cover = ensureProtocol(cover);
                link = ensureProtocol(link);
                
                // Add to data
                data.push({
                    name: name,
                    link: link,
                    cover: cover,
                    description: description,
                    host: BASE_URL
                });
                
            } catch (itemError) {
                Console.log('[GEN] Error processing item: ' + itemError.toString());
                // Skip this item and continue
            }
        });
        
        if (data.length === 0) {
            return Response.error('Không tìm thấy truyện hợp lệ');
        }
        
        // Detect next page
        let nextPage = null;
        let nextLink = doc.select("a.next, a:contains(下一页), a[rel=next]");
        
        if (nextLink && nextLink.size() > 0) {
            // Extract page number from next link
            let href = nextLink.attr('href');
            if (href) {
                let pageMatch = href.match(/(\d+)/);
                if (pageMatch) {
                    nextPage = pageMatch[1];
                }
            }
        }
        
        // Fallback: if we have data, assume there might be more pages
        if (!nextPage && data.length > 0) {
            nextPage = String(parseInt(page) + 1);
        }
        
        Console.log('[GEN] Success - got ' + data.length + ' items, next: ' + nextPage);
        return Response.success(data, nextPage);
        
    } catch (e) {
        Console.log('[GEN] Exception: ' + e.toString());
        return Response.error('Lỗi xử lý dữ liệu: ' + e.message);
    }
}