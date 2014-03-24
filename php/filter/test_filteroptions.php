<?php
/*
@author Lars Syfuß
*/

require_once("filteroptions.php"); // for testing
require_once("timeFilter.php"); // for testing
$filteroptions = new filteroptions(); // for testing
$timeFilter = new timeFilter();


// Test createTrackFromID()
$trackID = "52d77ba2e4b0f9afbe4ea8d8";
$createTrack = $filteroptions->createTrackFromID ($trackID, true);
echo "</br></br>";

// Create an URL with the function getTimeintervalURL()
echo "<b>Test  getTimeintervalURL() (class timeFilter)</b> </br>";
$exampleRequest = $timeFilter -> getTimeintervalURL("2014-01-10 16:19:02", "2014-01-10 18:44:40", 10, true);
echo "</br></br>";

// Test createFilterTracks()
echo "<b>Test  createFilterTracks() </b> </br>";
$jsonTracks = $filteroptions -> createFilterTracks($exampleRequest, true);
echo "</br></br>";

// Test getTrackID()
$poiID = "52d0489ce4b0f9afbdeadf91"; // any point from the track
echo "<b>Test  getTrackID() </b> </br>";
$trackID = $filteroptions -> getTrackID($jsonTracks, $poiID, true);
echo "</br></br>";

// Test getSelectedTrack()
echo "<b>Test  getSelectedTrack() </b> </br>";
$selectedTrack = $filteroptions ->getSelectedTrack ($jsonTracks, $poiID, true);
echo "<b>The selected track is: </b> </br>";
print_r($selectedTrack);
echo "</br></br>";

// Test getFullTrack()
echo "<b>Test  getFullTrack() </b> </br>";
$fullTrack = $filteroptions ->getFullTrack ($jsonTracks, $poiID, true);
echo "<b>The wanted track is: </b> </br>";
print_r($fullTrack);
echo "</br></br>";

/*
// Test getInitialTimeTrack()
echo "<b>Test  getInitialTimeTrack() </b> </br>";
$initialTimeTrack = $filteroptions ->getInitialTimeTrack("2014-01-10T16:19:02Z", "2014-01-10T18:44:40Z", 10, null, true);
echo "<b>The initial (time) track is: </b> </br>";
print_r($initialTimeTrack);
echo "</br></br>";
*/


// Test getInitialSpatialTrack()
// create bbox from Muenster for testing
$bbox = array("minX" =>7.581, "minY" => 51.938, "maxX" => 7.662, "maxY" => 51.971);

echo "<b>Test  getInitialSpatialTrack() </b> </br>";
$initialSpatialTrack = $filteroptions ->getInitialSpatialTrack($bbox, 10, true);
echo "<b>The initial (spatial) track  is: </b> </br>";
print_r($initialSpatialTrack);
echo "</br></br>";

?>