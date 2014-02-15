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
if ($_POST["f"] == "getTrackID"){
	$jsonTracks = $_POST["jsonTracks"];
	$poiID = $_POST["poiID"];
    echo $filteroptions -> getTrackID($jsonTracks, $poiID);
}

// createTrackFromID
if ($_POST["f"] == "createTrackFromID"){
	$trackID = $_POST["trackID"];
	$encoded = $_POST["encoded"];
    echo $filteroptions -> createTrackFromID($trackID, $encoded);
}

// createFilterTracks
if ($_POST["f"] == "createFilterTracks"){
    $filterURL = $_POST["filterurl"];
    echo $filteroptions -> createFilterTracks($filterURL);
}

// getFullTrack
if ($_POST["f"] == "getFullTrack"){
	$jsonTracks = $_POST["jsonTracks"];
	$poiID = $_POST["poiID"];
    echo $filteroptions -> getFullTrack($jsonTracks, $poiID);
}

// getSelectedTrack
if ($_POST["f"] == "getSelectedTrack"){
	$jsonTracks = $_POST["jsonTracks"];
	$poiID = $_POST["poiID"];
    echo $filteroptions -> getSelectedTrack($jsonTracks, $poiID);
}

/*
###############################
### SPATIALFILTER functions ###
###############################
Have a look at spatialFilter.php for function details!
*/

// runSpatialFilter
if ($_POST["f"] == "runSpatialFilter"){
	$jsonTracks = $_POST["jsonTracks"];
	$polygon = $_POST["polygon"];
    echo $spatialFilter -> runSpatialFilter($jsonTracks, $polygon);
}

// getBBox
if ($_POST["f"] == "getBBox"){
	$polygon = $_POST["polygon"];
    echo $spatialFilter -> getBBox($polygon);
}

// createBBoxURLfromPolygon
if ($_POST["f"] == "createBBoxURLfromPolygon"){
	$polygon = $_POST["polygon"];
	if(isset($_POST["limit"])){
		$limit = $_POST["limit"];
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
if ($_POST["f"] == "createTimestamp"){
	$timeString = $_POST["timeString"];
    echo $timeFilter -> createTimestamp($timeString);
}

// getWeekday
if ($_POST["f"] == "getWeekday"){
	$timeString = $_POST["timeString"];
    echo $timeFilter -> getWeekday($timeString);
}

// checkDay
if ($_POST["f"] == "checkDay"){
	$timeString = $_POST["timeString"];
	$weekday = $_POST["weekday"];
    echo $timeFilter -> checkDay($timeString, $weekday);
}

// runTimeFilter
if ($_POST["f"] == "runTimeFilter"){
	$jsonTracks = $_POST["jsonTracks"];
	$starttime = $_POST["starttime"];
	$endtime = $_POST["endtime"];
	if(isset($_POST["weekday"])){
		$weekday = $_POST["weekday"];
		echo $timeFilter -> runTimeFilter($jsonTracks, $starttime, $endtime, $weekday);
	} else {
		echo $timeFilter -> runTimeFilter($jsonTracks, $starttime, $endtime);
	}
}

// getTimeintervalURL
if ($_POST["f"] == "getTimeintervalURL"){
	$starttime = $_POST["starttime"];
	$endtime = $_POST["endtime"];
	if(isset($_POST["limit"])){
		$limit = $_POST["limit"];
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