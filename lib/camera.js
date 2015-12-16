/*
* Date: 16/4/2015
* Author: Tiago Ricardo
* Description: Camera functions
*/	


var exec = require('child_process').exec;


exports.Start = function(mqttClient,mainDeviceId)
{
    mqttClient.subscribe(mainDeviceId+'/img');
 	mqttClient.on('message', function (topic, message) 
	{
		//Console.log(topic + "-" + message);
		if(topic.toString().split("/")[1] == 'img' && message == 'getcameraimage')
		{
			try {
				console.log("Taking a picture!")  
				//raspistill -w 320 -h 240 -hf -vf -t 1 -o - | base64
				//raspistill -w 320 -h 180 -n -ex auto -t 1 -q 50 -o - | base64
				exec("raspistill -w 320 -h 240 -n -ex auto -t 1 -o - | base64s", function(error, stdout, stderr){
					if (error) {
						console.log(error);
					}
					if (stderr) {
						console.log(stderr);
					}
					console.log("... sending the picture") 
					mqttClient.publish(mainDeviceId+'/img',JSON.stringify({'value': stdout }), {retain: true});  
					console.log("... picture sent!")  
				}); 
			} 
			catch (err) 
			{
			  // If the type is not what you want, then just throw the error again.
			  if (err.code !== 'ENOENT') throw e;
			  Console.log("Ficheiro não existe");
			  // Handle a file-not-found error
			}
		}
		
	});
}


exports.Stop= function()
{
 	//job.stop();
}
