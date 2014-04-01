
###
#
# Description: Function that reads the features of one track from 
#   a list and creates a data.frame out of them containing the requested
#   phenomenon as a variable.
#
# @author : Roland Harhoff
#
# @param featureListOfOneTrack : list with the features of one track
# @param attributeO : character, original name of the requested phenomenon
#
# @return trackDF : data.frame, where each feature is represented by one
#   row containing the following variables that have been extracted from
#   the features list:
#   x : x coordinate
#   y : y coordinate
#   id : id of the feature
#   time : time of the measuremnt
#   phenom : requested phenomenon / variable
#   trackID : id of the track the features belong to
#
# Required packages
# require(futile.logger)
#
###

readTrackToDF <- function(featureListOfOneTrack, attributeO){
  
  # Logging
  require(futile.logger)
  flog.info("readTrackToDF function starts...")
  
  # Check if the track is empty.
  if (length(featureListOfOneTrack) > 0){
    
    # Read the coordinates of the observations and return them as a list
    # of coordinate pairs.
    c <- lapply(featureListOfOneTrack, function (x) x$geometry$coordinates)
    
    # Binds the coordinates list elements and returns a matrix where each row
    # represents a coordinate pair.
    coords <- do.call(rbind,c)
    
    # Assign column names to the matrix.
    colnames(coords) <- c("x", "y")  
    
    # Get the observation (properties) id and the observation time
    # and return both as vectors.
    id <- vapply(featureListOfOneTrack, function(x) x$properties$id, "")
    time <- vapply(featureListOfOneTrack, function(x) x$properties$time, "")
    
    # Create a vector populated with the values of the requested attribute.
    # For every measurement point that does not have a value for the requested
    # attribute NA will be assigned to keep information about missing values.
    phenom <- unlist(lapply(featureListOfOneTrack, function(x) ifelse(
      !is.null(x$properties$phenomenons[[attributeO]]), 
      x$properties$phenomenons[[attributeO]]$value,
      NA)))

    # Get the unit of the requested attribute if the attribute is available in this track.
    # If the attribute is not available set the unit to NA.
    phenNotNAIndexVec <- !is.na(phenom)
    w <- which(phenNotNAIndexVec) #[1] # NA oder integer (length > 0)
    attrunit <- ifelse(length(w) > 0,
           featureListOfOneTrack[[w[[1]]]]$properties$phenomenons[[attributeO]]$unit,
           NA)
    
    # Convert the original attribute name to a name useable by R,
    # e.g. as a column name of a data.frame.
    attribute <- gsub(" ", ".", attributeO)

    # Give the attribute name to the attribute unit
    names(attrunit) <- attribute

    # Check if the coordinate matrix and the other created vectors have the same "length".
    if (nrow(coords) == length(phenom) & length(phenom) == length(time) &
          length(time) == length(id)) {
      
      # Create a data.frame out of the coordinate matrix and the other attribute vectors
      trackDF <- data.frame(coords, id, time, phenom)
      
	# Get the track ID...
      tID <- featureListOfOneTrack[[1]]$properties$trackID
      flog.info("readTrackToDF: trackID is %s", tID)

      # Add the trackID to the data.frame
      trackDF$trackID <- as.factor(tID)

      # Convert the attribute time to POSIXct
      trackDF$time = as.POSIXct(trackDF$time, format = "%Y-%m-%dT%H:%M:%SZ")

      # Assign the attribute name to the attribute column as column name.
      colnames(trackDF)[colnames(trackDF) == "phenom"] <- attribute

      # Assign the named attribute unit to the data as an attribute.
      attr(trackDF, "units") <- attrunit

      flog.info("Function to read the attribute(s) of one track finished successfully.#")
      
      trackDF

    }else{
      flog.warn("readTrackToDF function finished. nrow of variables differ.#")
      NULL
    } 
  }else{
    flog.warn("readTrackToDF function finished. NO Features red!#")
    NULL
  } 
}
