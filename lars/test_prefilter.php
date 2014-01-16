<?php

// @author Lars Syfuß

require("prefilter.php");

// get point data with getJson
$tracksJson = new prefilter();
$exampleRequest = "https://envirocar.org/api/stable/tracks?contains=2014-01-10T18:44:40Z,2014-01-10T16:19:02Z";
$json = $tracksJson -> getFilterTracks($exampleRequest);

$tracksJson -> printCoordinates($json);
?>