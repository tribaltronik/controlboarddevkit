/*
* Date: 16/4/2015
* Author: Tiago Ricardo
* Description: Main process of system
*/


// Necessary modules
var mqtt = require('mqtt');
var http = require('http');
var path = require('path');
var fs = require('fs');
//var exec = require('child_process').exec;
var child_process = require('child_process');
var packageJSON = require('./package.json');

// load other files 
var rgbled = require('./lib/rgbled.js')
var device = require('./lib/device.js');
var dht = require('./lib/dht.js');
// Database
//var db = require('./lib/database.js');
var camera = require('./lib/camera.js');
var sound = require('./lib/audioplay.js');
var updater = require('./updater.js');
var systemInfo = require('./lib/systemstatus.js');
var common = require('./lib/common.js');
var mainDeviceId;
var DeviceIP;
common.getID(function(ID){
		mainDeviceId = ID;
		console.log("Device ID:" + mainDeviceId);
	}); //config.settings.deviceID;
common.getIP(function(IP){
		DeviceIP = IP;
		console.log("Device IP:" + DeviceIP);
	}); //config.settings.deviceID;	
rgbled.ON_BLUE();

//Load config file JSON
var alarmState = "unlock";
var startTime = +new Date();
var config = require('./config.json');




// MQTT connection to broker
var host = 'societytools.dynip.sapo.pt'
  , myUserId = ''  // your DIoTY userId
  , myPwd = ''              // your DIoTY password
  , clientMQTT = mqtt.connect('mqtt://societytools.dynip.sapo.pt:1883');

clientMQTT.on('error', function (error) 
{
  // message is Buffer 
  console.log('mqtt error: ' + error);
  rgbled.ON_RED();
});

clientMQTT.on('connect', function () 
{
	console.log("MQTT Connected ID:" + mainDeviceId);
  rgbled.ON_GREEN();
  clientMQTT.subscribe(mainDeviceId+'/status');
  clientMQTT.subscribe(mainDeviceId+ '/alarm');
  clientMQTT.publish('presence', 'Hello mqtt');
  //Start send info from system
  systemInfo.Start(clientMQTT,mainDeviceId);

  // starts the updater cron
  updater.Start(clientMQTT,mainDeviceId);

  /*
  * Listen to requests to camera image
  */
  camera.Start(clientMQTT,mainDeviceId);

  dht.StartReadDHT(clientMQTT,mainDeviceId);
});
  
clientMQTT.on('message', function (topic, message) {
	if(topic == mainDeviceId+ '/alarm' && ( message.value == "lock"  || message.value == "unlock"))
	{
		alarmState = message;
		rgbled.ON_BLUE();
		setTimeout(function(){ rgbled.ON_GREEN(); }, 3000);
	}
	else if(topic == mainDeviceId+ "/status" && message == "get")
	{
		console.log("Send status");
		var end = +new Date();
		var runningTimems = (end - startTime);
		clientMQTT.publish(mainDeviceId +'/status', JSON.stringify("{'version':"+ packageJSON.version +",'runtime':"+convertMillisecondsToDigitalClock(runningTimems).clock+",'ip':"+DeviceIP+"}"), {retain: false});
	}
});
  


// CONVERT MILLISECONDS TO DIGITAL CLOCK FORMAT
function convertMillisecondsToDigitalClock(ms) {
	days = Math.floor(ms / (3600000 * 24)), // 1 day = 36000 * 24 Milliseconds
    hours = Math.floor(ms / 3600000), // 1 Hour = 36000 Milliseconds
    minutes = Math.floor((ms % 3600000) / 60000), // 1 Minutes = 60000 Milliseconds
    seconds = Math.floor(((ms % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
        return {
		days : days,
        hours : hours,
        minutes : minutes,
        seconds : seconds,
        clock : days + "days " + hours + "hours " + minutes + "minutes " + seconds + "seconds "
    };
}


// »»»»»» Server
http.createServer(function (req, res) {  
var end = +new Date();
var runningTimems = (end - startTime);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Control Board Device. - ');
  res.write("Running Time: " + convertMillisecondsToDigitalClock(runningTimems).clock  + " Totalms:"  + runningTimems + "ms");
  res.end();
}).listen(3000);

/* server started */  
console.log('Control Board Dev Kit device is running on port 3000'); 

//console.log("Pid: " +process.pid);
console.log("Starting Control Board Dev Kit");
 
 run = function () {
  //require('./startup').startup().done();
};
 
 var command = process.argv[2];
if(!command || command === "run") {
  run();
} else {
  logFile = path.resolve(__dirname, '../../controlboard-daemon.log');
  pidFile = path.resolve(__dirname, '../../controlboard.pid');

  init.simple({
    pidfile: pidFile,
    logfile: logFile,
    command: process.argv[3],
    run: run
  });
}




console.log("Green LED light and play sound");
rgbled.ON_GREEN();
sound.Play('/home/pi/projects/homebrain/sounds/Robot_blip.mp3');





