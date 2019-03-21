var C = (function() {
	var entry = null;
	var root = null;
	var VDOM = null;

	function DOMdiff(DOMparent,updated,curr,child) {
		if (!curr) {
			DOMparent.appendChild(DOM(updated));
		}
		else if (isDifferentType(updated,curr)) {
			DOMparent.replaceChild(DOM(updated),DOMparent.childNodes[child]);
		}
		else if (updated.tag) {
			var DOMchild = DOMparent.childNodes[child];
			updateFeeds(Object.assign({}, updated.feed, curr.feed), DOMchild , updated.feed, curr.feed);
			for (var i = 0 ; i < updated.children.length ; i++) {
				DOMdiff(DOMchild, updated.children[i], curr.children[i], i);
			}
			for (i ; i < curr.children.length ; i++) {
				DOMchild.removeChild(DOMchild.lastChild);
			}
		}
	}

	function isDifferentType(updated,curr) {
		if (typeof updated === 'object') {
			return updated.tag !== curr.tag || updated.feed.forceSync;
		}
		return updated !== curr;
	}

	function updateFeeds(feeds,DOMtarget,updated,curr) {
		Object.keys(feeds).forEach(key => {
			if (typeof feeds[key] === 'boolean') {
				if (updated[key] === undefined) {
					DOMtarget.removeAttribute(key);
					DOMtarget[key] = false;
				}
				else if (curr[key] === undefined || curr[key] !== updated[key]) {
					if (updated[key]) {
						DOMtarget.setAttribute(key,true);
						DOMtarget[key] = true;
					}
					else {
						DOMtarget[key] = false;
					}
				}
			}
			else if (key === 'style') {
				var updatedStyle = updated[key];
				var currStyle = curr[key];
				var styles = Object.assign({}, updatedStyle, currStyle);
				for (var styleKey in styles) {
					if (!updatedStyle || !updatedStyle[styleKey]) {
						DOMtarget.style[styleKey] = '';
					}
					else if (!currStyle || !currStyle[styleKey] || currStyle[styleKey] !== updatedStyle[styleKey]) {
						DOMtarget.style[styleKey] = updatedStyle[styleKey];
					}
				}
			}
			else {
				if (!updated[key]) {
					DOMtarget.removeAttribute(key);
				}
				else if (!curr[key] || curr[key] !== updated[key]) {
					DOMtarget.setAttribute(key, updated[key]);
				}
			}
		});
	}

	function DOM(node) {
		if (typeof node !== 'object' || node === null) {
			return document.createTextNode(node);
		}
		var { tag,feed,children } = node;
		var DOMel = document.createElement(tag);
		Object.keys(feed).forEach(prop => {
			if (typeof feed[prop] === 'boolean') {
				if (feed[prop]) {
					DOMel.setAttribute(prop, true);
				}
				DOMel[prop] = feed[prop];
			}
			else if (prop === 'style') {
				for (var key in feed[prop]) {
					DOMel.style[key] = feed[prop][key];
				}
			}
			else if (prop === 'listeners') {
				Object.keys(feed[prop]).forEach(key => {
					DOMel.addEventListener(key.slice(2), feed[prop][key]);
				});
			}
			else {
				DOMel.setAttribute(prop, feed[prop]);
			}
		});
		children.forEach(c=>DOMel.appendChild(DOM(c)));
		return DOMel;
	}

	function C(tag,feed={},children=[]) {
		if (Array.isArray(feed)) {
			children = feed;
			feed = {};
		}
		return { tag,feed,children };
	}

	function Sync() {
		var updatedVDOM = entry();
		DOMdiff(root,updatedVDOM,VDOM,0);
		VDOM = updatedVDOM;
		// *************** re-write entire DOM
		// if (root.childNodes.length) {root.removeChild(root.lastChild)}
		// root.appendChild(DOM(entry()));
	}

	C.sync = function() {
		setTimeout(Sync);
	}

	C.attach = function(component,rootNode) {
		entry = component;
		root = rootNode;
		Sync();
	}

	return C;
}());

function Options({options,display,optionsDisplay,saveOptions,updateOptions}) {
	return C('div',{style:{marginBottom:'10em'}},[
		C('span',{style:{paddingLeft:'3px'}},['\u2602',C('span',{style:{cursor:'pointer',textDecoration:'underline',fontStyle:'italic'},listeners:{onclick:optionsDisplay}},['options'])]),
		C('div',{style:{display,paddingLeft:'1%'}},[
			C('div',{style:{margin:'1em',display:'grid',gridTemplateColumns:'1fr 9fr',gridGap:'1em'}},[
				C('span',{style:{textAlign:'right'}},['Background Color: ']),
				C('input',{id:'bgcolor',type:'color',autocomplete:true,value:options?options.backgroundColor:'#000000',listeners:{onchange:(e)=>setOption({backgroundColor:e.target.value})}}),
				C('span',{style:{textAlign:'right'}},['Widget Bar Color: ']),
				C('input',{id:'barcolor',type:'color',value:options?options.color:'#000000',listeners:{onchange:(e)=>setOption({color:e.target.value})}}),
				C('span',{style:{textAlign:'right'}},['Widget Units: ']),
				C('div',{},[
					C('input',{type:'radio',name:'units',checked:options?options.units==='us':true,listeners:{onclick:()=>setOption({units:'us'})}}),
					C('label',{class:'wlabel'},['US: Fahrenheit & mph(default)']),
					C('input',{type:'radio',name:'units',checked:!!options&&options.units==='uk',listeners:{onclick:()=>setOption({units:'uk'})}}),
					C('label',{class:'wlabel'},['UK: Celsius & mph']),
					C('input',{type:'radio',name:'units',checked:!!options&&options.units==='ca',listeners:{onclick:()=>setOption({units:'ca'})}}),
					C('label',{class:'wlabel'},['CA: Celsius & km/h']),
					C('input',{type:'radio',name:'units',checked:!!options&&options.units==='si',listeners:{onclick:()=>setOption({units:'si'})}}),
					C('label',{class:'wlabel'},['SI: Celsius & m/s'])
				])
			]),
			C('button',{id:'defaults',listeners:{onclick:resetAll}},['reset all options to default']),C('button',{id:'saveOpts',listeners:{onclick:()=>saveOptions(options)}},['save'])
		])
	]);
	function resetAll() {
		chrome.storage.sync.clear(()=>location.reload());
	}
	function setOption(option) {
		document.getElementById('saveOpts').style.background = 'red';
		options = Object.assign({},options,option);
	}
}

function Pics({picDisplay,display,photos}) {
	return C('div',{id:'pictop',style:{cursor:photos&&display==='none'?'pointer':''},listeners:{onclick:picDisplay}},[photos?renderPhotos():'']);
	function renderPhotos() {
		return C('div',{style:{display,gridTemplateColumns:'repeat(4,1fr)',padding:'3px',gridGap:'3px'}},photos.map(img));
	}
	function img(p) {
		return C('div',{style:{textAlign:'center',backgroundColor:'#333333'}},[
				C('IMG',{src:p})
		]);
	}
}

function Tables({session,local,display}) {
	return C('div',{id:'tables',style:{display}},[
		C('div',{},[
			C('div',{class:'table',style:{borderRight:'1px solid #f7f7f7'}},[
				C('div',{class:'thead'},['\u2606 Saved',C('span',{style:{float:'right'}},[C('button',{listeners:{onclick:clearLocal}},['delete all'])])]),
				C('div',{style:{fontWeight:'normal'}},local.map(localPlace))
			]
		)]),
		C('div',{},[
			C('div',{class:'table',style:{borderLeft:'1px solid #f7f7f7'}},[
				C('div',{class:'thead'},['\u263D Recent',C('span',{style:{float:'right'}},[C('button',{listeners:{onclick:clearSearches}},['clear'])])]),
				C('div',{style:{fontWeight:'normal'}},session.searches.map(s=>C('div',{class:'place',listeners:{onclick:()=>loadPlace(s)}},[s.name])))
			]
		)])
	]);
	function clearSearches() {
		session.searches = [];
		sessionStorage.setItem('DSNT',JSON.stringify(session));
		C.sync();
	}
	function clearLocal() {
		localStorage.setItem('DSNT',JSON.stringify([]));
		C.sync();
	}
	function deleteSaved(i) {
		local.splice(i,1);
		localStorage.setItem('DSNT',JSON.stringify(local));
		C.sync();
	}
	function localPlace(s,i) {
		return C('div',{class:'place',style:{display:'grid',gridTemplateColumns:'1fr 2em'}},[
			C('div',{listeners:{onclick:()=>loadPlace(s)}},[s.name]),
			C('button',{listeners:{onclick:()=>deleteSaved(i)}},['X'])
		]);
	}
	function loadPlace(place) {
		session.current = place;
		sessionStorage.setItem('DSNT',JSON.stringify(session));
		location.reload();
	} 
}

function DarkSky({current}) {
	var href = `https://darksky.net/${current.coords?`${current.coords[0]},${current.coords[1]}`:''}`;
	return C('div',{id:'ds',class:'links'},[
		C('a',{id:'dsanch',class:'links',target:'_blank',href},[`${current.name?`${current.name} at `:''}Dark Sky`]),
		C('div',{},[C('img',{src:'dsfoot.svg'})])
	]);
}

function Google({current}) {
	var href = current.url?current.url:`http://maps.google.com${current.coords?`/?q=${current.coords[0]},${current.coords[1]}`:''}`;
	return C('div',{id:'google',class:'links'},[
		C('a',{id:'mapanch',class:'links',target:'_blank',href},[`${current.name?`${current.name} on `:''}Google Maps`]),
		C('div',{id:'svgcon'},[C('div',{style:{height:'10px'}},[]),C('img',{id:'svglink',src:'pbg.svg'})])
	]);
}

function InterContainer({display,tables,session,local}) {
	return C('div',{id:'intercontainer'},[
		DarkSky({current:session.current}),
		C('div',{style:{textAlign:'center'}},[
			C('input',{id:'locSearch',placeholder:'\u26B2',autofocus:true})
		]),
		Google({current:session.current}),
		C('div',{},[]),
		C('div',{style:{width:'60%',margin:'auto',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',height:'3em',gridGap:'1%'}},[
			C('button',{class:'midbuttons',id:'show-tables',listeners:{onclick:()=>tables()}},[`\u2605: ${local.length} - \u263D:${session.searches.length}`]),
			saveLocButton(),
			C('button',{class:'midbuttons',id:'loc',listeners:{onclick:getLocation}},['\u21BB'])
		])
	]);
	function saveLocButton() {
		if (local.length&&session.current.coords&&local.some(s=>s.name===session.current.name)) {
			return C('button',{class:'midbuttons',id:'prevsaved',listeners:{onclick:deleteLocation},forceSync:true},[`\u2606 delete this place`]);
		}
		return C('button',{class:'midbuttons',id:'saveLocBtn',listeners:{onclick:saveLoc},forceSync:true},[`\u2605 save this place`]);
	}
	function getLocation() {
		session.current = {};
		sessionStorage.setItem('DSNT',JSON.stringify(session));
		C.sync();
	}
	function saveLoc() {
		if (session.current.coords&&local.every(s=>s.name!==session.current.name)) {
			local.push(session.current);
			localStorage.setItem('DSNT',JSON.stringify(local));
			C.sync();
		}
	}
	function deleteLocation() {
		if (session.current.coords) {
			for (var i = 0 ; i < local.length ; i++) {
				if (local[i].name===session.current.name) {
					local.splice(i,1);
					break;
				}
			}
			localStorage.setItem('DSNT',JSON.stringify(local));
			C.sync();
		}
	}
}

function Frame({options,session}) {
	return C('div',{id:'loadframe'},[checkLoad()]);
	function checkLoad() {
		if (!options) {
			return Loading();
		}
		if (session.current.coords) {
			return iFrame();
		}
		getLocation();
		return Loading();
	}
	function iFrame() {
		var src = `https://forecast.io/embed/#lat=${session.current.coords[0]}&lon=${session.current.coords[1]}&name=${session.current.name}&color=${options.color}&units=${options.units}`;
		return C('iframe',{id:"forecast_embed",frameborder:'0',height:'245',width:"100%",src});
	}
	function Loading() {
		return C('div',{id:'framecon'},[
			C('div',{class:'stormy'},[]),
			C('div',{},[C('p',{id:'error',style:{fontWeight:'bold',fontSize:'14px',textAlign:'center',paddingTop:'5%'}},['Loading . . .'])])
		]);
	}

	function getLocation() {
		navigator.geolocation.getCurrentPosition(function(p) {
			var geocoder = new google.maps.Geocoder;
			geocoder.geocode({'location': {lat: p.coords.latitude, lng: p.coords.longitude}}, function(results, status) {
				if (status === 'OK') {
					var coords = [p.coords.latitude.toFixed(4),p.coords.longitude.toFixed(4)];
					var address = results[0].address_components;
					session.current.name = results[0].formatted_address;
					session.current.coords = coords;
					if (session.searches.every(s=>s.name!==session.current.name)) {
						session.searches.unshift(session.current);
					}
					sessionStorage.setItem('DSNT',JSON.stringify(session));
					C.sync();
				}
			})
		}, function(error) {
				console.log('err =', error);
				var err = document.getElementById('error');
				if (error.code === 1) {
					err.innerHTML = 'It loooks like you haven\'t enabled location permission.  Search for a location below';
				}
				else if (error.code === 2) {
					err.innerHTML = 'For some reason your location is unavailable - is your wifi on? modem/router working?<br>Sometimes Chrome\'s location service goes down for a little while.<br>Just search for a location below<br>\u2193';
				}
				else {
					err.innerHTML = 'The location search timed out.  Search for a location below';
				}
		});
	}
}

var App = (function() {
	var data = {state: {tableDisplay:'none',picDisplay:'none',optionsDisplay:'none'}};
	getSync();
	google.maps.event.addDomListener(window, 'load', () => {
		var input = document.getElementById('locSearch');
		var autocomplete = new google.maps.places.Autocomplete(input)
		autocomplete.addListener('place_changed', () => {
			var results = autocomplete.getPlace();
			var name = results.formatted_address;
			var coords = [results.geometry.location.lat().toFixed(4),results.geometry.location.lng().toFixed(4)];
			var session = data.session;
			var url = results.url;
			session.current = {name,coords,url};
			if (results.photos) {
				session.current.photos = results.photos.map(p=>p.getUrl({'maxWidth': 500, 'maxHeight': 200}));
			}		
			if (session.searches.every(s=>s.name!==session.current.name)) {
				session.searches.unshift(session.current);
			}
			sessionStorage.setItem('DSNT',JSON.stringify(session));
			location.reload();
		})
	});
	return function() {
		data.session = JSON.parse(sessionStorage.getItem('DSNT'))||{searches:[],current:{}};
		data.local = JSON.parse(localStorage.getItem('DSNT'))||[];
		var feed = deepCopy(data);
		return C('div',{},[
			C('a',{href:'https://darksky.net/',target:'_blank'},[C('img',{id:'headpic',src:'pbds.svg'})]),
			Frame({options:feed.sync,session:feed.session}),
			InterContainer({display:feed.state.tableDisplay,tables,session:feed.session,local:data.local}),
			Tables({display:feed.state.tableDisplay,session:feed.session,local:feed.local}),
			Pics({picDisplay,display:feed.state.picDisplay,photos:feed.session.current.photos}),
			Options({saveOptions,updateOptions,options:feed.sync,display:feed.state.optionsDisplay,optionsDisplay:toggleOptions})
		]);
	}
	function getSync() {
		chrome.storage.sync.get(null,(sync={}) => {
			data.sync = Object.assign({},defaults(),sync);
			document.body.style.backgroundColor = data.sync.backgroundColor;
			C.sync();
		});
	}
	function tables() {
		data.state.tableDisplay = data.state.tableDisplay === 'none' ? 'grid' : 'none';
		C.sync();
	}
	function picDisplay() {
		data.state.picDisplay = 'grid';
		C.sync();
	}
	function toggleOptions() {
		data.state.optionsDisplay = data.state.optionsDisplay ? '' : 'none';
		C.sync();
	}
	function saveOptions(opts) {
		data.sync = opts;
		chrome.storage.sync.set(opts,()=>location.reload());
	}
	function updateOptions(opts) {
		data.sync = Object.assign({},defaults(),opts);
		C.sync();
	}
	function defaults() {
		return {backgroundColor:'#9C9C9C',units:'us',color:'#333333'};
	}
	function deepCopy(val) {
		if (typeof val === 'object' && val !== null) {
			if (Array.isArray(val)) {
				return val.map(deepCopy);
			}
			var copy = {};
			for (var key in val) {
				copy[key] = deepCopy(val[key]);
			}
			return copy;
		}
		return val;
	}
}());

C.attach(App,document.getElementById('root'));
