<?php

// @author Lars Syfuß

class prefilter{
	
	/*
	Get json from track-url. If $encoded = true the track will be encoded.
	The trackID is added to the phenomenons of each feature!
	*/
	function createTrackFromID ($trackID, $encoded = false){
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
		return $track;
	}
	
	/*
	Get json  that matches the filter. 
	The format is the same as the api request result but with all the data.
	*/
	function getFilterTracks ($filterURL, $info = false){
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
			echo "Filter result count: " . $resultCount . "</br>"; // Infoprint for testing
		}
		return $encodedResult; 
	}
	
	/*
	Load one complete track from given POI.
	The format is the same as the api request result but with all the data.	
	*/
	function getFullTrack ($jsonTracks, $poiID){
		$trackID = $this->getTrackID ($jsonTracks, $poiID);
		$track = $this->createTrackFromID ($trackID, false); //decoded
		$result = array("tracks"=>$track); // get the structure from the filterURl again
		$encodedResult = json_encode($result); // encode the array
		return $encodedResult;
	}
	
	/*
	Get the trackID of a track by the POI-ID.
	*/
	function getTrackID ($jsonTracks, $poiID){
		$decodedTracks = json_decode($jsonTracks, true); // decode tracks
		// search in every track
		foreach ($decodedTracks["tracks"] as $track){
			// search every point inside the track
			foreach ($track["features"] as $feature){
				if($feature["properties"]["id"]==$poiID){
					$trackID = $track["properties"]["id"];
					return $trackID;
				}
			}
		}
	}
	
	/*
	Select just one track with the selected POIs inside this track!
	This function deletes all other tracks from the selection ($jsonTracks).
	The format is the same as the api request result but with all the data.
	*/
	function getSelectedTrack ($jsonTracks, $poiID, $info = false) {
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
			echo "Number of deleted Tracks: " . ($trackIndexCounter-1) . "</br>"; // Infoprint for testing
		}
		$encodedResult = json_encode($decodedTracks); // encode the result
		return $encodedResult;
	}

	
} // end of class
?>