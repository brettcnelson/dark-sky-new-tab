document.getElementById('loc').onclick = function () {
	getLocation(true)
}

document.getElementById('saveLoc').onclick = function () {
	console.log('saved')
}

document.getElementById('remove').onclick = function () {
	console.log('lsbefore', localStorage)
	localStorage.clear()
	console.log('lsafter', localStorage)
}

document.getElementById('clear').onclick = function () {
	console.log('ssbefore', sessionStorage)
	sessionStorage.clear()
	console.log('ssafter', sessionStorage)
}

var iframe = document.getElementById('forecast_embed')

document.getElementById('loading').style.display = 'none'

document.getElementById('locSearch').focus()







function getLocation(force) {
	console.log(force)
}
