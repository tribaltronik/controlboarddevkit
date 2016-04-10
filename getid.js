var common = require('./lib/common.js');

common.getID(function(ID){
                var mainDeviceId = ID+"raspi";
		console.log("Device ID:" + mainDeviceId);
	}); //config.settings.deviceID;
