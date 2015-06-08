var piblaster = require("pi-blaster.js");
/*

GPIO 17 - pin 11  (blue)
GPIO 18 - pin 12 (Red)
GPIO 27 - pin 13 (Green)
*/

exports.ON_RED = function(value)
{
    piblaster.setPwm(17, 0);

    piblaster.setPwm(18, 1);

    piblaster.setPwm(27, 0);
}

exports.ON_BLUE = function(value)
{
    piblaster.setPwm(17, 1);

    piblaster.setPwm(18, 0);

    piblaster.setPwm(27, 0);
}

exports.ON_GREEN = function(value)
{
    piblaster.setPwm(17, 0);

    piblaster.setPwm(18, 0);

    piblaster.setPwm(27, 1);
}

exports.ON_RGB = function(R,G,B)
{
	var valueR = R /255;
	var valueG = G /255;
	var valueB = B /255;

    piblaster.setPwm(17, valueR);

    piblaster.setPwm(18, valueG);

    piblaster.setPwm(27, valueB);
}

exports.OFF = function(value)
{
    piblaster.setPwm(17, 0);

    piblaster.setPwm(18, 0);

    piblaster.setPwm(27, 0);
}
  

