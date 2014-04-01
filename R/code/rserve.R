
## This script will be loaded when Rserve starts
## and before any client connect.
## Use it to pre-load packages and any data you want
## as well as define any global variables you want all
## scripts to see


## Today, pretty much everyone speaks UTF-8, it makes the life easier
Sys.setlocale(,"en_US.UTF-8")

## it is useful to have access to the root of your
## installation from R scripts
root <- Sys.getenv("ROOT")
if (is.null(root) || nchar(root) == 0) root <- "/var/FastRWeb"

## run the server in the "tmp" directory of the root in
## case some files need to be created
setwd(paste(root,"tmp",sep='/'))

## if you have multiple servers it's good to know which machine this is
host <- tolower(system("hostname -s", TRUE))
cat("Starting Rserve on", host,"\n")


## This is a friendly way to load package and report success/failure
## You will definitetly need FastRWeb, others are optional

pkgs <- c("XML", "Cairo", "Matrix", "FastRWeb", "rgdal", "RCurl", "rjson", "maptools", "lattice", "sp")
cat("Loading packages 1...\n")
for (pkg in pkgs) cat(pkg, ": ",require(pkg, quietly=TRUE, character.only=TRUE),"\n",sep='')
cat("Loading packages part 1 finished!\n") 

pkgs <- c("futile.logger", "ggplot2", "ggmap", "latticeExtra", "raster") 
cat("Loading packages 2 ...\n")
for (pkg in pkgs) cat(pkg, ": ",require(pkg, quietly=TRUE, character.only=TRUE),"\n",sep='')
cat("Loading packages part 2 finished!\n") 

pkgs <- c("plyr")
cat("Loading packages 3 ...\n")
for (pkg in pkgs) cat(pkg, ": ",require(pkg, quietly=TRUE, character.only=TRUE),"\n",sep='')
cat("Loading packages part 3 finished!\n") 

## fix font mappings in Cairo -- some machines require this
if (exists("CairoFonts")) CairoFonts("Arial:style=Regular","Arial:style=Bold","Arial:style=Italic","Helvetica","Symbol")


## Source functions
## path to functions: /var/www/R/Rfunctions

## Sourcing the functions will be done by the function init()
## which will be called in common.R.

## init() is a special function that will be called from
## each script. Do what you want here - it is usually a good idea
## to have a "common" script that is loaded on each request
## so you don't need re-start Rserve for global code changes

init <- function() {
    set.seed(Sys.getpid()) # we want different seeds so we get different file names
    
    ## get a temporary file name for this session
    tmpfile<<-paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')

    ## if there is a common script, source it first
    common <- paste(root,"/web.R/common.R",sep='')
    if (isTRUE(file.exists(common))) source(paste(root,"/web.R/common.R",sep=''))
}
