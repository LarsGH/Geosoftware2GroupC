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
					//			y1							*							inclination								+	V1.lon
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
	Check if the polygon is closed. Throws an Exception if the polygon is not closed.
	The polygon has to be an array like this: 
		array("lon"=>lonCoord, "lat"=>latCoord)
	*/
	function checkPolygon ($polygon){
		$vertices_count = count($polygon); // Get number of vertices
		if($polygon[0]!=$polygon[$vertices_count-1]){ // Compare first and last point
			throw new Exception('Polygon not closed!');
		}
	}
	
} // End of class
?>