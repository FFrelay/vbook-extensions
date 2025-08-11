load('config.js');
function execute(url, page) {
    if (!page) page = 1;
    let response = fetch(BASE_URL + url + "?page=" + page);
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".clearfix.rec_rboxone > div ul").forEach(e => {
            data.push({
                name: e.select(".two").first().text(),
                cover: "",
                link: e.select(".two a").attr("href"),
                description: e.select(".four").first().text(),
                host: BASE_URL
            })
        });
        let next = parseInt(page) + 1;
        return Response.success(data, next)
    }
    return null;
}