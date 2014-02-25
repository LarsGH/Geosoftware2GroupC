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
				$("#filter_btn").click(function() {
					page.load("analyse");
				});
				$( "#from_dt" ).datepicker();
				$( "#to_dt" ).datepicker();
				map.init();
				break;

			case "analyse":
				$("#analyse_btn").click(function() {
					page.load("result");
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
	this.sidebar = "";
	var oldselectedPoint;
	var datatrack;
	var trackid;

	this.phenomenons = ["Speed", "Rpm", "MAF", "Calculated MAF", "Engine Load", "Intake Pressure", "Intake Temperature"];

	// Initialization
	this.init = function() {
		mapLeaflet = L.map('map', {
			zoomControl: false,
		}).setView([51.963491, 7.625840], 14);
		
		var osm = new L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
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
		
		$.getJSON("https://envirocar.org/api/stable/tracks?limit=10&bbox=7.581596374511719,51.948761868981265,7.670001983642577,51.97821922232462", function(json) {
			
			for (i = 0; i <= json.tracks.length; i++){
			
			trackid = json.tracks[i].id;
			map.loadTrack("https://envirocar.org/api/stable/tracks/" +trackid);
			};});
		map.loadTracks("json/measurements.json")
		map.loadTracks("json/measurements7.json");	
		//map.loadTracks("json/measurements6.json");
		map.loadTracks("http://giv-geosoft2c.uni-muenster.de/php/filter/filteroptions2.php?f=createFilterTracks&filterurl=https://envirocar.org/api/stable/tracks?limit=2&bbox=7.581596374511719,51.948761868981265,7.670001983642577,51.97821922232462");
		map.loadTracks("json/trackarray.json");
		
		mapLeaflet.on('click', map.onMapClick);
		
		
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
		
	// Load test measurements from json
	this.loadTrackJSON = function(json) {
	
			L.geoJson(json, {
				style: function (feature) {
					col = "white";
					if (feature.properties.phenomenons.Speed != null) { //only if there is a Speed Measurement the Color will be another than white
						if (feature.properties.phenomenons.Speed.value < 10)
							col = "#0f0";
						else if (feature.properties.phenomenons.Speed.value < 20)
							col = "#4f0";
						else if (feature.properties.phenomenons.Speed.value < 30)
							col = "#8f0";
						else if (feature.properties.phenomenons.Speed.value < 40)
							col = "#cf0";
						else if (feature.properties.phenomenons.Speed.value < 50)
							col = "#ff0";
						else if (feature.properties.phenomenons.Speed.value < 60)
							col = "#fc0";
						else if (feature.properties.phenomenons.Speed.value < 70)
							col = "#f80";
						else if (feature.properties.phenomenons.Speed.value < 80)
							col = "#f40";
						else
							col = "#f00";
					}
					else col = "#fff";

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

                        //highlighting the clicked point
                        selectedPoint = e.target;
						map.highlightPoint(selectedPoint);
                        
                        oldselectedPoint = selectedPoint;

						
						var sphenomenon = feature.properties.id + "<br>" + feature.properties.time + "<br>" + feature.geometry.coordinates +"<br> <hr> <table>";

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
						sphenomenon += "</table>";


						sidebar.setContent(sphenomenon);

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

			}).addTo(mapLeaflet);
	};
};




// Page loaded - start the magic
$( document ).ready(function() {
	page.init();
});
