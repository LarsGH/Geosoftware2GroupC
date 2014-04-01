
# This script will be loaded by FastRWeb for all requests 
# before the run() function is evaluated.

# Source functions
# path to functions: /var/www/R/Rfunctions

createRandomString <- "/var/www/R/Rfunctions/createRandomString.R"
    if (isTRUE(file.exists(createRandomString))) source("/var/www/R/Rfunctions/createRandomString.R")
getGermanVariableName <- "/var/www/R/Rfunctions/getGermanVariableName.R"
    if (isTRUE(file.exists(getGermanVariableName))) source("/var/www/R/Rfunctions/getGermanVariableName.R")
getDefaultCellCount <- "/var/www/R/Rfunctions/getDefaultCellCount.R"
    if (isTRUE(file.exists(getDefaultCellCount))) source("/var/www/R/Rfunctions/getDefaultCellCount.R")
calcBBoxSideLength <- "/var/www/R/Rfunctions/calcBBoxSideLength.R"
    if (isTRUE(file.exists(calcBBoxSideLength))) source("/var/www/R/Rfunctions/calcBBoxSideLength.R")
getBackgroundMap <- "/var/www/R/Rfunctions/getBackgroundMap.R"
    if (isTRUE(file.exists(getBackgroundMap))) source("/var/www/R/Rfunctions/getBackgroundMap.R")
calcBgMapPlotParam <- "/var/www/R/Rfunctions/calcBgMapPlotParam.R"
    if (isTRUE(file.exists(calcBgMapPlotParam))) source("/var/www/R/Rfunctions/calcBgMapPlotParam.R")
calcCellSizeAndDimDefault <- "/var/www/R/Rfunctions/calcCellSizeAndDimDefault.R"
    if (isTRUE(file.exists(calcCellSizeAndDimDefault))) source("/var/www/R/Rfunctions/calcCellSizeAndDimDefault.R")
calcCellSizeAndDimStdMode <- "/var/www/R/Rfunctions/calcCellSizeAndDimStdMode.R"
    if (isTRUE(file.exists(calcCellSizeAndDimStdMode))) source("/var/www/R/Rfunctions/calcCellSizeAndDimStdMode.R")
calcCellSizeAndDimExptMode <- "/var/www/R/Rfunctions/calcCellSizeAndDimExptMode.R"
    if (isTRUE(file.exists(calcCellSizeAndDimExptMode))) source("/var/www/R/Rfunctions/calcCellSizeAndDimExptMode.R")
readTrackToDF <- "/var/www/R/Rfunctions/readTrackToDF.R"
    if (isTRUE(file.exists(readTrackToDF))) source("/var/www/R/Rfunctions/readTrackToDF.R")
readAndMergeTrackListToSPDF <- "/var/www/R/Rfunctions/readAndMergeTrackListToSPDF.R"
    if (isTRUE(file.exists(readAndMergeTrackListToSPDF))) source("/var/www/R/Rfunctions/readAndMergeTrackListToSPDF.R")
rasterizeAndPlot <- "/var/www/R/Rfunctions/rasterizeAndPlot.R"
    if (isTRUE(file.exists(rasterizeAndPlot))) source("/var/www/R/Rfunctions/rasterizeAndPlot.R")
aggregationMain <- "/var/www/R/Rfunctions/aggregationMain.R"
    if (isTRUE(file.exists(aggregationMain))) source("/var/www/R/Rfunctions/aggregationMain.R")
boxplotMain <- "/var/www/R/Rfunctions/boxplotMain.R"
    if (isTRUE(file.exists(boxplotMain))) source("/var/www/R/Rfunctions/boxplotMain.R")
