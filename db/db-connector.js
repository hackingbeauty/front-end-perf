
/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------

'use strict';

var DBConnector = (function(){ //this creation should be cached

  var 
  	mode 		    = process.env.NODE_ENV,
  	mongodb     = require( 'mongodb' ),
	  mongoServer, dbHandle;

  if(mode === 'development'){
    console.log('----------------- MONGODB - YOU ARE IN DEV MODE YAY -------------');
    mongoServer = new mongodb.Server(
      'localhost',
      mongodb.Connection.DEFAULT_PORT
    );
    dbHandle    = new mongodb.Db(
      'chat-salon', mongoServer, { safe : true }
    );
  } else if(mode === 'production'){
    console.log('----------------- MONGODB - YOU ARE IN PROD MODE YAY -------------');
    mongoServer = new mongodb.Server(
      'ds045998.mongolab.com',
      45998
    );
    dbHandle    = new mongodb.Db(
      'nodejitsu_hackingbeauty_nodejitsudb653477187', mongoServer, { safe : true }
    );
  }

  return dbHandle;

}());

module.exports = { DBConnector : DBConnector };
