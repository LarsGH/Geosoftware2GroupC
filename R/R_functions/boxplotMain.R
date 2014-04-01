
###
#
# Description: Function that creates a plot containing boxplots of
#   (a selection of) attributes of one track.
#
# @author : Roland Harhoff
#
# @param layerJSON : a list containing one track; this list was created
#   by the fromJSON() method from the rjson package
#
# @return plot : a plot created by boxplot()
#
# Required packages
# require(futile.logger)
#
###

boxplotMain <- function(layerJSON){
  
  # Logging
  require(futile.logger)
  flog.info("boxplotMain function starts...")
  
  # Check list
  if(length(layerJSON$tracks)>0){
    
    # Get the track from the list
    track <- layerJSON$tracks[[1]]
    
    # Check if track is populated with measurement points
    if (length(track$features) > 0){
      
      # Get the track ID, date,  and model and manufacturer and  of the car
      # to be used in the plot
      trackId <- track$features[[1]]$properties$trackID
      model <- track$properties$sensor$properties$model
      manuf <- track$properties$sensor$properties$manufacturer
      car <- paste(manuf,model)
      time <- track$features[[1]]$properties$time
      time <- as.POSIXct(time, format = "%Y-%m-%dT%H:%M:%SZ")
      date <- as.Date(time)
      
      # Get the attribute values. One vector for each attribute.
      speedVec <- unlist(lapply(track$features, function(x) x$properties$phenomenons$Speed$value))
      mafVec <- unlist(lapply(track$features, function(x) x$properties$phenomenons$MAF$value))
      co2Vec <- unlist(lapply(track$features, function(x) x$properties$phenomenons$CO2$value))
      inPVec <- unlist(lapply(track$features, function(x) x$properties$phenomenons[["Intake Pressure"]]$value))
      inTVec <- unlist(lapply(track$features, function(x) x$properties$phenomenons[["Intake Temperature"]]$value))
      calcMafVec <- unlist(lapply(track$features, function(x) x$properties$phenomenons[["Calculated MAF"]]$value))
      engLoadVec <- unlist(lapply(track$features, function(x) x$properties$phenomenons[["Engine Load"]]$value))
      consumptVec <- unlist(lapply(track$features, function(x) x$properties$phenomenons$Consumption$value))
      rpmVec <- unlist(lapply(track$features, function(x) x$properties$phenomenons$Rpm$value))
      
      # The Rpm value will be adjusted for better fitting to the values from the other
      # attributes according to the range of values.
      rpmAdjVec <- rpmVec/100
      
      # Create a list containing the (german) named attribute value vectors
      vecList <- list(Geschw. = speedVec,
                      Verbr. = consumptVec,
                      Upm_100 = rpmAdjVec,
                      CO2 = co2Vec,
                      Ber.MAF = calcMafVec,
                      MAF = mafVec,
                      Ans.Temp. = inTVec,
                      Last = engLoadVec,
                      Ans.Druck = inPVec)

      # Delete the NULL elements from the list of vectors
      ind <- sapply(vecList, is.null)
      vecList[ind] <- NULL
      
      # Create the boxplot
      boxplot(x=vecList,
              main=paste("Verteilung der Attributwerte der ausgewählten Fahrt.\nFahrzeug: ",
                         car,", Datum: ", date, ", Track-ID: ",trackId,".", sep="")
      )
      
      flog.info("boxplotMain function finished successfully.#")
      
    }else{
      flog.warn("Empty Track!")
      NULL
    }
  }else{
    flog.warn("No Track!")
    NULL
  }
}