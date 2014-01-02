<?php
// @author Lars Syfuß

// Use the spatialFilter.php
require("spatialFilter.php");

// create spatialFilter
$spatialFilter = new spatialFilter();

// Points array
$points = array();
array_push( $points, array("lon" => 50, "lat" => 70 ));
array_push( $points, array("lon" => 70, "lat" => 40 )); 
array_push( $points, array("lon" => -20, "lat" => 30 )); 
array_push( $points, array("lon" => 100, "lat" => 10 ));
array_push( $points, array("lon" => -10, "lat" => -10 ));  
array_push( $points, array("lon" => 40, "lat" => -20 ));
array_push( $points, array("lon" => 110, "lat" => -20 ));

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
echo "</br>";
// Print the result array.
print_r($spatialFilterResult);

echo "</br>";
// Test the exception handling with a not closed polygon.
$notClosedPolygon = array();
array_push( $notClosedPolygon, array("lon" => -50, "lat" => 30 ));
array_push( $notClosedPolygon, array("lon" => 50, "lat" => 70 )); 
array_push( $notClosedPolygon, array("lon" => 100, "lat" => 50 )); 

// Pops up: "Caught Exception: Polygon not closed!" like expected.
$spatialFilter->runSpatialFilter($points, $notClosedPolygon, false); // Logging disabled with false (last parameter)

?>