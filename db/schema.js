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
var findOrCreate 	= require('mongoose-findorcreate'),
    mongoose        = require ("mongoose");

var Schema = {
	Room: function(){
		var roomSchema, Room;

		roomSchema = new mongoose.Schema({
			name: 		{ type: String },
			moderator: 	{ type: String },
			url: 		{ type: String },
			chatters:   [
				{
					userID: { type: String }
				}
			]
		});

		roomSchema.plugin(findOrCreate);
		Room = mongoose.model('Room', roomSchema);
		return Room;
	}
};

module.exports = { Schema: Schema };