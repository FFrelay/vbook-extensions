function execute() {
    return Response.success([
        {title: "最新更新", input: "/last", script: "update.js"},
        {title: "全部分类", input: "/booklist/class/0/{0}.html", script: "gen.js"},
		{title: "玄幻魔法", input: "/booklist/class/1/{0}.html", script: "gen.js"},
        {title: "修真武侠", input: "/booklist/class/2/{0}.html", script: "gen.js"},
        {title: "言情小说", input: "/booklist/class/3/{0}.html", script: "gen.js"},
        {title: "历史军事", input: "/booklist/class/4/{0}.html", script: "gen.js"},
        {title: "游戏竞技", input: "/booklist/class/5/{0}.html", script: "gen.js"},
        {title: "科幻空间", input: "/booklist/class/6/{0}.html", script: "gen.js"},
        {title: "悬疑惊悚", input: "/booklist/class/7/{0}.html", script: "gen.js"},
        {title: "同人小说", input: "/booklist/class/8/{0}.html", script: "gen.js"},
		{title: "都市小说", input: "/booklist/class/9/{0}.html", script: "gen.js"},
        {title: "官场职场", input: "/booklist/class/10/{0}.html", script: "gen.js"},
		{title: "穿越时空", input: "/booklist/class/11/{0}.html", script: "gen.js"},
        {title: "青春校园", input: "/booklist/class/12/{0}.html", script: "gen.js"},
    ]);
}