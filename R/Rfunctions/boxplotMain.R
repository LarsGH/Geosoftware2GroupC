
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
    track <- layerJSON$tracks
    
    # Check if track is populated with measurement points
    if (length(track$features) > 0){
      
      # Get track-ID and model + manufacturer of the car
      # to be used in the plot.
      trackId <- track$features[[1]]$properties$trackID
      model <- track$properties$sensor$properties$model
      manuf <- track$properties$sensor$properties$manufacturer
      car <- paste(manuf,model)
      
      # Get the date of the track in german format
      time <- track$features[[1]]$properties$time
      time <- as.POSIXct(time, format = "%Y-%m-%dT%H:%M:%SZ")
      date <- format(as.Date(time), "%d.%m.%Y")
      
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

      # Create a list containing the (german) named units vectors
      unitsList <- list(Geschw. = "km/h",
                        Verbr. = "l/h",
                        Upm_100 = "100 u/min",
                        CO2 = "kg/h",
                        Ber.MAF = "g/s",
                        MAF = "l/s",
                        Ans.Temp. = "c",
                        Last = "%",
                        Ans.Druck = "kPa")
      
      # Create a list containing the (german) names of the attributes to be used in the plot
      gerNamesList <- list(Geschw. = "Geschw.",
                           Verbr. = "Verbr.",
                           Upm_100 = "Upm",
                           CO2 = "CO2",
                           Ber.MAF = "Ber.MAF",
                           MAF = "MAF",
                           Ans.Temp. = "Ans.Temp.",
                           Last = "Last",
                           Ans.Druck = "Ans.Druck")
      
      # Delete the NULL elements (no measurement values) from the lists of vectors
      ind <- sapply(vecList, is.null)
      vecList[ind] <- NULL
      unitsList[ind] <- NULL
      gerNamesList[ind] <- NULL
      
      # Get the length of the final vector list
      len <- length(vecList)
      
      # Initialize the names vector to be used in the boxplot function as an argument
      namesVec <- character(len)
      
      # Fill the names vector with a combination of the german name and the unit for each attribute vector
      for (i in 1:len){
        namesVec[i] <- paste(gerNamesList[[i]], "\n", unitsList[[i]], sep="")
      }
      
      # Create the boxplot
      boxplot(x=vecList,
              names = namesVec,
              main=paste("Verteilung der Attributwerte der ausgewählten Fahrt.\nFahrzeug: ",
                         car,", Datum: ", date, ", Fahrt-ID: ",trackId,".\n", sep=""),
              sub="Nur die zur Verfügung stehenden Attribute werden dargestellt.\n"
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