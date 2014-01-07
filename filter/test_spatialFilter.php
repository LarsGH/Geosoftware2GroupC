<?php
// @author Lars Syfuß

// Use the spatialFilter.php
require("spatialFilter.php");

// create spatialFilter
$spatialFilter = new spatialFilter();

// Points array
$points = array();
array_push( $points, array("lon" => 50, "lat" => 70, "track" => 1));
array_push( $points, array("lon" => 70, "lat" => 40, "track" => 3)); 
array_push( $points, array("lon" => -20, "lat" => 30, "track" => 1)); 
array_push( $points, array("lon" => 100, "lat" => 10, "track" => 2));
array_push( $points, array("lon" => -10, "lat" => -10, "track" => 3));  
array_push( $points, array("lon" => 40, "lat" => -20, "track" => 1));
array_push( $points, array("lon" => 110, "lat" => -20, "track" => 2));

// Polygon array (first and last point has to be the same)
$polygon = array();
array_push( $polygon, array("lon" => -50, "lat" => 30 ));
array_push( $polygon, array("lon" => 50, "lat" => 70 )); 
array_push( $polygon, array("lon" => 100, "lat" => 50 )); 
array_push( $polygon, array("lon" => 80, "lat" => 10 ));
array_push( $polygon, array("lon" => 110, "lat" => -10 ));  
array_push( $polygon, array("lon" => 110, "lat" => -30 ));
array_push( $polygon, array("lon" => -20, "lat" => -50 ));
array_push( $polygon, array("lon" => -30, "lat" => -40 ));
array_push( $polygon, array("lon" => 10, "lat" => -10 ));
array_push( $polygon, array("lon" => -10, "lat" => 10 ));
array_push( $polygon, array("lon" => -30, "lat" => -20 ));
array_push( $polygon, array("lon" => -50, "lat" => 30 ));

// Store just the points that are inside the given polygon.
$spatialFilterResult = $spatialFilter->runSpatialFilter($points, $polygon, true); //Logging enabled with true (last parameter)
// Print the result array (points).
echo "</br> spatialFilterResult: </br>";
print_r($spatialFilterResult);


// Get the tracks from the result points
$tracks = $spatialFilter->getTracks($spatialFilterResult);
// Print the result array (tracks).
echo "</br></br> Print the tracks from the result points: </br>";
print_r($tracks);

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