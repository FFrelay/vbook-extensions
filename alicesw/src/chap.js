function execute(url) {
    var browser = Engine.newBrowser(); // Khởi tạo browser
    var doc = browser.launch(url, 5000);
    browser.close();
    let htm = doc.select(".content_txt").html();
    return Response.success(htm);
}