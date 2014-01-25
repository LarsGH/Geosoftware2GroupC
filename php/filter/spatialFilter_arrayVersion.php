<?php
// @author Lars Syfuß
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
			// Check if the polygon is closed
			$this->checkPolygon($vertices);
			$status; // Info-String for testing (just enabled if $info = true)
			
			// Count the intersections
			$intersections = 0; 
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
						$status = "Inside (Boundary)"; // Infoprint for testing
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
							$status =  "Inside (Boundary)"; // Infoprint for testing
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
		// Catch exception (poygon not closed)
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
	Checks if the points are in the given polygon
	Returns just the points that are in the polygon
	*/
	function runSpatialFilter ($points, $polygon, $info = false) {
		if ($info == true){
			echo "Logging for spatial filtering enabled: </br>";
		}
		$resultPoints = array(); // Stores the points in the polygon
		foreach($points as $key => $point){
			if($this->pointInPolygon($point, $polygon, $info)){
				array_push($resultPoints, $point); // Add the point to the result-array
			}
		}
		// Just return the points in the polygon
		return $resultPoints;
	}
	
	/*
	Check if the polygon is closed and has at least 3 points. Throws an Exception otherwise.
	The polygon has to be an array like this: 
		array("lon"=>lonCoord, "lat"=>latCoord)
	*/
	function checkPolygon ($polygon){
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
	Get the track-IDs from the points.
	Works with runSpatialFilter() as parameter to get the tracks inside a polygon.
	*/
	function getTracks ($points){
		$resultTracks = array(); // stores the track-IDs from the delivered points
		foreach($points as $key => $point){
			// Check if the points track exists in the result-array and adds it if it does not exist
			if(!in_array($point['track'] , $resultTracks)){
				array_push($resultTracks, $point['track']); // Add the track-ID to the result-array
			}
		}
		return $resultTracks;
	}
	
	/*
	Get a boundigbox-array from the given polygon for pre-filtering.
	The returned array has the following format: minx,miny,maxx,maxy.
	*/
	function getBBox ($polygon){
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
		// return the result array
		return array("minX" => $minX, "minY" => $minY, "maxX" => $maxX, "maxY" => $maxY);
	}
	
	/*
	Create boundigbox-url (for the envirocar-API) from a bbox coordinate array.
	This can be used for pre-filtering.
	The array has to have the following format: minx,miny,maxx,maxy.
	*/
	function getBBoxURL($bbox){
			$bboxURL = "https://envirocar.org/api/stable/tracks?bbox=";
		$minX=$bbox['minX'];
			$bboxURL .= $minX.",";
		$minY=$bbox['minY'];
			$bboxURL .= $minY.",";
		$maxX=$bbox['maxX'];
			$bboxURL .= $maxX.",";
		$maxY=$bbox['maxY'];
			$bboxURL .= $maxY;
		return $bboxURL;
	}
	
} // End of class
?>