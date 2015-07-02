/*
* Module: updater
* Date: 16/4/2015
* Author: Tiago Ricardo
* Description: Verify periodically for new updates, download and extract
*/

var exec = require('child_process').exec;
var mqtt = require('mqtt');
var http = require('http');
var fs = require('fs');
var request = require("request");
var AdmZip = require('adm-zip');

//Load config file JSON
var config = require('./config.json');
var packageJSON = require('./package.json');
var systemInfo = require('./lib/systemstatus.js');
var common = require('./lib/common.js');

var startTime = +new Date();

// Get IP
common.getID(function(ID){
		mainDeviceId = ID;
		console.log("Device ID:" + mainDeviceId);
	}); //config.settings.deviceID;
common.getIP(function(IP){
		DeviceIP = IP;
		console.log("Device IP:" + DeviceIP);
	}); //config.settings.deviceID;	
	
	
/*
/ MQTT client to get instructions to update
*/
var client; //  = mqtt.connect(config.settings.mqtt.server);
var mainDeviceId = config.settings.deviceID;

// MQTT connection to broker
var host = 'societytools.dynip.sapo.pt'
  , myUserId = ''  // your DIoTY userId
  , myPwd = ''              // your DIoTY password
  , clientMQTT = mqtt.connect('mqtt://societytools.dynip.sapo.pt:1883');


clientMQTT.on('connect', function () 
{
  console.log("MQTT Connected ID:" + mainDeviceId);

  //clientMQTT.subscribe(mainDeviceId+'/status');
  clientMQTT.subscribe(mainDeviceId+'/updateDevice');
  
  //Start send info from system
  systemInfo.Start(clientMQTT,mainDeviceId);

});
  
clientMQTT.on('message', function (topic, message) {
	if(topic == mainDeviceId+ "/status" && message == "get")
	{
		console.log("Send status");
		var end = +new Date();
		var runningTimems = (end - startTime);
		clientMQTT.publish(mainDeviceId +'/status',JSON.stringify({'version': packageJSON.version ,'runtime':common.convertMillisecondsToDigitalClock(runningTimems).clock,'ip':DeviceIP}), {retain: false});
	}
	else if(topic == mainDeviceId+'/updateDevice')
	{
		if(message == 'update')
		{
			clientMQTT.publish(mainDeviceId+'/updateDevice','Updating start from ver:'+packageJSON.version, {retain: false});  
			//updateFirmware(packageJSON.version);
			child = exec("sudo git pull", {cwd: '/home/pi/controlboarddevkit'}, function (error, stdout, stderr) {
			    if (error !== null) {
			      console.log('exec error: ' + error);
			    } else {
				 exec("sudo service controlboard stop", function(err, stdout, stderr) {
			                console.log("Service Control Board Stop " ); console.log(err);
			                exec("sudo service controlboard start", function(err, stdout, stderr) {
			                	console.log("Service Control Board Stop " ); console.log(err);
			                });
			         });
			    }
			});
		}
	}
});

// Job to diary at 1:00 check new updates
var CronJob = require('cron').CronJob;
var job = new CronJob('00 00 1 * * *', function()
{	
	// verify if exists new realease and download and unzip
	updateFirmware(packageJSON.version);

}, null, true, "Europe/Lisbon");


var downloadFile = function(url, dest, cb) 
{
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  });
}


function VerifyLastRealease(url)
{
	request(url, function (error, response, body) 
	{
	  if (!error && response.statusCode == 200) 
	  {
		 // Show the HTML for the Google homepage.
		var downloadLink = JSON.parse(body);
		console.log(downloadLink);
		
		if(downloadLink != null && downloadLink != undefined && downloadLink.Updated == "false")
		{
			console.log(downloadLink.url);
			downloadFile(downloadLink.url,"realease.zip",UnzipAndInstall);
		}  
		else
		{
			console.log("Its updated");
	    }
	}
	});
}

function UnzipAndInstall()
{
	console.log('Extract zip');  
    // reading archives
    var zip = new AdmZip("./realease.zip");

    // extracts everything
    zip.extractAllTo(/*target path*/"./", /*overwrite*/true);
		fs.unlinkSync("./realease.zip");
		var filePath = "/home/pi/controlboard/script.js" ; 
		if(fs.existsSync(filePath))
		{
			var script = require('./script.js');
			script.run();
			
			// remove the script file
			fs.unlinkSync(filePath);
		}
		console.log('Restart ControlBoard');
		exec("sudo /etc/init.d/controlboard restart"); 

}


function updateFirmware(version) 
{
	// Verify if exists new realease
	var downloadLink = VerifyLastRealease('http://tiago:585182@societytools.dynip.sapo.pt/homebrain/updates/verify.php?version='+version);
}

function getControlBoardRuntime() 
{
	// Get rumtime of controlboard process
	var options = {
	  host: 'http://127.0.0.1',
	  port: 3000,
	  path: '/runtime'
	};
	
	http.get(options, function(res) {
	  console.log("Got response: " + res.statusCode);
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
}

//this.update("001");

exports.Start = function(client,ID)
{
	mainDeviceId = ID;
 	job.start();
 	client.subscribe(mainDeviceId+'/updateDevice');
	client.on('message', function (topic, message) 
	{
		if(topic == mainDeviceId+'/updateDevice')
		{
			if(message == 'update')
			{
				client.publish(mainDeviceId+'/updateDevice','Updating start from ver:'+packageJSON.version, {retain: false});  
				updateFirmware(packageJSON.version);
			}
		}
	});
}


exports.Stop= function()
{
 	job.stop();
}
