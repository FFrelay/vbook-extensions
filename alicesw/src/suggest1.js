load('config.js');
function execute(key, page) {
    if (!page) page = 1;
    let response = fetch( key + "&p=" + page)
    if (response) {
        let doc = response.html();
        let data = [];
        let elems = doc.select(".list-group")
        if (!elems.length) return Response.error(key);

        elems.forEach(function (e) {
            var link = e.select('h5 a').first().attr('href')
            data.push({
                name: e.select('h5 a').text(),
                link: link,
                cover: "https://i.postimg.cc/T2WtdmBM/5BdXa90.webp",
                description: e.select('.text-muted').text()
            })
        })
        let next = parseInt(page) + 1;
        return Response.success(data, next);
    }
    return null;
}
