/*
 * spa.model.js
 * Model module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global TAFFY, $, spa */

spa.model = (function () {
  'use strict';
  var
    configMap = { anon_id : 'a0' },
    stateMap  = {
      anon_user             : null,
      cid_serial            : 0,
      is_connected          : false,
      conversation_cid_map  : {},
      people_cid_map        : {},
      conversations_db       : TAFFY(),
      people_db             : TAFFY(),
      user                  : null
    },

    isFakeData = true,

    makeCid,  completeLogin,
    conversationProto, personProto, 
    clearPeopleDb,
    makeConversation, makePerson, 
    conversations, people, initModule;

    makeCid = function () {
      return 'c' + String( stateMap.cid_serial++ );
    };

  // The Conversations object API
  // ---------------------
  // The conversations object is available at spa.model.conversation.
  // The conversations object provides methods and events to manage
  // a collection of conversation objects. Its public methods include:
  //   * get_user() - return the current user conversation object.
  //     If the current user is not signed-in, an anonymous conversation
  //     object is returned.
  //   * get_db() - return the TaffyDB database of all the conversation
  //     objects - including the current user - presorted.
  //   * get_by_cid( <client_id> ) - return a conversation object with
  //     provided unique id.
  //   * login( <user_name> ) - login as the user with the provided
  //     user name. The current user object is changed to reflect
  //     the new identity. Successful completion of login
  //     publishes a 'spa-login' global custom event.
  //   * logout()- revert the current user object to anonymous.
  //     This method publishes a 'spa-logout' global custom event.
  //
  // jQuery global custom events published by the object include:
  //   * spa-login - This is published when a user login process
  //     completes. The updated user object is provided as data.
  //   * spa-logout - This is published when a logout completes.
  //     The former user object is provided as data.
  //
  // Each conversation is represented by a conversation object.
  // conversation objects provide the following methods:
  //   * get_is_user() - return true if object is the current user
  //   * get_is_anon() - return true if object is anonymous
  //
  // The attributes for a conversation object include:
  //   * cid - string client id. This is always defined, and
  //     is only different from the id attribute
  //     if the client data is not synced with the backend.
  //   * id - the unique id. This may be undefined if the
  //     object is not synced with the backend.
  //   * name - the string name of the user.
  //   * css_map - a map of attributes used for avatar
  //     presentation.
  //
  conversationProto = {
    get_is_conversation : function () {
      return this.cid === stateMap.user.cid;
    },
    get_is_anon : function () {
      return this.cid === stateMap.anon_user.cid;
    }
  };

  makeConversation = function ( conversation_map ) {
    var the_conversation,
      cid     = conversation_map.cid,
      css_map = conversation_map.css_map,
      id      = conversation_map.id,
      name    = conversation_map.name;

    if ( cid === undefined || ! name ) {
      throw 'client id and name required';
    }

    the_conversation         = Object.create( conversationProto );
    the_conversation.cid     = cid;
    the_conversation.name    = name;
    the_conversation.css_map = css_map;

    if ( id ) { the_conversation.id = id; }

    stateMap.conversation_cid_map[ cid ] = the_conversation;
    stateMap.conversations_db.insert( the_conversation );
    return the_conversation;
  };

  conversations = (function () {
    var get_by_cid, get_db;

    get_by_cid = function ( cid ) {
      return stateMap.conversation_cid_map[ cid ];
    };

    get_db = function () { 
      console.log('inside conversations.get_db!');
      return stateMap.conversations_db; 
    };

    return {
      get_by_cid : get_by_cid,
      get_db     : get_db
    };
  }());


  // The People object API
  // ---------------------
  personProto = {
    get_is_user : function () {
      return this.cid === stateMap.user.cid;
    },
    get_is_anon : function () {
      return this.cid === stateMap.anon_user.cid;
    }
  };

  clearPeopleDb = function () {
    var user = stateMap.user;
    stateMap.people_db      = TAFFY();
    stateMap.people_cid_map = {};
    if ( user ) {
      stateMap.people_db.insert( user );
      stateMap.people_cid_map[ user.cid ] = user;
    }
  };

  completeLogin = function ( user_list ) {
    var user_map = user_list[ 0 ];
    delete stateMap.people_cid_map[ user_map.cid ];
    stateMap.user.cid     = user_map._id;
    stateMap.user.id      = user_map._id;
    stateMap.user.css_map = user_map.css_map;
    stateMap.people_cid_map[ user_map._id ] = stateMap.user;
    $.gevent.publish( 'spa-login', [ stateMap.user ] );
  };

  makePerson = function ( person_map ) {
    var person,
      cid     = person_map.cid,
      css_map = person_map.css_map,
      id      = person_map.id,
      name    = person_map.name;

    if ( cid === undefined || ! name ) {
      throw 'client id and name required';
    }

    person         = Object.create( personProto );
    person.cid     = cid;
    person.name    = name;
    person.css_map = css_map;

    if ( id ) { person.id = id; }

    stateMap.people_cid_map[ cid ] = person;

    stateMap.people_db.insert( person );
    return person;
  };

  people = (function () {
    var get_by_cid, get_db, get_user, login, logout;

    get_by_cid = function ( cid ) {
      return stateMap.people_cid_map[ cid ];
    };

    get_db = function () { return stateMap.people_db; };

    get_user = function () { return stateMap.user; };

    login = function ( name ) {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

      stateMap.user = makePerson({
        cid     : makeCid(),
        css_map : {top : 25, left : 25, 'background-color':'#8f8'},
        name    : name
      });

      sio.on( 'userupdate', completeLogin );

      sio.emit( 'adduser', {
        cid     : stateMap.user.cid,
        css_map : stateMap.user.css_map,
        name    : stateMap.user.name
      });
    };

    logout = function () {
      var user = stateMap.user;

      // chat._leave();
      stateMap.user = stateMap.anon_user;
      clearPeopleDb();

      $.gevent.publish( 'spa-logout', [ user ] );
    };

    return {
      get_by_cid : get_by_cid,
      get_db     : get_db,
      get_user   : get_user,
      login      : login,
      logout     : logout
    };
  }());

  initModule = function () {
    var i, conversation_list, conversation_map,
        people_list, person_map;
    // initialize anonymous person
    stateMap.anon_user = makePerson({
      cid   : configMap.anon_id,
      id    : configMap.anon_id,
      name  : 'anonymous'
    });
    stateMap.user = stateMap.anon_user;
    
    if( isFakeData ){

      // people_list = spa.fake.getPeopleList;
      // for ( i = 0; i < people_list.length; i++ ) {
      //   person_map = people_list[ i ];
      //   makePerson({
      //     cid : person_map._id,
      //     css_map : person_map.css_map,
      //     id : person_map._id,
      //     name : person_map.name
      //   });
      // }
      // console.log('stateMap.people_db().get() yields ', stateMap.people_db().get());

      // conversation_list = spa.fake.getConversationList;
      // for(i = 0; i < conversation_list.length; i++){
      //   conversation_map = conversation_list[i];
      //   makeConversation({
      //     cid     : conversation_map._id,
      //     css_map : conversation_map.css_map,
      //     id      : conversation_map._id,
      //     name    : conversation_map.name
      //   });
      // }  
      // console.log('stateMap.conversations_db().get()', stateMap.conversations_db().get());
    } else {
      alert('not fake Data!');
    }
  }
  
  return {
    initModule        : initModule,
    conversations     : conversations,
    people            : people
  };
}());
