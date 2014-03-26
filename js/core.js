/******************************************
	core.js

	- page class
	- map class

******************************************/


// Global variables

var ieh = 1;

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
				$('#analyse_btn').off('click');
				break;

			case "analyse":
				$("#results_btn").off('click');
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

				$("#analyse_btn").click(function() {
					page.load("analyse");
				});
				$("#timeFilterCheck").click(function(){
					if($(this).is(':checked')){
						$("#timeParameters").fadeIn();
					}
					else {
						$("#timeParameters").fadeOut()
					}
				});
				$("#spacialFilterCheck").click(function(){
					if($(this).is(':checked')){
						$("#spacialParameters").fadeIn();
						
					}
					else {
						$("#spacialParameters").fadeOut()
					}
				});
				
				
				break;
			
			case "analyse":
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
						$("#results_btn").fadeIn();
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
						$("#results_btn").fadeIn();
					}
					else{
						$("#rasterSize").fadeOut();
					}
				});				
				$("#results_btn").click(function() {
					page.load("result");
				});
				break;

			case "result":
			
				// !!! Analyse-TEST !!!
				var url = 'cgi-bin/Rcgi/test2?' + ieh;
					$.ajax({ 
					    url : url, 
					    cache: true,
					    data : {"":""},
					    processData : false,
					}).always(function(){
						
					    $("#some_target").attr("src", url);
					    ieh++;
					});   
				break;

			case "help":
			case "about":
				
				$('.scroll').on('click', function(e) {
					var href = $(this).attr('id');
					var el = document.getElementById(href + '_target');
    				el.scrollIntoView(true);
				}); 
				break;
		}
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
		map.mapLeaflet = L.map('map', {
			zoomControl: false,
		}).setView([51.963491, 7.625840], 14);
		
		this.LayerGroup = new L.LayerGroup();
		this.LayerGroup.addTo(map.mapLeaflet);

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
		map.mapLeaflet.addLayer(osm);
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
		map.mapLeaflet.addControl(new L.Control.Layers( {'OpenStreetMap':osm, 'Google Satellit':ggl, 'Google Geländekarte':ggl2, 'Topografische Karte':NRWgeoWMS}, {}));
		
		sidebar = L.control.sidebar('sidebar', {
			position: 'right'
		});

		map.mapLeaflet.addControl(sidebar);
		L.control.mousePosition({
			separator: ' , ',
			position: 'bottomright',
			prefix: 'Mauszeigerkoordinaten: '
			}).addTo(map.mapLeaflet);
		L.control.pan().addTo(map.mapLeaflet);
		L.control.zoomslider().addTo(map.mapLeaflet);
		L.control.locate().addTo(map.mapLeaflet);
		map.loadScale();
		
		
		var legend = L.control({position: 'bottomright'});

legend.onAdd = function (Lmap) {

    var div = L.DomUtil.create('div', 'info legend');
        div.id = "legend";
        div.innerHTML += '<select id="select_phenomenon">' +
	'<option value="Speed">Geschwindigkeit</option>' +
	'<option value="Rpm">Upm</option>' +
	'<option value="MAF">MAF</option>' +
	'<option value="Calculated MAF">Berechneter MAF</option>' +
	'<option value="Engine Load">Last</option>' +
	'<option value="Intake Pressure">Einlassdruck</option>' +
	'<option value="Intake Temperature">Einlasstemperatur</option>' +
	'</select><br>' + 
	'<div id="legend_inner"></div>';

    return div;
};

legend.addTo(map.mapLeaflet);
map.setLegend();


//Functions to either disable (onmouseover) or enable (onmouseout) the map's dragging
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

$( "#select_phenomenon" ).change(function() {

	map.selectedPhenomenon = $("#select_phenomenon").val();

	if (map.selectedPhenomenon == map.phenomenons[0]) {
		map.selectedPhenomenonValues = map.SpeedValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[0];
	}
	else if (map.selectedPhenomenon == map.phenomenons[1]) {
		map.selectedPhenomenonValues = map.RpmValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[1];
	}
	else if (map.selectedPhenomenon == map.phenomenons[2]) {
		map.selectedPhenomenonValues = map.MafValues; 
		map.selectedPhenomenonUnit = map.phenomenonUnits[2];
	}
	else if (map.selectedPhenomenon == map.phenomenons[3]) {
		map.selectedPhenomenonValues = map.CalMafValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[3];
	}
	else if (map.selectedPhenomenon == map.phenomenons[4]) {
		map.selectedPhenomenonValues = map.EngineValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[4];
	}
	else if (map.selectedPhenomenon == map.phenomenons[5]) {
		map.selectedPhenomenonValues = map.PressValues;
		map.selectedPhenomenonUnit = map.phenomenonUnits[5];
	}
	else if (map.selectedPhenomenon == map.phenomenons[6]) {
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
		map.mapLeaflet.addLayer(drawnItems);

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
		//this.changeLanguageOfDrawTool();
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
		map.mapLeaflet.on('draw:deletestart', function (e) {
			drawnItems.clearLayers();
		});
		map.mapLeaflet.on('draw:created', function (e) {
			drawnItems.clearLayers();
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
			filter.filterPolygon = [];
			polygon[latLngs.length] = polygon[0];
			for(var i=0; i < polygon.length; i++){
				for (var prop in polygon[i]){
					filter.filterPolygon.push(polygon[i][prop]);
				};
			};
			//alert(filter.filterPolygon.toString())
			drawnItems.addLayer(layer);
			$(".leaflet-draw-edit-edit").animate({marginLeft:'0px'});
			$(".leaflet-draw-draw-rectangle").animate({marginLeft:'0px'});
		});
		map.mapLeaflet.on('draw:edited', function (e) {
			var layers = e.layers;
			var countOfEditedLayers = 0;
			layers.eachLayer(function(layer) {
			countOfEditedLayers++;
			});
			console.log("Edited " + countOfEditedLayers + " layers");
			$(".leaflet-draw-edit-remove").animate({marginLeft:'0px'});
		});
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
		
		// $.getJSON("https://envirocar.org/api/stable/tracks?limit=3&bbox=7.581596374511719,51.948761868981265,7.670001983642577,51.97821922232462", function(json) {
			
		// 	for (i = 0; i <= json.tracks.length; i++){
			
		// 	trackid = json.tracks[i].id;
		// 	map.loadTrack("https://envirocar.org/api/stable/tracks/" +trackid);
		// 	};});
		//map.loadTracks("json/measurements.json")
		//map.loadTracks("json/measurements7.json");	
		//map.loadTrack("json/measurements6.json");
		//map.loadTracks("http://giv-geosoft2c.uni-muenster.de/php/filter/filteroptions2.php?f=createFilterTracks&filterurl=https://envirocar.org/api/stable/tracks?limit=2&bbox=7.581596374511719,51.948761868981265,7.670001983642577,51.97821922232462");
		map.loadTracks("json/trackarray.json");
		
		map.mapLeaflet.on('click', map.onMapClick);
				
		$("#draw_buttons").append($(".leaflet-draw-draw-polygon"));
		//$(".leaflet-draw-draw-polygon").html("Polygon");
		$("#draw_buttons").append($(".leaflet-draw-draw-rectangle"));
		$("#draw_buttons").append($(".leaflet-draw-edit-edit"));
		$("#draw_buttons").append($(".leaflet-draw-edit-remove"))
		$("#draw_buttons").append($(".leaflet-draw-actions"));
		$("#draw_buttons").append($(".leaflet-draw-actions"));

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

		db.loadInitSpaceTracks();
	};
	
	// Load the Scale
	this.loadScale = function() {
		L.control.scale({
			position: 'bottomleft',
			maxWidth: 150,
			imperial: false
		}).addTo(map.mapLeaflet);
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
		for (i = 0; i < json.tracks.length; i++){

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
	
	
	this.getIndex = function(json, PointID){
		//console.log("länge des json: "+json.features.length);
			var jsonLength = json.features.length;
			for ( var i=0; i < jsonLength; i++ ){
				var chx = json.features[i].properties.id;
				//alert(data.features[i].properties.id.toString());
				if(chx === PointID){
					var Index = i;
				}
			}
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
					
						"<button id=show_Track>Fahrt zu diesem Punkt anzeigen</button>";
						

						sidebar.setContent(sphenomenon);
						$("#show_Track").click(function() {
							console.log(feature.properties.trackID)
							var blablubb = feature.properties.trackID;
							map.clearTrackLayers();
							$.getJSON("https://envirocar.org/api/stable/tracks/" +blablubb, function(hure){
							 map.loadTrackJSON(hure);
							 console.log(typeof hure);
							});
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

	this.clearTrackLayers = function() {
		var layers = this.LayerGroup.getLayers();

		for (var i = 0; i < layers.length; i++) {
			this.LayerGroup.removeLayer(layers[i]);
		};
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

this.filterPolygon = new Array();

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

		db.loadInitTimeTracks($( "#from_dt" ).datetimepicker( 'getDate' ), $( "#to_dt" ).datetimepicker( 'getDate' ))
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

	this.loadInitTimeTracks = function(from, to) {
		map.clearTrackLayers();

		var tracks = "";

		$.post( "php/filter.php", 
				{ 
					f: "getInitialTimeTrack",
					starttime: helper.dateToRequestDateTimeString(from),
					endtime: helper.dateToRequestDateTimeString(to),
					limit: "15" 
				},
				function( data ) {
					console.log("Data loaded "+data.tracks.length);
		 			for (i = 0; i < data.tracks.length; i++){

						map.loadTrackJSON(data.tracks[i]);
					};
		 		},
		 		"json"
			);
	};

		
	this.loadInitSpaceTracks = function() {
		map.clearTrackLayers();

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
					f: "getInitialSpatialTrack",
					bbox : JSON.stringify(bounds),
					limit: "5" 
				},
				function( data ) {
					console.log("Data loaded "+data.tracks.length);
		 			for (i = 0; i < data.tracks.length; i++){

						map.loadTrackJSON(data.tracks[i]);
					};
		 		},
		 		"json"
			);
	};


};




// Helper class
// Description: Class for universal functions
// Author: Peter Zimmerhof
var helper = new function() {

	this.dateToRequestDateTimeString = function(date) {

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
