<?php
/*
@author Lars Syfuß
*/
class timeFilter {
 
	/* 
	Check if starttime is before endtime.
	Returns true if starttime is before endtime.
	*/
	function checkTimeLogic($starttime, $endtime, $info = false){
		if($info == true){
			echo "<u> function checkTimeLogic() </u> </br>"; // Infoprint for testing
		}
		// Create timestamps
		$start = $this->createTimestamp($starttime, $info);
		$end = $this->createTimestamp($endtime, $info);
		// Compare $starttime with $endtime
		if($start<=$end){
			if($info == true){
				echo "OK: Starttime is before endtime. </br>";
			}
			return true;
		}
		if($info == true){
			echo "Error: Starttime must be earlier then endtime! </br>";
		}
		throw new Exception('Starttime needs to be before endtime!');
		return false;
	}

	/*
	Creates a timestamp from a string.
	The function expects an envirocar properties time value (Example: "2014-01-06T17:41:50Z")
	or a string like this: "2014-01-06 17:41:50"
	*/
	function createTimestamp($timeString, $info = false){
		if($info == true){
			echo "<u> function createTimestamp() </u> </br>"; // Infoprint for testing
		}
		// Check if it is an envirocar time
		if(substr($timeString, -1)=="Z"){
			// delete the letters T and Z
			$timeString = str_replace("T", " ", $timeString);
			$timeString = str_replace("Z", "", $timeString);
			if($info == true){
				echo "Envirocar timestamp changed. New String: " . $timeString . "</br>";
			}
		}
		// Create the timestamp from the string
		$timestamp = strtotime($timeString); 
		if($info == true){
			echo "The Timestamp is: " . $timestamp . "</br>";
		}
		return $timestamp;
	}

	/*
	Get weekday from timestring (first 2 letters)
	The format of the possible results is: MO, TU, WE, TH, FR, SA, SU
	*/
	function getWeekday ($timeString, $info = false){
		if($info == true){
			echo "<u> function getWeekday() </u> </br>"; // Infoprint for testing
		}
		// Create timestamp
		$timestamp = $this->createTimestamp($timeString, $info);
		// Get the weekday
		$weekday = date('D', $timestamp);
		//$weekday = $date["wday"];
		if($info == true){
			echo "The weekday is: " . $weekday . "</br>";
		}
		// The result must be the first 2 letters in uppercase
		$resultWeekday = strtoupper(substr($weekday, 0, 2));
		if($info == true){
			echo "The first 2 letters of the weekday are: " . $resultWeekday . "</br>";
		}
		return $resultWeekday;
	}


	/*
	Check if the $timeString is matches a specific $weekday.
	The $weekday format must be one of the following: MO, TU, WE, TH, FR, SA, SU
	Returns true if the $timeString matches the $weekday.
	*/
	function checkDay ($timeString, $weekday, $info = false){
		if($info == true){
			echo "<u> function checkDay() </u> </br>"; // Infoprint for testing
		}
		// Get the weekday from the $timeString
		$weekdayFromString = $this->getWeekday($timeString, $info);
		// Ensure that the $weekday is uppercase
		$weekday = strtoupper($weekday);
		if($weekdayFromString == $weekday){
			if($info == true){
				echo "The timeString weekday $weekdayFromString matches the weekday ($weekday)!</br>";
			}
			return true;
		}
		if($info == true){
			echo "The timeString weekday $weekdayFromString does not match the weekday ($weekday)!</br>";
		}
		return false;
	}

	/*
	Check if point is in the time interval.
	A point is a feature from the envirocar request result.
	$starttime and $endtime are strings like they are needed for createTimestamp().
	Returns true if the points timestamp is >= $starttime and <= $endtime.
	*/
	function pointInTimeinterval($point, $starttime, $endtime, $info = false) {
		try{
			if($info == true){
				echo "<u> function pointInTimeinterval() </u> </br>"; // Infoprint for testing
			}
			// Check if the time interval is correct
			$this->checkTimeLogic($starttime, $endtime, $info);
			// Get the timestamp from a point (properties from feature)
			$pointTime = $point["timestamp"];
			$pointTimestamp = $this->createTimestamp($pointTime, $info);
			// Get the timestamps from start and end
			$startTimestamp = $this->createTimestamp($starttime, $info);
			$endTimestamp = $this->createTimestamp($endtime, $info);
			// Check if the point is in the interval
			if($pointTimestamp >= $startTimestamp && $pointTimestamp <= $endTimestamp){
				if($info == true){
					echo "The points timestamp ( $pointTime ) is inside the time interval [starttime ( $starttime ) - endtime( $endtime )]";
				}
				return true;
			}
			// Point outside the timeinterval
			if($info == true){
				echo "The points timestamp ( $pointTime ) is outside time interval [starttime ( $starttime ) - endtime( $endtime )]";
			}
			return false;
		}
		// Catch exception (starttime is after endtime)
		catch (Exception $e) {
			$exceptionString = 'Caught exception: '.$e->getMessage();
			// A message-box with the exception will pop up
			echo "<script type=\"text/javascript\" language=\"Javascript\">  
			alert(\"$exceptionString\")
			</script>";
			exit; // The program will be terminated
		}
	}

	/*
	Gets the points from the jsonTrack ( with the envirocar-query format: {tracks:[{},{},...]} )
	Checks if the points are in the given time interval using the pointInTimeinterval() function.
	Can also check specific weekdays with the 
	Returns just the points that are in the time interval ( in the envirocar-query format: {tracks:[{},{},...]} )
	*/
	function runTimeFilter ($jsonTracks, $starttime, $endtime, $weekday = null, $info = false) {
		if ($info == true){
			echo "<u> function runTimeFilter() </u> </br> Logging for time filtering enabled: </br>"; // Infoprint for testing
		}
		$decodedTracks = json_decode($jsonTracks, true); // Decode tracks
		// Search every track
		$trackIndexCounter = 0;
		foreach ($decodedTracks["tracks"] as $track){
			$pointIndexCounter = 0;
			// Search every point inside the track
			foreach ($track["features"] as $feature){
				// Get the timestring from the point
				$timeString = $feature["properties"]["time"];
				// Check if $weekday is set.
				$weekdayBoolean = true; // true = matches the searched weekday
				if(!is_null($weekday)){
					// Check if the points weekday matches the searched $weekday
					$weekdayBoolean = $this->checkDay($timeString, $weekday, $info); // Sets the weekdayBoolean
				}
				// Create a point with the timestamp as attribute
				$point = array("timestamp"=>$timeString);
				// Check if the points timestamp is in the time interval or the weekday is the searched $weekday.
				if(!$weekdayBoolean || !$this->pointInTimeinterval($point, $starttime, $endtime, $info)){
					// Delete the feature that does not match the filter
					unset($decodedTracks["tracks"][$trackIndexCounter]["features"][$pointIndexCounter]);
					if ($info == true){
						echo "Point has been deleted! </br>"; // Infoprint for testing
					}
				} else {
					if ($info == true){
						echo "Point matches the filter criteria! </br>"; // Infoprint for testing
					}
				}
				$pointIndexCounter++;
			}
			$trackIndexCounter++;
		}
		$encodedTracks = json_encode($decodedTracks); // encode again
		// Just return the points in the polygon
		return $encodedTracks;
	}
	
	/*
	This function can be used to create the URL for the envirocar request.
	$starttime and $endtime must be in the following format: "2014-01-06 17:41:50"
	Returns an URL like this: "https://envirocar.org/api/stable/tracks?contains=2014-01-10T18:44:40Z,2014-01-10T16:19:02Z"
	This can be used for prefiltering.
	*/
	function getTimeintervalURL($starttime, $endtime, $info = false){
		if($info == true){
			echo "<u> function getTimeintervalURL() </u> </br>"; // Infoprint for testing
		}
		// Edit the timestamp format
		$start = substr(trim($starttime), 0, 10)."T".substr(trim($starttime),-8, 8)."Z";
		$end = substr(trim($endtime), 0, 10)."T".substr(trim($endtime),-8, 8)."Z";
		$timeURL = "https://envirocar.org/api/stable/tracks?contains=".$end.",".$start;
		if($info == true){
			echo "The URL to request the time interval is: $timeURL </br>"; // Infoprint for testing
		}
		return $timeURL;
	}

} // End of class
?>