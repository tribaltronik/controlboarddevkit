/*
* Date: 16/4/2015
* Author: Tiago Ricardo
* Description: Sensor DHT 11 control
*/


// modulo de comunicaçao com o sensor DHT22
var sensorLib = require('node-dht-sensor');

exports.StartReadDHT = function(clientMQTT,mainDeviceId)
{
	var sensor = {
	  initialize: function() {

		return sensorLib.initialize(11, 4);
	  },
	  read: function() 
	  {
		var readout = sensorLib.read();

		console.log('Temperature: '+readout.temperature.toFixed(1)+'C, humidity: '+readout.humidity.toFixed(1)+'%'+
					', valid: '+readout.isValid+
					', errors: '+readout.errors);
		//if (readout.isValid && readout.checksum) 
	//	{
		  clientMQTT.publish(mainDeviceId +'/temp','{"value":"'+ readout.temperature.toFixed(1) +'","date":"' +new Date() +'"}', {retain: true});
		  clientMQTT.publish(mainDeviceId +'/hum','{"value":"'+ readout.humidity.toFixed(1) +'","date":"' +new Date() +'"}', {retain: true});
	  //  }

		
		  setTimeout(function() {
			sensor.read();
		  }, 600000);
		
	  }
	};

	if (sensor.initialize()) {
		sensor.read();
	} else {
		console.warn('Failed to initialize sensor');
	}

}
