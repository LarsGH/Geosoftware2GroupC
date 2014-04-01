# letzter fehler
#Fehler in rasterGrob(image, x = x, y = y, width = width, height = height,  : 
#Objekt 'myMap' nicht gefunden

#!
# mit globalen variablen kein fehler mehr
# !

aggregationMain <- function(attributeO, statistic, lx, ly, mode, bool, layerJSON){
# Stand: momentan alte Varinat emit Grid impl.
# nur für StandardMode !!!

  require(futile.logger)
  
#  attributeO <- attr
#filename <- fn
#layerJSON <- layerJ
#cat("\nls()\n")
#cat(ls())
#r <- rm(list=ls())
#r
#cat("\nls()\n")
#cat(ls())

# ATTENTION
# Still 2 be done
# filename in plot to be deleted !
###
flog.info("Aggregation script starts...")
#cat("LOGGING: file: ", filename, " \n")
t_aggScript_s <- Sys.time()





#cat("\ncat(Sys.time(), fill=T) \n")
#cat(Sys.time()-tt, fill=T)
#cat("\ncat(as.character(Sys.time()), fill=T) \n")
#cat(as.character(Sys.time()-tt), fill=T)
#cat("\nSys.time()\n")
#Sys.time()-tt
#cat("\nprint(Sys.time())\n")
#print(Sys.time()-t_aggScript_s)

# PACKAGES

#cat("LOGGING: Required packages will be loaded.\n")
flog.info("Required packages will be loaded.")

#require(rgdal) # readOGR
require(rjson)  # fromJSON
require(maptools) # spCbind
require(RCurl) # ... xxx
#require(plyr) # compact --> removing NULL elemnts from a list
require(sp) # spdf
require(lattice) # spplot

#require(colorRamps) # benutzt???

require(raster) # wirklich???
require(ggplot2) # ?? Wofür genau?
require(ggmap) #google/osm map for background

## latticeExtra must be loaded after ggmap because both ggplot2 and
## latticeExtra define a 'layer' function. We need the definition from latticeExtra.
require(latticeExtra) #advanced spplot
#Das folgende Objekt ist maskiert from ‘package:ggplot2’: layer

# ?? welches ??
  require(futile.logger)

###


# USED FUNCTIONS

#cat("LOGGING: Implemented functions will be loaded.\n")
flog.info("Implemented functions will be loaded.")

  #source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/calcGrid4SpDefaultTest.R")
  
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/getDefaultCellCount.R")
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/calcCellSizeAndDimDefault.R")
  
  #notused#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/createPhenomDataStructure.R")
  #notused#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/importPhenomDataStructure.R")
  #notused#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/fillAttrListFct.R")
  #notused#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/read1TrackByLayerFromJSON_noOGR_ApplyAltFastFct.R")
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/readTrackToDF.R")
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/readAndMergeTAByLayerFromJSON_withoutOGR.R")
  
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/calculateRectangleSideLengthUnitsMeter.R")
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/calculateCellSizeAndDimension4RasterSimple.R")
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/calculateCellSizeAndDimension4RasterExpert.R")
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/getBackgroundMap.R")
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/calculateBgMapParam.R")
  #newplace_02#source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/rasterizeAndPlot.R")
  
  #source("/media/7D6823A15EC4AC59/HARRY/R_wd/Geosoft2/enviroCar_v01/rAndP_simple4Test.R")
  ###


# Testing
#mypath <- "/media/7D6823A15EC4AC59/HARRY/R_wd/enviroCarTest00/"
#filename <- "TrackArray_SpFilterAusg_V02_Bsp_formatiert.geojson"
#datasource <- paste(mypath,filename, sep="")
#layerJSON <- fromJSON(file = datasource)


# NEEDED ARGUMENTS / PARAMETER

# !!!
# layerJSON <- ...
#bool <- TRUE
#attribute <- 'Speed'
#attribute <- 'MAF'
#Speed Consumption Calculated.MAF Intake.Pressure CO2 Intake.Temperature MAF Rpm GPS.Accuracy
###


# trellis.par backup
#trellis.par.sic <- trellis.par.get()
###


# CODE

# ! Special for this case (simple Aggregation - not Expertmode)
#defaultCellCount <- getDefaultCellCount() # may be move to calCellSIze..., default: 65 !? # ausgelagert!
#statistic <- mean
flog.info("Aggregation method is %s in the normal mode.", 'xyz')



# xxx verlagern...! entweder auslagern (Rserve/Fastrweb) oder in
# Fkt readANdMerge.... integrieen Achtung
#unitsDf <- importPhenomDataStructure()

# Returns NULL or a SpatialPointsDataFrame in the case that spdf_wgs[[attribute]] is not just populated by NA.
spdf_wgs <- readAndMergeTrackListToSPDF(layerJSON, attributeO)

if(!is.null(spdf_wgs)){
  
  # Rename requested attribute according to (possible) variable names encoding in R code
  attribute <- gsub(" ", ".", attributeO)
  
  ###
  # !! ALTE IMPL und gnaz neue mit DF mit nur einem Attribut
  naIndexVec <- is.na(spdf_wgs[[attribute]])
  if(FALSE %in% naIndexVec){
  # ! NEU
  #if(!is.null(spdf_wgs[[attribute]])){
  ###
    
    bb_wgs <- bbox(spdf_wgs)
    
    # Probl wenn BackgroundMap == NULL ?
    myMap <- getBackgroundMap(bb_wgs)
    # Alternative Variante global --> wegen plot
#    #myMap <<- getBackgroundMap(bb_wgs)
    #myMap <- NULL
    #is.null(myMap)
    # global !
    bgmapParam <- calcBgMapPlotParam(myMap)
#    #bgmapParam <<- calculateBgMapParam(myMap)
    #bgmapParam <- NULL
    
    # Calculate grid extent...
    #rasterParam <- calculateCellSizeAndDimension4RasterSimple(bb_wgs, defaultCellCount)
    ifelse(mode == F, 
           rasterParam <- calcCellSizeAndDimStdMode(bb_wgs),
           rasterParam <- calcCellSizeAndDimExptMode(bb_wgs, lx, ly))
    
    # method:
    
#     theDate <- format(Sys.time(), "%Y-%m-%d_%H.%M.%S")
#     require (Cairo)
#     #png(filenem = ...)
#     Cairo(file = paste("Agg_build_",theDate,"_",rasterParam$modus,"_",attribute,"_mit_",statistic,"_alsAggFkt.png", sep=""),
#           width = 960, height = 960)#, pointsize=30) # for testing purpose
#     #width = 1440, height = 1440)
    
    rasterizeAndPlot(spdf_wgs, attribute, statistic, myMap, rasterParam, bool, bgmapParam)
    
#     dev.off()
    # method:
    
    flog.info("Aggregation in %s run successfully.", rasterParam$modus)
    
  }else{
    flog.warn("Objekt \"spdf_wgs[[attribute]]\" is NULL or just populated by NA! !?!? --> Differenzieren xxx !\n")
    flog.warn("Keine Messwerte verfügbar!\n")
    flog.warn("Aggregation abgebrochen!\n")
    #Just 4 Testing# Achtung filename nur zu testzwecken
    #cat(paste("JSON-Datei: ", filename, sep=""))
  }
}else{
  flog.warn("Objekt \"spdf_wgs\" is NULL!\n")
  flog.warn("Keine Beobachtungen ausgewählt!\n")
  flog.warn("Aggregation abgebrochen!\n")
  #Just 4 Testing# Achtung filename nur zu testzwecken
  #cat(paste("JSON-Datei: ", filename, sep=""))
}
  flog.info(" ### Aggregation script (Expertmode == %s) finished! ###
          ### Passed time is: %s ###\n", mode, Sys.time()-t_aggScript_s)
  #cat("LOGGING: Aggregation script finished!# ")
  #print(Sys.time()-t_aggScript_s)
}