/*
Database 
===========
*/
var config = require('../config.json');
// Database
var sqlite3 = require('sqlite3');

var db = new sqlite3.Database(config.settings.database.filename);

/*
* Insert value for device in db
*/
exports.InsertValueDevice = function(value,attributeId)
{
	//Perform INSERT operation.
	db.run("INSERT into attributeValues(time,attributeId,value) VALUES ('"+ (new Date()).getTime() +"','"+ attributeId +"','"+ value +"')");
	console.log('Data inserted');
}

/*
_parseTime: (time) ->
      if time is "0" then return 0
      else
        timeMs = null
        M(time).matchTimeDuration((m, info) => timeMs = info.timeMs)
        unless timeMs?
          throw new Error("Can not parse time in database config: #{time}")
        return timeMs
  */
        

exports.GetArrayDeviceId = function(attributeId,startime,endtime) 
{
  
  db.all("SELECT time,value FROM attributeValues where attributeId='"+ attributeId +"';", function(err, rows) 
  {
    rows.forEach(function (row) {
            console.log(row.value + ": " + row.time);
        });
  });
}
