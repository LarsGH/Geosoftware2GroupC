createRandomString <- function(lenght=14){
  # Initialize character object
  randomString <- ""
  # Fill character object with random characters and numbers beginning with a character
  randomString <- paste(c(sample(c(letters, LETTERS), 1),
                               sample(c(0:9, letters, LETTERS), lenght - 1, replace=TRUE)),
                             collapse="", sep="")
  # Output
  randomString
}