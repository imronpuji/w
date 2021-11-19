var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'trenbisn_imron',
  password : 'tahubladak',
  database : 'trenbisn_wa'
});


const connect = ()=>{

	connection.connect(function(err) {
  	if (err) {
    	console.error('error connecting: ' + err.stack);
    	return;
  	}
  		console.log('connected as id ' + connection.threadId);
	});
}

 

module.exports = {connect, connection}

