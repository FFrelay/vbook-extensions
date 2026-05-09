load('libs.js');
load('config.js');
load('utils.js');

function execute(url) {            
    // Normalize URL
    url = normalizeUrl(url);
    
    if (!url) {
        return Response.error('URL không hợp lệ');
    }
    
    Console.log('[TOC] Loading: ' + url);
    
    // Extract book ID from URL
    let bookId = extractId(url);
    if (!bookId) {
        return Response.error('Không thể trích xuất ID từ URL');
    }
    
    Console.log('[TOC] Book ID: ' + bookId);
    
    // Load chapter list page
    let tocUrl = BASE_URL + "/book/" + bookId + "/";
    let response = fetch(tocUrl);
    
    if (!response.ok) {
        return Response.error('Không thể tải mục lục (HTTP ' + response.status + ')');
    }
    
    try {
        let doc = response.html('gbk');
        let data = [];
        
        // Primary selector for chapters
        let elems = $.QA(doc, 'div#catalog.catalog > ul > li > a', {
            reverse: true  // Get in reverse order (oldest to newest)
        });
        
        // Fallback selectors
        if (!elems || elems.length === 0) {
            Console.log('[TOC] Primary selector failed, trying fallbacks...');
            elems = $.QA(doc, 'ul.chapter-list li a, .chapter-item a, div.chapter-list a', {
                reverse: true
            });
        }
        
        if (!elems || elems.length === 0) {
            return Response.error('Không tìm thấy chương nào');
        }
        
        Console.log('[TOC] Found ' + elems.length + ' chapters');
        
        // Process each chapter
        for (let i = 0; i < elems.length; i++) {
            try {
                let elem = elems[i];
                let name = elem.text ? elem.text().trim() : '';
                let url = elem.attr ? elem.attr('href') : '';
                
                if (!name || !url) {
                    continue;
                }
                
                // Clean up chapter name (remove numbering prefix)
                name = formatChapterName(name);
                
                // Normalize URL
                url = ensureProtocol(url);
                
                data.push({
                    name: name,
                    url: url,
                    host: BASE_URL
                });
                
            } catch (itemError) {
                Console.log('[TOC] Error processing chapter: ' + itemError.toString());
                continue;
            }
        }
        
        if (data.length === 0) {
            return Response.error('Không tìm thấy chương hợp lệ');
        }
        
        Console.log('[TOC] Success - got ' + data.length + ' chapters');
        return Response.success(data);
        
    } catch (e) {
        Console.log('[TOC] Exception: ' + e.toString());
        return Response.error('Lỗi tải mục lục: ' + e.message);
    }
}