/*
 * cache.js - Redis cache implementation
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
  redisClient,
  redis = require( 'redis' ),
  getRedisClient, makeString, deleteKey, getValue, setValue;
// ------------- END MODULE SCOPE VARIABLES ---------------

getRedisClient = (function(){
  var mode = process.env.NODE_ENV;
  if(mode === 'development'){
    redisClient = redis.createClient(6379, '127.0.0.1');
  } else if(mode === 'production'){
    redisClient = redis.createClient(6379, 'nodejitsudb7548468739.redis.irstack.com');
    redisClient.auth('nodejitsudb7548468739.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function (err) {
      if (err) { throw err; }
      // You are now connected to your redis.
    });
  }
})();

// --------------- BEGIN UTILITY METHODS ------------------
makeString = function ( key_data ) {
  return (typeof key_data === 'string' )
    ? key_data
    : JSON.stringify( key_data );
};
// ---------------- END UTILITY METHODS -------------------

// ---------------- BEGIN PUBLIC METHODS ------------------
deleteKey = function ( key ) {
  redisClient.del( makeString( key ) );
};

getValue = function ( key, hit_callback, miss_callback ) {
  redisClient.get(
    makeString( key ),
    function( err, reply ) {
      if ( reply ) {
        console.log( 'HIT' );
        hit_callback( reply );
      }
      else {
        console.log( 'MISS' );
        miss_callback();
      }
    }
  );
};

setValue = function ( key, value ) {
  console.log('-----------------------');
  console.log('setting this key: ', key);
  console.log('to this value: ', value);
  console.log('-----------------------');

  redisClient.set(
    makeString( key ), makeString( value )
  );
};

module.exports = {
  deleteKey : deleteKey,
  getValue  : getValue,
  setValue  : setValue
};
// ----------------- END PUBLIC METHODS -------------------
