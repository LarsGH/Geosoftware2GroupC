
###
#
# Description: Function that provides the german translations of
#   the phenomenon names and returns the translation of the requested attribute.
#
# @author : Roland Harhoff
#
# @param attr : character, the phenomenon name, where blanks
#   were replaced by points
#
# @return name : character, a german translation of the phenomenon name
#
# Required packages
# require(futile.logger)
#
###

getGermanVariableName <- function(attr){
  
  # Logging
  require(futile.logger)
  flog.info("getGermanVariableName function starts...")

  # Switch to get the corresponding name
  name <- switch(attr,
                 CO2="CO2", 
                 Calculated.MAF="Ber. MAF", 
                 Consumption="Verbrauch", 
                 Engine.Load="Last", 
                 Intake.Pressure="Ansaugdruck", 
                 Intake.Temperature="Ansaugtemperatur", 
                 MAF="MAF", 
                 Rpm="Upm", 
                 Speed="Geschwindigkeit", 
                 GPS.Accuracy="GPS Genauigkeit",
                 GPS.Altitude="GPS Höhe",
                 GPS.Bearing="GPS Peilung",
                 GPS.HDOP="GPS Horizontalpräzision",
                 GPS.PDOP="GPS Positionspräzision",
                 GPS.Speed="GPS Geschwindigkeit",
                 GPS.VDOP="GPS Vertikalpräzision",
                 Throttle.Position="Drosselklappenstellung",
                 Fuel.System.Loop="Kraftstoffanlagenbetrieb",
                 Fuel.System.Status.Code="Kraftstoffanlagen Status Code",
                 Long.Term.Fuel.Trim.1="Langzeit Gemischregelung",
                 O2.Lambda.Current="O2 Lambda Stromstärke",
                 O2.Lambda.Current.ER="O2 Lambda Stromstärke ER",
                 O2.Lambda.Voltage="O2 Lambda Spannung",
                 O2.Lambda.Voltage.ER="O2 Lambda Spannung ER",
                 Short.Term.Fuel.Trim.1="Kurzzeit Gemischregelung"
                 )
 
  flog.info("getGermanVariableName function finished.#") 
  
  # Output
  name

}
