function execute() {
    return Response.success([
        {title: "Front Page", input: "https://e-hentai.org", script: "gen.js"},
        {title: "Popular", input: "https://e-hentai.org/popular", script: "gen.js"},
		{title: "All-Time", input: "https://e-hentai.org/toplist.php?tl=11", script: "gen.js"},
		{title: "Past Year", input: "https://e-hentai.org/toplist.php?tl=12", script: "gen.js"},
		{title: "Past Month", input: "https://e-hentai.org/toplist.php?tl=13", script: "gen.js"},
		{title: "Yesterday", input: "https://e-hentai.org/toplist.php?tl=15", script: "gen.js"}
    ]);
}