<?php
/*
@author Lars Syfuß
*/

// Use the spatialFilter.php
require("timeFilter.php");
require("filteroptions.php");

// create timeFilter
$timeFilter = new timeFilter();


// Test  createTimestamp()
echo "<b>Test  createTimestamp() </b></br>";
$testTimestamp = $timeFilter -> createTimestamp("2014-01-06T17:41:50Z", true);
echo "</br></br>";

// Test checkTimeLogic()
echo "<b>Test  checkTimeLogic() </b></br>";
$timeLogic = $timeFilter -> checkTimeLogic("2014-01-06T13:41:50Z", "2014-01-06T15:41:50Z", true);
/*
exception version (starttime after endtime): 
$timeLogic = $timeFilter -> checkTimeLogic("2014-01-06T17:41:50Z", "2014-01-06T15:41:50Z", true);
*/
echo "</br></br>";

// Test getWeekday()
echo "<b>Test  getWeekday() </b></br>";
$getWeekday = $timeFilter -> getWeekday("2014-01-27T17:41:50Z", true);
echo "</br></br>";

// Test checkDay()
echo "<b>Test  checkDay() </b></br>";
$checkDay = $timeFilter -> checkDay("2014-01-25T17:41:50Z", "sa", true);
echo "</br></br>";

// Test pointInTimeinterval()
echo "<b>Test  pointInTimeinterval() </b></br>";
$testPoint = array("timestamp" => "2014-01-10 16:19:02");
$pointInTimeinterval = $timeFilter -> pointInTimeinterval($testPoint, "2014-01-10 15:19:02", "2014-01-10 18:44:40", true);
/*
exception version (starttime after endtime): 
$pointInTimeinterval = $timeFilter -> pointInTimeinterval($testPoint, "2014-01-10 18:44:40", "2014-01-10 15:19:02", true);
*/
echo "</br></br>";

// Test getTimeintervalURL()
echo "<b>Test  getTimeintervalURL() </b></br>";
$exampleRequest = $timeFilter -> getTimeintervalURL("2014-01-10 16:19:02", "2014-01-10 18:44:40", 15, true);
echo "</br></br>";

// Test runTimeFilter()
$filteroptions = new filteroptions(); // Need filteroptions for prefiltering and creating the json file we need
$jsonTracks = $filteroptions -> createFilterTracks($exampleRequest);

echo "<b>Test  runTimeFilter() </b></br>";
$timeFilterResult = $timeFilter -> runTimeFilter($jsonTracks, "2014-01-10 15:19:02", "2014-01-10 17:44:40", "fr", true);
echo "</br> <b> timeFilterResult: </b> </br>";
print_r($timeFilterResult);
echo "</br></br>";
/*
exception version (starttime after endtime): 
$timeFilterResult = $timeFilter -> runTimeFilter($jsonTracks, "2014-01-10 18:44:40", "2014-01-10 16:19:02", true);
echo "</br> <b> timeFilterResult: </b> </br>";
print_r($timeFilterResult);
*/


?>