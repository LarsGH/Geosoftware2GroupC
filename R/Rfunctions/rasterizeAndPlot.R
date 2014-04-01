
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
# @param attribute : character, variable name of the requested attribute.
# @param statistic : function that should be used for the aggregation process, e.g. mean.
# @param myMap : ggmap object, a map represented by a data.frame with attributes,
#   returned from getBackgroundMap().
# @param rasterParam : List containing the named parameters cell size, grid dimension,
#   aggregation mode and a comment according to the resulting grid:
#   list(sizeX = csizeX_Meter, sizeY = csizeY_Meter, dimX = gridDimX, dimY = gridDimY,
#   modus = aggMode, com = comment).
# @param points : boolean, indicating if the measurement points should be plotted too.
# @param bgmapParam : list containing relevant named parameters (latCenter, lonCenter,
#   height, width) for ploting the background map, returned from calcBgMapPlotParam().
#
# @return plot : a plot created by spplot()
#
# Required packages
# require(futile.logger)
# require(lattice)
# require(raster)
# require(sp)
# require(latticeExtra)
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
  attributeO <- getGermanVariableName(attribute)
  
  ###
  # Create a raster layer using the calculated raster parameter (dimension).
  require(raster)
  rasterLay <- raster(spdf_wgs,ncols=rasterParam$dimX,nrows=rasterParam$dimY)

  flog.info("rasterLayer created.")

  # Aggregate the data on basis of the raster layer and the aggregation function.
  # That populates the raster layer with values.
  rasterLayerWithAggData <- rasterize(spdf_wgs, rasterLay, spdf_wgs[[attribute]], fun=statFct)

  flog.info("rasterLayerWithAggData created.")

  
  # xxx ?!
  # NaN --> NA
  #logVec <- is.nan(rasterLayerWithAggData@data@values)
  #rasterLayerWithAggData@data@values[logVec] <- NA


  # Convert the raster layer to a SpatialGridDataFrame to be useable with spplot.
  require(sp)  
  spGridDF <- as(rasterLayerWithAggData, "SpatialGridDataFrame") # schneller als Pixels


  
#   ###
#   # ALTERNATIVE GRID - bis jetzt nur für Standard Mode impl.
#   crs_wgs = CRS(proj4string(spdf_wgs))
#   grd_wgs <- rasterParam$grid
#   #spdf_wgs[[attribute]]
#   # !!!?! Folgendes, um den unten dokumntierenten Fehler auszuschießen
#   spdf_attr_noNA <- subset(spdf_wgs, complete.cases(spdf_wgs[[attribute]]))
#   #spdf_attr_noNA <- spdf_wgs[[attribute]]
#   #Fehler in aggregate.data.frame(as.data.frame(x), ...) : 
#    # 'by' must be a list
#   #spdf_attr_noNA[[attribute]]
#   #spdf_wgs.agg = aggregate(spdf_wgs[[attribute]], SpatialGrid(grd_wgs, crs_wgs), param)
#   #spGridDF = aggregate(spdf_wgs[attribute], SpatialGrid(grd_wgs, crs_wgs), statFct)#, na.action = na.rm)
#   spGridDF = aggregate(spdf_attr_noNA[attribute], SpatialGrid(grd_wgs, crs_wgs), statFct)#, na.action = na.rm)
#   ###


  
  flog.info("spGridDF created.")
  
  # Retrieve different parameter which will be used in the plot function...
  
  # Get the number of tracks, measurement points and missing values.
  nmbrOfTracks <- nlevels(spdf_wgs$trackID)
  nmbrOfPoints <- length(spdf_wgs)
  
  #naIndexVec <- is.na(spdf_wgs[[attribute]])
  #dataNA <- count(naIndexVec) # --> true / false
  #nmbrOfNA <- dataNA[2,2]
  #if(is.na(nmbrOfNA)){ nmbrOfNA <- 0 }
  
  naIndexVec <- is.na(spdf_wgs[[attribute]])
  notNAIndexVec <- !is.na(spdf_wgs[[attribute]])
  sp_NotNA <- subset(x=spdf_wgs, subset=notNAIndexVec, select=attribute)
  sp_NA <- subset(x=spdf_wgs, subset=naIndexVec, select=attribute)
  #nmbrOfPoints <- length(sp_NotNA) # just points with attribute values
  nmbrOfNA <- length(sp_NA)
  
  #flog.info("notNAIndexVec created.")
  #str(sp_NotNA1)
  #identical(sp_NotNA, sp_NotNA1)
  

  # Get the units of the attribute
  unit <- spdf_wgs@units[[attribute]]
  
  # Define colors to be used in the plot
  mycol <- rainbow(30)[c(11,8,6,4,1)]


  # xxx
  # Just for testing
  # 2be deleted
  #theDate <- format(Sys.time(), "%Y-%m-%d_%H.%M.%S")
  

  # Define two sp.points objects representing the measurement points with values 
  # and the missing value points. These object will be used in sp.layout of spplot.
  sp_points_NotNA <- list("sp.points", sp_NotNA, col = "black", cex=0.90, pch=4) # pch=1
  sp_points_NA <- list("sp.points", sp_NA, col = "turquoise3", cex=1.1, pch=4) # or pch=8
  
  
  # Open a graphics device
  #flog.info("Graphics device will be opened.")
  #png(filename = paste("Agg_build_",theDate,"_",rasterParam[[5]],"_",attribute,"_mit_",statistic,"_alsAggFkt.png", sep=""),
  #    width = 960, height = 960) # for testing purpose
  #width = 1440, height = 1440)
  

  # Set trellis parameter for the plot.
  require(lattice)
  trellis.par.set(list(sp.theme(),fontsize=list(text=16)))
  
  # Debugging
  lattice.options(panel.error=NULL)
  
  # Check if the bachground map is available
  if(!is.null(myMap)){
    

    flog.info("browser() should be opend")
    #browser()
    # 2 be deleted

    
    flog.info("Plot with background map will start.")
    
    # Plot with background map
    require(latticeExtra)
    print(spplot(spGridDF[], colorkey=T, cuts=4, scales=list(draw=TRUE, cex=1, tck = c(1,0), tick.number = 2, rot = 45), col.regions=mycol,
                 sp.layout = if(points == TRUE){list(sp_points_NA, sp_points_NotNA)}else NULL, 
                 main = paste("\n", statistic, " des Attributes \"",attributeO, "\" [", unit, "]\nin Aggregationszellen der Größe ",rasterParam$sizeX," x ",rasterParam$sizeY, " Meter (",rasterParam$modus,").", sep=""),
                 sub = if(points == TRUE){
                   # Subtitle for plot with measurement points
                   paste(#"Zellengröße ca. ",rasterParam$sizeX," x ",rasterParam$sizeY, " Meter (Maßstab),\n",
                        nmbrOfTracks ," Fahrt(en) mit ",nmbrOfPoints,
                        " Messpunkten (schwarz) ausgewertet, davon fehlende Messwerte: ", nmbrOfNA, " (blau).",
                        #"\nJSON-File: ",filename,
                        "\n", rasterParam$com, "\n",
                        sep="")
                  }else{
                    # Subtitle for plot without measurement points
                    paste(#"Zellengröße ca. ",rasterParam$sizeX," x ",rasterParam$sizeY, " Meter (Maßstab),\n",
                        nmbrOfTracks ," Fahrt(en) mit ",nmbrOfPoints,
                        " Messpunkten ausgewertet, davon fehlende Messwerte: ", nmbrOfNA, ".",
                        #"\nJSON-File: ",filename,
                        "\n", rasterParam$com, "\n",
                        sep="")
                  }
                 ) + 
            # Add the background map to the plot.
            layer(grid.raster(myMap,
                              x = bgmapParam$longC, y = bgmapParam$latC, width = bgmapParam$w, 
                              height = bgmapParam$h, default.units = "native"),
                  #data = list(myMap, bgmapParam[1], bgmapParam[2], bgmapParam[3], bgmapParam[4]),
                  data = list(myMap=myMap, bgmapParam=bgmapParam),
                  under=TRUE)
    )
    flog.info("spplot with background map finished successfully.")
    
  }else{
    
    flog.info("Plot without background map will start ...")
    # Plot without background map
    print(spplot(spGridDF[], colorkey=T, cuts=4, scales=list(draw=TRUE, cex=1, tck = c(1,0), tick.number = 2, rot = 45), col.regions=mycol,
                 sp.layout = if(points == TRUE){list(sp_points_NA, sp_points_NotNA)}else NULL, 
                 main = paste("\n", statistic, " des Attributes \"",attributeO, "\" [", unit, "]\nin Aggregationszellen der Größe ",rasterParam$sizeX," x ",rasterParam$sizeY, " Meter (",rasterParam$modus,").", sep=""),
                 sub = if(points == TRUE){
                   # Subtitle for plot with measurement points
                   paste(#"Zellengröße ca. ",rasterParam$sizeX," x ",rasterParam$sizeY, " Meter (Maßstab),\n",
                         nmbrOfTracks ," Fahrt(en) mit ",nmbrOfPoints,
                         " Messpunkten (schwarz) ausgewertet, davon fehlende Messwerte: ", nmbrOfNA, " (blau).",
                         #"\nJSON-File: ",filename, "\n",
                         "\nHintergrundkarte konnte nicht geladen werden.",
                         "\n", rasterParam$com, "\n",
                         sep="")
                 }else{
                   # Subtitle for plot without measurement points
                   paste(#"Zellengröße ca. ",rasterParam$sizeX," x ",rasterParam$sizeY, " Meter (Maßstab),\n",
                         nmbrOfTracks ," Fahrt(en) mit ",nmbrOfPoints,
                         " Messpunkten ausgewertet, davon fehlende Messwerte: ", nmbrOfNA, ".",
                         #"JSON-File: ",filename, "\n",
                         "\nHintergrundkarte konnte nicht geladen werden.",
                         "\n", rasterParam$com, "\n",
                         sep="")
                 }
                 )
    )
    flog.info("spplot without background map finished successfully.")
  }
  #dev.off()
  flog.info("rasterizeAndPlot finished.#")
}
