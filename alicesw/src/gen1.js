load('config.js');
function execute(url) {
    let response = fetch(BASE_URL + url);
    if (response.ok) {
        let doc = response.html();
        const data = [];
        doc.select(".clearfix.rec_rboxone > div ul").forEach(e => {
            data.push({
                name: e.select(".two").first().text(),
                cover: "https://i.postimg.cc/T2WtdmBM/5BdXa90.webp",
                link: e.select(".two a").attr("href"),
                description: e.select(".four").first().text(),
                host: BASE_URL
            })
        });
        return Response.success(data)
    }
    return null;
}