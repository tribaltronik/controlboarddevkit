/*
* Date: 22/12/2015
* Author: Tiago Ricardo
* Description: 433 MHz receiver and transmitter
*/

var rpi433    = require('rpi-433'),
    rfSniffer = rpi433.sniffer(3, 500), //Snif on PIN 2 with a 500ms debounce delay 
    rfSend    = rpi433.sendCode;
 
 
exports.Start = function(clientMQTT,mainDeviceId)
{
    // Receive     
    rfSniffer.on('codes', function (code) {
        console.log('Code received: '+code);
        // send MQTT with the code
        clientMQTT.publish(mainDeviceId +'/433','{"value":"'+ code +'","date":"' +new Date() +'"}', {retain: true});
    });
}
 

exports.Send = function(code)
{
    // Send 
    rfSend(code, 0, function(error, stdout) {   //Send 1234 
    if(!error) console.log(stdout); //Should display 1234 
    });
}