function execute(url) {
    var doc = Http.get(url + "/").string()
	var newUrl = url.replace('gallery','g')
	var totalPage = parseInt(doc.match(/load_pages.+value="(\d+)"/)[1])
	var listImage = []
	for(var i=1 ; i<=totalPage;i++){
		var newdoc = Http.get(newUrl + "/" + i + "/").html()
		var image = 'https:' + newdoc.select("#gimg").attr("src")
		var newimage = image.replace('https:https:','https:')
		var splitUrl = newimage.match(/(.+)(\d+)(.jpg|.jpeg|.png|.webp)/)
        listImage.push(splitUrl[1] + i + splitUrl[3])
    }
    return Response.success(listImage)
}

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