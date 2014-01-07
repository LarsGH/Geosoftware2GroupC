<?php

// @author Lars Syfuß

/*
Takes a Json-File and gives all the points with attributes.
*/
function getTrackPoints ($trackJson, $printInfo = false){
	$nl = "</br>"; // newline
	$decoded = json_decode(file_get_contents($trackJson), true); //decode the json-file
	$counter = 1; // count the points
	$pointsArray = array(); // stores the points with all relevant attributes
	$track = $decoded["properties"]["id"];
	foreach ($decoded["features"] as $features){
		$lon = $features["geometry"]["coordinates"][0];
		$lat = $features["geometry"]["coordinates"][1];
		$maf = $features["properties"]["phenomenons"]["Calculated MAF"]["value"];
		$verbrauch = $features["properties"]["phenomenons"]["Consumption"]["value"];
		$einlassdruck = $features["properties"]["phenomenons"]["Intake Pressure"]["value"];
		$einlasstemp = $features["properties"]["phenomenons"]["Intake Temperature"]["value"];
		$co2 = $features["properties"]["phenomenons"]["CO2"]["value"];
		$kmh = $features["properties"]["phenomenons"]["Speed"]["value"];
		$umdrehungen = $features["properties"]["phenomenons"]["Rpm"]["value"];
		// Infoprint if $printInfo is true
		if($printInfo == true){
			echo "<b>punkt ".$counter.": </b> $nl";
			echo "lon: ".$lon.$nl;
			echo "lat: ".$lat.$nl;
			echo "track: ".$track.$nl;
			echo "maf: ".$maf.$nl;
			echo "verbrauch: ".$verbrauch.$nl;
			echo "einlassdruck: ".$einlassdruck.$nl;
			echo "einlasstemp: ".$einlasstemp.$nl;
			echo "co2: ".$co2.$nl;
			echo "kmh: ".$kmh.$nl;
			echo "umdrehungen: ".$umdrehungen.$nl.$nl;		
		}
		$newPoint = array("lon" => $lon, "lat" => $lat, "track" => $track, "maf" => $maf, "verbrauch" => $verbrauch, 
		"einlassdruck" => $einlassdruck, "einlasstemp" => $einlasstemp, "co2" => $co2, "kmh" => $kmh, "umdrehungen" => $umdrehungen);
		array_push($pointsArray, $newPoint);
		$counter++;
	}
	return $pointsArray;
}

// Test
$file = "52cb2919e4b0f9afbd8dd0fe.json";
$trackPoints = getTrackPoints($file, true);

// Print the result-array
print_r($trackPoints);
?>