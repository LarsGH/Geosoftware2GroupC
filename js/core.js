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

		$( "#panel_left" ).load( "pages/" + name + "_panel.html", function () {
			$( "#page" ).load( "pages/" + name + "_page.html", function () {

				page.afterLoad(name);
			});
		});		
	};

	// Before page unloading
	this.beforeUnload = function(name) {

		switch (name) {

		    case "home":
		    	$('#filter_btn').off('click');
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
// Author: Peter Zimmerhof
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

		var marker = new L.Marker(new L.LatLng(51.963491, 7.625840), {});

		map.loadMeasurements();		
	};

	// Load test measurements from json
	this.loadMeasurements = function() {
		$.getJSON("json/measurements.json", function(json) {

			for (var i = json.features.length - 1; i >= 0; i--) {

				var circle = L.circle([json.features[i].geometry.coordinates[1], json.features[i].geometry.coordinates[0]], 10, {
				    color: 'red',
					fillColor: 'red',
					fillOpacity: 0.75
				});

				circle.on('click', function () {
					page.toggleInfo();
				});

				circle.addTo(mapLeaflet);
			};

		});
	};

};




// Page loaded - start the magic
$( document ).ready(function() {
	page.init();
});
