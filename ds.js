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

var photo = document.getElementById('photo')

photo.style.display = 'none'

if (sessionStorage.pending) {
	if (sessionStorage.geocode) {
		document.getElementById('loc').style.display = 'none'
		sessionStorage.removeItem('geocode')
	}
	iframe.src = sessionStorage.pending
	sessionStorage.removeItem('pending')
}
else {
	getLocation()
}

function initAutocomplete() {
	var input = document.getElementById('locSearch');
	autocomplete = new google.maps.places.Autocomplete(input)
	autocomplete.addListener('place_changed', changeSrc)
}

function getLocation(force) {
	document.getElementById('loading').style.display = 'block'
	document.getElementById('loc').style.display = 'none'
	iframe.style.display = 'none'
	navigator.geolocation.getCurrentPosition(function(p) {
		var locLat = p.coords.latitude
		var locLon = p.coords.longitude
		var geocoder = new google.maps.Geocoder
		geocoder.geocode({'location': {lat: locLat, lng: locLon}}, function(results, status) {
			if (status === 'OK') {
				document.getElementById('loading').style.display = 'none'
				iframe.style.display = 'inline'
				var locName = results[0].formatted_address
				iframe.src = "http://forecast.io/embed/#lat=" + locLat.toFixed(4) + "&lon=" + locLon.toFixed(4) + "&name=" + locName
				sessionStorage.setItem(locName, iframe.src)
				popList()
				if (force === true) {
					sessionStorage.pending = iframe.src
					sessionStorage.geocode = true
					location.reload()
				}
			}
			else {
				console.log(status)
			}
		})
	}, function(error) {
			document.getElementById('error').innerHTML = error.message.toUpperCase() + ': Search for a location below'
	})
}

function changeSrc() {

	console.log(autocomplete.getPlace())
	var locName = document.getElementById('locSearch').value
	locLat = autocomplete.getPlace().geometry.location.lat().toFixed(4)
	locLon = autocomplete.getPlace().geometry.location.lng().toFixed(4)
	
	sessionStorage.pending = "http://forecast.io/embed/#lat=" + locLat + "&lon=" + locLon + "&name=" + locName

	sessionStorage.setItem(locName, iframe.src)

	sessionStorage.results = JSON.stringify(autocomplete.getPlace())

	console.log(JSON.parse(sessionStorage.results))

	location.reload()
}
