/******************************************
	core.js

	- page class
	- map class
	- filter class
	- analyse class
	- db class
	- helper class

******************************************/


/*
	When I wrote this, only God and I understood what I was doing. Now, God only knows.
*/

var firstStart = true;

// Page class
// Description: Class for handling all page related functions / events
// Author: Peter Zimmerhof
var page = new function(){

	// Page variables
	this.currentPage = "home";


	// Initialization
	this.init = function() {

		// Load home on entry
		page.load("home");

		// Register nav button click events
		$("#home_btn").click(function() {
			page.load("home");
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

		// Fire events
		page.beforeUnload(this.currentPage);
		page.beforeLoad(name);

		page.currentPage = name;

		// Load panel content
		$( "#panel_left_container" ).load( "pages.html #" + name + "_panel", function () {

			// Only load page content when it's not the analyse page
			if (name != "analyse") {
				$( "#page_container" ).load( "pages.html #" + name + "_page", function () {

					// Fire event
					page.afterLoad(name);
				});
			} else {

				// Fire event
				page.afterLoad(name);
			}
		});

	};

	// Before page unloading
	this.beforeUnload = function(name) {

		// Open loading overlay
		page.toggleLoadingOverlay(true);

		switch (name) {

			case "home":

				// Deregister button events
				$('#filter_btn').off('click');
				$('#analyse_btn').off('click');
				break;

			case "analyse":

				// Deregister button events
				$("#results_btn").off('click');

				// Set the anaylse values
				analyse.setValues();

				break;
		}
	};

	// Before page loading
	this.beforeLoad = function(name) {

	};

	// After page loading
	this.afterLoad = function(name) {

		// Close overlay when a page other then result is loaded
		if(name != "result")
			page.toggleLoadingOverlay(false);

		switch (name) {

			case "home":

				// Initialize
				map.init();
				filter.init();
				break;
			
			case "analyse":

				// Initialize
				analyse.init();
				break;

			case "result":
				
				// Load results if it is not a boxplot
				if(!map.resultBoxplot){
					analyse.showResults();  
				} else {
					map.resultBoxplot = false;
				}
				break;

			case "help":
			case "about":
				
				// Left hand navigation system on help and about page
				$('.scroll').on('click', function(e) {

					var href = $(this).attr('id'); // Get the source
					var target = document.getElementById(href + '_target'); // Get the target
    				
    				target.scrollIntoView(true); // Scroll to target
				}); 
				break;
		}

	};

	// Show / Hide the loading overlay
	this.toggleLoadingOverlay = function(show) {

		if (show) 
			$('#loading_overlay').addClass('loading');
		else
			$('#loading_overlay').removeClass('loading');
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
	this.oldselectedPoint;
	this.datatrack;
	this.trackid;
	this.Index;
	this.polygon = new Array();

	// Variable holding the last tracks
	this.tracks = null;
	
	// Hardcoded color map
	this.colorMap = 	['#0e0', '#9f0', '#ff0', '#f90', '#f00'];

	// Initialize the legend values
	this.phenomenons = ["Speed", "Rpm", "Consumption", "CO2", "MAF", "Calculated MAF", "Engine Load", "Intake Pressure", "Intake Temperature"];
	this.phenomenonsDE = ["Geschwindigkeit", "Upm", "Verbrauch", "C02", "MAF", "Ber. MAF", "Last", "Ansaugdruck", "Ansaugtemperatur"];
	this.phenomenonUnits = ['km/h', 'u/min', 'l/h', 'kg/h', 'l/s', 'g/s', '%', 'kPa', '°C'];

	// Interval values for the phenomenons
	this.SpeedValues = 	[0,		30, 	60, 	90, 	120];
	this.RpmValues = 	[0, 	750, 	1500, 	2250, 	3000];
	this.ConsumValues = [0,		4,		8,		13,		16],
	this.CO2Values = 	[0, 	1, 		2, 		3, 		4];
	this.MafValues = 	[0, 	5, 		10, 	15, 	20];
	this.CalMafValues = [0, 	5, 		10, 	15, 	20];
	this.EngineValues = [0, 	20, 	40, 	60, 	80];
	this.PressValues = 	[0, 	25, 	50, 	75, 	100];
	this.TempValues = 	[0, 	10, 	20, 	30, 	40];

	// Selected phenomenon attributes
	this.selectedPhenomenon;
	this.selectedPhenomenonUnit;

	this.selectedPhenomenonValues;
	
	// Variable if a boxplot will be loaded
	this.resultBoxplot = false;

	// Initialization of map
	this.init = function() {

		// Creating the map
		map.mapLeaflet = L.map('map', {
			zoomControl: false,
		}).setView([51.963491, 7.625840], 14);
		
		this.LayerGroup = new L.LayerGroup();
		this.LayerGroup.addTo(map.mapLeaflet);
		
		// Initialize pan-, zoomslider-, locate and mousePosition-Control
		L.control.pan().addTo(map.mapLeaflet);
		L.control.zoomslider().addTo(map.mapLeaflet);
		L.control.locate().addTo(map.mapLeaflet);
		L.control.mousePosition({
			separator: ' , ',
			position: 'bottomright',
			prefix: 'Mauszeigerkoordinaten: '
			}).addTo(map.mapLeaflet);

		// Set selected legend values
		map.selectedPhenomenon = "Speed";
		map.selectedPhenomenonUnit = "km/h";
		map.selectedPhenomenonValues = map.SpeedValues;

		// Load controls
		map.loadLayers();
		map.loadScale();
		map.loadSidebar();
		map.loadLegend();
		map.loadDrawItems();

		// Load map.tracks or get initial tracks depending if it's the first startup
		if (!firstStart) {

			map.loadTracks(map.tracks);
		}
		else {

			firstStart = false;
			db.loadInitSpaceTracks();
		}

		// Map click event
		map.mapLeaflet.on('click', map.onMapClick);
	};

	// Load the layer control
	this.loadLayers = function() {
		// Creating openStreetMap layer
		var osm = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		});

		// Creating topographic map of NRW
		var NRWgeoWMS = L.tileLayer.wms("http://www.wms.nrw.de/geobasis/wms_nw_dtk10",{
			layers: 'nw_dtk10_col',
			minZoom: 14,
			format: 'image/png'
		});

		// Creating the two Googlebaselayer
		var ggl = new L.Google();
		var ggl2 = new L.Google('TERRAIN');
		
		map.mapLeaflet.addLayer(osm);

		// Creating Baselayer-chooser
		map.mapLeaflet.addControl(new L.Control.Layers( {'OpenStreetMap':osm, 'Google Satellit':ggl, 'Google Geländekarte':ggl2, 'Topografische Karte':NRWgeoWMS}, {}));

	};
	
	// Load the scale control
	this.loadScale = function() {
		L.control.scale({
			position: 'bottomleft',
			maxWidth: 150,
			imperial: false
		}).addTo(map.mapLeaflet);
	};

	// Load the sidebar control
	this.loadSidebar = function() {
		
		// Initialize the sidebar
		map.sidebar = L.control.sidebar('sidebar', {
			position: 'right'
		});
		
		map.mapLeaflet.addControl(map.sidebar);
	};

	// Load the legend control
	this.loadLegend = function() {

		var legend = L.control({position: 'bottomright'});

		legend.onAdd = function (Lmap) {

			// Add the phenomenon option control
		    var div = L.DomUtil.create('div', 'info legend');
		        div.id = "legend";
		        div.innerHTML += '<select id="select_phenomenon">' +
			'<option value="Speed">Geschwindigkeit</option>' +
			'<option value="Rpm">Upm</option>' +
			'<option value="Consumption">Verbrauch</option>' +
			'<option value="CO2">CO2</option>' +
			'<option value="MAF">MAF</option>' +
			'<option value="Calculated MAF">Ber. MAF</option>' +
			'<option value="Engine Load">Last</option>' +
			'<option value="Intake Pressure">Ansaugdruck</option>' +
			'<option value="Intake Temperature">Ansaugtemperatur</option>' +
			'</select><br>' + 
			'<div id="legend_inner"></div>';

		    return div;
		};

		legend.addTo(map.mapLeaflet);

		// Set the intervals and unit
		map.setLegend();

		// Functions to either disable (onmouseover) or enable (onmouseout) the map's dragging
		document.getElementById("legend").onmouseover = function(e) {
		    map.mapLeaflet.dragging.disable();
			map.mapLeaflet.touchZoom.disable();
			map.mapLeaflet.doubleClickZoom.disable();
			map.mapLeaflet.scrollWheelZoom.disable();
			map.mapLeaflet.boxZoom.disable();
			map.mapLeaflet.keyboard.disable();
		};
		document.getElementById("legend").onmouseout = function() {
		    map.mapLeaflet.dragging.enable();
			map.mapLeaflet.touchZoom.enable();
			map.mapLeaflet.doubleClickZoom.enable();
			map.mapLeaflet.scrollWheelZoom.enable();
			map.mapLeaflet.boxZoom.enable();
			map.mapLeaflet.keyboard.enable();
		};

		// Phenomenon changed
		$( "#select_phenomenon" ).change(function() {

			map.selectedPhenomenon = $("#select_phenomenon").val();

			// Set selected phenomenon values
			if (map.selectedPhenomenon == map.phenomenons[0]) {
				map.selectedPhenomenonValues = map.SpeedValues;
				map.selectedPhenomenonUnit = map.phenomenonUnits[0];
			}
			else if (map.selectedPhenomenon == map.phenomenons[1]) {
				map.selectedPhenomenonValues = map.RpmValues;
				map.selectedPhenomenonUnit = map.phenomenonUnits[1];
			}
			else if (map.selectedPhenomenon == map.phenomenons[2]) {
				map.selectedPhenomenonValues = map.ConsumValues;
				map.selectedPhenomenonUnit = map.phenomenonUnits[2];
			}
			else if (map.selectedPhenomenon == map.phenomenons[3]) {
				map.selectedPhenomenonValues = map.CO2Values;
				map.selectedPhenomenonUnit = map.phenomenonUnits[3];
			}
			else if (map.selectedPhenomenon == map.phenomenons[4]) {
				map.selectedPhenomenonValues = map.MafValues; 
				map.selectedPhenomenonUnit = map.phenomenonUnits[4];
			}
			else if (map.selectedPhenomenon == map.phenomenons[5]) {
				map.selectedPhenomenonValues = map.CalMafValues;
				map.selectedPhenomenonUnit = map.phenomenonUnits[5];
			}
			else if (map.selectedPhenomenon == map.phenomenons[6]) {
				map.selectedPhenomenonValues = map.EngineValues;
				map.selectedPhenomenonUnit = map.phenomenonUnits[6];
			}
			else if (map.selectedPhenomenon == map.phenomenons[7]) {
				map.selectedPhenomenonValues = map.PressValues;
				map.selectedPhenomenonUnit = map.phenomenonUnits[7];
			}
			else if (map.selectedPhenomenon == map.phenomenons[8]) {
				map.selectedPhenomenonValues = map.TempValues;
				map.selectedPhenomenonUnit = map.phenomenonUnits[8];
			}

			// Reload the legend intervals and units
			map.setLegend();

			// Apply the intervals and colors on the tracks
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
	};

	// Load the controls for spatial filtering
	this.loadDrawItems = function() {

		// Initialize the FeatureGroup to store editable layers
		var drawnItems = new L.FeatureGroup();
		map.mapLeaflet.addLayer(drawnItems);

		// Initialize the draw control and pass it the FeatureGroup of editable layers
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

		// Translate button layout and tooltips
		L.drawLocal.draw.toolbar.buttons.polygon = 'Polygon zeichnen';
		L.drawLocal.draw.toolbar.buttons.rectangle = 'Rechteck zeichnen';
		L.drawLocal.draw.toolbar.actions.text = 'Abbrechen';
		L.drawLocal.draw.toolbar.actions.title = 'Zeichnen Abbrechen';
		L.drawLocal.draw.toolbar.undo.title = 'Letzten Punkt löschen';
		L.drawLocal.draw.toolbar.undo.text = 'Zurück';
		L.drawLocal.draw.handlers.polygon.tooltip.start = 'Klicken Sie auf die Karte um mit dem Zeichnen zu starten';
		L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Klicken Sie wieder auf die Karte um einen weiteren Punkt zu zeichnen';
		L.drawLocal.draw.handlers.polygon.tooltip.end = 'Klicken Sie auf den ersten Punkt um das Polygon zu schließen';
		L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Klicken Sie auf die Karte und ziehen Sie die Maus um ein Rechteck zu ziehen';
		L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Lassen sie die Maustaste los um das Rechteck zu zeichnen';
		L.drawLocal.edit.toolbar.actions.save.title = 'Änderungen speichern';
		L.drawLocal.edit.toolbar.actions.save.text = 'Speichern';
		L.drawLocal.edit.toolbar.actions.cancel.title = 'Änderungen abbrechen und alle Änderungen verwerfen';
		L.drawLocal.edit.toolbar.actions.cancel.text = 'Abbrechen';
		L.drawLocal.edit.toolbar.buttons.edit = 'Bearbeiten';
		L.drawLocal.edit.toolbar.buttons.editDisabled = 'Keine Zeichnung zum bearbeiten vorhanden';
		L.drawLocal.edit.toolbar.buttons.remove = 'Löschen';
		L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Keine Zeichnung zum löschen vorhanden';
		L.drawLocal.edit.handlers.edit.tooltip.text = 'Ziehen Sie die Marker um die Zeichnung zu bearbeiten';
		L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Drücken Sie auf Abbrechen um die Änderungen zu verwerfen';
		map.mapLeaflet.addControl(drawControl);

		// Chaning deletestart behavior of the DrawControl
		map.mapLeaflet.on('draw:deletestart', function (e) {
			$("#filter_btn").fadeOut();
			drawnItems.clearLayers();
			filter.filterPolygon=[];
		});

		// Chaning created behavior of the DrawControl
		map.mapLeaflet.on('draw:created', function (e) {
			$("#filter_btn").fadeIn();
			drawnItems.clearLayers();
			polygon = [];
			var type = e.layerType,
			layer = e.layer;
			
			//if (type === 'marker') {
			//	layer.bindPopup('A popup!');
			//}
			var latLngs = layer.getLatLngs();
			filter.createDrawPolygon(latLngs);
			//alert(filter.filterPolygon.toString())
			drawnItems.addLayer(layer);
			drawnItems.bringToBack();
			$(".leaflet-draw-edit-edit").animate({marginLeft:'0px'});
			$(".leaflet-draw-draw-rectangle").animate({marginLeft:'0px'});
		});

		// Chaning edited behavior of the DrawControl
		map.mapLeaflet.on('draw:edited', function (e) {
			var layers = e.layers;
			var countOfEditedLayers = 0;
			layers.eachLayer(function(layer) {
				countOfEditedLayers++;
				var latLngs = layer.getLatLngs();
				filter.createDrawPolygon(latLngs);
			});
			console.log("Edited " + countOfEditedLayers + " layers");
			$(".leaflet-draw-edit-remove").animate({marginLeft:'0px'});
		});

		// Setting the drawingOption to meet our Webdesign
		drawControl.setDrawingOptions({
			rectangle: {
				shapeOptions: {
					color: '#8BBB40',
					fillColor: '#1680C2',
					opacity: 0.9,
				}
			},
			polygon: {
				shapeOptions: {
					color: '#8BBB40',
					fillColor: '#1680C2',
					opacity: 0.9,
				},
				allowIntersection: false,
			}
		});	

		// Changing the position of the toolbar
		$("#draw_buttons").append($(".leaflet-draw-draw-polygon"));
		$("#draw_buttons").append($(".leaflet-draw-draw-rectangle"));
		$("#draw_buttons").append($(".leaflet-draw-edit-edit"));
		$("#draw_buttons").append($(".leaflet-draw-edit-remove"))
		$("#draw_buttons").append($(".leaflet-draw-actions"));
		$("#draw_buttons").append($(".leaflet-draw-actions"));

		// Adding some moving behavior for the toolbar buttons
		$(".leaflet-draw-draw-polygon").click(function(){
			$(".leaflet-draw-draw-rectangle").animate({marginLeft:'98px'});
			$(".leaflet-draw-edit-edit").animate({marginLeft:'0px'});
			$(".leaflet-draw-edit-remove").animate({marginLeft:'0px'});
			$(".leaflet-draw-actions").css('left',"37px");
		});
		$(".leaflet-draw-draw-rectangle").click(function(){
			$(".leaflet-draw-edit-edit").animate({marginLeft:'59px'});
			$(".leaflet-draw-draw-rectangle").animate({marginLeft:'0px'});
			$(".leaflet-draw-edit-remove").animate({marginLeft:'0px'});
			$(".leaflet-draw-actions").css('left',"64px");
		});
		$(".leaflet-draw-edit-edit").click(function(){
			if(drawnItems.getLayers().length == 1){
			$(".leaflet-draw-edit-remove").animate({marginLeft:'113px'},300);
			$(".leaflet-draw-draw-rectangle").animate({marginLeft:'0px'});
			$(".leaflet-draw-edit-edit").animate({marginLeft:'0px'});
			$(".leaflet-draw-actions").css('left',"91px");
			};
		});

	};
	
	// Map click event function
	this.onMapClick = function(e) {
		
		// If the sidebar is open it's gonna close now
		map.sidebar.hide();
		
		// If there is a highlighted Point, it will be unHighlighted
		if (map.oldselectedPoint != undefined && map.oldselectedPoint != null && map.oldselectedPoint != ""){
             map.unHighlightPoint(map.oldselectedPoint);
        }
	};

	// Highlight the selected Point
	this.highlightPoint = function(Point) {
        Point.setStyle({
			radius: 5.5,
            color: "#ff4444",
            weight: 3,
            opacity: 0.75,
            fillOpacity: 1
        });
	};
	
	// Dehighlight the deselected Point
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
	this.loadTracks = function(tracks) {

		if (tracks != null && tracks != undefined) {
			console.log("Data loaded "+ tracks.length);
			map.tracks = tracks;
			map.clearTrackLayers();
			for (i = 0; i < tracks.length; i++){
				map.loadTrackJSON(tracks[i]);
			};
			$("#analyse_btn").fadeIn();
			page.toggleLoadingOverlay(false);
		}
		else {
			console.log("Data is null");
		}
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
						
						// Highlighting the clicked point
						if (map.oldselectedPoint != undefined && map.oldselectedPoint != null && map.oldselectedPoint != "")
                        {
                            map.unHighlightPoint(map.oldselectedPoint);
                        }
                        // Highlighting the clicked point
                        selectedPoint = e.target;
						map.highlightPoint(selectedPoint);
                        
                        map.oldselectedPoint = selectedPoint;
						
						var d = new Date(Date.parse(feature.properties.time));

						var car = map.getCar(feature.properties.trackID);
						
						// Setting the sphenomenon to display in the sidebar
						var sphenomenon = "<h3>Attribute</h3>" +
							"<table width=100%>" +
							"<tr><td>ID</td><td>" + feature.properties.id + "</td></tr>" + 
							"<tr><td>Datum</td><td>" + helper.dateToDateString(d) + "</td></tr>" + 
							"<tr><td>Uhrzeit</td><td>" + helper.dateToTimeString(d) + "</td></tr>" + 
							"<tr><td>Fahrzeug</td><td>" + car + "</td></tr>" + 							
							"<tr><td>Lat</td><td>" + feature.geometry.coordinates[1] + "</td></tr>" + 
							"<tr><td>Long</td><td>" + feature.geometry.coordinates[0] + "</td></tr>" +
							"</table>" + 
							"<hr> <table width=100%>";
						
						
						for (var i = 0; i < map.phenomenons.length; i++) {
							p = map.phenomenons[i];
						
							if (feature.properties.phenomenons[p] != undefined)
							{
							sphenomenon += 
								"<tr><td>" +
								map.phenomenonsDE[i] + 
								"</td><td>" +
								((feature.properties.phenomenons[p].value % 1 == 0) ?
								feature.properties.phenomenons[p].value :
								(Math.round(feature.properties.phenomenons[p].value* 100)/100).toFixed(2)) + 
								"</td><td>" +
								map.phenomenonUnits[i] + 
								"</td></tr>";
							}
							else 
							{
								sphenomenon += "<tr><td>" + map.phenomenonsDE[i] + "</td><td>-</td><td>" + map.phenomenonUnits[i] + "</td></tr>";
							}
						};
						
						sphenomenon += "</table><hr>" + // index + 
						"<button id=show_Track>Fahrt zu diesem Punkt anzeigen</button><br>" +
						"<button id=show_Stat>Statistik zur ausgewählten Fahrt anzeigen</button>";
						
						map.sidebar.setContent(sphenomenon);
						
						// Show track
						$("#show_Track").click(function() {
							page.toggleLoadingOverlay(true);
							map.sidebar.hide();
							$.post( "php/filter.php", 
									{ 
										f: "getFullTrack_fromTrackID",
										trackID: feature.properties.trackID,
										encoded: false
									},
									function( data ) {
										map.loadTracks(data.tracks);
									},
									"json"
								);
						});
						
						// Show statistic
						$("#show_Stat").click(function() {
							map.resultBoxplot = true;
							page.load("result");
							map.showBoxplot(feature.properties.trackID);
						});

						map.sidebar.show(feature.geometry.coordinates[1],feature.geometry.coordinates[0]);
					});

				// Highlighting or unhighlighting s point by mouseover/mouseout
				layer.on('mouseover', function (e) {
					map.highlightPoint(e.target);
				});
				layer.on('mouseout', function (e) {
					if (map.oldselectedPoint != e.target){
					map.unHighlightPoint(e.target);}
				});
					
				},
					
				pointToLayer: function (feature, latlng) {
        			return L.circleMarker(latlng);
    			}
			})
			);

	};
	
	// Get a car info string matching the trackID
	this.getCar = function(trackID) {

		var car = '-';

		for (var i = 0; i < map.tracks.length; i++) {
			if (map.tracks[i].id = trackID) {
				car = map.tracks[i].properties.sensor.properties.manufacturer + ' ' + map.tracks[i].properties.sensor.properties.model;
				break;
			};
		};

		return car;
	};

	// Clear the layers displayed on the map
	this.clearTrackLayers = function() {
		var layers = this.LayerGroup.getLayers();

		for (var i = 0; i < layers.length; i++) {
			this.LayerGroup.removeLayer(layers[i]);
		};
	};

	// Set and update the legend
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

	// Get a phenomenon color for a number value
	this.getPhenomenonColor = function (value) {

		col = "#fff";

		if (value != null && value != undefined) {
			for (var i = 1; i < this.selectedPhenomenonValues.length; i++) {
				if ((value-0.001) < this.selectedPhenomenonValues[i]) {

					col = map.colorMap[i-1];
					break;
				}
				else if (i == (this.selectedPhenomenonValues.length - 1) && value > this.selectedPhenomenonValues[i]) {

					col = map.colorMap[(map.colorMap.length - 1)];
					break;
				}
			};
		}

		return col;
	};

	// Get an green to red color based on percentage value
	this.getGreenToRed = function (percent){
            r = percent>50 ? 255 : Math.floor((percent*2)*255/100);
            g = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);

            r = r.toString(16);
            g = g.toString(16);

            if (r < 10) r = '0' + r;
            if (g < 10) g = '0' + g;

            return '#'+r+''+g+'00';
    };
	
	// Load and show the calculated image
	this.showBoxplot = function(trackID) {
		
		page.toggleLoadingOverlay(true);
		
		var json_track;
		
		for (var i = 0; i < map.tracks.length; i++) {
			if(map.tracks[i].properties.id==trackID)
				json_track = {tracks:[map.tracks[i]]};
		}
		
		if(json_track != null && json_track != undefined){
			
			// Load the boxplot
			var url = 'cgi-bin/Rcgi/boxplot';
			$.ajax({ 
				type: "POST",
			    url : url, 
			    cache: false,
			    data : JSON.stringify(json_track),
			    processData : false,
			}).done(function(data){

				// Add the image to the document
			    var img = '<img src="img/r/' + data.toString() + '"></img>';
			    $("#result_page").append(img);

			    // Remove overlay
			    page.toggleLoadingOverlay(false);
			}); 
		}

	};

};




// Filter class
// Description: Class for filter functions
// Author: Peter Zimmerhof
var filter = new function() {

	// Filter variables
	this.filterPolygon = new Array();
	this.weekArray;

	// Creating the polygon for the drawn spatial filter
	this.createDrawPolygon = function(latLngs){
		for(var i=0; i < latLngs.length; i++){
			var latLngString = latLngs[i].toString();
			var openBracket = latLngString.indexOf("(");
			var comma = latLngString.indexOf(",");
			var bracketClose = latLngString.indexOf(")");
			var lat = latLngString.slice(openBracket+1, comma);
			var lng = latLngString.slice(comma+2, bracketClose);
			
			polygon[i] = new Object();
			polygon[i]["lat"]=lat.toString();
			polygon[i]["lon"]=lng.toString();
		};
		filter.filterPolygon = [];
		polygon[latLngs.length] = polygon[0];
		for(var i=0; i < polygon.length; i++){
			filter.filterPolygon.push({
				lat: polygon[i].lat,
				lon: polygon[i].lon
			});
			
		};
	}

	// Initialization
	this.init = function() {

		$("#analyse_btn").click(function() {
			page.load("analyse");
		});

		$("#filter_btn").click(function() {
			db.getSpaceTimeTrack();
		});


		// Set dateTimePicker and restrict time selection logic
		var startDateTextBox = $('#from_dt');
		var endDateTextBox = $('#to_dt');

		// Datetimepicker and selection logic
		startDateTextBox.datetimepicker({
			onClose: function(dateText, inst) {
				if (endDateTextBox.val() != '') {
					var testStartDate = startDateTextBox.datetimepicker('getDate');
					var testEndDate = endDateTextBox.datetimepicker('getDate');
					if (testStartDate > testEndDate)
						endDateTextBox.datetimepicker('setDate', testStartDate);
				}
				else {
					endDateTextBox.val(dateText);
				}
			},
			onSelect: function (selectedDateTime){
				endDateTextBox.datetimepicker('option', 'minDate', startDateTextBox.datetimepicker('getDate') );
			}
		});

		// Datetimepicker and selection logic
		endDateTextBox.datetimepicker({
			onClose: function(dateText, inst) {
				if (startDateTextBox.val() != '') {
					var testStartDate = startDateTextBox.datetimepicker('getDate');
					var testEndDate = endDateTextBox.datetimepicker('getDate');
					if (testStartDate > testEndDate)
						startDateTextBox.datetimepicker('setDate', testEndDate);
				}
				else {
					startDateTextBox.val(dateText);
				}
			},
			onSelect: function (selectedDateTime){
				startDateTextBox.datetimepicker('option', 'maxDate', endDateTextBox.datetimepicker('getDate') );
			}
		});

		// Set time preselection
		startdate =  new Date();
		enddate =  new Date();

		startdate.setTime(startdate.getTime() - (7 * (1000 * 60 * 60 * 24)));
		startdate.setHours(0);
		startdate.setMinutes(0);
		startdate.setSeconds(0);

		enddate.setHours(23);
		enddate.setMinutes(59);
		enddate.setSeconds(59);

		// Set start and end date preselection
		$( "#from_dt" ).datetimepicker('setDate', startdate);
		$( "#to_dt" ).datetimepicker('setDate', enddate);

		// Setting the locigal workflow for the buttons ins the filterpanel
		$("#timeFilterCheck").click(function(){
			$("#filter_btn").fadeIn();
			if($(this).is(':checked')){
				$("#timeParameters").fadeIn();
			}
			else {
				$("#timeParameters").fadeOut()
				if($("#spacialFilterCheck").is(":checked")==false){
					$("#filter_btn").fadeOut();
				}
			}
		});

		var oldPolygon;
		$("#spacialFilterCheck").click(function(){
			
			if($(this).is(':checked')){
				$("#spacialParameters").fadeIn();
				if (oldPolygon != undefined && oldPolygon != null && oldPolygon != ""){
					filter.filterPolygon = oldPolygon;
					if(filter.filterPolygon.length!=0){
						$("#filter_btn").fadeIn();
					}
				}
			}
		
		
			else {
				oldPolygon = filter.filterPolygon
				filter.filterPolygon=[];
				$("#spacialParameters").fadeOut()
				if($("#timeFilterCheck").is(":checked")==false){
					$("#filter_btn").fadeOut();
				}
			}
		});
		
	};

	// Main filter function
	this.filter = function() {

		db.loadInitTimeTracks($( "#from_dt" ).datetimepicker( 'getDate' ), $( "#to_dt" ).datetimepicker( 'getDate' ))
	};

	// Get an weekday array
	this.getWeekday = function(){
		if(($("#cb_mo").is(':checked'))||
			($("#cb_di").is(':checked'))||
			($("#cb_mi").is(':checked'))||
			($("#cb_do").is(':checked'))||
			($("#cb_fr").is(':checked'))||
			($("#cb_sa").is(':checked'))||
			($("#cb_so").is(':checked'))){
				filter.weekArray = [];
				if($("#cb_mo").is(':checked')){
					filter.weekArray.push("mo")
				}
				if($("#cb_di").is(':checked')){
					filter.weekArray.push("tu")
				}
				if($("#cb_mi").is(':checked')){
					filter.weekArray.push("we")
				}
				if($("#cb_do").is(':checked')){
					filter.weekArray.push("th")
				}
				if($("#cb_fr").is(':checked')){
					filter.weekArray.push("fr")
				}
				if($("#cb_sa").is(':checked')){
					filter.weekArray.push("sa")
				}
				if($("#cb_so").is(':checked')){
					filter.weekArray.push("su")
			}
		}
	};
	
};




// Filter class
// Description: Class for analyse functions
// Author: Peter Zimmerhof
var analyse = new function() {

	// Analyse variables
	this.expertMode = false;

	this.selectedPhenomenon = '';
	this.selectedMethod = '';

	this.xCell = 300;
	this.yCell = 300;

	this.pointOverlay = true;


	// Initialization
	this.init = function() {
		
		// Setting the locigal workflow for the buttons in the analysepanel
		$("#results_btn").click(function() {
			page.load("result");
		});

		$("#expertMod").click(function() {
		if($("#expertMod").is(":checked")){
			if($("#selectedAttributes").val()!=""){
				$("#methodExp").fadeIn();
				if($("#selectedMethod").val()!=""){
					$("#rasterSize").fadeIn();
				}
			}}
			else{
				$("#rasterSize").fadeOut();
				$("#methodExp").fadeOut();
			}
		});
		
		$("#selectedAttributes").change(function() {
			if($("#selectedAttributes").val()!=""){
				if($("#expertMod").is(':checked')){
					$("#methodExp").fadeIn();
				}
			}
			else{
				$("#methodExp").fadeOut();
			}
		});
		$("#selectedMethod").change(function() {
			if($("#selectedMethod").val()!=""){
				$("#rasterSize").fadeIn();
			}
			else{
				$("#rasterSize").fadeOut();
			}
		});				
		
		// Assure that only number can be entered
		$('.numbersOnly').keyup(function () {
		    if (this.value != this.value.replace(/[^0-9]/g, '')) {
		       this.value = this.value.replace(/[^0-9]/g, '');
		    }
		});
	};

	// Set the analyse values from the controls
	this.setValues = function() {
		analyse.expertMode = $('#expertMod').is(':checked');

		analyse.selectedPhenomenon = $('#selectedAttributes').val();
		analyse.selectedMethod = $('#selectedMethod').val();

		analyse.xCell = parseInt($('#metersX').val());
		analyse.yCell = parseInt($('#metersY').val());

		analyse.pointOverlay = $('#pointOverlay').is(':checked');
	};

	// Get a json object holding the analyse settings
	this.getValues = function() {
		var json = 
			{
				"phenomenon" : analyse.selectedPhenomenon,
				"statistic" : analyse.selectedMethod,
				"x_cell" : analyse.xCell,
				"y_cell" : analyse.yCell,
				"mode" : analyse.expertMode,
				"points" : analyse.pointOverlay,
				"tracks" : map.tracks
			};

		return json;
	};

	// Load and show the calculated image
	this.showResults = function() {

		page.toggleLoadingOverlay(true);

		var json = analyse.getValues();

		// Load the raster plot
		var url = 'cgi-bin/Rcgi/aggregation';
			$.ajax({ 
				type: "POST",
			    url : url, 
			    cache: false,
			    data : JSON.stringify(json),
			    processData : false,
			}).done(function(data){

				// Add the image to the document
			    var img = '<img id="result_img" src="img/r/' + data + '"></img>';
			    $("#result_page").append(img);

			    // Remove overlay
			    page.toggleLoadingOverlay(false);
			}); 
	};

};




// DB class
// Description: Class for DB functions
// Author: Peter Zimmerhof
var db = new function() {

	// Load a initial set of tracks based on time
	this.loadInitTimeTracks = function(from, to) {

		page.toggleLoadingOverlay(true);

		$.post( "php/filter.php", 
			{ 
				f: "getInitialTimeTrack",
				starttime: helper.dateToRequestDateTimeString(from),
				endtime: helper.dateToRequestDateTimeString(to),
				limit: "15" 
			},
			function( data ) {

				map.loadTracks(data.tracks);
		 	},
		 	"json"
		);
	};

	// Load a initial set of tracks based on space
	this.loadInitSpaceTracks = function() {

		page.toggleLoadingOverlay(true);

		var tracks = "";
		var bounds = {
			minX : map.mapLeaflet.getBounds().getSouthWest().lng,
			minY : map.mapLeaflet.getBounds().getSouthWest().lat,
			maxX : map.mapLeaflet.getBounds().getNorthEast().lng,
			maxY : map.mapLeaflet.getBounds().getNorthEast().lat
		};

		console.log( JSON.stringify(bounds));

		$.post( "php/filter.php", 
			{ 
				f: "loadDefaultTracks",
				bbox : JSON.stringify(bounds),
				limit: "5" 
			},
			function( data ) {
				
				map.loadTracks(data.tracks);
		 	},
		 	"json"
		);
	};

	// Load a set of tracks based on time and space
	this.getSpaceTimeTrack = function(){
		
		page.toggleLoadingOverlay(true);

		$("#analyse_btn").fadeOut();
		
		var emtyArray;
		filter.weekArray = emtyArray
		
		if($("#timeFilterCheck").is(":checked")){
			filter.getWeekday();
			var phpWeekArray = filter.weekArray;
			var starttime = $( "#from_dt" ).datetimepicker( 'getDate' );
			var phpStarttime = helper.dateToRequestDateTimeString(starttime);
			var endtime = $( "#to_dt" ).datetimepicker( 'getDate' );
			var phpEndtime = helper.dateToRequestDateTimeString(endtime);
		}
		else{
			var phpStarttime;
			var phpEndtime;
			var phpWeekArray;
		}
		if(($("#spacialFilterCheck").is(":checked")) && (filter.filterPolygon.length != 0)){
			var phpFilterPolygon = filter.filterPolygon;
			console.log(filter.filterPolygon[2].lat);
		}
		else{
			var phpFilterPolygon;
		}

		$.post( "php/filter.php", 
			{ 
				f: "getSpaceTimeTrack",
				polygon: JSON.stringify(phpFilterPolygon),
				starttime: phpStarttime,
				endtime: phpEndtime,
				weekday: JSON.stringify(phpWeekArray),
				limit: "6"
				
			},
			function( data ) {
				map.loadTracks(data.tracks);
		 	},
		 	"json"
		);
	};
};




// Helper class
// Description: Class for universal functions
// Author: Peter Zimmerhof
var helper = new function() {

	// Get a formated date string
	this.dateToRequestDateTimeString = function(date) {

		// Remove 1 hour to match GMT stamp
		date.setTime(date.getTime() - (1 * (1000 * 60 * 60)));

		var day = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
		var month12 = date.getMonth() + 1;
		var month = (month12 < 10) ? "0" + month12 : month12;
		var hours = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
		var minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
		var seconds = (date.getSeconds() < 10) ? "0" + date.getSeconds() : date.getSeconds();

		// 2014-01-10T18:44:40Z
		return date.getFullYear() + '-' + month + '-' + day + '%20' + hours + ':' + minutes + ':' + seconds + '';
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
