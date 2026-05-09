// ================================================
// UTILITY FUNCTIONS FOR 69SHUBA EXTENSION
// ================================================

// URL normalization - handle various domain formats
function normalizeUrl(url) {
    if (!url) return '';
    
    // Remove domain variations and redirect to BASE_URL
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, BASE_URL);
    
    // Ensure trailing slash is removed for consistency
    return url.replace(/\/$/, '');
}

// Clean HTML content - remove ads, scripts, and format text
function cleanContent(html) {
    if (!html) return '';
    
    // Replace newlines with <br>
    html = html.replace(/\n/g, '<br>');
    
    // Remove duplicate <br> tags
    html = html.replace(/(<br>\s*){2,}/gm, '<br>');
    
    // Remove HTML comments
    html = html.replace(/<!--[\s\S]*?-->/gm, '');
    
    // Decode HTML entities (common ones)
    html = html.replace(/&nbsp;/g, ' ');
    html = html.replace(/&amp;/g, '&');
    html = html.replace(/&lt;/g, '<');
    html = html.replace(/&gt;/g, '>');
    
    // Trim whitespace and multiple spaces
    html = html.trim();
    html = html.replace(/\s{2,}/g, ' ');
    
    return html;
}

// Validate data structure - ensure required fields exist
function validateItem(item, requiredFields) {
    if (!item) return false;
    
    for (let i = 0; i < requiredFields.length; i++) {
        let field = requiredFields[i];
        if (!item[field] || item[field].toString().trim() === '') {
            return false;
        }
    }
    
    return true;
}

// Select elements with fallback selectors - try multiple CSS selectors
function selectWithFallbacks(doc, selectors) {
    if (typeof selectors === 'string') {
        return doc.select(selectors);
    }
    
    // selectors is array
    for (let i = 0; i < selectors.length; i++) {
        let selector = selectors[i];
        let elements = doc.select(selector);
        if (elements && elements.size && elements.size() > 0) {
            return elements;
        }
    }
    
    // Return empty Elements object if none match
    return doc.select('null');
}

// Get next page number - detect pagination
function getNextPage(currentPage, totalPages, hasNextLink) {
    let pageNum = parseInt(currentPage) || 1;
    
    // If we have explicit total pages, compare
    if (totalPages && totalPages > 0) {
        if (pageNum >= totalPages) return null;
    }
    
    // If we have a next link and data, assume there's more
    if (hasNextLink) {
        return String(pageNum + 1);
    }
    
    // If we got data but no explicit next, be cautious
    return null;
}

// Safe JSON parse with fallback
function safeJsonParse(str, fallback) {
    try {
        return JSON.parse(str);
    } catch (e) {
        Console.log('JSON parse error: ' + e + ' | Input: ' + (str ? str.substring(0, 100) : 'null'));
        return fallback || null;
    }
}

// Extract ID from URL using regex
function extractId(url, pattern) {
    if (!pattern) {
        // Default: look for /(\d+)/ or /(\d+)\.
        pattern = /\/(\d+)(?:\/|\.)/;
    }
    
    let match = url.match(pattern);
    return match ? match[1] : null;
}

// Format chapter name - remove numbering prefix if present
function formatChapterName(name) {
    if (!name) return '';
    
    // Remove "1.第5章" format -> "第5章"
    name = name.replace(/^\d+\./, '');
    
    // Remove leading/trailing whitespace
    return name.trim();
}

// Ensure URL has protocol
function ensureProtocol(url, protocol) {
    if (!url) return '';
    
    protocol = protocol || 'https';
    
    if (url.startsWith('//')) {
        return protocol + ':' + url;
    }
    
    if (url.startsWith('/')) {
        return BASE_URL + url;
    }
    
    if (!url.startsWith('http')) {
        return BASE_URL + '/' + url;
    }
    
    return url;
}

// Limit text length for display
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}