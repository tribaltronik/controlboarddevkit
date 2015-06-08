
/*
* Date: 16/4/2015
* Author: Tiago Ricardo
* Description: Common functions
*/

var exec = require('child_process').exec;
var child;

// Get ID
exports.getID = function(callback)
{
    // Function for checking Serial number
    child = exec("grep -i serial /proc/cpuinfo | cut -d : -f2", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
        var ID = stdout.replace(/\b(0(?!\b))+/g, "").trim();
      callback(ID);
    }
  });
}


// Get IP
exports.getIP = function(callback)
{
    // Function for checking Serial number
    child = exec("hostname -I", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
        var IP = stdout;
      callback(IP);
    }
  });
}



// Get date time
exports.getDateTime = function()
{
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}