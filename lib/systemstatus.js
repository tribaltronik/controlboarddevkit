/*
* Module: System Status
* Date: 16/4/2015
* Author: Tiago Ricardo
* Description: Get memory, cpu, Run Time info.
*/

// Stat topics ****
//  id/memoryTotal
//  id/memoryUsed
//  id/cpuUsageUpdate
//  id/temperatureUpdate

// necessary modules 
var fs = require('fs'),
  sys = require('util'),
  exec = require('child_process').exec;
var child, child1;

exports.Start = function(clientMQTT,mainDeviceId)
{

  var memTotal, memUsed = 0, memFree = 0, memBuffered = 0, memCached = 0, sendData = 1, percentBuffered, percentCached, percentUsed, percentFree;

  setInterval(function(){
    
     // Function for checking memory
    child = exec("egrep --color 'MemTotal' /proc/meminfo | egrep '[0-9.]{4,}' -o", function (error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      } else {
        memTotal = stdout;
        clientMQTT.publish(mainDeviceId +'/memoryTotal',JSON.stringify({'value': memTotal.toString()}) , {retain: true});
        //socket.emit('memoryTotal', stdout); 
      }
    });
    
     child1 = exec("egrep --color 'MemFree' /proc/meminfo | egrep '[0-9.]{4,}' -o", function (error, stdout, stderr) {
    if (error == null) {
      memFree = stdout;
      memUsed = parseInt(memTotal)-parseInt(memFree);
      clientMQTT.publish(mainDeviceId +'/memoryUsed',JSON.stringify({'value': memUsed.toString()}) , {retain: true});
      percentUsed = Math.round(parseInt(memUsed)*100/parseInt(memTotal));
      percentFree = 100 - percentUsed;
    } else {
      sendData = 0;
      console.log('exec error: ' + error);
    }
  });


 // Function for checking CPU usage
    child = exec("top -d 0.5 -b -n2 | grep 'Cpu(s)'|tail -n 1 | awk '{print $2 + $4}'", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
      //Es necesario mandar el tiempo (eje X) y un valor de temperatura (eje Y).
      var date = new Date().getTime();
      //socket.emit('cpuUsageUpdate', date, parseFloat(stdout)); 
      clientMQTT.publish(mainDeviceId +'/cpuUsageUpdate',JSON.stringify({'value': parseFloat(stdout).toString()}) , {retain: true});
      
    }
  });
  
   child = exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
      //Es necesario mandar el tiempo (eje X) y un valor de temperatura (eje Y).
      var date = new Date().getTime();
      var temp = parseFloat(stdout)/1000;
      //socket.emit('temperatureUpdate', date, temp); 
      clientMQTT.publish(mainDeviceId +'/temperatureUpdate',JSON.stringify({'value': temp.toString()}) , {retain: true});
    }
    });
    
  }, 10000);



}

