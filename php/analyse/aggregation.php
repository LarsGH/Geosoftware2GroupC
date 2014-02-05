<?php
/*
@author Lars Syfuß
*/

class aggregation{

	/*
	Calculates the minimum, maximum, standard deviation and mean of the selected phenomenon.
	All selected points are considered in the calculation.
	The $phenomenon must be available for the tracks! (Check with getAvailablePhenomenons).
	The result is an associated array like this: array("min" => $min, "max" => $max, "mean" => $mean, "sd" => $sd).
	*/
	function getAggregationResult($jsonTracks, $phenomenon, $info = false){
		if($info == true){
			echo "<u> function getAggregationResult() </u> </br>"; // Infoprint for testing
		}
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
			$availablePhenomenons = $this->getAvailablePhenomenons($track, false, true);
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
		// Print Info
		if($info == true){
			echo "</br> Found " . count($phenomenonArray) . " phenomenons ($phenomenon) in " . $trackCount . " from " .  
			$allTracks ." tracks! </br> The result is: </br>";
			print_r($result);
			echo "</br>";
		}
		return $result;
	}

	/*
	Function to calculate the statistical standard deviation (not the empirical).
	The $values parameter needs to be an array!
	*/
	function calculateSD($values, $info = false){
		if($info == true){
			echo "<u> function calculateSD() </u> </br>"; // Infoprint for testing
		}
		if(is_array($values)){
			$mean = array_sum($values) / count($values);
			foreach($values as $key => $num) $devs[$key] = pow($num - $mean, 2);
			$sd = sqrt(array_sum($devs) / (count($devs)-1));
			if($info == true){
				echo "The standard deviation is: $sd </br>";
			}
			return $sd;
		}
	}

	/*
	Get the available phenomenons of a track. Not all phenomenons are available for every track.
	Set $encoded to true if the $track-file is encoded.
	The result is an array.
	*/
	function getAvailablePhenomenons($track, $encoded = false, $info = false){
		if($info == true){
			echo "<u> function getAvailablePhenomenons() </u> </br>"; // Infoprint for testing
		}
		if($encoded == true){
			$track = json_decode($track, true); 
		}
		// Just the first feature needs to be searched. 
		$availablePhenomenons = array_keys($track["features"][0]["properties"]["phenomenons"]);
		if($info == true){
			echo "The available phenomenons are: </br>";
			print_r($availablePhenomenons);
			echo "</br>";
		}
		return $availablePhenomenons;
	}

} // end of class
?>