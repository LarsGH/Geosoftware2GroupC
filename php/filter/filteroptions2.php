<?php
/*
@author Lars Syfuß
*/

	if ($_GET["f"] == "createFilterTracks")
{
    $filteroptions = new filteroptions(); // for testing
    $filterURL = $_GET["filterurl"];

    echo $filteroptions -> createFilterTracks($filterURL, false);
}


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
	Get json from track-url. If $encoded = true the track will be encoded.
	The trackID is added to the phenomenons of each feature!
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
			$track["features"][$featureCount]["properties"]["phenomenons"]["trackID"] = "$trackID";
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
		$decodedTracks = json_decode(file_get_contents($filterURL), true); // decode tracks
		$trackArray = array(); // array to store the tracks
		$resultCount = 0;
		foreach ($decodedTracks["tracks"] as $track){
			$trackWithData = $this->createTrackFromID ($track["id"]); // get json from track-url
			array_push($trackArray, $trackWithData); // push it to the trackArray
			$resultCount++; // count the tracks
		}
		$resultArray = array("tracks"=>$trackArray); // get the structure from the filterURl again
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
		$result = array("tracks"=>$track); // get the structure from the filterURl again
		$encodedResult = json_encode($result); // encode the array
		if($info == true){
			echo "A new json with track ($trackID) only has been created! </br>"; // Infoprint for testing
		}
		return $encodedResult;
	}

	/*
	Select just one track with the selected POIs inside this track!
	(Deleted POIs of that track remain deleted!)
	The POI-ID must be in the current $jsonTracks.
	This function deletes all other tracks from the selection ($jsonTracks).
	The format is the same as the api request result but with all the data.
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

	
} // end of class
?>