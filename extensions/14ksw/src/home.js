load("config.js");
function execute() {
    return Response.success([
        {title: "热门推荐", input: BASE_URL + "/?list=hot", script: "gen.js"},
        {title: "最近更新", input: BASE_URL + "/?list=new", script: "gen.js"},
        {title: "排行", input: BASE_URL + "/rank/", script: "gen.js"},
        {title: "完本", input: BASE_URL + "/quanben/fenlei/", script: "gen.js"},
    ]);
}
