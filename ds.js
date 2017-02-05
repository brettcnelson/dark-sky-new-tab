document.getElementById('loc').onclick = function () {
	getLocation(true)
}

document.getElementById('saveLoc').onclick = function () {
	var name = iframe.src.split('&name=')[1]
	if (name) {
		localStorage.setItem(name, iframe.src)
		popList()
	}
	else {
		alert('there is no current location to save')
	}	
}

document.getElementById('remove').onclick = function () {
	localStorage.clear()
	popList()
}

document.getElementById('clear').onclick = function () {
	sessionStorage.clear()
	popList()
}

var iframe = document.getElementById('forecast_embed')

document.getElementById('loading').style.display = 'none'

document.getElementById('locSearch').focus()

var photoGall = document.getElementById('photo')

photoGall.style.display = 'none'

popList()

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
				iframe.src = "https://forecast.io/embed/#lat=" + locLat.toFixed(4) + "&lon=" + locLon.toFixed(4) + "&name=" + locName
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
	var locName = document.getElementById('locSearch').value
	locLat = autocomplete.getPlace().geometry.location.lat().toFixed(4)
	locLon = autocomplete.getPlace().geometry.location.lng().toFixed(4)
	sessionStorage.pending = "https://forecast.io/embed/#lat=" + locLat + "&lon=" + locLon + "&name=" + locName
	sessionStorage.setItem(locName, iframe.src)
	// sessionStorage.results = JSON.stringify(autocomplete.getPlace())
	if (autocomplete.getPlace().photos) {
		var photos = autocomplete.getPlace().photos
		var photourls = photos.map(function(p) {
			return p.getUrl({'maxWidth': 150, 'maxHeight': 150})
		})
		sessionStorage.urls = JSON.stringify(photourls)
	}
	sessionStorage.name = autocomplete.getPlace().name
	location.reload()
}

function popList() {

	function pop(id1, id2, storage) {
		var table = document.getElementById(id1)
		while (table.rows.length) {
			table.deleteRow(0)
		}
		for (var key in storage) {
			if (key !== 'pending' && key !== 'geocode' && key !== 'name' && key !== 'urls') {
				var newRow = table.insertRow(table.rows.length)
				var newCell = newRow.insertCell(0)
				var newText = document.createTextNode(key)
				newCell.appendChild(newText)
				newCell.classList.add('places')
			}
		}
		var disp = document.getElementById(id2).style.display
		table.rows.length ? disp = '' : disp = 'none'
	}

	pop('recent', 'rectable', sessionStorage)
	pop('saved', 'savtable', localStorage)

	var places = document.querySelectorAll('.places')
	for (var i = 0 ; i < places.length ; i++) {
		var el = places[i]
		var search = document.getElementById('locSearch')
		el.ondblclick = function() {
			if (localStorage[this.innerHTML]) {
				search.value = ''
				search.blur()
				localStorage.removeItem(this.innerHTML)
				popList()
			}
		}
		el.onclick = function() {
			search.value = this.innerHTML
			search.focus()
		}
	}
}
