
###
#
# Description: Function that creates a random string that will be used
#   as filename for the plots.
#
# @param length : numeric, length of the random string (14).
#
# @return randomString : character, a random character string
#
# Required packages
# ---
#
###

createRandomString <- function(lenght=14){
  
  # Initialize the character object
  randomString <- ""
  
  # Fill character object with random characters and numbers beginning with a character
  randomString <- paste(c(sample(c(letters, LETTERS), 1),
                               sample(c(0:9, letters, LETTERS), lenght - 1, replace=TRUE)),
                        collapse="", sep="")
  
  # Output
  randomString

}