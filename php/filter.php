<?php
/*
@author Lars Syfuß
*/

/*
This file is used to query all the needed filter-functions from the classes spatialFilter, timeFilter and filteroptions.
*/

require_once("filter/filteroptions.php"); 
require_once("filter/spatialFilter.php"); 
require_once("filter/timeFilter.php"); 

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
else if ($_POST["f"] == "createTrackFromID"){
	$trackID = $_POST["trackID"];
	$encoded = $_POST["encoded"];
    echo $filteroptions -> createTrackFromID($trackID, $encoded);
}

// createFilterTracks
else if  ($_POST["f"] == "createFilterTracks"){
    $filterURL = $_POST["filterurl"];
    echo $filteroptions -> createFilterTracks($filterURL);
}

// getFullTrack
else if  ($_POST["f"] == "getFullTrack"){
	$jsonTracks = $_POST["jsonTracks"];
	$poiID = $_POST["poiID"];
    echo $filteroptions -> getFullTrack($jsonTracks, $poiID);
}

// getSelectedTrack
else if  ($_POST["f"] == "getSelectedTrack"){
	$jsonTracks = $_POST["jsonTracks"];
	$poiID = $_POST["poiID"];
    echo $filteroptions -> getSelectedTrack($jsonTracks, $poiID);
}

// getInitialTimeTrack
else if  ($_POST["f"] == "getInitialTimeTrack"){
	$starttime = $_POST["starttime"];
	$endtime = $_POST["endtime"];
    echo $filteroptions -> getInitialTimeTrack($starttime, $endtime, $limit);
	if(isset($_POST["limit"])){
		$limit = $_POST["limit"];
		echo $filteroptions -> getInitialTimeTrack($starttime, $endtime, $limit);
	} else {
		echo $filteroptions -> getInitialTimeTrack($starttime, $endtime);
	}
}

/*
###############################
### SPATIALFILTER functions ###
###############################
Have a look at spatialFilter.php for function details!
*/

// runSpatialFilter
else if  ($_POST["f"] == "runSpatialFilter"){
	$jsonTracks = $_POST["jsonTracks"];
	$polygon = $_POST["polygon"];
    echo $spatialFilter -> runSpatialFilter($jsonTracks, $polygon);
}

// getBBox
else if  ($_POST["f"] == "getBBox"){
	$polygon = $_POST["polygon"];
    echo $spatialFilter -> getBBox($polygon);
}

// createBBoxURLfromPolygon
else if  ($_POST["f"] == "createBBoxURLfromPolygon"){
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
else if  ($_POST["f"] == "createTimestamp"){
	$timeString = $_POST["timeString"];
    echo $timeFilter -> createTimestamp($timeString);
}

// getWeekday
else if  ($_POST["f"] == "getWeekday"){
	$timeString = $_POST["timeString"];
    echo $timeFilter -> getWeekday($timeString);
}

// checkDay
else if  ($_POST["f"] == "checkDay"){
	$timeString = $_POST["timeString"];
	$weekday = $_POST["weekday"];
    echo $timeFilter -> checkDay($timeString, $weekday);
}

// runTimeFilter
else if  ($_POST["f"] == "runTimeFilter"){
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
else if  ($_POST["f"] == "getTimeintervalURL"){
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