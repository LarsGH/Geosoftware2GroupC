
###
#
# Description: This is the main function for the aggregation process.
#   The function controls the whole process, calls in the end
#   the rasterizeAndPlot() function and returns the resulting plot.
#
# @author : Roland Harhoff
#
# @param attributeO : character, original variable name of the requested attribute.
# @param statistic : character, the german name for the requested statistic that should be
#   used for the aggregation process, e.g. "Mittelwert" for 'mean'.
# @param lx : integer, representing the width of the requested aggregation cell size (meter)
# @param ly : integer, representing the height of the requested aggregation cell size (meter)
# @param mode : boolean, indicating the mode to be used:
#   FALSE == Standardmode, TRUE == Expertmode
# @param bool : boolean, indicating if the measurement points should be plotted in addition
#   to the aggregation raster.
# @param layerJSON : list, containing the data to be analysed. The was created by the
#   fromJSON function (package 'rjson').
#
# @return : a plot created by spplot()
#
# Required packages 
# require(futile.logger)
#
# Check the documentation for a list of all required add-on packages for this application.
#
###

aggregationMain <- function(attributeO, statistic, lx, ly, mode, bool, layerJSON){

  # Logging
  require(futile.logger)
  flog.info("Aggregation function (Expertmode == %s) starts...", mode)

  # Create a SpatialPointsDataFrame from the data,
  # or - if there are no features in the tracks - assign NULL.
  spdf_wgs <- readAndMergeTrackListToSPDF(layerJSON, attributeO)

  # Check if the SpatialPointsDataFrame is NULL.
  # If not...
  if(!is.null(spdf_wgs)){
    
    # Rename requested attribute according to (legal) variable names encoding in R code.
    attribute <- gsub(" ", ".", attributeO)
    
    # Create an index vector indicating if the attribute value is NA.
    naIndexVec <- is.na(spdf_wgs[[attribute]])
    
    # Check if attribute values are available.
    if(FALSE %in% naIndexVec){
      
      # Get the Bounding Box of the SpatialPointsDataFrame.
      bb_wgs <- bbox(spdf_wgs)
      
      # Try to get a background map. 
      myMap <- getBackgroundMap(bb_wgs)
      
      # Calculate plotting parameters for the background map.
      bgmapParam <- calcBgMapPlotParam(myMap)
  
      # Calculate aggregation raster parameter (cell size, dimension, ...) according
      # to the requested aggregation mode (Standard vs. Expert).
      ifelse(mode == F, 
             rasterParam <- calcCellSizeAndDimStdMode(bb_wgs),
             rasterParam <- calcCellSizeAndDimExptMode(bb_wgs, lx, ly))

      # Run the rasterizeAndPlot function.
      rasterizeAndPlot(spdf_wgs, attribute, statistic, myMap, rasterParam, bool, bgmapParam)
      
      flog.info("Aggregation in %s run successfully.", rasterParam$modus)
      
    }else{
      flog.warn("Keine Messwerte verfügbar!\n")
      flog.warn("Aggregation abgebrochen!\n")
    }
  }else{
    flog.warn("Keine Beobachtungen ausgewählt!\n")
    flog.warn("Aggregation abgebrochen!\n")
  }
  flog.info(" ### Aggregation function (Expertmode == %s) finished! ###", mode)
}