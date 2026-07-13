load("config.js");
function execute() {
    return Response.success([
        {title: "热门推荐", input: BASE_URL, script: "gen.js"},
        {title: "最新小说", input: BASE_URL + "/ranking/update.html", script: "gen.js"}
    ]);
}
