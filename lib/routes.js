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

  app.post('/performance/create', function( request, response ){
    var conversationName = request.body.convo_title,
        conversationDescription = request.body.convo_desc,
        userID = request.user.fb.id;
    response.contentType( 'json' );
    if(request.user){
      Conversation.find(userID, conversationName, function(noRecordFound){
        if(noRecordFound){
          Conversation.create(userID, conversationName, conversationDescription, function(conversationID){
            response.statusCode = 200;
            response.send( { 
              msg               : "Success!  Start yapping!", 
              conversationName  : conversationName,
              conversationID    : conversationID
            } );
          });
        } else {
          response.statusCode = 409; //http "conflict" status code
          response.send( { msg: "Sorry, but we couldn't create your conversation." } );
        }
      });
    }
  });
};

module.exports = { configRoutes : configRoutes };
// ----------------- END PUBLIC METHODS -------------------
