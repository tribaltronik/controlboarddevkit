/*
* Module: System Status
* Date: 16/4/2015
* Author: Tiago Ricardo
* Description: Get memory, cpu, Run Time info.
*/

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

  // Memory used
  var mem = process.memoryUsage();
  clientMQTT.publish(mainDeviceId +'/memoryUsed',JSON.stringify({'value': mem.rss.toString()}) , {retain: true});

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
    
  }, 10000);

    child = exec("hostname", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
      //socket.emit('hostname', stdout); 
    }
  });

    child = exec("uptime | tail -n 1 | awk '{print $1}'", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
      //socket.emit('uptime', stdout); 
      clientMQTT.publish(mainDeviceId +'/uptime',JSON.stringify({'value': stdout}) , {retain: true});
    }
  });

    child = exec("uname -r", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
      //socket.emit('kernel', stdout); 
      clientMQTT.publish(mainDeviceId +'/kernel',JSON.stringify({'value': stdout}) , {retain: true});
    }
  });

    

  setInterval(function(){
    // Function for checking memory free and used
    child1 = exec("egrep --color 'MemFree' /proc/meminfo | egrep '[0-9.]{4,}' -o", function (error, stdout, stderr) {
    if (error == null) {
      memFree = stdout;
      memUsed = parseInt(memTotal)-parseInt(memFree);
      percentUsed = Math.round(parseInt(memUsed)*100/parseInt(memTotal));
      percentFree = 100 - percentUsed;
    } else {
      sendData = 0;
      console.log('exec error: ' + error);
    }
  });

    // Function for checking memory buffered
    child1 = exec("egrep --color 'Buffers' /proc/meminfo | egrep '[0-9.]{4,}' -o", function (error, stdout, stderr) {
    if (error == null) {
      memBuffered = stdout;
      percentBuffered = Math.round(parseInt(memBuffered)*100/parseInt(memTotal));
    } else {
      sendData = 0;
      console.log('exec error: ' + error);
    }
  });

    // Function for checking memory buffered
    child1 = exec("egrep --color 'Cached' /proc/meminfo | egrep '[0-9.]{4,}' -o", function (error, stdout, stderr) {
    if (error == null) {
      memCached = stdout;
      percentCached = Math.round(parseInt(memCached)*100/parseInt(memTotal));
    } else {
      sendData = 0;
      console.log('exec error: ' + error);
    }
  });

    if (sendData == 1) {
      //socket.emit('memoryUpdate', percentFree, percentUsed, percentBuffered, percentCached); 
    } else {
      sendData = 1;
    }
  }, 5000);

  // Function for measuring temperature
  setInterval(function(){
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
  });}, 5000);


}

