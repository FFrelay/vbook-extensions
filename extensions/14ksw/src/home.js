load("config.js");

function execute() {
    return Response.success([
        {title: "\u7384\u5e7b", input: BASE_URL + "/fenlei/1/{0}/", script: "gen.js"},
        {title: "\u5947\u5e7b", input: BASE_URL + "/fenlei/2/{0}/", script: "gen.js"},
        {title: "\u6b66\u4fa0", input: BASE_URL + "/fenlei/3/{0}/", script: "gen.js"},
        {title: "\u4ed9\u4fa0", input: BASE_URL + "/fenlei/4/{0}/", script: "gen.js"},
        {title: "\u90fd\u5e02", input: BASE_URL + "/fenlei/5/{0}/", script: "gen.js"},
        {title: "\u519b\u4e8b", input: BASE_URL + "/fenlei/6/{0}/", script: "gen.js"},
        {title: "\u5386\u53f2", input: BASE_URL + "/fenlei/7/{0}/", script: "gen.js"},
        {title: "\u6e38\u620f", input: BASE_URL + "/fenlei/8/{0}/", script: "gen.js"},
        {title: "\u79d1\u5e7b", input: BASE_URL + "/fenlei/10/{0}/", script: "gen.js"},
        {title: "\u4e8c\u6b21\u5143", input: BASE_URL + "/fenlei/24/{0}/", script: "gen.js"}
    ]);
}
