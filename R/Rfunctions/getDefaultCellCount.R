
###
#
# Description: Function to provide a default number of aggregation cells
#   for one specified side (normally the larger side) of the requested
#   bounding box. 
#   The default number of cells provides a standardized raster 
#   dimension (at least in one direction) for the output in the
#   standard aggregation mode ("Standardmodus").
#   The default number of aggregation cells may be set by changing the
#   value inside this function.
#
# @author : Roland Harhoff
#
# @return defCellCount : integer, number of cells on larger side of the bbox
#
# Required packages:
# require(futile.logger)
#
###

getDefaultCellCount <- function(){
  
  # Define the default number of aggregation cells for one row or column
  defCellCount <- 20
  
  require(futile.logger)
  flog.info("getDefaultCellCount() function is running. defCellCount is %s", defCellCount)
  
  # Return the default number of aggregation cells
  defCellCount
  
}
