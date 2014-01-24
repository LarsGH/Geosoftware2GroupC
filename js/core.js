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


	// Initialization
	this.init = function() {
		mapLeaflet = L.map('map').setView([51.963491, 7.625840], 14);

		L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
		}).addTo(mapLeaflet);
		
		map.loadScale();
		map.loadSpeedMeasurements();
		map.loadSpeedMeasurements2();	
		map.loadLayerControl();
		
	};
	
	// Load the Scale
	this.loadScale = function() {
		L.control.scale({
			position: 'bottomleft',
			maxWidth: 150,
			imperial: false
		}).addTo(mapLeaflet);
	};
	
	this.loadSpeedMeasurements = function() {
	// Load test measurements from json
		$.getJSON("json/measurements.json", function(json) {

			L.geoJson(json, {
				style: function (feature) {
					col = "white";

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
						$('#panel_right_container').html(feature.properties.id + "<br>" + feature.properties.phenomenons.Speed.value);
						page.showInfo();
					});
				},
				pointToLayer: function (feature, latlng) {
        			return L.circleMarker(latlng);
    			},
    			// filter: function(feature, layer) {
				// 	return (feature.properties.phenomenons.Speed.value > 60);
				// }
			}).addTo(mapLeaflet);
			
		});
	};
	this.loadSpeedMeasurements2 = function() {
	// Load test measurements from json
	//after putting it into a seperate Layer it gets add to the map
		
		$.getJSON("json/measurements2.json", function(json) {
		var myLayer = L.geoJson(json, {
				style: function (feature) {
					col = "white";

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
						$('#panel_right_container').html(feature.properties.id + "<br>" + feature.properties.phenomenons.Speed.value);
						page.showInfo();
					});
				},
				pointToLayer: function (feature, latlng) {
        			return L.circleMarker(latlng);
    			},
    			// filter: function(feature, layer) {
				// 	return (feature.properties.phenomenons.Speed.value > 60);
				// }
				
				
			}).addTo(mapLeaflet);
		});
	};
	
	
	this.loadLayerControl = function() {
		//var baseLayers = {
			//"Minimal": myLayer};
		//loading the Layercontrol. This one is empty.
		//The first null are Baselayers so only one can be activatet
		//the second null are overlaylayers so there can be no layer and more than one
		L.control.layers(null, null).addTo(mapLeaflet);
	};
};




// Page loaded - start the magic
$( document ).ready(function() {
	page.init();
});
