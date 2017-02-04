document.getElementById('loc').onclick = function () {
	getLocation(true)
}

function getLocation(force) {
	console.log(force)
}

document.getElementById('saveLoc').addEventListener('click', saveLoc)

function saveLoc() {
	console.log('saved')
}

document.getElementById('clearLS').addEventListener('click', clearLS)

function clearLS() {
	console.log('clearLSed')
}


document.getElementById('clearSS').addEventListener('click', clearSS)

function clearSS() {
	console.log('clearSSed')
}




var iframe = document.getElementById('forecast_embed')





iframe.src = 'http://forecast.io/embed/#lat=42.667869&lon=-70.840479&name=test home'
