load('config.js');
function execute(url) {
    let response = fetch(BASE_URL + url);
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".clearfix.rec_rboxone > div ul").forEach(e => {
            data.push({
                name: e.select(".two").first().text(),
                cover: "",
                link: e.select(".two a").attr("href"),
                description: e.select(".sev").first().text() + " " + e.select(".five").first().text(),
                host: BASE_URL
            })
        });
        return Response.success(data)
    }
    return null;
}