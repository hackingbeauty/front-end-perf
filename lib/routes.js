/*
 * routes.js - module to provide routing
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true,
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';

var
  configRoutes, Conversation = require( '../model/conversation' ).Conversation;

// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN PUBLIC METHODS ------------------
configRoutes = function ( app ) {
  
  app.get( '/', function ( request, response ) {
    response.render('index', { title: 'Front-End-Perf' });
  });

  app.get('/performance', function( request, response ){
    console.log('------ OH HELLZ YESSSS ------');
  });

};

module.exports = { configRoutes : configRoutes };
// ----------------- END PUBLIC METHODS -------------------
