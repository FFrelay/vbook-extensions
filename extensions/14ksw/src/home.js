load("config.js");

function execute() {
    return Response.success([
        {title: "玄幻", input: BASE_URL + "/fenlei/1/{0}/", script: "gen.js"},
        {title: "奇幻", input: BASE_URL + "/fenlei/2/{0}/", script: "gen.js"},
        {title: "武侠", input: BASE_URL + "/fenlei/3/{0}/", script: "gen.js"},
        {title: "仙侠", input: BASE_URL + "/fenlei/4/{0}/", script: "gen.js"},
        {title: "都市", input: BASE_URL + "/fenlei/5/{0}/", script: "gen.js"},
        {title: "军事", input: BASE_URL + "/fenlei/6/{0}/", script: "gen.js"},
        {title: "历史", input: BASE_URL + "/fenlei/7/{0}/", script: "gen.js"},
        {title: "游戏", input: BASE_URL + "/fenlei/8/{0}/", script: "gen.js"},
        {title: "科幻", input: BASE_URL + "/fenlei/10/{0}/", script: "gen.js"},
        {title: "二次元", input: BASE_URL + "/fenlei/24/{0}/", script: "gen.js"}
    ]);
}
