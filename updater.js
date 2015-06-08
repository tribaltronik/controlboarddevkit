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


/*
/ MQTT client to get instructions to update
*/
var client; //  = mqtt.connect(config.settings.mqtt.server);
var mainDeviceId = config.settings.deviceID;




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
		var filePath = "/home/pi/projects/homebrain/script.js" ; 
		if(fs.existsSync(filePath))
		{
			var script = require('./script.js');
			script.run();
			
			// remove the script file
			fs.unlinkSync(filePath);
		}
		console.log('Restart Homebrain');
		exec("sudo /etc/init.d/homebrain restart"); 

}


function updateFirmware(version) 
{
	// Verify if exists new realease
	var downloadLink = VerifyLastRealease('http://tiago:585182@societytools.dynip.sapo.pt/homebrain/updates/verify.php?version='+version);
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
