if (sessionStorage.urls) {
	photoGall.style.display = ''
	var p = document.createElement('P')
	var t = document.createTextNode(sessionStorage.name)
	p.appendChild(t)
	photoGall.appendChild(p)
	JSON.parse(sessionStorage.urls).forEach(function(u) {
		var el = document.createElement('img')
		el.src = u
		el.classList.add('grayscale')
		photoGall.appendChild(el)
	})
	// console.log('grayscale')
	sessionStorage.removeItem('urls')
	sessionStorage.removeItem('name')
}

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