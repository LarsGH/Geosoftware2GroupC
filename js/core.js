/******************************************
	core.js

	- page class
	- map class

******************************************/


// Global variables




// Page class
// Description: Class for handling all page related functions / events
// Author: Peter Zimmerhof
var page = new function(){

	// Page variables
	this.currentPage = "home";
	this.infoShown = false;

	// Initialization
	this.init = function() {

		$('#panel_right_container').css({ "left": ($( window ).width() - 250) + "px" });

		page.load("home");

		$( window ).resize(function() {
			page.resize();
		});

		$("#home_btn").click(function() {
			page.load("home");
		});
		$("#expert_btn").click(function() {
			page.switchExpert("expert");
		});
		$("#help_btn").click(function() {
			page.load("help");
		});
		$("#about_btn").click(function() {
			page.load("about");
		});
	};

	// Load a page
	this.load = function(name) {
		page.beforeUnload(this.currentPage);
		page.beforeLoad(name);

		page.currentPage = name;

		$( "#panel_left_container" ).load( "pages.html #" + name + "_panel", function () {
			$( "#page_container" ).load( "pages.html #" + name + "_page", function () {

				page.afterLoad(name);
			});
		});		
	};

	// Before page unloading
	this.beforeUnload = function(name) {

		switch (name) {

			case "home":
				$('#filter_btn').off('click');
				page.hideInfo();
				break;

			case "analyse":
				$("#analyse_btn").off('click');
				break;
		}
	};

	// Before page loading
	this.beforeLoad = function(name) {

	};

	// After page loading
	this.afterLoad = function(name) {

		switch (name) {

			case "home":

				filter.init();
				map.init();
				break;

			case "analyse":
				$("#analyse_btn").click(function() {
					page.load("result");
				});
				break;

			case "help":
				$('.scroll').on('click', function(e) {
					var href = $(this).attr('id');
					var el = document.getElementById(href + '_target');
    				el.scrollIntoView(true);
				}); 
				break;
		}
	};

	// Toggle the info panel
	this.toggleInfo = function() {
		if (page.infoShown)
			page.hideInfo();
		else
			page.showInfo();
	};

	// Show the info panel
	this.showInfo = function() {
		if (!page.infoShown) {
			$('#panel_right_container').animate({ "left": "-=250px" }, function() {
					$('#panel_right_container').css({ "left": ($( window ).width() - 500) + "px" });
				}
			);
			page.infoShown = true;
		}
	};

	// Hide the info panel
	this.hideInfo = function() {
		if (page.infoShown) {
			$('#panel_right_container').animate({ "left": "+=250px" }, function() {
				}
			);
			page.infoShown = false;
		}
	};

	// Page resize function to keep the info panel in positon
	this.resize = function() {
		if (page.infoShown)
			$('#panel_right_container').css({ "left": ($( window ).width() - 500) + "px" });
		else
			$('#panel_right_container').css({ "left": "" });
	};

};




// Map class
// Description: Class for handling all Map related functions / events
// Author: Peter Zimmerhof, André Wieghardt
var map = new function() {

	// Map variables
	this.mapLeaflet = "";
	this.LayerGroup = "";
	this.sidebar = "";
	var oldselectedPoint;
	var datatrack;
	var trackid;
	var Index;
	var polygon = new Array();

	this.phenomenons = ["Speed", "Rpm", "MAF", "Calculated MAF", "Engine Load", "Intake Pressure", "Intake Temperature"];
	this.phenomenonUnits = ['km/h', 'u/min', 'l/s', 'g/s', '%', 'kPa', '°C'];

	this.SpeedValues = 	[0,		30, 	60, 	90, 	120];
	this.RpmValues = 	[0, 	750, 	1500, 	2250, 	3000];
	this.MafValues = 	[0, 	5, 		10, 	15, 	20];
	this.CalMafValues = [0, 	5, 		10, 	15, 	20];
	this.EngineValues = [0, 	20, 	40, 	60, 	80];
	this.PressValues = 	[0, 	25, 	50, 	75, 	100];
	this.TempValues = 	[0, 	10, 	20, 	30, 	40];

	this.selectedPhenomenon = "Speed";
	this.selectedPhenomenonUnit = "km/h";

	this.selectedPhenomenonValues = this.SpeedValues;

	// Initialization
	this.init = function() {
		mapLeaflet = L.map('map', {
			zoomControl: false,
		}).setView([51.963491, 7.625840], 14);
		
		this.LayerGroup = new L.LayerGroup();
		this.LayerGroup.addTo(mapLeaflet);

		var osm = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		});
		
		var NRWgeoWMS = L.tileLayer.wms("http://www.wms.nrw.de/geobasis/wms_nw_dtk10",{
			layers: 'nw_dtk10_col',
			minZoom: 14,
			format: 'image/png'
		});
		
		var ggl = new L.Google();
		var ggl2 = new L.Google('TERRAIN');
		mapLeaflet.addLayer(osm);
		var Topos = L.TileLayer.multi({
	13: {
		url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
		subdomains:'1234'
	},
	17: {
		url: 'http://www.wms.nrw.de/geobasis/wms_nw_dtk10',
		layers: 'nw_dtk10_col',
			format: 'image/png'
	}
}, {
	minZoom: 0,
	maxZoom: 17,
});
		mapLeaflet.addControl(new L.Control.Layers( {'OSM':osm, 'Google':ggl, 'Google Terrain':ggl2, 'Topoalt':NRWgeoWMS, 'Topo':Topos}, {}));
		
		sidebar = L.control.sidebar('sidebar', {
			position: 'right'
		});

		mapLeaflet.addControl(sidebar);
		L.control.mousePosition({
			separator: ' , ',
			position: 'bottomright',
			prefix: 'Mauszeigerkoordinaten: '
			}).addTo(mapLeaflet);
		L.control.pan().addTo(mapLeaflet);
		L.control.zoomslider().addTo(mapLeaflet);
		L.control.locate().addTo(mapLeaflet);
		map.loadScale();
		
		
		var legend = L.control({position: 'bottomright'});

legend.onAdd = function (Lmap) {

    var div = L.DomUtil.create('div', 'info legend');
        div.id = "legend";
        div.innerHTML += '<select id="select_phenomenon">' +
	'<option value="Speed">Speed</option>' +
	'<option value="Rpm">Rpm</option>' +
	'<option value="MAF">MAF</option>' +
	'<option value="Calculated MAF">Calculated MAF</option>' +
	'<option value="Engine Load">Engine Load</option>' +
	'<option value="Intake Pressure">Intake Pressure</option>' +
	'<option value="Intake Temperature">Intake Temperature</option>' +
	'</select><br>' + 
	'<div id="legend_inner"></div>';

    return div;
};

legend.addTo(mapLeaflet);
map.setLegend();


//Functions to either disable (onmouseover) or enable (onmouseout) the map's dragging
document.getElementById("legend").onmouseover = function(e) {
    mapLeaflet.dragging.disable();
	mapLeaflet.touchZoom.disable();
	mapLeaflet.doubleClickZoom.disable();
	mapLeaflet.scrollWheelZoom.disable();
	mapLeaflet.boxZoom.disable();
	mapLeaflet.keyboard.disable();
};
document.getElementById("legend").onmouseout = function() {
    mapLeaflet.dragging.enable();
	mapLeaflet.touchZoom.enable();
	mapLeaflet.doubleClickZoom.enable();
	mapLeaflet.scrollWheelZoom.enable();
	mapLeaflet.boxZoom.enable();
	mapLeaflet.keyboard.enable();
};

$( "#select_phenomenon" ).change(function() {

	map.selectedPhenomenon = $("#select_phenomenon").val();

	if (map.selectedPhenomenon == "Speed") {
		map.selectedPhenomenonValues = map.SpeedValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[0];
	}
	else if (map.selectedPhenomenon == "Rpm") {
		map.selectedPhenomenonValues = map.RpmValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[1];
	}
	else if (map.selectedPhenomenon == "MAF") {
		map.selectedPhenomenonValues = map.MafValues; 
		map.selectedPhenomenonUnit = map.phenomenonUnits[2];
	}
	else if (map.selectedPhenomenon == "Calculated MAF") {
		map.selectedPhenomenonValues = map.CalMafValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[3];
	}
	else if (map.selectedPhenomenon == "Engine Load") {
		map.selectedPhenomenonValues = map.EngineValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[4];
	}
	else if (map.selectedPhenomenon == "Intake Pressure") {
		map.selectedPhenomenonValues = map.PressValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[5];
	}
	else if (map.selectedPhenomenon == "Intake Temperature") {
		map.selectedPhenomenonValues = map.TempValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[6];
	}

	map.setLegend();

	for (var i = 0; i < map.LayerGroup.getLayers().length; i++) {
		map.LayerGroup.getLayers()[i].setStyle(function (feature) {

					col = "#fff";
					phenomenon = feature.properties.phenomenons[map.selectedPhenomenon];

					if (phenomenon != null && phenomenon != undefined)
						col = map.getPhenomenonColor(phenomenon.value);

					return {
						radius: 5,
						color: "#000",
						fillColor: col,
					    weight: 0.5,
					    opacity: 1,
					    fillOpacity: 1
					};
				});
	};

});

		// Initialise the FeatureGroup to store editable layers
		var drawnItems = new L.FeatureGroup();
		mapLeaflet.addLayer(drawnItems);

		// Initialise the draw control and pass it the FeatureGroup of editable layers
		var drawControl = new L.Control.Draw({
			position: 'topleft',
			draw: {
				circle: false,
				marker: false,
				polyline: false
			},
			edit: {
				featureGroup: drawnItems
			}
		});
		mapLeaflet.addControl(drawControl);
		mapLeaflet.on('draw:created', function (e) {
			polygon = [];
			var type = e.layerType,
			layer = e.layer;
			
			//if (type === 'marker') {
			//	layer.bindPopup('A popup!');
			//}
			var latLngs = layer.getLatLngs();
			for(var i=0; i < latLngs.length; i++){
				var latLngString = latLngs[i].toString();
				var openBracket = latLngString.indexOf("(");
				var comma = latLngString.indexOf(",");
				var bracketClose = latLngString.indexOf(")");
				var lat = latLngString.slice(openBracket+1, comma);
				var lng = latLngString.slice(comma+2, bracketClose);
				
				polygon[i] = new Object();
				polygon[i]["lat"]=lat;
				polygon[i]["lng"]=lng
			};
			polygon[latLngs.length] = polygon[0];
			var bla = [];
			for(var i=0; i < polygon.length; i++){
				for (var prop in polygon[i]){
					bla.push(polygon[i][prop]);
				};
			};
			alert(bla.toString());

			drawnItems.addLayer(layer);
		});

		mapLeaflet.on('draw:edited', function (e) {
			var layers = e.layers;
			var countOfEditedLayers = 0;
			layers.eachLayer(function(layer) {
			countOfEditedLayers++;
			});
			console.log("Edited " + countOfEditedLayers + " layers");
		});
		
		// $.getJSON("https://envirocar.org/api/stable/tracks?limit=3&bbox=7.581596374511719,51.948761868981265,7.670001983642577,51.97821922232462", function(json) {
			
		// 	for (i = 0; i <= json.tracks.length; i++){
			
		// 	trackid = json.tracks[i].id;
		// 	map.loadTrack("https://envirocar.org/api/stable/tracks/" +trackid);
		// 	};});
		//map.loadTracks("json/measurements.json")
		//map.loadTracks("json/measurements7.json");	
		//map.loadTracks("json/measurements6.json");
		//map.loadTracks("http://giv-geosoft2c.uni-muenster.de/php/filter/filteroptions2.php?f=createFilterTracks&filterurl=https://envirocar.org/api/stable/tracks?limit=2&bbox=7.581596374511719,51.948761868981265,7.670001983642577,51.97821922232462");
		map.loadTracks("json/trackarray.json");
		
		mapLeaflet.on('click', map.onMapClick);
		//db.loadTracks();
		
	};
	
	// Load the Scale
	this.loadScale = function() {
		L.control.scale({
			position: 'bottomleft',
			maxWidth: 150,
			imperial: false
		}).addTo(mapLeaflet);
	};
	
	this.onMapClick = function(e) {
		
		//if the sidebar is open it's gonna close now
		sidebar.hide();
		//if there is a highlighted Point, it will be unHighlighted
		if (oldselectedPoint != undefined && oldselectedPoint != null && oldselectedPoint != ""){
             map.unHighlightPoint(oldselectedPoint);
        }
	};
	
	// highlight the selected Point
	this.highlightPoint = function(Point) {
        Point.setStyle({
			radius: 5.5,
            color: "#ff4444",
            weight: 3,
            opacity: 0.75,
            fillOpacity: 1
        });
	};
	
	// unhighlight the deselected Point
	this.unHighlightPoint = function(Point) {
        Point.setStyle({
			radius: 5,
			color: "#000",
            weight: 0.5,
			opacity: 1,
			fillOpacity: 1
        });
	};

	
	// Load test measurements from json
	this.loadTracks = function(jsonFile) {
	$.getJSON(jsonFile, function(json) {
		for (i = 0; i <= json.tracks.length; i++){

			map.loadTrackJSON(json.tracks[i]);
			};
		});
	};
	
	// Load test measurements from json
	this.loadTrack = function(jsonFile) {
	
		$.getJSON(jsonFile, function(json) {
		
		map.loadTrackJSON(json);
		
		});
	};
	
	
	this.getIndex = function(jsonFile, PointID){
		$.getJSON( jsonFile, function( data ) {
		
			var jsonLength = data.features.length;
			for ( i=1; i <= jsonLength; i++ ){
				var chx = data.features[i].properties.id.toString;
				//alert(data.features[i].properties.id.toString());
				if(chx === PointID){
					Index = i;
				}
			}
		});
		return Index;
	};	
	
	
	
	
	// Load test measurements from json
	this.loadTrackJSON = function(json) {
	
			this.LayerGroup.addLayer(
				L.geoJson(json, {
				style: function (feature) {

					col = "#fff";
					phenomenon = feature.properties.phenomenons[map.selectedPhenomenon];

					if (phenomenon != null && phenomenon != undefined)
						col = map.getPhenomenonColor(phenomenon.value);

					return {
						radius: 5,
						color: "#000",
						fillColor: col,
					    weight: 0.5,
					    opacity: 1,
					    fillOpacity: 1
					};
				},
				
				onEachFeature: function (feature, layer) {
					layer.on('click', function (e) {
						
						//highlighting the clicked point
						if (oldselectedPoint != undefined && oldselectedPoint != null && oldselectedPoint != "")
                        {
                            map.unHighlightPoint(oldselectedPoint);
                        }
						//var index = feature.properties.indexOf("id");
                        //highlighting the clicked point
                        selectedPoint = e.target;
						map.highlightPoint(selectedPoint);
                        
                        oldselectedPoint = selectedPoint;
						
						
						var d = new Date(Date.parse(feature.properties.time));
						var sphenomenon = "<h3>Attribute</h3>" +
							"<table width=100%>" +
							"<tr><td>ID</td><td>" + feature.properties.id + "</td></tr>" + 
							"<tr><td>Datum</td><td>" + helper.dateToDateString(d) + "</td></tr>" + 
							"<tr><td>Uhrzeit</td><td>" + helper.dateToTimeString(d) + "</td></tr></table>" + 
							"<hr> <table width=100%>";
						

						for (var i = 0; i < map.phenomenons.length; i++) {
							p = map.phenomenons[i];
						
							if (feature.properties.phenomenons[p] != undefined)
							{
							sphenomenon += 
								"<tr><td>" +
								p + 
								"</td><td>" +
								((feature.properties.phenomenons[p].value % 1 == 0) ?
								feature.properties.phenomenons[p].value :
								(Math.round(feature.properties.phenomenons[p].value* 100)/100).toFixed(2)) + 
								"</td><td>" +
								feature.properties.phenomenons[p].unit + 
								"</td></tr>";
							}
							else 
							{
								sphenomenon += "<tr><td>" + p + "</td><td>-</td><td>-</td></tr>";
							}
						};
						
						sphenomenon += "</table><hr>" + //index + 
						"<button id=next_button>N\u00e4chster</button>";
						

						sidebar.setContent(sphenomenon);
						$("#next_button").click(function() {
							//mapLeaflet.panTo([51.963491, 7.625840], {duration: 0.5});
							//alert(feature.properties.id.toString() +", "+ feature.properties.phenomenons.trackID.toString());
							url = "https://envirocar.org/api/stable/tracks/" +feature.properties.phenomenons.trackID;
							map.getIndex(feature.properties.id, "https://envirocar.org/api/stable/tracks/" +feature.properties.phenomenons.trackID);
							alert(Index+", "+ url+", "+ feature.properties.id+ " na hats funktioniert?");
						});
						sidebar.show(feature.geometry.coordinates[1],feature.geometry.coordinates[0]);
						
					});
				
				layer.on('mouseover', function (e) {
					map.highlightPoint(e.target);
				});
				layer.on('mouseout', function (e) {
					if (oldselectedPoint != e.target){
					map.unHighlightPoint(e.target);}
				});
					
				},
								
				pointToLayer: function (feature, latlng) {
        			return L.circleMarker(latlng);
    			},
    			// filter: function(feature, layer) {
				// 	return (feature.properties.phenomenons.Speed.value > 60);
				// }

			})
			);
	};

	this.setLegend = function () {
		legend_inner = '';

		// loop through intervals and generate a label with a colored square for each interval
	    for (var i = 0; i < map.selectedPhenomenonValues.length; i++) {
	        legend_inner += 
	            '<i style="background:' + map.getPhenomenonColor(map.selectedPhenomenonValues[i] + 1) + '"></i> ' +
	            map.selectedPhenomenonValues[i] + ' ' +
	            (map.selectedPhenomenonValues[i + 1] ? '&ndash; ' + map.selectedPhenomenonValues[i + 1] + '<br>' : '+<b id="legend_unit">' + map.selectedPhenomenonUnit + '</b>');
	    }

		$( "#legend_inner" ).html(legend_inner);
	};

	this.getPhenomenonColor = function (value) {

		col = "#fff";

		if (value != null && value != undefined) {
			for (var i = 1; i < this.selectedPhenomenonValues.length; i++) {
				if (value < this.selectedPhenomenonValues[i]) {

					col = map.getGreenToRed((i-1) / (this.selectedPhenomenonValues.length - 1) * 100);
					break;
				}
				else if (i == (this.selectedPhenomenonValues.length - 1) && value > this.selectedPhenomenonValues[i]) {

					col = map.getGreenToRed(100);
					break;
				}
			};
		}

		return col;
	};

	this.getGreenToRed = function (percent){
            r = percent>50 ? 255 : Math.floor((percent*2)*255/100);
            g = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);

            r = r.toString(16);
            g = g.toString(16);

            if (r < 10) r = '0' + r;
            if (g < 10) g = '0' + g;

            return '#'+r+''+g+'00';
    }
};





// Filter class
// Description: Class for filter functions
// Author: Peter Zimmerhof
var filter = new function() {



	this.init = function() {

		$("#filter_btn").click(function() {
			filter.filter();
		});

		$( "#from_dt" ).datetimepicker();
		$( "#to_dt" ).datetimepicker();


		startdate =  new Date();
		enddate =  new Date();

		startdate.setTime(startdate.getTime() - (7 * (1000 * 60 * 60 * 24)));
		startdate.setHours(0);
		startdate.setMinutes(0);
		startdate.setSeconds(0);

		enddate.setHours(23);
		enddate.setMinutes(59);
		enddate.setSeconds(59);

		$( "#from_dt" ).datetimepicker('setDate', startdate);
		$( "#to_dt" ).datetimepicker('setDate', enddate);

		$("#btn_bb").click(filter.btnBBClick);
		$("#btn_polygon").click(filter.btnPolygonClick);
	};

	this.filter = function() {
		db.loadTracks($( "#from_dt" ).datetimepicker( 'getDate' ), $( "#to_dt" ).datetimepicker( 'getDate' ))
	};

	this.btnBBClick = function() {
		alert("bbox");
	};

	this.btnPolygonClick = function() {
		alert("polygon");
	};
	
};




// DB class
// Description: Class for DB functions
// Author: Peter Zimmerhof
var db = new function() {

	this.loadTracks = function(from, to) {

		var tracks = "";

		$.post( "http://giv-geosoft2c.uni-muenster.de/php/filter.php", { f: "getInitialTimeTrack", starttime: helper.dateToDateTimeString(from), endtime: helper.dateToDateTimeString(to), limit: "5" })
		 	.done(function( data ) {
		 		map.loadTrackJSON();
		 	});
		};
};




// Helper class
// Description: Class for universal functions
// Author: Peter Zimmerhof
var helper = new function() {

	this.dateToDateTimeString = function(date) {
		return helper.dateToDateString(date) + ' ' + helper.dateToTimeString(date);
	};

	// JS Date to date string
	this.dateToDateString = function(date) {

		var day = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
		var month12 = date.getMonth() + 1;
		var month = (month12 < 10) ? "0" + month12 : month12;

		var sdate = day + "." + month + "." + date.getFullYear();

		return sdate;
	};

	// JS Date to time string
	this.dateToTimeString = function(date) {

		var hours = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
		var minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
		var seconds = (date.getSeconds() < 10) ? "0" + date.getSeconds() : date.getSeconds();

		var stime = hours + ":" + minutes + ":" + seconds;

		return stime;
	};
};




// Page loaded - start the magic
$( document ).ready(function() {
	page.init();
});
