function execute() {
    return Response.success([
        {title: "最新更新", input: "/last", script: "update.js"},
        {title: "全部分类", input: "/blist/class/0/{0}.htm", script: "gen.js"},
		{title: "玄幻魔法", input: "/blist/class/1/{0}.htm", script: "gen.js"},
        {title: "修真武侠", input: "/blist/class/2/{0}.htm", script: "gen.js"},
        {title: "言情小说", input: "/blist/class/3/{0}.htm", script: "gen.js"},
        {title: "历史军事", input: "/blist/class/4/{0}.htm", script: "gen.js"},
        {title: "游戏竞技", input: "/blist/class/5/{0}.htm", script: "gen.js"},
        {title: "科幻空间", input: "/blist/class/6/{0}.htm", script: "gen.js"},
        {title: "悬疑惊悚", input: "/blist/class/7/{0}.htm", script: "gen.js"},
        {title: "同人小说", input: "/blist/class/8/{0}.htm", script: "gen.js"},
		{title: "都市小说", input: "/blist/class/9/{0}.htm", script: "gen.js"},
        {title: "官场职场", input: "/blist/class/10/{0}.htm", script: "gen.js"},
		{title: "穿越时空", input: "/blist/class/11/{0}.htm", script: "gen.js"},
        {title: "青春校园", input: "/blist/class/12/{0}.htm", script: "gen.js"},
    ]);
}