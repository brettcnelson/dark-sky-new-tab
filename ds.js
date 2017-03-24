var iframe = document.getElementById('forecast_embed')

var loading = document.getElementById('loading')
loading.style.display = 'none'

var locBtn = document.getElementById('loc')

var prevSaved = document.getElementById('prevsaved')
prevSaved.style.display = 'none'

document.getElementById('locSearch').focus()

var tables = document.getElementById('tables')
tables.style.display = 'none'

var showTables = document.getElementById('show-tables')
showTables.innerHTML = 'saved places: ' + getPlaces();

function getPlaces() {
	var places = 0;
	for (var key in localStorage) {
		if (key[0] !== '*') {
			places++
		}
	}
	return places
}

// ************** SET DEFAULT NOTES ****************************

// document.getElementById('default').onclick = function() {
// 	// console.log(iframe.src, sessionStorage)
// 	for (var key in sessionStorage) {
// 		if (sessionStorage[key] === iframe.src) {
// 			var defaults = [iframe.src, sessionStorage['*' + key]]
// 		}
// 	}
// 	localStorage.setItem('*default', JSON.stringify(defaults))
// 	console.log(localStorage['*default'])
// }

// if (localStorage['*default']) {
// 	console.log('def', localStorage['*default'][0])
// 	iframe.src = JSON.parse(localStorage['*default'])[0]
// }

// change this to else if - if the above if statement is uncommented
//*******************************************************************

if (sessionStorage['*pending']) {
	if (sessionStorage['*geocode']) {
		locBtn.style.display = 'none'
		sessionStorage.removeItem('*geocode')
	}
	iframe.src = sessionStorage['*pending']
	sessionStorage.removeItem('*pending')
	geosrc()
	popList()
}
else {
	getLocation()
}

function geosrc() {
	var name = getName()
	document.getElementById('dsanch').innerHTML = name + ' at Dark Sky'
	var lat = iframe.src.split('=')[1].split('&')[0]
	var lng = iframe.src.split('&lon=')[1].split('&')[0]
	document.getElementById('dsanch').href = 'https://darksky.net/' + lat + ',' + lng
	if (sessionStorage['*results']) {
		var results = JSON.parse(sessionStorage['*results'])
		var mapAnch = document.getElementById('mapanch')
		mapAnch.innerHTML = results.name + ' on google maps'
		mapAnch.href = results.url
	}
	if (!sessionStorage['*results']) {
		var text = name + ' on google maps'
		var url = 'http://maps.google.com/?q=' + lat + ',' + lng
		document.getElementById('mapanch').innerHTML = text
		document.getElementById('mapanch').href = url
	}
}

function getName() {
	if (iframe.src.split('forecast.io/embed').length) {
		var name;
		if (sessionStorage['*results']) {
			name = JSON.parse(sessionStorage['*results']).name
		}
		else {
			name = iframe.src.split('&name=')[1]	
		}
	}
	return name;
}

function popList() {

	var currInLocal = false
	for (var key in localStorage) {
		if (!currInLocal && key === iframe.src.split('&name=')[1]) {
			currInLocal = true
			document.getElementById('saveLocbtn').style.display = 'none'
			document.getElementById('prevsaved').style.display = '';		
		}
	}
	if (!currInLocal) {
		document.getElementById('saveLocbtn').style.display = ''
		document.getElementById('prevsaved').style.display = 'none';	
	}

	function pop(id1, id2, storage) {
		var table = document.getElementById(id1)
		while (table.rows.length) {
			table.deleteRow(0)
		}
		for (var key in storage) {
			if (key[0] !== '*') {
				var newRow = table.insertRow(table.rows.length)
				var newCell = newRow.insertCell(0)
				var newText = document.createTextNode(key)
				newCell.appendChild(newText)
				newCell.classList.add('places')
			}
		}
	}

	pop('recent', 'rectable', sessionStorage)
	pop('saved', 'savtable', localStorage)

	var places = document.querySelectorAll('.places')
	for (var i = 0 ; i < places.length ; i++) {
		var el = places[i]
		var search = document.getElementById('locSearch')

		el.onclick = function() {
			if (deleteSaved) {
				deleteSaved = false
				var table = document.getElementById('savtable')
				table.deleteRow(1)
				document.getElementById('deleteSaved').innerHTML = 'remove one'
				if (localStorage[this.innerHTML]) {
					localStorage.removeItem(this.innerHTML)
					localStorage.removeItem('*' + this.innerHTML)
					updatePlaceCount()
					popList()
				}
			}
			else {
				var newsrc;
				if (localStorage[this.innerHTML]) {
					newsrc = localStorage[this.innerHTML]
					if (localStorage['*' + this.innerHTML]) {	
						sessionStorage['*results'] = localStorage['*' + this.innerHTML]
					}
					else {
						sessionStorage.removeItem('*results')
					}
				}
				if (sessionStorage[this.innerHTML]) {
					newsrc = sessionStorage[this.innerHTML]
					if (sessionStorage['*' + this.innerHTML]) {
						sessionStorage['*results'] = sessionStorage['*' + this.innerHTML]
					}
					else {
						sessionStorage.removeItem('*results')
					}
				}
				if (!newsrc) {
					newsrc = iframe.src
				}
				sessionStorage['*pending'] = newsrc

				location.reload()
			}
		}
	}
}

function getLocation(force) {
	hideLinks()
	sessionStorage.removeItem('*results')
	var loading = document.getElementById('loading')
	loading.style.display = ''
	document.getElementById('loadicon').style.display = ''
	document.getElementById('loc').style.display = 'none'
	navigator.geolocation.getCurrentPosition(function(p) {
		var locLat = p.coords.latitude
		var locLon = p.coords.longitude
		var geocoder = new google.maps.Geocoder
		geocoder.geocode({'location': {lat: locLat, lng: locLon}}, function(results, status) {
			if (status === 'OK') {
				// console.log('geocode res', results)
				// sessionStorage.setItem('*temp', JSON.stringify(results))
				// var locName = results[0].formatted_address
				var address = results[0].address_components
				var locName = address[0].short_name + ' ' + address[1].short_name + ' in ' + address[3].short_name
				iframe.src = "https://forecast.io/embed/#lat=" + locLat.toFixed(4) + "&lon=" + locLon.toFixed(4) + "&name=" + locName
				sessionStorage.setItem(locName, iframe.src)
				geosrc()
				showLinks()
				loading.style.display = 'none'
				if (force) {
					sessionStorage['*pending'] = iframe.src
					sessionStorage['*geocode'] = true
					location.reload()
				}
				popList()
			}
		})
	}, function(error) {
			document.getElementById('loadicon').style.display = 'none'
			document.getElementById('top-container').style.display = ''
			document.getElementById('saveLocbtn').style.display = 'none'
			popList()
			console.log('err =', error)
			var err = document.getElementById('error')
			if (error.code === 1) {
				err.innerHTML = 'It loooks like you haven\'t enabled location permission.  Search for a location below'
			}
			if (error.code === 2) {
				err.innerHTML = 'Your location is unavailable - check your connection or search for a location below'
			}
			if (error.code === 3) {
				err.innerHTML = 'The location search timed out.  Search for a location below'
			}
	})
}

function hideLinks() {
	var links = document.getElementsByClassName('links')
	iframe.style.display = 'none'
	links[0].style.display = 'none'
	links[1].style.display = 'none'
	document.getElementById('top-container').style.display = 'none'
}

function showLinks() {
	var links = document.getElementsByClassName('links')
	iframe.style.display = ''
	links[0].style.display = ''
	links[1].style.display = ''
	document.getElementById('top-container').style.display = ''
}

function initAutocomplete() {
	var input = document.getElementById('locSearch');
	autocomplete = new google.maps.places.Autocomplete(input)
	autocomplete.addListener('place_changed', changeSrc)
}

function changeSrc() {
	// var locName = document.getElementById('locSearch').value
	var results = autocomplete.getPlace()
	if (results.photos) {
		var photourls = []
		for (var i = 0 ; i < results.photos.length ; i++) {
			photourls.push(results.photos[i].getUrl({'maxWidth': 500, 'maxHeight': 200}))
		}
		results.photourls = photourls
	}
	var locName = results.formatted_address
	locLat = results.geometry.location.lat().toFixed(4)
	locLon = results.geometry.location.lng().toFixed(4)
	var url = "https://forecast.io/embed/#lat=" + locLat + "&lon=" + locLon + "&name=" + locName
	sessionStorage['*pending'] = url
	sessionStorage.setItem(locName, url)
	sessionStorage.setItem('*' + locName, JSON.stringify(results))
	sessionStorage.setItem('*results', JSON.stringify(results))
	location.reload()
}

// CLICK HANDLERS **********************************

document.getElementById('loc').onclick = function () {
	getLocation(true)
}

showTables.onclick = function() {
	if (tables.style.display === 'none') {
		tables.style.display = '';
		showTables.style.backgroundColor = '#333333'
		showTables.style.color = '#f7f7f7'
	}
	else {
		tables.style.display = 'none'
		showTables.style.backgroundColor = '#f7f7f7'
		showTables.style.color = '#333333'
	}
}

document.getElementById('saveLocbtn').onclick = function () {
	var name = iframe.src.split('&name=')[1]
	if (name) {
		localStorage.setItem(name, iframe.src)
		sessionStorage.removeItem(name)
		if (sessionStorage['*' + name]) {
			localStorage.setItem('*' + name, sessionStorage['*' + name])
			sessionStorage.removeItem('*' + name)
		}
		updatePlaceCount()
		popList()
	}
	else {
		alert('there is no current location to save')
	}	
}

function updatePlaceCount() {
	showTables.innerHTML = 'saved places: ' + getPlaces();
}

var deleteSaved = false
document.getElementById('deleteSaved').onclick = function() {
	if (deleteSaved) {
		deleteSaved = false;
		document.getElementById('deleteSaved').innerHTML = 'remove one'
		var table = document.getElementById('savtable')
		table.deleteRow(1)
	}
	else {
		deleteSaved = true;
		document.getElementById('deleteSaved').innerHTML = 'CANCEL'	
		var table = document.getElementById('savtable')
		var newRow = table.insertRow(1)
		var newCell = newRow.insertCell(0)
		var newDiv = document.createElement('DIV')
		newDiv.innerHTML = '< CLICK ON A ROW TO DELETE IT >'
		newDiv.style.textAlign = 'center'
		newDiv.style.color = 'black'
		newDiv.style.backgroundColor = '#f7f7f7'
		newCell.appendChild(newDiv)
		setTimeout(function() {
			if (deleteSaved) {
				document.getElementById('deleteSaved').innerHTML = 'remove one'
				var table = document.getElementById('savtable')
				table.deleteRow(1)
				deleteSaved = false
			}
		}, 10000)
	}
}

document.getElementById('remove').onclick = function () {
	localStorage.clear()
	updatePlaceCount()
	popList()
}

document.getElementById('clearrec').onclick = function () {
	sessionStorage.clear()
	updatePlaceCount()
	popList()
}

// ********** PICTURE / IMG FILTER NOTES ******************************

var allPicsClicked = false;

document.getElementById('allpics').onclick = function() {
	if (!allPicsClicked) {
		allPicsClicked = true;
		if (sessionStorage['*results'] && JSON.parse(sessionStorage['*results']).photourls) {
			var photos = JSON.parse(sessionStorage['*results']).photourls
			photos.forEach(function(x) {
				var img = document.createElement('IMG')
				img.src = x
				img.style.margin = '5px'
				document.getElementById('picdiv').appendChild(img)
			})
			document.getElementById('allpics').innerHTML = '&#9889'
			setTimeout(function() {
				document.getElementById('allpics').innerHTML = ''
			}, 1500)
		}
		else {
			document.getElementById('allpics').innerHTML = 'no pics'
			setTimeout(function() {
				document.getElementById('allpics').innerHTML = ''
			}, 1000)
		}
	}
	else {
		return;
	}
}

// TEST *********************************************************
// var test;
// test = true;

// function randCoords() {
// 	var tpos = Math.random() < .5 ? 1 : -1
// 	var gpos = Math.random() < .5 ? 1 : -1
// 	var lat = (Math.random() * 90 * tpos).toFixed(4)
// 	var lng = (Math.random() * 180 * gpos).toFixed(4)
// 	iframe.src = "https://forecast.io/embed/#lat=" + lat + "&lon=" + lng + "&name=" + lat + ',' + lng
// 	document.getElementById('testurl').href = 'http://maps.google.com/?q=' + lat + ',' + lng
// }

// SETTINGS **************************************************************
// potential settings options -- background-color, img grayscale, img width/height, iframe units
