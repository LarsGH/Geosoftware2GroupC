<?php
/*
@author Lars Syfuß
*/

/*
This file is used to query all the needed filter-functions from the classes spatialFilter, timeFilter and filteroptions.
*/

require("filter/filteroptions.php"); 
require("filter/spatialFilter.php"); 
require("filter/timeFilter.php"); 

// create the objects we need for the functions
$filteroptions = new filteroptions();
$spatialFilter = new spatialFilter();
$timeFilter = new timeFilter();


/*
###############################
### FILTEROPTIONS functions ###
###############################
Have a look at filteroptions.php for function details!
*/

// getTrackID
if ($_GET["f"] == "getTrackID"){
	$jsonTracks = $_GET["jsonTracks"];
	$poiID = $_GET["poiID"];
    echo $filteroptions -> getTrackID($jsonTracks, $poiID);
}

// createTrackFromID
if ($_GET["f"] == "createTrackFromID"){
	$trackID = $_GET["trackID"];
	$encoded = $_GET["encoded"];
    echo $filteroptions -> createTrackFromID($trackID, $encoded);
}

// createFilterTracks
if ($_GET["f"] == "createFilterTracks"){
    $filterURL = $_GET["filterurl"];
    echo $filteroptions -> createFilterTracks($filterURL);
}

// getFullTrack
if ($_GET["f"] == "getFullTrack"){
	$jsonTracks = $_GET["jsonTracks"];
	$poiID = $_GET["poiID"];
    echo $filteroptions -> getFullTrack($jsonTracks, $poiID);
}

// getSelectedTrack
if ($_GET["f"] == "getSelectedTrack"){
	$jsonTracks = $_GET["jsonTracks"];
	$poiID = $_GET["poiID"];
    echo $filteroptions -> getSelectedTrack($jsonTracks, $poiID);
}

/*
###############################
### SPATIALFILTER functions ###
###############################
Have a look at spatialFilter.php for function details!
*/

// runSpatialFilter
if ($_GET["f"] == "runSpatialFilter"){
	$jsonTracks = $_GET["jsonTracks"];
	$polygon = $_GET["polygon"];
    echo $spatialFilter -> runSpatialFilter($jsonTracks, $polygon);
}

// getBBox
if ($_GET["f"] == "getBBox"){
	$polygon = $_GET["polygon"];
    echo $spatialFilter -> getBBox($polygon);
}

// createBBoxURLfromPolygon
if ($_GET["f"] == "createBBoxURLfromPolygon"){
	$polygon = $_GET["polygon"];
	if(isset($_GET["limit"])){
		$limit = $_GET["limit"];
		echo $spatialFilter -> createBBoxURLfromPolygon($polygon, $limit);
	} else {
		echo $spatialFilter -> createBBoxURLfromPolygon($polygon);
	}
}

/*
###############################
###   TIMEFILTER functions  ###
###############################
Have a look at timeFilter.php for function details!
*/

// createTimestamp
if ($_GET["f"] == "createTimestamp"){
	$timeString = $_GET["timeString"];
    echo $timeFilter -> createTimestamp($timeString);
}

// getWeekday
if ($_GET["f"] == "getWeekday"){
	$timeString = $_GET["timeString"];
    echo $timeFilter -> getWeekday($timeString);
}

// checkDay
if ($_GET["f"] == "checkDay"){
	$timeString = $_GET["timeString"];
	$weekday = $_GET["weekday"];
    echo $timeFilter -> checkDay($timeString, $weekday);
}

// runTimeFilter
if ($_GET["f"] == "runTimeFilter"){
	$jsonTracks = $_GET["jsonTracks"];
	$starttime = $_GET["starttime"];
	$endtime = $_GET["endtime"];
	if(isset($_GET["weekday"])){
		$weekday = $_GET["weekday"];
		echo $timeFilter -> runTimeFilter($jsonTracks, $starttime, $endtime, $weekday);
	} else {
		echo $timeFilter -> runTimeFilter($jsonTracks, $starttime, $endtime);
	}
}

// getTimeintervalURL
if ($_GET["f"] == "getTimeintervalURL"){
	$starttime = $_GET["starttime"];
	$endtime = $_GET["endtime"];
	if(isset($_GET["limit"])){
		$limit = $_GET["limit"];
		echo $timeFilter -> getTimeintervalURL($starttime, $endtime, $limit);
	} else {
		echo $timeFilter -> getTimeintervalURL($starttime, $endtime);
	}
}

// The function does not exist!
else{
	echo "The function (f) does not exist!";
}


?>