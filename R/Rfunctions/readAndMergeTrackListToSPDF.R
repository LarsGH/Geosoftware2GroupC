
###
#
# Description: Function that converts the data.frames given by the
#   function readTracktoDF() to one SpatialPointsDataFrame.
#
# @author : Roland Harhoff
#
# @param trackListFromJSON : a list of tracks
# @param attributeO : character, original name of the requested phenomenon
#
# @return df : SpatialPointsDataFrame, containing all measurement points with
#   values of the requested phenomenon
#
# Required packages
# require(futile.logger)
# require(sp)
#
###

readAndMergeTrackListToSPDF <- function(trackListFromJSON, attributeO){
  
  # Logging
  require(futile.logger)
  flog.info("readAndMerge function starts...")
  
  # Convert the list of tracks to a list where each track is represented
  # by a list of features
  trackl <- lapply(trackListFromJSON$tracks, function(x) x$features)
  
  # Create a list of data.frames - one for each track - containing the variables
  # x, y, id, time, requested attribute and trackID.
  dfl <- lapply(trackl, function(x) readTrackToDF(x, attributeO))
  
  flog.info("Reading tracks do data.frames finished.")

  # Merge the list of data.frames containing the
  # requested phenomenon to one data.frame
  df <- do.call(rbind, dfl)
  


  ###
  # ! NEU 4 spdf_wgs
##  myldf_comp <- compact(myldf)
  # !! ALTE IMPL
  #dfcompl <- do.call(rbind, myldf) # kein Problem mit NULL ! : ) !
  # ! NEU 4 spdf_wgs
##  dfcompl <- do.call(rbind.fill, myldf_comp) # kein Problem mit NULL ! : ) ! ??

  ###
  #str(df)
  #spdfAll <- dfcompl
  
  #attr(df, "units") <- NULL
    
  #spdfAll@units[["Speed"]]
  #a <- attr(unitsDf, "units")

  

  # Check if the data.frame is NULL.
  # That might be the case if there are no measurements points / features 
  # in all of the tracks or if there are some unexpected missing values like
  # e.g. the feature id or the time.
  if(!is.null(df)){
    
    flog.info("Track DF is NOT NULL.")  
    
    # Create a SpatialPointsDataFrame by assigning coordinates and
    # a coordinate reference system.
    require(sp)
    coordinates(df) <- c("x", "y")
    proj4string(df) <- CRS("+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0")
  
    flog.info("SPDF created.")
    


    #str(df)
  # Hier auswählen welche Attribute überhaupt gebraucht werden
  # xxx achtung !!!
  
  # unitsDF: wo brauch ich das ? attr, ... ?!
  # Aufpassen dass ich das ich die Fkt nicht zu oft aufrufe...!
  #Hier sollte ich im folgenden genau angeben welche jetzt von interrsse sind, und diese auch vorher ausgewählt haben...
  #unitsDfSmall <- unitsDf[c("Speed", "Consumption", "Calculated.MAF", "Intake.Pressure", "CO2", "Intake.Temperature", "MAF", "Rpm", "GPS.Accuracy")]
  #unitsDfSmall <- unitsDf[c("Speed", "Consumption", "Calculated.MAF", "Intake.Pressure", "CO2", "Intake.Temperature", "MAF", "Rpm", "GPS.Accuracy", "O2.Lambda.Current.ER")]  
    #alt
  #attr(df, "units") <- unitsDf#Small

  
    

    # To retrieve the "units" of the requested attribute,
    # first create a vector that is populated with the units "value"
    # of each data.frame from the data.frame list. This vector might
    # contain the units "value" or NA.
    unitsVec <- unlist(lapply(dfl, function(x) attr(x, "units")))

    # Then create an index vector for the units vector indicating
    # the units "values" which are not NA.
    unitsNotNAIndexVec <- !is.na(unitsVec)

    # Assign the units "value" - retrieved by using the index vector -
    # to the units attribute of the SpatialPointsDataFrame.
    w <- which(unitsNotNAIndexVec)
    attr(df, "units") <- unitsVec[w[1]]
    
    flog.info("Unit of requested attribute assigned: %s.",attr(df, "units")[[1]])
  
    flog.info("readAndMerge function processed successfully.")

  }else{
    flog.warn("Track DF is NULL!")
  }
  
  flog.info("readAndMerge function finished.#")
  
  df

}
