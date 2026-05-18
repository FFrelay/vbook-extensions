load('libs.js');
load('config.js');

function execute(url, page) {
    // Validate input
    if (!url) {
        return Response.error('Invalid URL');
    }

    if (!page) page = '1';

    // Build URL: if page is 1 use original URL, otherwise add page number
    let fullUrl = page === '1'
        ? BASE_URL + "/tag" + url
        : BASE_URL + "/tag" + url + page + "/";
    console.log(fullUrl);

    let response = fetch(fullUrl);
    if (!response.ok) return Response.success([]);

    let doc = response.html('gbk');
    const data = [];

    // Get list of articles from <ul>
    doc.select("ul#article_list_content li").forEach(e => {
        let link = e.select("h3 a").attr("href");
        
        // Null check for link
        if (!link) return;
        
        let name = e.select("h3").text().trim();
        let description = e.select(".zxzj > p").text().replace("最近章节", "");
        let m = link.match(/\/(?:book|b)\/(\d+)\.htm/);
        let id = m ? m[1] : "";
        let cover = id
            ? `${CDN_URL}/files/article/image/${Math.floor(id / 1000)}/${id}/${id}s.jpg`
            : "";

        data.push({
            name: name,
            link: link,
            cover: cover,
            description: description,
            host: BASE_URL
        });
    });

    // Use adjacent sibling selector to get element right after <strong>
    let nextPage = doc.select("div.pagelink strong + a").text().trim();
    if (nextPage === "") nextPage = null;

    return Response.success(data, nextPage);
}