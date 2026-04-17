load('config.js');
load('libs.js');

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/, BASE_URL);
    
    var doc;
    var browser = Engine.newBrowser();
    
    try {
        doc = browser.launch(url, 4000);
        var htm = doc.select(".txtnav");
        htm.select(".contentadv").remove();
        htm.select(".bottom-ad").remove();
        htm.select(".txtinfo").remove();
        htm.select("#txtright").remove();
        htm.select("h1").remove();
        htm = htm.html();
        htm = cleanHtml(htm)
            .replace(/^第\d+章.*?<br>/, '')
            .replace(/^第.*章[^<br>]*）/, '')
            .replace('(本章完)', '')
        ;
        return Response.success(htm);
    } finally {
        browser.close();
    }
}