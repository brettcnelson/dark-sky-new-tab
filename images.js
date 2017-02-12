var photoGall = document.getElementById('photo')
photoGall.style.display = 'none'

	// no more .urls - everything is in *Place

if (sessionStorage['*results']) {
	var results = JSON.parse(sessionStorage['*results'])
	console.log('photos', results.photos)
	photoGall.style.display = ''
	var p = document.createElement('P')
	var name = results.name
	var t = document.createTextNode(name)
	p.appendChild(t)
	photoGall.appendChild(p)
	results.photos.forEach(function(p) {
		var a = p.html_attributions[0]
		var el = document.createElement('span')
		el.innerHTML = a
		photoGall.appendChild(el)

		// var el = document.createElement('a')

	})
}


	// if (autocomplete.getPlace().photos) {
	// 	var photos = autocomplete.getPlace().photos
	// 	var photourls = photos.map(function(p) {
	// 		return p.getUrl({'maxWidth': 150, 'maxHeight': 150})
	// 	})
	// 	sessionStorage.urls = JSON.stringify(photourls)
	// }
	// sessionStorage.name = autocomplete.getPlace().name
	// location.reload()

// function grays() {
// 	var grays = document.querySelectorAll('.grayscale')
// 	for (var i = 0 ; i < grays.length ; i++) {
// 		var el = grays[i]
// 		grayscaleImage(el)
// 	}
// }

// function grayscaleImage(imgObj) {
// 	console.log('gs', imgObj)
// 	var canvas = document.createElement('canvas');
// 	var canvasContext = canvas.getContext('2d');

// 	var imgW = imgObj.width;
// 	var imgH = imgObj.height;
// 	canvas.width = imgW;
// 	canvas.height = imgH;

// 	canvasContext.drawImage(imgObj, 0, 0);
// 	var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);

// 	for(var y = 0; y < imgPixels.height; y++){
// 		for(var x = 0; x < imgPixels.width; x++){
// 			var i = (y * 4) * imgPixels.width + x * 4;
// 			var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
// 			imgPixels.data[i] = avg; 
// 			imgPixels.data[i + 1] = avg; 
// 			imgPixels.data[i + 2] = avg;
// 		}
// 	}

// 	canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
// 	return canvas.toDataURL();
// }