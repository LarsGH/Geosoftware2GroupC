<?php

// @author Lars Syfuß

require("prefilter.php");

### test getFilterTracks ###
// get point data with getJson
$prefilter = new prefilter();
$exampleRequest = "https://envirocar.org/api/stable/tracks?contains=2014-01-10T18:44:40Z,2014-01-10T16:19:02Z";
$jsonTracks = $prefilter -> getFilterTracks($exampleRequest, true);
//echo $jsonTracks; // works

### test getFullTrack ###
$poiID = "52d0489ce4b0f9afbdeadf91"; // any point from the track
$wantedTrack = $prefilter ->getFullTrack ($jsonTracks, $poiID);
//echo $wantedTrack; // works!

### test getSelectedTrack ###
$selectedTrack = $prefilter ->getSelectedTrack ($jsonTracks, $poiID, true);
echo $selectedTrack;

/*
### test createTrackFromID ###
$trackID = "52d77ba2e4b0f9afbe4ea8d8";
$track = $prefilter->createTrackFromID ($trackID, true); // encode the result
echo($track);
*/

?>