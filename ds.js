google.maps.event.addDomListener(window, 'load', () => {
	var input = document.getElementById('locSearch');
	autocomplete = new google.maps.places.Autocomplete(input)
	autocomplete.addListener('place_changed', changeSrc)
});
var tables = document.getElementById('tables');
var prevSaved = document.getElementById('prevsaved');
var iframe = document.getElementById('forecast_embed');
var locBtn = document.getElementById('loc');
var showTables = document.getElementById('show-tables');
var defaults = {backgroundColor: '#9C9C9C',font: 'Helvetica',units: '',color: '#333333'};
document.getElementById('colordefault').style.backgroundColor = defaults.backgroundColor;
document.getElementById('colorbar').style.backgroundColor = defaults.color;
var options;
var data = {};
var state = {deleteSaved:false};
chrome.storage.sync.get(defaults, (opts) => {
	updatePlaceCount();
	setOptions(opts);
	document.getElementById('locSearch').focus();
	if (!sessionStorage['*pending']) {
		getLocation();
	}
	else {
		if (sessionStorage['*results']) {
			data.name = JSON.parse(sessionStorage['*results']).name;
		}
		if (sessionStorage['*pending']) {
			if (!data.name) {
				data.name = sessionStorage['*pending'].split('&name=')[1].replace(/%20/gi,' ');
			}
			if (sessionStorage['*geocode']) {
				locBtn.style.display = 'none';
				sessionStorage.removeItem('*geocode');
			}
			console.log(options)
			iframe.src = `${sessionStorage['*pending']}&color=${options.color}&font=${options.font}&units=${options.units}`;
			sessionStorage.removeItem('*pending');
			geosrc(data.name);
			popList();
		}
	}
});

// FUNCTIONS ***************************

function changeSrc() {
	var results = autocomplete.getPlace();
	if (results.photos) {
		var photourls = [];
		for (var i = 0 ; i < results.photos.length ; i++) {
			photourls.push(results.photos[i].getUrl({'maxWidth': 500, 'maxHeight': 200}));
		}
		results.photourls = photourls;
	}
	var locName = results.formatted_address;
	var frameName = results.name;
	locLat = results.geometry.location.lat().toFixed(4);
	locLon = results.geometry.location.lng().toFixed(4);
	var url = "https://forecast.io/embed/#lat=" + locLat + "&lon=" + locLon + "&name=" + frameName;
	sessionStorage['*pending'] = url;
	sessionStorage.setItem(locName, url);
	sessionStorage.setItem('*' + locName, JSON.stringify(results));
	sessionStorage.setItem('*results', JSON.stringify(results));
	location.reload();
}

function setOptions(opts) {
	var {backgroundColor,...rest} = opts;
	document.body.style.backgroundColor = backgroundColor;
	document.body.style.fontFamily = opts.font;
	options = rest;
}

function getLocation(force) {
	iframe.style.display = 'none';
	document.getElementById('framecon').style.display = '';
	sessionStorage.removeItem('*results');
	document.getElementById('loc').style.display = 'none';
	navigator.geolocation.getCurrentPosition(function(p) {
		var locLat = p.coords.latitude;
		var locLon = p.coords.longitude;
		var geocoder = new google.maps.Geocoder;
		geocoder.geocode({'location': {lat: locLat, lng: locLon}}, function(results, status) {
			if (status === 'OK') {
				var address = results[0].address_components;
				data.name = address[0].short_name + ' ' + address[1].short_name;
				var src = "https://forecast.io/embed/#lat=" + locLat.toFixed(4) + "&lon=" + locLon.toFixed(4) + "&name=" + data.name;
				sessionStorage.setItem(data.name, src);
				if (force) {
					sessionStorage['*pending'] = src;
					sessionStorage['*geocode'] = true;
					location.reload();
				}
				iframe.src = `${src}&color=${options.color}&font=${options.font}&units=${options.units}`;
				geosrc(data.name);
				iframe.style.display = '';
				document.getElementById('framecon').style.display = 'none';
				popList();
				updatePlaceCount();
			}
		})
	}, function(error) {
			document.getElementById('top-container').style.display = ''
			popList()
			console.log('err =', error)
			var err = document.getElementById('error')
			if (error.code === 1) {
				err.innerHTML = 'It loooks like you haven\'t enabled location permission.  Search for a location below'
			}
			if (error.code === 2) {
				err.innerHTML = 'For some reason your location is unavailable - is your wifi on? modem/router working?<br>Sometimes Chrome\'s location service goes down for a little while.<br>Just search for a location below<br>\u2193'
			}
			if (error.code === 3) {
				err.innerHTML = 'The location search timed out.  Search for a location below'
			}
			document.getElementById('saveLocbtn').style.display = 'none'	
	});
}

function geosrc(name) {
	document.getElementById('dsanch').innerHTML = name + ' at Dark Sky';
	var lat = iframe.src.split('=')[1].split('&')[0];
	var lng = iframe.src.split('&lon=')[1].split('&')[0];
	document.getElementById('dsanch').href = 'https://darksky.net/' + lat + ',' + lng;
	var mapAnch = document.getElementById('mapanch');
	if (sessionStorage['*results']) {
		var results = JSON.parse(sessionStorage['*results']);
		mapAnch.innerHTML = results.name + ' on Google Maps';
		mapAnch.href = results.url;
		var pictop = document.getElementById('pictop');
		pictop.innerHTML = '&#9889';
		setTimeout(function() {
			pictop.innerHTML = '';
		}, 2000);
	}
	else {
		mapAnch.innerHTML = name + ' on Google Maps';
		mapAnch.href = 'http://maps.google.com/?q=' + lat + ',' + lng;
	}
}

function popList() {
	var currInLocal = false;
	for (var key in localStorage) {
		if (!currInLocal && key === data.name ) {
			// iframe.src.split('&name=')[1].replace(/%20/gi,' ')
			// || (sessionStorage['*results'] && key === JSON.parse(sessionStorage['*results']).formatted_address)
			currInLocal = true;
			document.getElementById('saveLocbtn').style.display = 'none'
			document.getElementById('prevsaved').style.display = '';		
		}
	}
	if (!currInLocal) {
		document.getElementById('saveLocbtn').style.display = '';
		document.getElementById('prevsaved').style.display = 'none';	
	}

	function pop(id1, storage) {
		var table = document.getElementById(id1);
		while (table.rows.length) {
			table.deleteRow(0);
		}
		for (var key in storage) {
			if (key[0] !== '*' && key !== 'length' && typeof storage[key] !== 'function') {
				var newRow = table.insertRow(table.rows.length);
				var newCell = newRow.insertCell(0);
				var newText = document.createTextNode(key);
				newCell.appendChild(newText);
				newCell.classList.add('places');
			}
		}
	}

	pop('recent', sessionStorage);
	pop('saved', localStorage);

	var places = document.querySelectorAll('.places');
	for (var i = 0 ; i < places.length ; i++) {
		var el = places[i];
		var search = document.getElementById('locSearch');

		el.onclick = function() {
			if (state.deleteSaved) {
				state.deleteSaved = false;
				var table = document.getElementById('savtable');
				table.deleteRow(1);
				document.getElementById('deleteSaved').innerHTML = 'remove one';
				if (localStorage[this.innerHTML]) {
					localStorage.removeItem(this.innerHTML);
					localStorage.removeItem('*' + this.innerHTML);
					updatePlaceCount();
					popList();
				}
			}
			else {
				var newsrc;
				if (localStorage[this.innerHTML]) {
					newsrc = localStorage[this.innerHTML];
					if (localStorage['*' + this.innerHTML]) {	
						sessionStorage['*results'] = localStorage['*' + this.innerHTML];
					}
					else {
						sessionStorage.removeItem('*results');
					}
				}
				if (sessionStorage[this.innerHTML]) {
					newsrc = sessionStorage[this.innerHTML];
					if (sessionStorage['*' + this.innerHTML]) {
						sessionStorage['*results'] = sessionStorage['*' + this.innerHTML];
					}
					else {
						sessionStorage.removeItem('*results');
					}
				}
				sessionStorage['*pending'] = newsrc;
				location.reload();
			}
		}
	}
}

function updatePlaceCount() {
	showTables.innerHTML = '\u2606: ' + (getPlaces()[0]||'');
}

function getPlaces() {
	var places = 0;
	var recent = 0;
	for (var key in localStorage) {
		if (key[0] !== '*' && key !== 'length' && typeof localStorage[key] !== 'function') {
			places++;
		}
	}
	for (var key in sessionStorage) {
		if (key[0] !== '*' && key !== 'length' && typeof sessionStorage[key] !== 'function') {
			recent++;
		}
	}
	return [places, recent];
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
	var name = data.name;
	if (name) {
		localStorage.setItem(name, iframe.src.split('&color')[0]);
		sessionStorage.removeItem(name);
		if (sessionStorage['*' + name]) {
			localStorage.setItem('*' + name, sessionStorage['*' + name])
			sessionStorage.removeItem('*' + name)
		}
		else if (sessionStorage['*results']) {
			localStorage.setItem('*' + name, sessionStorage['*results'])
		}
		updatePlaceCount()
		popList()
	}
	else {
		alert('there is no current location to save')
	}	
}

document.getElementById('prevsaved').onclick = function () {
	for (var key in localStorage) {
		if (key === data.name) {
			localStorage.removeItem(key);
			var starred = '*' + key;
			if (localStorage[starred]) {
				localStorage.removeItem(starred);
			}
		}
	}
	updatePlaceCount();
	popList();
}

document.getElementById('deleteSaved').onclick = function() {
	if (state.deleteSaved) {
		state.deleteSaved = false;
		document.getElementById('deleteSaved').innerHTML = 'remove one';
		var table = document.getElementById('savtable');
		table.deleteRow(1);
	}
	else if (localStorage.length) {
		state.deleteSaved = true;
		document.getElementById('deleteSaved').innerHTML = 'CANCEL';
		var table = document.getElementById('savtable');
		var newRow = table.insertRow(1);
		var newCell = newRow.insertCell(0);
		var newDiv = document.createElement('DIV');
		newDiv.innerHTML = '< CLICK ON A ROW TO DELETE IT >';
		newDiv.style.textAlign = 'center';
		newDiv.style.color = 'black';
		newDiv.style.backgroundColor = '#f7f7f7';
		newCell.appendChild(newDiv);
		setTimeout(function() {
			if (state.deleteSaved) {
				document.getElementById('deleteSaved').innerHTML = 'remove one';
				var table = document.getElementById('savtable');
				table.deleteRow(1);
				state.deleteSaved = false;
			}
		}, 10000);
	}
}

document.getElementById('remove').onclick = function () {
	localStorage.clear();
	updatePlaceCount();
	popList();
}

document.getElementById('clearrec').onclick = function () {
	for (var key in sessionStorage) {
		if (key !== '*results') {
			sessionStorage.removeItem(key)
		}
	}
	updatePlaceCount();
	popList();
}

document.getElementById('pictop').onmouseover = function() {
	if (sessionStorage['*results'] && JSON.parse(sessionStorage['*results']).photourls) {
		this.style.cursor = 's-resize'
	}
}

document.getElementById('defaults').onclick = function() {
	chrome.storage.sync.set(defaults,() => {
		chrome.storage.sync.get(defaults,setOptions);
	});
}

document.getElementById('jscol').onchange = function(e) {
	chrome.storage.sync.set({backgroundColor:`#${e.target.value}`},()=>chrome.storage.sync.get(defaults,setOptions));
}

document.getElementById('colordefault').onclick = function() {
	chrome.storage.sync.set({backgroundColor:defaults.backgroundColor},()=>chrome.storage.sync.get(defaults,setOptions));
}

document.getElementById('jscolbar').onchange = function(e) {
	chrome.storage.sync.set({color:`#${e.target.value}`},()=>chrome.storage.sync.get(defaults,setOptions));
}

// ********** PICTURE / IMG FILTER NOTES ******************************
document.getElementById('pictop').onclick = (function() {
	var clicked = false;
	var show = false;
	var pics = document.getElementById('pics');
	return function() {
		if (!clicked) {
			clicked = true;
			show = true;
			if (sessionStorage['*results'] && JSON.parse(sessionStorage['*results']).photourls) {
				var photos = JSON.parse(sessionStorage['*results']).photourls;
				photos.forEach(function(x) {
					var img = document.createElement('IMG');
					img.src = x;
					img.style.margin = '5px';
					pics.appendChild(img);
				});
			}
		}
		else {
			show = !show;
			pics.style.display = pics.style.display ? '' : 'none';
		}
	}
}());

// SETTINGS **************************************************************
// potential settings options -- background-color, img grayscale, img width/height, iframe units

// You can change the font from the default Helvetica, the color of the temperature bars, and the localization of the units (‘us’ for Fahrenheit and mph, ‘uk’ for Celsius and mph, ‘ca’ for Celsius and km/h, and ‘si’ for Celsius and m/s).

// function showStorage() {
// 	var lsobj = {local: [], iframes: []}
// 	for (var key in localStorage) {
// 		if (localStorage[key][0] === 'h') {
// 			lsobj.iframes.push(key)
// 		}
// 		else {
// 			lsobj.local.push(key)
// 			lsobj[key] = JSON.parse(localStorage[key])
// 		}
// 	}

// 	var ssobj = {session: [], iframes: []}
// 	for (var key in sessionStorage) {
// 		if (sessionStorage[key][0] === 'h') {
// 			ssobj.iframes.push(key)
// 		}
// 		else {
// 			ssobj.session.push(key)
// 			ssobj[key] = JSON.parse(sessionStorage[key])	
// 		}
// 	}
// 	document.getElementById('local').innerHTML = JSON.stringify(lsobj, null, 2)
// 	document.getElementById('session').innerHTML = JSON.stringify(ssobj, null, 2)
// }

// TEST *********************************************************
// function randCoords() {
// 	console.log('randcoords')
// 	var tpos = Math.random() < .5 ? 1 : -1
// 	var gpos = Math.random() < .5 ? 1 : -1
// 	var lat = (Math.random() * 90 * tpos).toFixed(4)
// 	var lng = (Math.random() * 180 * gpos).toFixed(4)
// 	var iframe = document.getElementById('forecast_embed')
// 	iframe.src = "https://forecast.io/embed/#lat=" + lat + "&lon=" + lng + "&name=" + lat + ',' + lng
// 	document.getElementById('testurl').href = 'http://maps.google.com/?q=' + lat + ',' + lng
// }

// randCoords()
// ****************************************************************
