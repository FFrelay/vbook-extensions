load('libs.js');
load('config.js');

function execute() {
    let response = fetch(BASE_URL + "/tags");
    if (!response.ok) {
        return null;
    }
    let doc = response.html("gbk");

    const result = [];
    doc.select(".tag a").forEach(function (e) {
        result.push({
            title: e.text(),
            input: `/${e.text()}/`,
            script: "gen.js"
        });
    });
    return Response.success(result);
}