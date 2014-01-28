<?php
/*
@author Lars Syfuß
*/

class spatialFilter {
 
	/*
	Checks if a point is inside the given polygon
	The point is a single point
	The polygon needs to be an array with lon and lat-coordinates like this:
		array("lon"=>lonCoord, "lat"=>latCoord)
	Infoprints can be enabled with the info parameter (default = false)
	*/
	function pointInPolygon($point, $vertices, $info = false) {
		try{
			if($info == true){
				echo "<u> function pointInPolygon() </u> </br>"; // Infoprint for testing
			}
			// Check if the polygon is closed
			$this->checkPolygon($vertices);
			$status; // Info-String for testing (just enabled if $info = true)
			
			$intersections = 0; // Count the intersections
			$vertices_count = count($vertices); // Get the number of vertices
		
			// Check if the point is on a boundary or inside the polygon
			for ($i=1; $i < $vertices_count; $i++) {
				$vertex1 = $vertices[$i-1]; 
				$vertex2 = $vertices[$i];
				// Check if point is on an horizontal polygon boundary (including vertices)
				if ($vertex1['lat'] == $vertex2['lat'] 
				and $vertex1['lat'] == $point['lat'] 
				and $point['lon'] >= min($vertex1['lon'], $vertex2['lon']) 
				and $point['lon'] <= max($vertex1['lon'], $vertex2['lon'])) {
					if($info == true){
						$status = "Inside (on Boundary)"; // Infoprint for testing
						echo "<ul>Point " . " ( " . $point["lon"] . " / " . $point["lat"] . " ) <li>" . $status . "</li></ul>"; // Infoprint for testing
					}
					return true;
				}
				// Check if point is on any other polygon boundary
				if ($point['lat'] > min($vertex1['lat'], $vertex2['lat']) 
				and $point['lat'] <= max($vertex1['lat'], $vertex2['lat']) 
				and $point['lon'] <= max($vertex1['lon'], $vertex2['lon']) 
				and $vertex1['lat'] != $vertex2['lat']) { 
					// Check if the calculated lon-value of the point (xinters) is equal to the given lon value of the point
					$xinters = ($point['lat'] - $vertex1['lat']) * ($vertex2['lon'] - $vertex1['lon']) / ($vertex2['lat'] - $vertex1['lat']) + $vertex1['lon']; 
					//                         y1                *                              inclination                                  +    V1.lon
					if ($xinters == $point['lon']) { 
						if($info == true){
							$status =  "Inside (on Boundary)"; // Infoprint for testing
							echo "<ul>Point " . " ( " . $point["lon"] . " / " . $point["lat"] . " ) <li>" . $status . "</li></ul>"; // Infoprint for testing
						}
						return true;
					}
					if ($vertex1['lon'] == $vertex2['lon'] || $point['lon'] <= $xinters) {
						$intersections++; 
					}
				}
			}
		
			// If the number of passed edges is odd the point is in the polygon
			if ($intersections % 2 != 0) { // Inside the polygon
				if($info == true){
					$status =  "Inside"; // Infoprint for testing
					echo "<ul>Point " . " ( " . $point["lon"] . " / " . $point["lat"] . " ) <li>" . $status . "</li></ul>"; // Infoprint for testing
				}
				return true;
			} else { // Outside the polygon
				if($info == true){
					$status =  "Outside"; // Infoprint for testing
					echo "<ul>Point " . " ( " . $point["lon"] . " / " . $point["lat"] . " ) <li>" . $status . "</li></ul>"; // Infoprint for testing
				}
				return false;
			}	
		}
		// Catch exception (poygon not closed or less then 3 vertices)
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
	Checks if the points are in the given polygon using the pointInPolygon() function
	Returns just the points that are in the polygon ( in the envirocar-query format: {tracks:[{},{},...]} )
	*/
	function runSpatialFilter ($jsonTracks, $polygon, $info = false) {
		if ($info == true){
			echo "<u> function runSpatialFilter() </u> </br> Logging for spatial filtering enabled: </br>";
		}
		$decodedTracks = json_decode($jsonTracks, true); // decode tracks
		// search every track
		$trackIndexCounter = 0;
		foreach ($decodedTracks["tracks"] as $track){
			$pointIndexCounter = 0;
			// search every point inside the track
			foreach ($track["features"] as $feature){
				$lon = $feature["geometry"]["coordinates"][0]; // get lon
				$lat = $feature["geometry"]["coordinates"][1]; // get lat
				$point = array("lon"=>$lon, "lat"=>$lat); // create point to use pointInPolygon()
				if(!$this->pointInPolygon($point, $polygon, $info)){
					unset($decodedTracks["tracks"][$trackIndexCounter]["features"][$pointIndexCounter]); // delete the feature that does not match the filter
					if ($info == true){
						echo "Point has been deleted! </br>"; // Infoprint for testing
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
	Check if the polygon is closed and has at least 3 points. Throws an Exception otherwise.
	The polygon has to be an array of points like this: 
		array("lon"=>lonCoord, "lat"=>latCoord)
	*/
	function checkPolygon ($polygon, $info = false){
		if($info == true){
			echo "<u> function checkPolygon() </u> </br>"; // Infoprint for testing
		}
		$vertices_count = count($polygon); // Get number of vertices
		// Polygon needs at least 3 points (4 because first = last)
		if($vertices_count < 4){ 
			throw new Exception('Polygon needs at least 3 different points!');
		}
		// The first point needs to be equal to the last point
		if($polygon[0]!=$polygon[$vertices_count-1]){ 
			throw new Exception('Polygon not closed!');
		}
	}
	
	/*
	Get a boundingbox-array from the given polygon for pre-filtering.
	The returned array has the following format: minx,miny,maxx,maxy.
	*/
	function getBBox ($polygon, $info = false){
		if($info == true){
			echo "<u> function getBBox() </u> </br>"; // Infoprint for testing
		}
		$minX=$polygon[0]['lon'];
		$minY=$polygon[0]['lat'];
		$maxX=$polygon[0]['lon'];
		$maxY=$polygon[0]['lat'];
		foreach($polygon as $key => $point){
			// Set the lon value to the new minX if it is smaller then the current minX.
			if($point['lon']<$minX){
				$minX=$point['lon'];
			}
			// Set the lon value to the new maxX if it is bigger then the current maxX.
			if($point['lon']>$maxX){
				$maxX=$point['lon'];
			}
			// Set the lat value to the new minY if it is smaller then the current minY.
			if($point['lat']<$minY){
				$minY=$point['lat'];
			}
			// Set the lat value to the new maxY if it is smaller then the current maxY.
			if($point['lat']>$maxY){
				$maxY=$point['lat'];
			}
		}
		$bbox = array("minX" => $minX, "minY" => $minY, "maxX" => $maxX, "maxY" => $maxY);
		if($info == true){
			echo "The boundingbox is: </br>"; // Infoprint for testing
			print_r($bbox);
			echo "</br>";
		}
		// return the result array
		return $bbox;
	}
	
	/*
	Create boundigbox-url (for the envirocar-API) from a bbox coordinate array.
	The array must have the following format: minx,miny,maxx,maxy.
	The $limit parameter can set the result-limit. To have a better performance this value is set to 15 by default.
	This function can be used for pre-filtering.
	*/
	function getBBoxURL($bbox, $limit = 15, $info = false){
		if($info == true){
			echo "<u> function getBBoxURL() </u> </br>"; // Infoprint for testing
		}
		
			$bboxURL = "https://envirocar.org/api/stable/tracks?limit=".$limit."&bbox=";
		$minX=$bbox['minX'];
			$bboxURL .= $minX.",";
		$minY=$bbox['minY'];
			$bboxURL .= $minY.",";
		$maxX=$bbox['maxX'];
			$bboxURL .= $maxX.",";
		$maxY=$bbox['maxY'];
			$bboxURL .= $maxY;
		if($info == true){
			echo "The URL to request the boundingbox is: $bboxURL </br>"; // Infoprint for testing
		}
		return $bboxURL;
	}
	
} // End of class
?>