//function execute(url) {
//    var doc = Http.get(url + "/").string()
//    var totalPage = parseInt(doc.match(/load_pages.+value="(\d+)"/)[1])
//    var listImage = []
//    //----load page 1
//    var newUrl = url.replace('gallery','g')
//    var doc = Http.get(newUrl + "/1/").html()
//    var image = doc.select("#gimg").attr("data-src")
//    listImage.push(image)
//    var splitUrl = image.match(/(.+)(\d+)(.jpg|.jpeg|.png|.webp)/) 
//    
//    //return Response.success(doc)
//    
//    for(var i=2 ; i<=totalPage;i++){
//        listImage.push(splitUrl[1] + i + splitUrl[3])
//    }
//    return Response.success(listImage)
//}

function execute(url) {
    var initialDoc = Http.get(url + "/").string();
    var totalPage = parseInt(initialDoc.match(/load_pages.+value="(\d+)"/)[1]);
    var listImage = [];

    try {
        // Load page 1
        var newUrl = url.replace('gallery', 'g');
        var pageDoc = Http.get(newUrl + "/1/").html();
        var image = pageDoc.select("#gimg").attr("data-src");
        listImage.push(image);
        
        var splitUrl = image.match(/(.+)(\d+)(.jpg|.jpeg|.png|.webp)/);

        // Load remaining pages
        for (var i = 2; i <= totalPage; i++) {
            listImage.push(splitUrl[1] + i + splitUrl[3]);
        }
    } catch (error) {
        console.log("Error loading images:", error);
        
        // Fallback: use .webp if there's an error
        listImage = [];
        for (var i = 1; i <= totalPage; i++) {
            listImage.push(newUrl + "/" + i + ".webp");
        }
    }
    
    return Response.success(listImage);
}
