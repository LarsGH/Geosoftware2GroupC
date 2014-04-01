
###
#
# Description: Function to calculate parameters which will be used to plot the 
#   background map in a suitable way (resp. centered in the plot area).
#
# @author : Roland Harhoff
#
# @param myMap : ggmap object, a map represented by a data.frame with attributes.
#
# @return bgmapParam : list containing relevant named parameters (latCenter, lonCenter,
#   height, width) for ploting the background map.
#
# Required packages
# require(futile.logger)
#
###

calcBgMapPlotParam <- function(myMap){
  
  # Logging
  require(futile.logger)
  flog.info("calcBgMapPlotParam function starts...")
  
  if (!is.null(myMap)){
    
    # Get the bbox of the map.
    bb_myMap <- attr(myMap, "bb")
    
    # Calculate latCenter, lonCenter, ... of the map.
    latCenter <- with(bb_myMap, ll.lat + ur.lat)/2
    lonCenter <- with(bb_myMap, ll.lon + ur.lon)/2
    height <- with(bb_myMap, ur.lat - ll.lat)
    width <- with(bb_myMap, ur.lon - ll.lon)
    
    # Create a list with the calculated named parameters
    bgmapParam <- list(longC = lonCenter, latC = latCenter, w = width, h = height)
    
  }else{
    
    # If the map is NULL the parameters will be NULL as well.
    bgmapParam <- NULL
    
  }

  flog.info("calcBgMapPlotParam function finished.#")
  bgmapParam

}
