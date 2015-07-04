/*
* Date: 16/4/2015
* Author: Tiago Ricardo
* Description: Camera functions
*/	


var exec = require('child_process').exec;


exports.Start = function(client,mainDeviceId)
{
    client.subscribe(mainDeviceId+'/img');
 	client.on('message', function (topic, message) 
	{
		//Console.log(topic + "-" + message);
		if(topic.toString().split("/")[1] == 'img' && message == 'getcameraimage')
		{
			try {
				console.log("Taking a picture!")  
				exec("raspistill -w 320 -h 180 -n -ex auto -t 1 -q 50 -o - | base64", function(error, stdout, stderr){
				
					client.publish(mainDeviceId+'/img',JSON.stringify({'value': stdout }), {retain: true});  
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
