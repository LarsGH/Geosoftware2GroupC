
###
#
# Description: Function that calculates the (approximated) size (meter)
#   of a given bounding box with coordinates in longitude and latitude.
#   The calculated bbox size is used to ...
#   a) ... determine that side of the bbox which has the larger extent in meter.
#   b) ... provide a regular raster build of (approximated) quadratic cells.
#   c) ... calculate the extent of the resulting raster cells in meter.
#
# @author : Roland Harhoff
#
# @param bb : Bounding Box, 2x2 matrix filled with lowerLeftX, upperRigthX,
#   lowerLeftY, upperRightY (by row)
#
# @return bboxSize : vector of length two, containing the x- and y-length
#
# # Required packages:
# require(futile.logger)
# require(sp)
#
###

calcBBoxSideLength <- function(bb){
  
  require(futile.logger)
  flog.info("calcBBoxSideLength starts ...")
  
  llx <- bb[1,1]
  lly <- bb[2,1]
  urx <- bb[1,2]
  ury <- bb[2,2]
  
  
  # Calculate average x-Length of the given bbox in meter
  middleY <- (lly+ury)/2
  
  px1 <- c(llx,middleY)
  mpx1 <- matrix(px1, ncol=2)
  px2 <- c(urx,middleY)
  mpx2 <- matrix(px2, ncol=2)
  
  require(sp)
  lengthSideX <- spDistsN1(mpx1, mpx2, longlat = TRUE)*1000
  #flog.info("BBoxSideLength for x is %s meter", round(lengthSideX))

  
  # Calculate average y-Length of the given bbox in meter
  middleX <- (llx+urx)/2
  
  py1 <- c(middleX, lly)
  mpy1 <- matrix(py1, ncol=2)
  py2 <- c(middleX, ury)
  mpy2 <- matrix(py2, ncol=2)
  
  lengthSideY <- spDistsN1(mpy1, mpy2, longlat = TRUE)*1000
  #flog.info("BBoxSideLength for y is %s meter", round(lengthSideY))
  
  
  # Return the values
  bboxSize <- c(lengthSideX, lengthSideY)
  flog.info("calcBBoxSideLength finished successfully.#")
  bboxSize
  
}
