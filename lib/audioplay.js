/*
Module to play audio over raspberry pi audio stereo jack
===========
*/

var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');
 
 
/*
* function to play the audio file
*/
exports.Play = function(fileToPlay)
{
	fs.createReadStream(fileToPlay)
	  .pipe(new lame.Decoder())
	  .on('format', function (format) {
		this.pipe(new Speaker(format));
	  });
}