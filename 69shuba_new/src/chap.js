load('config.js');
load('libs.js');
load('utils.js');

function execute(url) {
    // Normalize URL
    url = normalizeUrl(url);
    
    if (!url) {
        return Response.error('URL chương không hợp lệ');
    }
    
    Console.log('[CHAP] Loading: ' + url);
    
    var browser = Engine.newBrowser();
    
    try {
        // Launch browser with timeout
        Console.log('[CHAP] Launching browser...');
        let doc = browser.launch(url, 5000);
        
        // Find content container
        let contentElem = doc.select(".txtnav");
        
        if (!contentElem || contentElem.size() === 0) {
            Console.log('[CHAP] Primary selector failed, trying fallbacks...');
            contentElem = doc.select(".content, #content, .chapter-content, .chapter-body");
        }
        
        if (!contentElem || contentElem.size() === 0) {
            throw new Error('Không tìm thấy phần nội dung');
        }
        
        // Remove ads and unwanted elements
        contentElem.select(".contentadv, .bottom-ad, .txtinfo, #txtright, .ads, script, style").remove();
        
        let htm = contentElem.html();
        
        if (!htm || htm.trim() === '') {
            throw new Error('Nội dung chương trống');
        }
        
        // Clean content
        htm = cleanContent(htm);
        
        // Remove chapter title lines
        htm = htm.replace(/^第\d+章.*?<br>/, '');
        htm = htm.replace(/^第.*章[^<br>]*）/, '');
        
        // Remove common markers
        htm = htm.replace('(本章完)', '');
        htm = htm.replace('(本章完毕)', '');
        htm = htm.replace('[本章完]', '');
        
        // Final cleanup
        htm = htm.trim();
        
        if (!htm || htm.length < 50) {
            return Response.error('Nội dung chương quá ngắn hoặc trống');
        }
        
        Console.log('[CHAP] Success - content length: ' + htm.length);
        return Response.success(htm);
        
    } catch (e) {
        Console.log('[CHAP] Exception: ' + e.toString());
        return Response.error('Lỗi tải nội dung: ' + e.message);
    } finally {
        // Always close browser
        try {
            browser.close();
            Console.log('[CHAP] Browser closed');
        } catch (closeError) {
            Console.log('[CHAP] Error closing browser: ' + closeError);
        }
    }
}