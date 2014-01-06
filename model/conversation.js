/*
 * crud.js - module to provide CRUD db capabilities
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------

'use strict';

var schema		= require( '../db/schema' ),
  	dbHandle    = require( '../db/db-connector' ).DBConnector,
  	MD5			= require( 'blueimp-md5' );

var Conversation = {
	find: function ( userID, conversationName, callback) {
		dbHandle.collection('conversations', function(err, collection) {
		    collection.findOne({
		    	conversationName: conversationName
		    }, {safe:true}, function(err, result) {
		    	console.log('result is: ', result);
		        if (err || result === null) {
		        	callback(true);
		        } else {
		        	callback(false);
		        }
		    });
		});
	},
	create: function( userID, conversationName, conversationDesc, callback ){
		var self = this,
			conversationID = self.generateID(userID, conversationName);
		dbHandle.collection('conversations', function(err, collection) {
		    collection.insert({
		    	userID 					 	: userID,
		    	conversationName 		 	: conversationName,
		    	conversationDesccription 	: conversationDesc,
		    	conversationID			 	: conversationID
		    }, {safe:true}, function(err, result) {
		        if (err) {
		            return false;
		        } 
		        callback(conversationID);
		        return true;
		    });
		});
	},
	generateID: function(userID, conversationName){
		var str = userID + conversationName + new Date().getTime();
		return MD5.md5(str);
	}
};

module.exports = { Conversation : Conversation };





