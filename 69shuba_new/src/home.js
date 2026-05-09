function execute() {
    return Response.success([
        {title: "排行-人气", input: "/novels/monthvisit_0_0_1.htm", script: "gen2.js"},
        {title: "排行-推荐", input: "/novels/allvote_0_0_1.htm", script: "gen2.js"},
        {title: "排行-新书榜", input: "/novels/newhot_0_0_1.htm", script: "gen2.js"},
        {title: "全部分类", input: "/novels/class/0.htm", script: "gen2.js"},
		{title: "玄幻魔法", input: "/novels/class/1.htm", script: "gen2.js"},
        {title: "修真武侠", input: "/novels/class/2.htm", script: "gen2.js"},
        {title: "言情小说", input: "/novels/class/3.htm", script: "gen2.js"},
        {title: "历史军事", input: "/novels/class/4.htm", script: "gen2.js"},
        {title: "游戏竞技", input: "/novels/class/5.htm", script: "gen2.js"},
        {title: "科幻空间", input: "/novels/class/6.htm", script: "gen2.js"},
        {title: "悬疑惊悚", input: "/novels/class/7.htm", script: "gen2.js"},
        {title: "同人小说", input: "/novels/class/8.htm", script: "gen2.js"},
		{title: "都市小说", input: "/novels/class/9.htm", script: "gen2.js"},
        {title: "官场职场", input: "/novels/class/10.htm", script: "gen2.js"},
		{title: "穿越时空", input: "/novels/class/11.htm", script: "gen2.js"},
        {title: "青春校园", input: "/novels/class/12.htm", script: "gen2.js"},
    ]);
}