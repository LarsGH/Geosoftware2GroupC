
###
#
# Description: Function that starts to process the calculation of
#   the cell size and the dimension in the standard mode by calling
#   the function calcCellSizeAndDimDefault() with the bbox and the default
#   cell count. The output of calcCellSizeAndDimDefault() is a
#   list with named elements, and the values of the elements 'modus'
#   and 'com' will be filled by this function.
#   'modus' characterises the mode of the aggregation (standard vs. expert),
#   and 'com' contains a comment about the aggregation.
#   If the standard mode is used, the comment will be empty.
#
# @author : Roland Harhoff
#
# @param bb_wgs : Bounding Box, 2x2 matrix filled with lowerLeftX, upperRigthX,
#   lowerLeftY, upperRightY (by row) (CRS: WGS84)
#
# @return paramList : List containing the named parameters cell size, grid dimension,
#   aggregation mode and a comment according to the resulting grid.
#   list(sizeX = csizeX_Meter, sizeY = csizeY_Meter, dimX = gridDimX, dimY = gridDimY,
#     modus = aggMode, com = comment) 
#
# Required packages
# require(futile.logger)
#
###

calcCellSizeAndDimStdMode <- function(bb_wgs){

  # Logging
  require(futile.logger)
  flog.info("calcCellSizeAndDimStdMode function starts...")
  
  # Get defaultCellCount to define the number of cells along the larger
  # side of the bbox
  defaultCellCount <- getDefaultCellCount()

  # Character object representing the mode in which the (following) function 
  # calcCellSizeAndDimDefault(...) will be processed.
  aggMode <- "Standardmodus"
  
  # An optional comment that just will be used in other cases (expert mode)
  # to provide additional information about the situation in which the
  # (following) function calcCellSizeAndDimDefault(...) will called.
  # These information will be used in the resulting aggregation plot
  # and in the standard mode there is no additional information needed.
  comment <- ""
  
  # Call the default function to calculate the cell size and dimension
  paramList <- calcCellSizeAndDimDefault(bb_wgs, defaultCellCount)
  
  # Assign values to the named list elements 'modus'
  paramList$modus <- aggMode
  # ... and 'com'
  paramList$com <- comment
  
  flog.info("calcCellSizeAndDimStdMode function finished.#")
  
  # Output
  paramList

}
