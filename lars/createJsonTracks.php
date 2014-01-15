<?php

// @author Lars Syfuß

// get json from track-url
function createTrackFromID ($trackID){
	$trackString = "https://envirocar.org/api/stable/tracks/" . $trackID;
	$track = json_decode(file_get_contents($trackString), true); // as array
	return $track;
}

// get json files from filter
function getFilterTracks ($filterURL){
	$decodedTracks = json_decode(file_get_contents($filterURL), true); // decode tracks
	$trackArray = array(); // array to store the tracks
	foreach ($decodedTracks["tracks"] as $track){
		$trackWithData = createTrackFromID ($track["id"]); // get json from track-url
		array_push($trackArray, $trackWithData); // push it to the trackArray
	}
	$resultArray = array("tracks"=>$trackArray); // get the structure from the filterURl again
	$encodedResult = json_encode($resultArray); // encode the array
	return $encodedResult; 
}

// TEST
$timeTracks = "https://envirocar.org/api/stable/tracks?contains=2014-01-10T18:44:40Z,2014-01-10T07:21:02Z"; // example with 3 tracks
getFilterTracks ($timeTracks); // funktioniert

?>