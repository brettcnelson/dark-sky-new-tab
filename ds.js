document.getElementById('loc').onclick = function () {
	getLocation(true)
}

document.getElementById('saveLoc').onclick = function () {
	console.log('saved')
}

document.getElementById('clearLS').onclick = function () {
	console.log('lsbefore', localStorage)
	localStorage.clear()
	console.log('lsafter', localStorage)
}

document.getElementById('clearSS').onclick = function () {
	console.log('ssbefore', sessionStorage)
	sessionStorage.clear()
	console.log('ssafter', sessionStorage)
}


function getLocation(force) {
	console.log(force)
}


var iframe = document.getElementById('forecast_embed')

iframe.src = 'http://forecast.io/embed/#lat=42.667869&lon=-70.840479&name=test home'

function initAutocomplete() {
	var input = document.getElementById('locSearch');
	autocomplete = new google.maps.places.Autocomplete(input)
	autocomplete.addListener('place_changed', changeSrc)
}

function changeSrc() {
	var locName = document.getElementById('locSearch').value
	locLat = autocomplete.getPlace().geometry.location.lat().toFixed(4)
	locLon = autocomplete.getPlace().geometry.location.lng().toFixed(4)
	
	sessionStorage.pending = "http://forecast.io/embed/#lat=" + locLat + "&lon=" + locLon + "&name=" + locName

	sessionStorage.setItem(locName, iframe.src)

	location.reload()
}