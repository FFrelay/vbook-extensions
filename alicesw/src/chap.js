function execute(url) {
    var browser = Engine.newBrowser(); // Khởi tạo browser
    var doc = browser.launch(url, 5000);
    browser.close();
    // if (doc.text().length < 1000) { return Response.error("Đăng nhập và reload"); }
    let htm = doc.select(".read-content").html();
    htm = htm.replace(/\&nbsp;/g, "".replace(/<br\s*\/?>|\n/g, "<br><br>"));
    return Response.success(htm);
}