<?php
// @author Lars Syfuß

require("prefilter.php"); // for testing
require("aggregation.php"); // for testing

$prefilter = new prefilter();
$aggregation = new aggregation();
/*
$testTrackEncoded = $prefilter -> createTrackFromID("52d77b92e4b0f9afbe4ea1aa", true); // get encoded track
$testTrackDecoded = $prefilter -> createTrackFromID("52d77b92e4b0f9afbe4ea1aa", false); // get encoded track
$available = getAvailablePhenomenons($testTrackDecoded, false); // get the phenomenons
print_r($available); // see the result (it works)
*/

// ### test getAggregationResult ###
$exampleRequest = "https://envirocar.org/api/stable/tracks?contains=2014-01-07T18:44:40Z,2014-01-05T01:19:02Z";
$jsonTracks = $prefilter -> getFilterTracks($exampleRequest);
$aggregationResult = $aggregation -> getAggregationResult($jsonTracks, "CO2", true);
print_r($aggregationResult);

?>