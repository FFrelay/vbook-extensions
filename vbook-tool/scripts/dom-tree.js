/**
 * dom-tree.js - Trích xuất cấu trúc DOM thu gọn cho AI phân tích
 * Chạy trong môi trường Rhino/VBook
 */
function execute(url) {
    var res = fetch(url);
    if (!res.ok) return Response.error("Fetch failed: " + res.status);
    
    var doc = res.html();
    var body = doc.body();
    
    function extractNode(el, depth) {
        if (depth > 12) return null; // Giới hạn độ sâu
        
        var tag = (el.tagName() + "").toLowerCase();
        // Loại bỏ các tag không cần thiết
        if (["script", "style", "svg", "noscript", "iframe", "header", "footer", "nav"].indexOf(tag) !== -1) {
            return null;
        }

        var node = {
            tag: tag,
            id: (el.id() + ""),
            class: (el.className() + ""),
            text: ""
        };

        // Lấy text nếu là tag chứa text trực tiếp
        var ownText = el.ownText().trim() + "";
        if (ownText.length > 0) {
            node.text = ownText.substring(0, 50);
        }

        // Lấy thuộc tính quan trọng
        if (tag === "a") node.href = (el.attr("href") + "");
        if (tag === "img") node.src = (el.attr("data-src") || el.attr("src") || "") + "";

        var children = [];
        el.children().forEach(function(child) {
            var childNode = extractNode(child, depth + 1);
            if (childNode) children.push(childNode);
        });

        if (children.length > 0) {
            node.children = children;
        }

        // Tối ưu: Nếu không có text và không có con và không có ID/Class quan trọng thì bỏ qua
        if (node.text === "" && (!node.children || node.children.length === 0) && node.id === "" && node.class === "") {
            return null;
        }

        return node;
    }

    var tree = extractNode(body, 0);
    return Response.success(tree);
}
