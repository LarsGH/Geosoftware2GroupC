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
	$starttime = urldecode($_POST["starttime"]);
	$endtime = urldecode($_POST["endtime"]);
	if(isset($_POST["limit"])){
		$limit = $_POST["limit"];
		echo $filteroptions -> getInitialTimeTrack($starttime, $endtime, $limit);
	} else {
		echo $filteroptions -> getInitialTimeTrack($starttime, $endtime);
	}
}

// loadDefaultTracks
else if  ($_POST["f"] == "loadDefaultTracks"){
	$bbox = json_decode($_POST["bbox"], true);
	if(isset($_POST["limit"])){
		$limit = $_POST["limit"];
		echo $filteroptions -> loadDefaultTracks($bbox, $limit);
	} else {
		echo $filteroptions -> loadDefaultTracks($bbox);
	}
}

// getSpaceTimeTrack
else if  ($_POST["f"] == "getSpaceTimeTrack"){
	// bind all variables that are set
	if(isset($_POST["polygon"])){
		$polygon = json_decode($_POST["polygon"], true);
	}
	if(isset($_POST["starttime"])){
		$starttime = urldecode($_POST["starttime"]);
	}
	if(isset($_POST["endtime"])){
		$endtime = urldecode($_POST["endtime"]);
	}
	if(isset($_POST["weekday"])){
		$weekday = $_POST["weekday"];
	}
	if(isset($_POST["limit"])){
		$limit = $_POST["limit"];
	}
	// CASE1: all needed data is set
	if(isset(($_POST["starttime"])) && isset($_POST["endtime"]) && isset($_POST["polygon"])){
		// if weekday is set
		if(isset($_POST["weekday"])){
			// if limit is set
			if(isset($_POST["limit"])){
				echo $filteroptions -> getSpaceTimeTrack($starttime, $endtime, $weekday, $polygon, $limit); // with limit
			} else {
				echo $filteroptions -> getSpaceTimeTrack($starttime, $endtime, $weekday, $polygon); // without limit
			}
		// weekday not set
		} else {
			// if limit is set
			if(isset($_POST["limit"])){
				echo $filteroptions -> getSpaceTimeTrack($starttime, $endtime, null, $polygon, $limit); // with limit
			} else {
				echo $filteroptions -> getSpaceTimeTrack($starttime, $endtime, null, $polygon); // without limit
			}
		}
	// CASE2: just spatial data is set
	} else if(isset($_POST["polygon"]) !isset(($_POST["starttime"])) && !isset($_POST["endtime"]) ){
		// if limit is set
			if(isset($_POST["limit"])){
				echo $filteroptions -> createTrackFromPolygon($polygon, $limit)
			} else {
				echo $filteroptions -> createTrackFromPolygon($polygon); // without limit
			}
	// CASE3: just temporal data is set
	} else {
		// if weekday is set
		if(isset($_POST["weekday"])){
			// if limit is set
			if(isset($_POST["limit"])){
				echo $filteroptions -> getInitialTimeTrack($starttime, $endtime, $limit, $weekday); // with limit
			} else {
				echo $filteroptions -> getInitialTimeTrack($starttime, $endtime, $weekday); // without limit
			}
		// weekday not set
		} else {
			// if limit is set
			if(isset($_POST["limit"])){
				echo $filteroptions -> getInitialTimeTrack($starttime, $endtime, $limit); // with limit
			} else {
				echo $filteroptions -> getInitialTimeTrack($starttime, $endtime); // without limit
			}
		}
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
	$polygon = json_decode($_POST["polygon"], true);
    echo $spatialFilter -> runSpatialFilter($jsonTracks, $polygon);
}

// getBBox
else if  ($_POST["f"] == "getBBox"){
	$polygon = json_decode($_POST["polygon"], true);
    echo $spatialFilter -> getBBox($polygon);
}

// createBBoxURLfromPolygon
else if  ($_POST["f"] == "createBBoxURLfromPolygon"){
	$polygon = json_decode($_POST["polygon"], true);
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
	$starttime = urldecode($_POST["starttime"]);
	$endtime = urldecode($_POST["endtime"]);
	if(isset($_POST["weekday"])){
		$weekday = $_POST["weekday"];
		echo $timeFilter -> runTimeFilter($jsonTracks, $starttime, $endtime, $weekday);
	} else {
		echo $timeFilter -> runTimeFilter($jsonTracks, $starttime, $endtime);
	}
}

// getTimeintervalURL
else if  ($_POST["f"] == "getTimeintervalURL"){
	$starttime = urldecode($_POST["starttime"]);
	$endtime = urldecode($_POST["endtime"]);
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