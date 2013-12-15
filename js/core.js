var shown = false;

var map = L.map('map').setView([51.963491, 7.625840], 14);

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(map);


var marker = new L.Marker(new L.LatLng(51.963491, 7.625840), {});

marker.on('click', function () {
	if (shown) {
		$('#panel_right_container').animate({ "left": "+=250px" });
		shown = false;
	} else {
		$('#panel_right_container').animate({ "left": "-=250px" });
		shown = true;
	}
});

marker.addTo(map);