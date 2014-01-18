<?php

//@author Lars Syfuß

class aggregation{

	/*
	Calculates the minimum, maximum, standard deviation and mean of the selected phenomenon.
	All selected points are considered in the calculation.
	The $phenomenon must be available for the tracks! (Check with getAvailablePhenomenons).
	The result is an associated array like this: array("min" => $min, "max" => $max, "mean" => $mean, "sd" => $sd).
	*/
	function getAggregationResult($jsonTracks, $phenomenon, $info = false){
		$decodedTracks = json_decode($jsonTracks, true); // decode tracks
		$phenomenonArray = array(); // stores the phenomenon values
		// Just for logging
		if($info == true){
			$trackCount = 0;
			$allTracks = 0;
		}
		foreach ($decodedTracks["tracks"] as $track){
			if($info == true){
				$allTracks++;
			}
			// Check if the track has the required phenomenon.
			$availablePhenomenons = $this->getAvailablePhenomenons($track);
			if(in_array($phenomenon, $availablePhenomenons)){
				// Just for logging
				if($info == true){
					$trackCount++;
				}
				// search every point inside the track
				foreach ($track["features"] as $feature){
					$search = $feature["properties"]["phenomenons"];
					if(array_key_exists($phenomenon, $search)){ // not every attribute exists in every feature, so it has to be checked
						$phenomenonValue = $feature["properties"]["phenomenons"]["$phenomenon"]["value"]; // get the value
						array_push($phenomenonArray, $phenomenonValue);
					}
				}
			}
		}
		// calculate results
		$min = min($phenomenonArray);
		$max = max($phenomenonArray);
		$mean = array_sum($phenomenonArray) / count($phenomenonArray);
		$sd = $this->calculateSD($phenomenonArray); // statistical standard deviation (not empirical)
		// Create the result array
		$result = array("min" => $min, "max" => $max, "mean" => $mean, "sd" => $sd);
		if($info == true){
			echo "Found " . count($phenomenonArray) . " phenomenons ($phenomenon) in " . $trackCount . " from " .  
			$allTracks ." tracks! </br>"; // Print Info
		}
		return $result;
	}

	/*
	Function to calculate the statistical standard deviation (not the empirical).
	The $values parameter needs to be an array!
	*/
	function calculateSD($values){
		if(is_array($values)){
			$mean = array_sum($values) / count($values);
			foreach($values as $key => $num) $devs[$key] = pow($num - $mean, 2);
			return sqrt(array_sum($devs) / (count($devs)-1));
		}
	}

	/*
	Get the available phenomenons of a track. Not all phenomenons are available for every track.
	Set $encoded to true if the $track-file is encoded.
	The result is an array.
	*/
	function getAvailablePhenomenons($track, $encoded = false){
		if($encoded == true){
			$track = json_decode($track, true); 
		}
		// Just the first feature needs to be searched. 
		$availablePhenomenons = array_keys($track["features"][0]["properties"]["phenomenons"]); 
		return $availablePhenomenons;
	}

} // end of class
?>