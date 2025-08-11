load('config.js');
function execute(url) {
    url = url.replace('/novel/', '/other/chapters/id/')
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let el = doc.select(".mulu_list li")
        const data = [];
        for (let i = 0; i < el.size(); i++) {
            var e = el.get(i);
            data.push({
                name: e.select("a").text(),
                url: BASE_URL + e.select("a").attr("href"),
                host: BASE_URL
            })
        }
        return Response.success(data);
    }
    return null;
}