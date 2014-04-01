<?php
/*
@author Lars Syfuß
*/

class filteroptions{

	/*
	Get the trackID of a track from a given POI-ID.
	The POI-ID must be in the current $jsonTracks.
	*/
	function getTrackID ($jsonTracks, $poiID, $info = false){
		if($info == true){
			echo "<u> function getTrackID() </u> </br>"; // Infoprint for testing
		}
		$decodedTracks = json_decode($jsonTracks, true); // decode tracks
		// search in every track
		foreach ($decodedTracks["tracks"] as $track){
			// search every point inside the track
			foreach ($track["features"] as $feature){
				if($feature["properties"]["id"]==$poiID){
					// get the trackID
					$trackID = $track["properties"]["id"];
					if($info == true){
						echo "The track-ID of the point ($poiID) is: $trackID </br>"; // Infoprint for testing
					}
					return $trackID;
				}
			}
		}
	}
	
	/*
	Get a json from track-URL using the track-ID. 
	If $encoded = true the track will be encoded.
	The trackID is added to the properties of each feature!
	*/
	function createTrackFromID ($trackID, $encoded = false, $info = false){
		if($info == true){
			echo "<u> function createTrackFromID() </u> </br>"; // Infoprint for testing
		}
		$trackString = "https://envirocar.org/api/stable/tracks/" . $trackID;
		$track = json_decode(file_get_contents($trackString), true); //array
		// add trackID to each feature
		$featureCount = 0;
		foreach($track["features"] as $feature){
			$track["features"][$featureCount]["properties"]["trackID"] = "$trackID";
			$featureCount++;
		}
		if($encoded == true){
			$track = json_encode($track);
		}
		// Infoprint
		if($info == true){
			$encodedString = "decoded";
			if($encoded == true){
				$encodedString = "encoded";
			}
			echo "Track [$trackID] has been created $encodedString"; // Infoprint for testing
		}
		return $track;
	}
	
	/*
	Create json  with tracks that match the filter. 
	The format is the same as the api request result but with all the data:
	{"tracks":[{},{}, ... ]}
	*/
	function createFilterTracks ($filterURL, $info = false){
		if($info == true){
			echo "<u> function getFilterTracks() </u> </br>"; // Infoprint for testing
		}
		$decodedTracks = json_decode(file_get_contents($filterURL), true); // decode track-json
		$trackArray = array(); // array to store the tracks
		$resultCount = 0;
		foreach ($decodedTracks["tracks"] as $track){
			$trackWithData = $this->createTrackFromID ($track["id"]); // get decoded track from track-ID
			array_push($trackArray, $trackWithData); // push the track to the trackArray
			$resultCount++; // count the tracks
		}
		$resultArray = array("tracks"=>$trackArray); // get the structure from the filterURL again
		$encodedResult = json_encode($resultArray); // encode the array
		if($info == true){
			echo "Json (encoded) has been created with " . $resultCount . " tracks! </br>"; // Infoprint for testing
		}
		return $encodedResult; 
	}
	
	/*
	Load one complete track from given POI of that track and stores just this one track!
	The POI-ID must be in the current $jsonTracks.
	The format is the same as the api request result but with all the data:
	{"tracks":[{},{}, ... ]}
	*/
	function getFullTrack_fromPoiID ($jsonTracks, $poiID, $info = false){
		if($info == true){
			echo "<u> function getFullTrack_fromPoiID() </u> </br>"; // Infoprint for testing
		}
		$trackID = $this->getTrackID ($jsonTracks, $poiID);
		$track = $this->createTrackFromID ($trackID, false); //decoded
		$result = array("tracks"=>$track); // get the structure from the filterURL again
		$encodedResult = json_encode($result); // encode the array
		if($info == true){
			echo "A new json containing one track ($trackID) only - has been created! </br>"; // Infoprint for testing
		}
		return $encodedResult;
	}
	
	/*
	Load one complete Track from given trackID and stores just this one track!
	The format is the same as the api request result but with all the data:
	{"tracks":[{},{}, ... ]}
	*/
	function getFullTrack_fromTrackID ($trackID, $info = false){
		if($info == true){
			echo "<u> function getFullTrack_fromTrackID() </u> </br>"; // Infoprint for testing
		}
		$trackArray = array(); // array to store the track
		$trackWithData = $this->createTrackFromID ($trackID); // get decoded track from track-ID
		array_push($trackArray, $trackWithData); // push the track to the trackArray
		$resultArray = array("tracks"=>$trackArray); // get the structure from the filterURL again
		$encodedResult = json_encode($resultArray); // encode the array
		if($info == true){
			echo "A new json containing one track ($trackID) only - has been created! </br>"; // Infoprint for testing
		}
		return $encodedResult;
	}

	/*
	Select just one track with the selected POIs inside this track!
	(Deleted POIs of that track remain deleted!)
	The POI-ID must be in the current $jsonTracks.
	This function deletes all other tracks from the selection ($jsonTracks).
	The format is the same as the api request result but with all the data:
	{"tracks":[{},{}, ... ]}
	*/
	function getSelectedTrack ($jsonTracks, $poiID, $info = false) {
		if($info == true){
			echo "<u> function getSelectedTrack() </u> </br>"; // Infoprint for testing
		}
		$trackID = $this->getTrackID ($jsonTracks, $poiID);
		$decodedTracks = json_decode($jsonTracks, true); // decode tracks
		$trackIndexCounter = 0;
		// search in every track
		foreach ($decodedTracks["tracks"] as $track){
			// check if the trackID matches
			if($track["properties"]["id"] != $trackID){ 
				// delete the tracks that does not match the filter
				unset($decodedTracks["tracks"][$trackIndexCounter]); 
			}
			$trackIndexCounter++;
		}
		if ($info == true){
			echo "Track ($trackID) selected! Number of deleted Tracks: " . ($trackIndexCounter-1) . "</br>"; // Infoprint for testing
		}
		$encodedResult = json_encode($decodedTracks); // encode the result
		return $encodedResult;
	}
	
	/*
	Combines the functions getBBoxURL() and createFilterTracks() to perform the initial spatial filtering.
	The format is the same as the api request result but with all the data:
	{"tracks":[{},{}, ... ]}
	*/
	function loadDefaultTracks($bbox, $limit = 15, $info = false){
		if($info == true){
			echo "<u> function loadDefaultTracks() </u> </br>"; // Infoprint for testing
		}
		// create spatialFilter object
		require_once("spatialFilter.php");
		$spatialFilter = new spatialFilter();
		// create the filterURL
		$spatialURL = $spatialFilter -> getBBoxURL($bbox, $limit, $info);
		// create track from the URL
		$track = $this -> createFilterTracks ($spatialURL, $info);
		if($info == true){
			echo "<u> The initial Track has been created from the given boundingbox: </u> </br>"; // Infoprint for testing
			print_r($bbox);
			echo "</br>";
		}
		return $track;
	}
	
	/*
	Create a filter URL that combines the spatial and the temporal filter.
	*/
	function createSpaceTimeURL($polygon, $starttime, $endtime, $limit = 15, $info = false){
		if($info == true){
			echo "<u> function createSpaceTimeURL() </u> </br>"; // Infoprint for testing
		}
		// create spatialFilter object
		require_once("spatialFilter.php");
		$spatialFilter = new spatialFilter();
		// create the boundingbox-URL from a given polygon.
		$bboxURL = $spatialFilter->createBBoxURLfromPolygon($polygon, $limit, $info);
		// append the URL information for time filtering
		// Edit the timestamp format
		$start = substr(trim($starttime), 0, 10)."T".substr(trim($starttime),-8, 8)."Z";
		$end = substr(trim($endtime), 0, 10)."T".substr(trim($endtime),-8, 8)."Z";
		$spaceTimeURL = $bboxURL."&contains=".$end.",".$start;
		if($info == true){
			echo "The URL to request the selected space and time is: $spaceTimeURL </br>"; // Infoprint for testing
		}
		return $spaceTimeURL;
	}
	
	/*
	Create Track from both, space and time parameter.
	*/
	function getSpaceTimeTrack($polygon, $starttime, $endtime, $weekday = null, $limit = 15, $info = false){
		if($info == true){
				echo "<u> function getSpaceTimeTrack() </u> </br>"; // Infoprint for testing
		}
		// create the filterURL
		$spaceTimeURL = $this->createSpaceTimeURL($polygon, $starttime, $endtime, $limit, $info);
		// create track from the URL
		$tracks = $this->createFilterTracks ($spaceTimeURL, $info);
		// create spatialFilter object
		require_once("spatialFilter.php");
		$spatialFilter = new spatialFilter();
		// create timeFilter object
		require_once("timeFilter.php");
		$timeFilter = new timeFilter();
		// run spatialFilter
		$tracks = $spatialFilter -> runSpatialFilter ($tracks, $polygon, $info);
		// run timeFilter
		$tracks = $timeFilter -> runTimeFilter ($tracks, $starttime, $endtime, $weekday, $info);
		return $tracks;
	}
	
	/*
	Create Track from polygon.
	The polygon has to be an array of points like this: 
		array("lon"=>lonCoord, "lat"=>latCoord)
	*/
	function createTrackFromPolygon($polygon, $limit = 15, $info = false){
		if($info == true){
			echo "<u> function createTrackFromPolygon() </u> </br>"; // Infoprint for testing
		}
		// create spatialFilter object
		require_once("spatialFilter.php");
		$spatialFilter = new spatialFilter();
		// create the boundingbox-URL from a given polygon.
		$bboxURL = $spatialFilter->createBBoxURLfromPolygon($polygon, $limit, $info);
		// create track from the URL
		$tracks = $this->createFilterTracks ($bboxURL, $info);
		// run spatialFilter
		$tracks = $spatialFilter -> runSpatialFilter ($tracks, $polygon, $info);
		if($info == true){
			echo "<u> Track has been created from given polygon: </u> </br>"; // Infoprint for testing
			print_r($tracks);
			echo "</br>";
		}
		return $tracks;
	}
	
		/*
	Combines the functions getTimeintervalURL(), createFilterTracks() and runTimeFilter() to perform the initial time filtering.
	The format is the same as the api request result but with all the data:
	{"tracks":[{},{}, ... ]}
	*/
	function getInitialTimeTrack($starttime, $endtime, $limit = 15, $weekday = null, $info = false){
		if($info == true){
			echo "<u> function getInitialTimeTrack() </u> </br>"; // Infoprint for testing
		}
		// create timeFilter object
		require_once("timeFilter.php");
		$timeFilter = new timeFilter();
		// create the filterURL
		$timeURL = $timeFilter -> getTimeintervalURL($starttime, $endtime, $limit, $info);
		// create track from the URL
		$track = $this->createFilterTracks ($timeURL, $info);
		// filter the given time interval
		$filteredTrack = $timeFilter -> runTimeFilter ($track, $starttime, $endtime, $weekday, $info);
		if($info == true){
			echo "<u> The initial Track has been created from the given time interval: [Starttime: $starttime, Endtime: $endtime] </u> </br>"; // Infoprint for testing
			print_r($filteredTrack);
			echo "</br>";
		}
		return $filteredTrack;
	}
	
} // end of class
?>