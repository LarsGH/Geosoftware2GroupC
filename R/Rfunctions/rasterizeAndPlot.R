
###
#
# Description: Function that runs the spatial aggregation of the 
#   requested phenomenon values according to the (optional) requested
#   aggregation grid characteristics by creating a SpatialGridDataFrame.
#   After the aggreation process the SpatialGridDataFrame will be plotted
#   by using the spplot() method.
#
# @author : Roland Harhoff
#
# @param spdf_wgs : SpatialPointsDataFrame, containing the requested phenomenon values.
# @param attribute : character, variable name (without blanks) of the requested attribute.
# @param statistic : character, the german name for the requested statistic that should be
#   used for the aggregation process, e.g. "Mittelwert" for 'mean'.
# @param myMap : ggmap object, a map represented by a data.frame with attributes,
#   returned from getBackgroundMap().
# @param rasterParam : List containing the named parameters cell size, grid dimension,
#   aggregation mode and a comment according to the resulting grid:
#   list(sizeX = csizeX_Meter, sizeY = csizeY_Meter, dimX = gridDimX, dimY = gridDimY,
#   modus = aggMode, com = comment).
# @param points : boolean, indicating if the measurement points should be plotted in addition
#   to the aggregation raster.
# @param bgmapParam : list containing relevant named parameters (latCenter, lonCenter,
#   height, width) for ploting the background map, returned from calcBgMapPlotParam().
#
# @return : a plot created by spplot()
#
# Required packages
# require(futile.logger)
# require(lattice)
# require(raster)
# require(sp)
# require(latticeExtra)
# The package 'latticeExtra' needs to be loaded after the ggmap package required 
# for the getBackgroundMap() function
#
###

rasterizeAndPlot <- function(spdf_wgs, attribute, statistic, myMap, rasterParam, points, bgmapParam){  
  
  # Logging
  require(futile.logger)
  flog.info("rasterizeAndPlot function starts...")
  flog.info("Background map available --> %s", !is.null(myMap))
  
  # Get the requested statistical aggregation function from the character object statistic.
  statFct <- switch(statistic, Mittelwert=mean, Maximum=max, Minimum=min, Median=median, Standardabweichung=sd)
  
  # Get the german phenomenon name.
  attributeG <- getGermanVariableName(attribute)
  
  # Create a raster layer using the calculated raster parameter (dimension).
  require(raster)
  rasterLay <- raster(spdf_wgs,ncols=rasterParam$dimX,nrows=rasterParam$dimY)

  # flog.info("rasterLayer created.")

  # Aggregate the data on basis of the raster layer and the aggregation function.
  # That populates the raster layer with values.
  rasterLayerWithAggData <- rasterize(spdf_wgs, rasterLay, spdf_wgs[[attribute]], fun=statFct)

  # flog.info("rasterLayerWithAggData created.")

  # Convert the raster layer to a SpatialGridDataFrame to be useable with spplot.
  require(sp)  
  spGridDF <- as(rasterLayerWithAggData, "SpatialGridDataFrame")

  flog.info("spGridDF created.")
  
  # Retrieve different parameters which will be used to provide information in the plot...
  # Get the number of tracks and measurement points and missing values.
  nmbrOfTracks <- nlevels(spdf_wgs$trackID)
  nmbrOfPoints <- length(spdf_wgs)

  # Create an index vector for values and missing values
  naIndexVec <- is.na(spdf_wgs[[attribute]])
  notNAIndexVec <- !naIndexVec
  
  # Create two subsets of the SpatialPointDataFrame to be plotted independently
  sp_NA <- subset(x=spdf_wgs, subset=naIndexVec, select=attribute)
  sp_NotNA <- subset(x=spdf_wgs, subset=notNAIndexVec, select=attribute)
  
  # Get the number of values and missing values.
  nmbrOfValues <- length(sp_NotNA)
  nmbrOfNA <- length(sp_NA)
  
  # Get the units of the attribute
  unit <- spdf_wgs@units[[attribute]]
  
  # Define colors
  mycol <- rainbow(30)[c(11,8,6,4,1)]

  # Define two sp.points objects, one representing the measurement points with values 
  # and the other the points with missing values. These objects will be used in sp.layout of spplot.
  sp_points_NotNA <- list("sp.points", sp_NotNA, col = "black", cex=0.90, pch=4) 
  sp_points_NA <- list("sp.points", sp_NA, col = "turquoise3", cex=1.1, pch=4) 

  # Set trellis parameter for the plot.
  require(lattice)
  trellis.par.set(list(sp.theme(),fontsize=list(text=16)))
  
  # Debugging
  # lattice.options(panel.error=NULL)
  
  # Check if the bachground map is available
  if(!is.null(myMap)){
    
    flog.info("Plot with background map will start.")
    
    # Plot with background map
    require(latticeExtra)
    print(spplot(spGridDF[], colorkey=T, cuts=4, scales=list(draw=TRUE, cex=1, tck = c(1,0), tick.number = 2, rot = 45), col.regions=mycol,
                 sp.layout = if(points == TRUE){list(sp_points_NA, sp_points_NotNA)}else NULL, 
                 main = paste("\n", statistic, " des Attributes \"",attributeG, "\" [", unit, "]\nin Aggregationszellen der Größe ",rasterParam$sizeX," x ",rasterParam$sizeY, " Meter (",rasterParam$modus,").", sep=""),
                 sub = if(points == TRUE){
                   # Subtitle for plot with measurement points
                   paste(nmbrOfTracks ," Fahrt(en) mit insgesamt ",nmbrOfPoints,
                        " Messpunkten ausgewertet.\nVorhandene Messwerte: ", nmbrOfValues,
                        " (schwarz), fehlende Messwerte: ", nmbrOfNA, " (hellblau).",
                        "\n", rasterParam$com, "\n",
                        sep="")
                  }else{
                    # Subtitle for plot without measurement points
                    paste(nmbrOfTracks ," Fahrt(en) mit insgesamt ",nmbrOfPoints,
                        " Messpunkten ausgewertet.\nVorhandene Messwerte: ", nmbrOfValues,
                        ", fehlende Messwerte: ", nmbrOfNA, ".",
                        "\n", rasterParam$com, "\n",
                        sep="")
                  }
                 ) + 
            # Add the background map to the plot.
            layer(grid.raster(myMap,
                              x = bgmapParam$longC, y = bgmapParam$latC, width = bgmapParam$w, 
                              height = bgmapParam$h, default.units = "native"),
                  data = list(myMap=myMap, bgmapParam=bgmapParam),
                  under=TRUE)
    )
    flog.info("spplot with background map finished successfully.")
    
  }else{
    
    flog.info("Plot without background map will start ...")
    
    # Plot without background map
    print(spplot(spGridDF[], colorkey=T, cuts=4, scales=list(draw=TRUE, cex=1, tck = c(1,0), tick.number = 2, rot = 45), col.regions=mycol,
                 sp.layout = if(points == TRUE){list(sp_points_NA, sp_points_NotNA)}else NULL, 
                 main = paste("\n", statistic, " des Attributes \"",attributeG, "\" [", unit, "]\nin Aggregationszellen der Größe ",rasterParam$sizeX," x ",rasterParam$sizeY, " Meter (",rasterParam$modus,").", sep=""),
                 sub = if(points == TRUE){
                   # Subtitle for plot with measurement points
                   paste(nmbrOfTracks ," Fahrt(en) mit insgesamt ",nmbrOfPoints,
                         " Messpunkten ausgewertet.\nVorhandene Messwerte: ", nmbrOfValues,
                         " (schwarz), fehlende Messwerte: ", nmbrOfNA, " (hellblau).",
                         "\nDie Hintergrundkarte konnte nicht geladen werden.",
                         "\n", rasterParam$com, "\n",
                         sep="")
                 }else{
                   # Subtitle for plot without measurement points
                   paste(nmbrOfTracks ," Fahrt(en) mit insgesamt ",nmbrOfPoints,
                         " Messpunkten ausgewertet.\nVorhandene Messwerte: ", nmbrOfValues,
                         ", fehlende Messwerte: ", nmbrOfNA, ".",
                         " Die Hintergrundkarte konnte nicht geladen werden.",
                         "\n", rasterParam$com, "\n",
                         sep="")
                 }
                 )
    )
    flog.info("spplot without background map finished successfully.")
  }
  flog.info("rasterizeAndPlot finished.#")
}
