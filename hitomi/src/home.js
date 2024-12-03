function execute() {
    return Response.success([
        {title: "New Releases", input: "https://hitomi.la/?page=1", script: "gen.js"}
    ])
}