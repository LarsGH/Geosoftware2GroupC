<?php
/*
@author Lars Syfuß
*/

// Use the spatialFilter.php
require("spatialFilter.php"); // for testing
require("filteroptions.php"); // for testing

// create spatialFilter
$spatialFilter = new spatialFilter();

// get track data with getJson
$filteroptions = new filteroptions();
$exampleRequest = "https://envirocar.org/api/stable/tracks?contains=2014-01-10T18:44:40Z,2014-01-10T16:19:02Z";
$jsonTracks = $filteroptions -> createFilterTracks($exampleRequest);

// Polygon array (at least 3 points + first and last point has to be the same)
$polygon = array();
array_push( $polygon, array("lon" => 11.56, "lat" => 47.45 ));
array_push( $polygon, array("lon" => 11.56, "lat" => 47.60 ));
array_push( $polygon, array("lon" => 11.66, "lat" => 47.60 ));
array_push( $polygon, array("lon" => 11.66, "lat" => 47.45 ));
array_push( $polygon, array("lon" => 11.56, "lat" => 47.45 ));



// Test runSpatialFilter()
echo "<b>Test  runSpatialFilter() </b></br>";
$spatialFilterResult = $spatialFilter->runSpatialFilter($jsonTracks, $polygon, true); //Logging enabled with true (last parameter)
echo "</br></br>";
// Print the result array (points).
echo "</br> spatialFilterResult: </br>";
print_r($spatialFilterResult);
echo "</br></br>";


// Test getBBox()
echo "<b>Test  getBBox() </b></br>";
$bbox = $spatialFilter->getBBox($polygon, true);
echo "</br></br>";

// Test getBBoxURL()
echo "<b>Test  getBBoxURL() </b></br>";
$bboxURL = $spatialFilter->getBBoxURL($bbox, true);
echo "</br></br>";

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