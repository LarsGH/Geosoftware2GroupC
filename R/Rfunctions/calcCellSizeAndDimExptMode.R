
###
#
# Description: Function to calculate the requested cell size and dimension of the
#   aggregation grid / raster in the expert mode. The function checks if the
#   requested cell size is zero, too large or too small and adjusts the size
#   if needed.
#
# @author : Roland Harhoff
#
# @param bb_wgs : Bounding Box, 2x2 matrix filled with lowerLeftX, upperRigthX,
#   lowerLeftY, upperRightY (by row) (CRS: WGS84)
# @param : cellSizeX_Meter, integer defining the requested width of the aggregation cells (meter)
# @param : cellSizeY_Meter, integer defining the requested height of the aggregation cells (meter)
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

calcCellSizeAndDimExptMode <- function(bb_wgs, cellSizeX_Meter, cellSizeY_Meter){

  # Logging
  require(futile.logger)
  flog.info("calcCellSizeAndDimExptMode function starts...")

  # Character object representing the mode in which the (following) code - in which 
  # the calcCellSizeAndDimDefault(...) function might be called  - will be processed.
  aggMode <- "Expertenmodus"
  
  # Check if the requested cell size contains zero.
  if(cellSizeX_Meter == 0 | cellSizeY_Meter == 0){
    
    flog.warn("calcCellSizeAndDimExptMode: Requested cell width or height is zero. 
              --> Default function will be called.")
    
    # If the requested cell size contains zero the default function to calculate
    # the cell size and dimension will be called with the default cell count
    # as one of the arguments.
    defCount <- getDefaultCellCount()
    
    # Providing a comment that explains the situation and will be used in the plot.
    comment <- "Hinweis: Angegebene Zellenbreite und/oder -höhe war Null. Zellen nach Standardmodus berechnet."
    
    # Call the default calculation function.
    paramList <- calcCellSizeAndDimDefault(bb_wgs, defCount)
    
  }else{
    
    # The requested cell size does not contain zero...
    
    bbSizeMeter <- calcBBoxSideLength(bb_wgs) 
    
    bbMeterLengthX <- bbSizeMeter[1]
    bbMeterHeightY <- bbSizeMeter[2]
    
    # Calculate the (requested) grid dimensions according to the requested
    # cell size. "Ceiling" is used to avoid dim == 0.
    gridDimX <- ceiling(bbMeterLengthX/abs(cellSizeX_Meter))
    gridDimY <- ceiling(bbMeterHeightY/abs(cellSizeY_Meter))
    
    # Calculate the cell sum of the requested grid
    cellsum <- gridDimX*gridDimY
  
    # Check if the cell sum is one.
    if(cellsum == 1){
      
      flog.warn("calcCellSizeAndDimExptMode: Resulting cell sum would be one. 
                --> Default function will be called with defaultCellCount == 2.")
      
      # If the requested cell sum is one the default function to calculate cell size
      # and dimension will be called with a cell count of two,
      # because we want to provide al least two aggregation cells.
      cellCnt <- 2
      
      # Providing a comment that explains the situation and will be used in the plot.
      comment <- paste("Hinweis: Die angegebene Zellengröße von ", format(abs(cellSizeX_Meter), sci=F), " x ", format(abs(cellSizeY_Meter), sci=F),
                       " Metern war zu groß.\nMinimum sind 2 Zellen. Die Zellengröße wurde angepasst.", sep="")
      
      # Call the default calculation function.
      paramList <- calcCellSizeAndDimDefault(bb_wgs, cellCnt)
    
    }else{
      
      # If the cell sum is not one...
      
      # Define a maximum cell sum with respect to performance issues.
      maxCellSum <- 12000
      
      # Check if the requested cell sum is larger than the maximum cell sum.
      if(cellsum > maxCellSum){
        
        # If the requested cell sum is larger than the maximum cell sum
        # the grid cell size and dimension will be recalculated.
        
        flog.warn("calcCellSizeAndDimExptMode: Requested cell size is too small. 
                  --> Cell size will be adjusted.")
        
        # Providing a comment that explains the situation and will be used in the plot.
        comment <- paste("Hinweis: Die angegebene Zellengröße von ", abs(cellSizeX_Meter), " x ", abs(cellSizeY_Meter),
                         " Metern war zu klein.\nMaximum sind insgesamt ", maxCellSum, " Zellen. Die Zellen wurden vergrößert.", sep="")
        
        # Recalculate the grid cell size and dimension as long
        # as the cell sum is larger than the maximum cell sum
        while(cellsum > maxCellSum){
          
          # Simply increase the requested grid cell size
          # but keep the ratio of the side length.
          cellSizeX_Meter <- abs(cellSizeX_Meter) * 3
          cellSizeY_Meter <- abs(cellSizeY_Meter) * 3
          
          # Calculate the new grid dimension.
          gridDimX <- ceiling(bbMeterLengthX/cellSizeX_Meter)
          gridDimY <- ceiling(bbMeterHeightY/cellSizeY_Meter)
          
          # Recalculate the cell sum.
          cellsum <- gridDimX * gridDimY
        }
        
        # Calculate the final resulting grid cell size.
        csizeX_Meter <- round(bbMeterLengthX/gridDimX)
        csizeY_Meter <- round(bbMeterHeightY/gridDimY)
        
	      # Create return list with named elements
        paramList <- list(sizeX = csizeX_Meter, sizeY = csizeY_Meter, dimX = gridDimX, dimY = gridDimY, modus = NULL, com = NULL)
        
      }else{
        
        # The requested cell sum is smaller than the maximum cell sum.
        
        flog.info("calcCellSizeAndDimExptMode: Requested cell size is ok.")
        
        # Calculate the final resulting grid cell size.
        csizeX_Meter <- round(bbMeterLengthX/gridDimX)
        csizeY_Meter <- round(bbMeterHeightY/gridDimY)
        
        # Providing a comment that explains the situation and will be used in the plot.
        comment <- paste("Umgesetzte Zellengröße weicht (i.d.R.) leicht von gewünschter Größe (",
                         abs(cellSizeX_Meter), " x ", abs(cellSizeY_Meter)," m) ab.", sep="")
        
	      # Create return list with named elements
        paramList <- list(sizeX = csizeX_Meter, sizeY = csizeY_Meter, dimX = gridDimX, dimY = gridDimY, modus = NULL, com = NULL)
            
      }
    }
  }
  
  # Finally assign values to the named list elements 'modus'
  paramList$modus <- aggMode
  # ... and 'com'
  paramList$com <- comment
  
  flog.info("calcCellSizeAndDimExptMode function finished.#")
  
  # Output
  paramList
  
}
