function execute() {
    return Response.success([
        {title: "Popular Now", input: "https://nhentai.net", script: "gen.js"},
		{title: "New uploads", input: "https://nhentai.net", script: "gen2.js"}
    ]);
}