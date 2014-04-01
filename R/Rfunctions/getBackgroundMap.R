
###
#
# Description: Function to request a (background) map from google / OSM, 
#   which is suitable for the given bounding box. Because the spatial 
#   extent of the map respects only approximately the given bounding 
#   box (Warning), the bounding box for the map request will be 
#   stepwise extended.
#
# @author : Roland Harhoff
#
# @param bb_wgs : Bounding Box, 2x2 matrix filled with lowerLeftX, upperRigthX,
#   lowerLeftY, upperRightY (by row) (CRS: WGS84)
#
# @return myMap : ggmap object, a map represented by a data.frame with attributes
#
# Required packages:
# require(futile.logger)
# require(ggmap)
#
###

getBackgroundMap <- function(bb_wgs){
  
  # Logging
  require(futile.logger)
  flog.info("getBackgroundMap function starts...")
  
  # Try to query the server for a map with a suitable extent.
  out <- tryCatch(
    {
    
    # Calculate the size of the bounding box
    bbSizeMeter <- calcBBoxSideLength(bb_wgs) 
    
    bbr1 <- bb_wgs[1,]
    bbr2 <- bb_wgs[2,]
    bbc1 <- bb_wgs[,1]
    bbc2 <- bb_wgs[,2]
    
    bb_wgs_extended <- bb_wgs
    
    # Check if the length of the bbox sides are very different,
    # because that supports the problem that the map extent might be
    # to small (Warning).
    if((min(bbSizeMeter)/max(bbSizeMeter)) > 0.5){
      
      # If the side length are quiet similar (ratio > 0.5)
      # just extend the bbox a little bit (~ doubled side length).
      d <- c(diff(bbr1)*0.55,diff(bbr2)*0.55)
      bb_wgs_extended[,1] <- bbc1 - d
      bb_wgs_extended[,2] <- bbc2 + d

    }else{
      
      # If the side length are very different (ratio < 0.5)
      # extend the bbox by a huge extent.
      d <- c(diff(bbr1)*1.55,diff(bbr2)*1.55)
      bb_wgs_extended[,1] <- bbc1 - d
      bb_wgs_extended[,2] <- bbc2 + d

    }
    
    # Get the map from the server
    require(ggmap)
    myMap <- get_map(location = as.vector(bb_wgs_extended), maptype = 'roadmap', color="bw")
    
    if (!is.null(myMap)){
      
      # Get the bbox of the map
      bb <- attr(myMap, "bb")
      flog.info("myMap bbox is: %s", bb)
      
      # Check if the map bbox covers the whole plot area (= bbox of the SpatialPointsDataFrame).
      # This test might be negative in the case that one side of the original data bbox is
      # much larger in extent than the other side.
      while(bb_wgs[1,1] < bb[[2]] | bb_wgs[2,1] < bb[[1]] | bb_wgs[1,2] > bb[[4]] | bb_wgs[2,2] > bb[[3]]){
        
        # While the map bbox extent is smaller than the extent to be ploted
        # the size of the bbox for the map request will be extended and a new 
        # request will be send to the server.
        flog.info("!!! Background map will be requested AGAIN!")
        d2 <- c(diff(bb_wgs_extended[1,])*0.5,diff(bb_wgs_extended[2,])*0.5)
        bb_wgs_extended[,1] <- bb_wgs_extended[,1] - d2
        bb_wgs_extended[,2] <- bb_wgs_extended[,2] + d2
        myMap <- get_map(location = as.vector(bb_wgs_extended), maptype = 'roadmap', color="bw")
        bb <- attr(myMap, "bb")

      }
    }

    flog.info("Background map try block ended.")
    myMap

  },
                  
  error=function(cond) {
    message("URL for background map does not seem to respond!")
    message("NULL will be returned!")
    message("Here's the original error message:")
    message(cond)
    return(NULL)
  },
                  
  finally={
    message("\n getBackgroundMap processed!")
  })
  
  flog.info("getBackgroundMap function finished.#")
  return(out)

}
