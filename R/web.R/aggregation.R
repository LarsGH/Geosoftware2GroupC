
###
#
# Description: Function that will be run by FastRWeb. This function calls the
#   aggregationMain() function, saves the plot output to a png-file with random name
#   and returns the filename (with path) of the png-file.
#
# @author : Roland Harhoff
#
# @return filenameWithExt : a string (character) which represents the random filename
#   together with the .png extension which is used to save the plot.
#   This filename will be send to the frontend to load the plot.
#
# Required packages
# require(rjson)
# require(Cairo)
#
###

run <- function(...) {
  
  # Read the data from the request body posted by the frontend to a list of lists.
  require(rjson)	 
  data <- fromJSON(rawToChar(request$body, multiple=FALSE))
    
  # Retrieve the values from the list an create R objects
  
  # Requested attribute - character
  attributeO <- data[["phenomenon"]]
  
  # Requested statistic / aggregation function - character
  statistic <- data[["statistic"]]
  
  # Requested aggregation cell size - integer
  lx <- data[["x_cell"]]
  ly <- data[["y_cell"]]
  
  # Requested mode - boolean
  mode <- data[["mode"]]
  
  # Plotting points? - boolean
  points <- data[["points"]]
  
  # Requested track data - list
  layerJSON <- list(data[["tracks"]])
  names(layerJSON) <- "tracks"    
    
  # Create a random filename
  randomChar <- createRandomString(14)
	filenameWithExt <- paste(randomChar, ".png", sep="")
  path <- "/var/www/img/r/"
  pathWithFilename <- paste(path,filenameWithExt,sep="")
  
  # Open a graphics device
  require(Cairo)
  Cairo(file = pathWithFilename, width = 960, height = 960)
    
  # Run the aggregationMain() function that returns a plot
	aggregationMain(attributeO, statistic, lx, ly, mode, points, layerJSON)
    
  # Close the gaphics device
  dev.off()

  # Return the filename
  filenameWithExt

}
