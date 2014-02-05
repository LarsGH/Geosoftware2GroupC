<?php
/*
@author Lars Syfuß
*/

require("filteroptions.php"); // for testing
require("aggregation.php"); // for testing

$filteroptions = new filteroptions();
$aggregation = new aggregation();

// ### test getAggregationResult ###
$exampleRequest = "https://envirocar.org/api/stable/tracks?contains=2014-01-07T18:44:40Z,2014-01-05T01:19:02Z";
$jsonTracks = $filteroptions -> getFilterTracks($exampleRequest);

// Test calculateSD()
echo "<b>Test  calculateSD() </b></br>";
$values = array(1,2,3,4,5);
$sd = $aggregation->calculateSD($values, true);
echo "</br></br>";

// Test getAvailablePhenomenons()
$decodedTracks = json_decode($jsonTracks, true); // decode tracks
$track = $decodedTracks["tracks"][0];
echo "<b>Test getAvailablePhenomenons() </b></br>";
$aggregationResult = $aggregation->getAvailablePhenomenons($track, false, true);
echo "</br></br>";

// Test getAggregationResult()
echo "<b>Test getAggregationResult() </b></br>";
$aggregationResult = $aggregation->getAggregationResult($jsonTracks, "CO2", true);
echo "</br></br>";

?>