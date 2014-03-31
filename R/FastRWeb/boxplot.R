
###
#
# Description: Function that will be run by FastRWeb. This function calls the
#   boxplotMain() function and saves the boxplot output to a png-file.
#
# @author : Roland Harhoff
#
# @return filenameWithPNGExt : a string (character) which represents the random filename
#   together with the .png extension which is used to save the plot.
#   This filename will be send to the frontend to load the plot.
#
# Required packages
# require(rjson)
# require(Cairo)
#
###

run <- function(...) {
  
  # Read the data from the request body posted by the frontend
  require(rjson)   
  data <- fromJSON(rawToChar(request$body, multiple=FALSE))
  
  # Adjust the data structure
  layerJSON <- list(data[["tracks"]])
  names(layerJSON) <- "tracks"
  
  # Create a random filename
  randomChar <- createRandomString(14)
  filenameWithPNGExt <- paste(randomChar, ".png", sep="")
  path <- "/var/www/img/r/"
  pathWithFilename2 <- paste(path,filenameWithPNGExt,sep="")
  
  # Open a Cairo graphics device
  require(Cairo)
  Cairo(file = pathWithFilename2, width = 960, height = 960)
  
  # Set graphics parameter
  par(cex=1.15, las=1)
  
  # Run the boxplotMain() function that returns a plot
  boxplotMain(layerJSON)
  
  # Close the gaphics device
  dev.off()
  
  # Return the filename
  filenameWithPNGExt
  
}