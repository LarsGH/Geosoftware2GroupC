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
	function getFullTrack ($jsonTracks, $poiID, $info = false){
		if($info == true){
			echo "<u> function getFullTrack() </u> </br>"; // Infoprint for testing
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
		// get the URL
		$timeURL = $timeFilter -> getTimeintervalURL($starttime, $endtime, $limit, $info);
		// create track from the URL
		$track = $this -> createFilterTracks ($timeURL, $info);
		// filter the given time interval
		$filteredTrack = $timeFilter -> runTimeFilter ($track, $starttime, $endtime, null, $info);
		if($info == true){
			echo "<u> The initial Track has been created from the given time interval: [Starttime: $starttime, Endtime: $endtime] </u> </br>"; // Infoprint for testing
		}
		return $filteredTrack;
	}
	
	/*
	Combines the functions getBBoxURL() and createFilterTracks() to perform the initial spatial filtering.
	The format is the same as the api request result but with all the data:
	{"tracks":[{},{}, ... ]}
	*/
	function getInitialSpatialTrack($bbox, $limit = 15, $info = false){
		if($info == true){
			echo "<u> function getInitialSpatialTrack() </u> </br>"; // Infoprint for testing
		}
		// create timeFilter object
		require_once("spatialFilter.php");
		$spatialFilter = new spatialFilter();
		// get the URL
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
	
} // end of class
?>