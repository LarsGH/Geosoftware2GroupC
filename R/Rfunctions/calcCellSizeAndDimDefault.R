
###
#
# Description: Function to calculate cell size and dimension for the
#   (resulting) aggregation grid on basis of a given bounding box and 
#   a given number of cells for the larger side of the bbox.  
#   The function provides parameter to generate a grid / raster
#   built out of approximated quadratic cells. This function might be
#   called in the standard and in the expert mode.The list elements 'modus'
#   and 'com' will be filled with values by (an) other function(s).
#
# @author : Roland Harhoff
#
# @param bb_wgs : Bounding Box, 2x2 matrix filled with lowerLeftX, upperRigthX,
#   lowerLeftY, upperRightY (by row)
# @param cellCount : integer, number of cells on larger side of the bbox
#
# @return retList : list containing named parameters according to cell size and grid dimension
#   list(sizeX = csizeX_Meter, sizeY = csizeY_Meter, dimX = gridDimX, dimY = gridDimY,
#     modus = NULL, com = NULL)
#
# # Required packages:
# require(futile.logger)
#
###

calcCellSizeAndDimDefault <- function(bb_wgs, cellCount){
  
  # Logging
  require(futile.logger)
  flog.info("calcCellSizeAndDimDefault function starts...")
  
  # Calculate the size of the bounding box
  bbSizeMeter <- calcBBoxSideLength(bb_wgs) 
  
  bbMeterLengthX <- bbSizeMeter[1]
  bbMeterHeightY <- bbSizeMeter[2]
  
  if(bbMeterLengthX > bbMeterHeightY){
    
    # BBox width is bigger than bbox height.
    # Calculate the ratio of the bbox sides.
    ratioMeter <- bbMeterHeightY/bbMeterLengthX
    
    # Determine the grid dimension.
    gridDimX <- cellCount
    gridDimY <- ceiling(cellCount*ratioMeter)
    
  }else{
    
    # BBox width is bigger than bbox height.
    # Calculate the ratio of the bbox sides.
    ratioMeter <- bbMeterLengthX/bbMeterHeightY
    
    # Determine the grid dimension.
    gridDimX <- ceiling(cellCount*ratioMeter)
    gridDimY <- cellCount
    
  }
  
  # Calculate the approximated size of the grid cells
  csizeX_Meter <- round(bbMeterLengthX/gridDimX)
  csizeY_Meter <- round(bbMeterHeightY/gridDimY)
  
  # Create a list with named elements for output
  retList <- list(sizeX = csizeX_Meter, sizeY = csizeY_Meter, dimX = gridDimX, dimY = gridDimY, modus = NULL, com = NULL)
  
  flog.info("calcCellSizeAndDimDefault function finished.#")
  
  retList
  
}
