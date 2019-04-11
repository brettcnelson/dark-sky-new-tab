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
			return updated.tag !== curr.tag || updated.feed.forceSync || updated.feed.listeners;
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

function Options({defaults,options,display,optionsDisplay,saveOptions,resetAll}) {
	return C('div',{},[
		C('span',{style:{paddingLeft:'3px'}},['\u2602',C('span',{style:{cursor:'pointer',textDecoration:'underline',fontStyle:'italic'},listeners:{onclick:optionsDisplay}},['options'])]),
		C('div',{style:{display,paddingLeft:'1%'}},[
			C('div',{style:{margin:'1em',display:'grid',gridTemplateColumns:'auto 1fr',gridGap:'1em'}},[
				C('span',{style:{textAlign:'right',alignSelf:'center'}},['Background Color: ']),
				C('div',{},[
					C('input',{id:'backgroundColor',type:'color',value:options.backgroundColor,style:{height:'50px',width:'50px',backgroundColor:'#f7f7f7'},listeners:{onchange:(e)=>setOption({backgroundColor:e.target.value},e.target.value)}}),
					C('button',{style:{marginLeft:'1em',backgroundColor:defaults.backgroundColor},listeners:{onclick:()=>setDefault('backgroundColor',true)}},['default'])
				]),
				C('span',{style:{textAlign:'right',alignSelf:'center'}},['Widget Bar Color: ']),
				C('div',{},[
					C('input',{id:'color',type:'color',value:options?options.color:'#000000',style:{height:'50px',width:'50px',fontSize:'1em',backgroundColor:'#f7f7f7'},listeners:{onchange:(e)=>setOption({color:e.target.value})}}),
					C('button',{style:{marginLeft:'1em',backgroundColor:defaults.color,color:'#f7f7f7'},listeners:{onclick:()=>setDefault('color')}},['default'])
				]),
				C('span',{style:{textAlign:'right',alignSelf:'center'}},['Widget Units: ']),
				C('div',{},[
					C('select',{style:{fontSize:'1em',backgroundColor:'#f7f7f7'},listeners:{onchange:(e)=>setOption({units:e.target.value})}},[
						C('option',{value:'us',selected:options.units==='us'},['US: Fahrenheit & mph']),
						C('option',{value:'uk',selected:options.units==='uk'},['UK: Celsius & mph']),
						C('option',{value:'ca',selected:options.units==='ca'},['CA: Celsius & km/h']),
						C('option',{value:'si',selected:options.units==='si'},['SI: Celsius & m/s'])
					])
				])
			]),
			C('button',{id:'defaults',listeners:{onclick:resetAll}},['reset all options to default']),
			C('span',{forceSync:true,id:'saveOpts',style:{display:'none',marginLeft:'1em'}},[
				C('button',{style:{backgroundColor:'red',border:'1px solid #333333'},listeners:{onclick:()=>saveOptions(options)}},['SAVE']),
				C('span',{style:{fontStyle:'italic',marginLeft:'1em'}},['widget will update when options are saved'])
			]),
			C('div',{style:{marginTop:'2em',fontSize:'.75em',fontStyle:'italic'}},['send feedback/suggestions to ',C('a',{class:'links',href:'mailto:weatherwidgetnewtab@yahoo.com',target:'_blank'},['weatherwidgetnewtab@yahoo.com'])])
		])
	]);
	function setOption(option,realTime) {
		if (realTime) {
			document.body.style.backgroundColor = realTime;
		}
		document.getElementById('saveOpts').style.display = '';
		options = Object.assign({},options,option);
	}
	function setDefault(key,realTime) {
		var option = {};
		option[key] = defaults[key];
		if (realTime) {
			realTime = defaults[key];
		}
		setOption(option,realTime);
		document.getElementById(key).value = defaults[key];
	}
}

function Pics({picDisplay,display,photos}) {
	return C('div',{style:{backgroundColor:'#333333'}},
		photos ? [C('div',{id:'pictop',style:{cursor:'pointer',backgroundImage:`radial-gradient(#f7f7f7,#333333)`},listeners:{onclick:picDisplay}}),renderPhotos()] : 
			[C('div',{id:'pictop'})]
	);
	function renderPhotos() {
		return C('div',{style:{display,borderBottom:'1vw solid #333333',margin:'1vw 1vw 0 1vw',gridGap:'1vw',gridTemplateColumns:'repeat(2,1fr)'}},photos.map(img));
	}
	function img(p) {
		return C('div',{style:{textAlign:'center'}},[
			C('span',{style:{display:'inline-block',height:'100%',verticalAlign:'middle'}}),
			C('a',{href:p,target:'_blank'},[C('img',{src:p,style:{verticalAlign:'middle',maxHeight:'90vh',maxWidth:'48.5vw'}})])
		]);
	}
}

function Tables({reloadiFrame,session,local,display}) {
	return C('div',{id:'tables',style:{display}},[
		C('div',{},[
			C('div',{class:'table',style:{borderRight:'1px solid #f7f7f7'}},[
				C('div',{class:'thead'},['\u2606 Saved',C('span',{style:{float:'right'}},[C('button',{listeners:{onclick:clearLocal}},['delete all'])])]),
				C('div',{style:{fontWeight:'normal'}},local.map(localPlace))
			]
		)]),
		C('div',{},[
			C('div',{class:'table',style:{borderLeft:'1px solid #f7f7f7'}},[
				C('div',{class:'thead'},['\u263D Recent',C('span',{style:{float:'right'}},[C('button',{listeners:{onclick:()=>clearSearches()}},['clear'])])]),
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
		reloadiFrame(place);
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
			C('input',{id:'locSearch',placeholder:'\u26B2',autofocus:true}),
			C('div',{class:'btncon'},[
				C('button',{class:'midbuttons',listeners:{onclick:()=>tables()}},[`\u2605: ${local.length} - \u263D:${session.searches.length}`]),
				saveLocButton(),
				C('button',{class:'midbuttons',listeners:{onclick:getLocation}},['\u21BB'])
			])
		]),
		Google({current:session.current})
	]);
	function saveLocButton() {
		if (local.length&&session.current.coords&&local.some(s=>s.name===session.current.name)) {
			return C('button',{class:'midbuttons',id:'prevsaved',listeners:{onclick:deleteLocation}},[`\u2606 saved`]);
		}
		return C('button',{class:'midbuttons',listeners:{onclick:saveLoc}},[`\u2605 save this place`]);
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
		if (options) {
			if (session.current.coords) {
				return iFrame();
			}
			if (session.temp) {
				session.current = session.temp;
				delete session.temp;
				sessionStorage.setItem('DSNT',JSON.stringify(session));
				C.sync();
			}
			else {
				getLocation();
			}
		}
		return Loading();
	}
	function iFrame() {
		var src = `https://forecast.io/embed/#lat=${session.current.coords[0]}&lon=${session.current.coords[1]}&name=${session.current.name}&color=${options.color}&units=${options.units}`;
		return C('iframe',{id:"forecast_embed",frameborder:1,height:'100%',width:'100%',style:{border:`1px solid rgba(0,0,0,0)`},src});
	}
	function Loading() {
		return C('div',{id:'framecon'},[
			C('div',{id:'spinner'},[Spinner()]),
			C('p',{id:'error',style:{fontWeight:'bold',textAlign:'center'}},[])
		]);
	}
	function getLocation() {
		navigator.geolocation.getCurrentPosition(function(p) {
			var geocoder = new google.maps.Geocoder;
			geocoder.geocode({'location': {lat: p.coords.latitude, lng: p.coords.longitude}}, function(results, status) {
				if (status === 'OK') {
					session.current.name = results[0].formatted_address;
					session.current.coords = [p.coords.latitude,p.coords.longitude];
					if (session.searches.every(s=>s.name!==session.current.name)) {
						session.searches.unshift(session.current);
					}
					sessionStorage.setItem('DSNT',JSON.stringify(session));
					C.sync();
				}
				else {
					error(status);
				}
			})
		}, error,{maximumAge:1000,timeout:8000,enableHighAccuracy:true});
	}
	function error(err) {
		console.warn(err);
		document.getElementById('spinner').style.display = 'none';
		document.getElementById('error').innerHTML = `There was an error getting your location.<br>Search for a location below<br><br>\u2193`;
	}
}

function Spinner() {
	return C('div',{class:'lds-default'},Array.from({length:12},()=>C('div')));
}

var App = (function() {
	var data = {state: {tableDisplay:'none',picDisplay:'none',optionsDisplay:'none'}};
	chrome.storage.sync.get(null,(sync={}) => {
		data.sync = Object.assign({},defaults(),sync);
		C.sync();
	});
	if (window.google) {
		google.maps.event.addDomListener(window, 'load', () => {
			var input = document.getElementById('locSearch');
			var autocomplete = new google.maps.places.Autocomplete(input);
			autocomplete.addListener('place_changed', () => {
				var results = autocomplete.getPlace();
				if (results.geometry) {
					var session = data.session;
					session.current = {};
					session.temp = {name:input.value,coords:[results.geometry.location.lat(),results.geometry.location.lng()],url:results.url};
					input.value = '';
					if (results.photos) {
						session.temp.photos = results.photos.map(p=>p.getUrl());
					}		
					if (session.searches.every(s=>s.name!==session.temp.name)) {
						session.searches.unshift(session.temp);
					}
					sessionStorage.setItem('DSNT',JSON.stringify(session));
					C.sync();
				}
			})
		});
	}
	return function() {
		data.session = JSON.parse(sessionStorage.getItem('DSNT'))||{searches:[],current:{}};
		data.local = JSON.parse(localStorage.getItem('DSNT'))||[];
		var feed = deepCopy(data);
		document.body.style.backgroundColor = feed.sync ? feed.sync.backgroundColor : defaults().backgroundColor;
		return C('div',{id:'root'},[
			Frame({options:feed.sync,session:feed.session}),
			InterContainer({display:feed.state.tableDisplay,tables,session:feed.session,local:feed.local}),
			Tables({reloadiFrame,display:feed.state.tableDisplay,session:feed.session,local:feed.local}),
			Pics({picDisplay,display:feed.state.picDisplay,photos:feed.session.current.photos}),
			feed.sync?Options({resetAll,defaults:defaults(),saveOptions,options:feed.sync,display:feed.state.optionsDisplay,optionsDisplay:toggleOptions}):Spinner()
		]);
	}
	function tables() {
		data.state.tableDisplay = data.state.tableDisplay === 'none' ? 'grid' : 'none';
		C.sync();
	}
	function picDisplay() {
		data.state.picDisplay = data.state.picDisplay === 'none' ? 'grid' : 'none';
		C.sync();
	}
	function toggleOptions() {
		data.state.optionsDisplay = data.state.optionsDisplay ? '' : 'none';
		C.sync();
	}
	function saveOptions(opts) {
		data.sync = opts;
		chrome.storage.sync.set(opts,reloadiFrame);
	}
	function resetAll() {
		data.sync = defaults();
		chrome.storage.sync.clear(reloadiFrame);
	}
	function reloadiFrame(place=data.session.current) {
		data.session.temp = place;
		data.session.current = {};
		sessionStorage.setItem('DSNT',JSON.stringify(data.session));
		C.sync();
	}
	function defaults() {
		return {backgroundColor:'#929292',units:'us',color:'#333333'};
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
