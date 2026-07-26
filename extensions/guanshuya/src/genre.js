load("config.js");

function execute() {
    return Response.success([
        { title: "玄幻", input: BASE_URL + "/class1-1.html", script: "gen.js" },
        { title: "武侠", input: BASE_URL + "/class2-1.html", script: "gen.js" },
        { title: "都市", input: BASE_URL + "/class3-1.html", script: "gen.js" },
        { title: "历史", input: BASE_URL + "/class4-1.html", script: "gen.js" },
        { title: "科幻", input: BASE_URL + "/class5-1.html", script: "gen.js" },
        { title: "网游", input: BASE_URL + "/class6-1.html", script: "gen.js" },
        { title: "女生", input: BASE_URL + "/class7-1.html", script: "gen.js" },
    ]);
}
