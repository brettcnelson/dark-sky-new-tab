var deleteSaved = false

document.getElementById('deleteSaved').onclick = function() {
	if (deleteSaved) {
		deleteSaved = false;
		document.getElementById('deleteSaved').innerHTML = 'click to select a row to delete'
		var table = document.getElementById('savtable')
		table.deleteRow(1)
	}
	else {
		deleteSaved = true;
		document.getElementById('deleteSaved').innerHTML = 'click here to stop delete selection'	
		var table = document.getElementById('savtable')
		var newRow = table.insertRow(1)
		var newCell = newRow.insertCell(0)
		var newDiv = document.createElement('DIV')
		newDiv.innerHTML = 'CLICK ON A ROW TO DELETE IT'
		newCell.appendChild(newDiv)
		setTimeout(function() {
			if (deleteSaved) {
				document.getElementById('deleteSaved').innerHTML = 'click to select a row to delete'
				var table = document.getElementById('savtable')
				table.deleteRow(1)
				deleteSaved = false
			}
		}, 10000)
	}
}

document.getElementById('show-tables').onclick = function() {
	if (document.getElementById('show-tables').innerHTML === 'hide saved places') {
			document.getElementById('show-tables').innerHTML = 'show saved places'
			document.getElementById('tables').style.display = 'none'
		}
	else {
		if (!localStorage.length && !sessionStorage.length) {
			document.getElementById('show-tables').innerHTML = 'you don\'t have any saved places'
			setTimeout(function() {
				document.getElementById('show-tables').innerHTML = 'show saved places'
			}, 2000)
		}
		else {
			document.getElementById('show-tables').innerHTML = 'hide saved places'
			document.getElementById('tables').style.display = ''
		}
	}
}

document.getElementById('loc').onclick = function () {
	getLocation(true)
}

document.getElementById('saveLocbtn').onclick = function () {
	var name = iframe.src.split('&name=')[1]
	if (name) {
		localStorage.setItem(name, iframe.src)
		if (sessionStorage['*' + name]) {
			localStorage.setItem('*' + name, sessionStorage['*' + name])
		}
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

document.getElementById('prevsaved').style.display = 'none'

document.getElementById('locSearch').focus()

document.getElementById('tables').style.display = 'none'

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
if (sessionStorage['*pending']) {
	if (sessionStorage['*geocode']) {
		document.getElementById('loc').style.display = 'none'
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

if (sessionStorage['*results']) {
	var results = JSON.parse(sessionStorage['*results'])
	var url = results.url
	var text = results.name + ' on google maps'
	document.getElementById('mapanch').innerHTML = text
	document.getElementById('mapanch').href = results.url
	if (results.photourls) {
		var ind = Math.floor(Math.random() * results.photourls.length)
		document.getElementById('test').src = results.photourls[ind]
	}
}

function hideLinks() {
	var links = document.getElementsByClassName('links')
	links[0].style.display = 'none'
	links[1].style.display = 'none'
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

function geosrc() {
	var name = getName()
	document.getElementById('dsanch').innerHTML = name + ' at Dark Sky'
	var lat = iframe.src.split('=')[1].split('&')[0]
	var lng = iframe.src.split('&lon=')[1].split('&')[0]
	document.getElementById('dsanch').href = 'https://darksky.net/' + lat + ',' + lng
	if (!sessionStorage['*results']) {
		var text = name + ' on google maps'
		var url = 'http://maps.google.com/?q=' + lat + ',' + lng
		document.getElementById('mapanch').innerHTML = text
		document.getElementById('mapanch').href = url
	}
}

function initAutocomplete() {
	var input = document.getElementById('locSearch');
	autocomplete = new google.maps.places.Autocomplete(input)
	autocomplete.addListener('place_changed', changeSrc)
}

function getLocation(force) {
	if (force) {
		hideLinks()
		document.getElementById('test').style.display = 'none'
	}
	sessionStorage.removeItem('*results')
	document.getElementById('loading').style.display = ''
	document.getElementById('loc').style.display = 'none'
	iframe.style.display = 'none'
	navigator.geolocation.getCurrentPosition(function(p) {
		var locLat = p.coords.latitude
		var locLon = p.coords.longitude
		var geocoder = new google.maps.Geocoder
		geocoder.geocode({'location': {lat: locLat, lng: locLon}}, function(results, status) {
			if (status === 'OK') {
				// console.log('geocode res', results)
				document.getElementById('loading').style.display = 'none'
				iframe.style.display = 'inline'
				// var locName = results[0].formatted_address
				var address = results[0].address_components
				var locName = address[0].short_name + ' ' + address[1].short_name + ' in ' + address[3].short_name
				iframe.src = "https://forecast.io/embed/#lat=" + locLat.toFixed(4) + "&lon=" + locLon.toFixed(4) + "&name=" + locName
				sessionStorage.setItem(locName, iframe.src)
				geosrc()
				if (force === true) {
					sessionStorage['*pending'] = iframe.src
					sessionStorage['*geocode'] = true
					location.reload()
				}
				popList()
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
	// var locName = document.getElementById('locSearch').value
	var results = autocomplete.getPlace()
	if (results.photos) {
		var photourls = []
		for (var i = 0 ; i < results.photos.length ; i++) {
			photourls.push(results.photos[i].getUrl({'maxWidth': 500, 'maxHeight': 500}))
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

function toggleSave() {
	if (document.getElementById('saveLocbtn').style.display === 'none') {
		document.getElementById('saveLocbtn').style.display = ''
		document.getElementById('prevsaved').style.display = 'none';
	}
	if (document.getElementById('prevsaved').style.display === 'none') {
		document.getElementById('saveLocbtn').style.display = 'none'
		document.getElementById('prevsaved').style.display = '';		
	}
}

function popList() {

	for (var key in localStorage) {
		if (sessionStorage[key]) {
			sessionStorage.removeItem(key)
		}
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
		var disp = document.getElementById(id2)
		table.rows.length ? disp.style.display = '' : disp.style.display = 'none'
	}

	pop('recent', 'rectable', sessionStorage)
	pop('saved', 'savtable', localStorage)
	document.getElementById('show-tables').display = ''
	if (!localStorage.length) {
		document.getElementById('saveLocbtn').style.display = ''
		document.getElementById('prevsaved').style.display = 'none';
		if (!sessionStorage.length) {
			document.getElementById('show-tables').style.display = 'none'
		}
	}
	var name = iframe.src.split('&name=')[1]
	var places = document.querySelectorAll('.places')
	for (var i = 0 ; i < places.length ; i++) {
		if (localStorage[places[i].innerHTML] && places[i].innerHTML === name) {
			toggleSave()
		}
		var el = places[i]
		var search = document.getElementById('locSearch')

		el.onclick = function() {
			if (deleteSaved) {
				deleteSaved = false
				var table = document.getElementById('savtable')
				table.deleteRow(1)
				document.getElementById('deleteSaved').innerHTML = 'click to select a row to delete'
				if (localStorage[this.innerHTML]) {
					localStorage.removeItem(this.innerHTML)
					localStorage.removeItem('*' + this.innerHTML)
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
				}
				if (sessionStorage[this.innerHTML]) {
					var newsrc = sessionStorage[this.innerHTML]
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
				search.value = this.innerHTML

				location.reload()
			}
		}
	}
}

// document.getElementById('allpics').onclick = function() {
// 	if (sessionStorage['*results']) {
// 		var curr = document.getElementById('test')
// 		curr.parentNode.removeChild(curr)
// 		var photos = JSON.parse(sessionStorage['*results']).photourls
// 		photos.forEach(function(x) {
// 			document.getElementById('allpics').innerHTML = photos.length
// 			var img = document.createElement('IMG')
// 			img.src = x
// 			document.getElementById('picdiv').appendChild(img)
// 		}) 
// 	}
// }

// document.getElementById('allpics').onclick = function() {
// 	document.getElementById('saveLocbtn').style.color = 'blue'
// }
// backgroundColor, webkit filter

