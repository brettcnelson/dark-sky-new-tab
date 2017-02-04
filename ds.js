document.getElementById('loc').onclick = function () {
	getLocation(true)
}

var iframe = document.getElementById('forecast_embed')



function getLocation(force) {
	console.log(force)
}

// 'http://forecast.io/embed/#lat=55.6164&lon=12.0555&name=test'