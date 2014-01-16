<?php
// @author Lars Syfuß

// Use the spatialFilter.php
require("spatialFilter.php");
require("prefilter.php");

// create spatialFilter
$spatialFilter = new spatialFilter();

// get track data with getJson
$tracksJson = new prefilter();
$exampleRequest = "https://envirocar.org/api/stable/tracks?contains=2014-01-10T18:44:40Z,2014-01-10T16:19:02Z";
$jsonTracks = $tracksJson -> getFilterTracks($exampleRequest);

// Polygon array (at least 3 points + first and last point has to be the same)
$polygon = array();
array_push( $polygon, array("lon" => 11.56, "lat" => 47.45 ));
array_push( $polygon, array("lon" => 11.56, "lat" => 47.60 ));
array_push( $polygon, array("lon" => 11.66, "lat" => 47.60 ));
array_push( $polygon, array("lon" => 11.66, "lat" => 47.45 ));
array_push( $polygon, array("lon" => 11.56, "lat" => 47.45 ));

// Store just the points that are inside the given polygon.
$spatialFilterResult = $spatialFilter->runSpatialFilter($jsonTracks, $polygon, true); //Logging enabled with true (last parameter)
// Print the result array (points).
echo "</br> spatialFilterResult: </br>";
print_r($spatialFilterResult);

// Test the bbox functions.
$bbox = $spatialFilter->getBBox($polygon);
echo "</br></br> Print the bbox from the given polygon: </br>";
print_r($bbox);

// Get the bbox-URL.
$bboxURL = $spatialFilter->getBBoxURL($bbox);
echo "</br></br> The bbox-URL is: " . $bboxURL . "</br>";

/*
// Test the exception handling with a not closed polygon.
$notClosedPolygon = array();
array_push( $notClosedPolygon, array("lon" => -50, "lat" => 30 ));
array_push( $notClosedPolygon, array("lon" => 50, "lat" => 70 )); 
array_push( $notClosedPolygon, array("lon" => -30, "lat" => -40 ));
array_push( $notClosedPolygon, array("lon" => 10, "lat" => -10 ));
array_push( $notClosedPolygon, array("lon" => 100, "lat" => 50 )); 

// Pops up: "Caught Exception: Polygon not closed!" like expected.
$spatialFilter->runSpatialFilter($points, $notClosedPolygon, false); // Logging disabled with false (last parameter)
*/

/*
// Test the exception handling with a polygon with less then 3 points (first and last count as same point)
$twoPointPolygon = array();
array_push( $twoPointPolygon, array("lon" => -50, "lat" => 30 ));
array_push( $twoPointPolygon, array("lon" => 50, "lat" => 70 ));
array_push( $twoPointPolygon, array("lon" => -50, "lat" => 30 ));
 
// Pops up: "Caught Exception: Polygon needs at least 3 different points!" like expected.
$spatialFilter->runSpatialFilter($points, $twoPointPolygon, false); // Logging disabled with false (last parameter)
*/

?>