/*
 * spa.shell.js
 * Shell module for SPA
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true, unparam : true
*/
/*global $, spa, Handlebars */

spa.shell = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      anchor_schema_map : {
        chat  : { opened : true, closed : true }
      },
      resize_interval : 200,
      main_html : Handlebars.compile($('#spa-container').html())
        
    },
    stateMap = {
      $container  : undefined,
      anchor_map  : {},
      resize_idto : undefined
    },
    jqueryMap = {},

    copyAnchorMap,    setJqueryMap,   changeAnchorPart, logInUser,
    onResize,         onHashchange,   onTapAcct, setChatAnchor,
    onLogin,          onLogout,       initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------


  //------------------- BEGIN UTILITY METHODS ------------------
  // Returns copy of stored anchor map; minimizes overhead
  copyAnchorMap = function () {
    return $.extend( true, {}, stateMap.anchor_map );
  };
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container        : $container,
      $acct             : $container.find('.spa-shell-head-acct'),
      $sidebar          : $('body').find('#spa-sidebar')    
    };
  };
  // End DOM method /setJqueryMap/

 // Begin DOM method /changeAnchorPart/
  // Purpose    : Changes part of the URI anchor component
  // Arguments  :
  //   * arg_map - The map describing what part of the URI anchor
  //     we want changed.
  // Returns    :
  //   * true  - the Anchor portion of the URI was updated
  //   * false - the Anchor portion of the URI could not be updated
  // Actions    :
  //   The current anchor rep stored in stateMap.anchor_map.
  //   See uriAnchor for a discussion of encoding.
  //   This method
  //     * Creates a copy of this map using copyAnchorMap().
  //     * Modifies the key-values using arg_map.
  //     * Manages the distinction between independent
  //       and dependent values in the encoding.
  //     * Attempts to change the URI using uriAnchor.
  //     * Returns true on success, and false on failure.
  //
  changeAnchorPart = function ( arg_map ) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return       = true,
      key_name, key_name_dep;

    // Begin merge changes into anchor map
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {

        // skip dependent keys during iteration
        if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // update independent key value
        anchor_map_revise[key_name] = arg_map[key_name];

        // update matching dependent key
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // End merge changes into anchor map

    // Begin attempt to update URI; revert if not successful
    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
      // replace URI with existing state
      $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
      bool_return = false;
    }
    // End attempt to update URI...

    return bool_return;
  };
  // End DOM method /changeAnchorPart/
  
  //--------------------- END DOM METHODS ----------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  // Begin Event handler /onHashchange/
  // Purpose    : Handles the hashchange event
  // Arguments  :
  //   * event - jQuery event object.
  // Settings   : none
  // Returns    : false
  // Actions    :
  //   * Parses the URI anchor component
  //   * Compares proposed application state with current
  //   * Adjust the application only where proposed state
  //     differs from existing and is allowed by anchor schema
  //
  onHashchange = function ( event ) {
    // Do something here maybe?
    return false;
  };
  // End Event handler /onHashchange/

  onResize = function () {
    if ( stateMap.resize_idto ) { return true; }

    spa.conversation.handleResize();
    stateMap.resize_idto = setTimeout(
      function () { stateMap.resize_idto = undefined; },
      configMap.resize_interval
    );

    return true;
  };

  logInUser = function ( event ) {
    var user_name, user = spa.model.people.get_user();
    if ( user.get_is_anon() ) {      
      spa.model.people.login( user_name );
      jqueryMap.$acct.text( '... processing ...' );
    }
    else {
     spa.model.people.logout();
    }
    return false;
  };

  onLogin = function ( event, login_user ) {
    alert('you have succcessfully logged in! The user is ', login_user);
    jqueryMap.$acct.text( login_user.name );
  };

  onLogout = function ( event, logout_user ) {
    alert('This user has logged out! ', logout_user);
    jqueryMap.$acct.text( 'Please sign-in' );
  };

  //-------------------- END EVENT HANDLERS --------------------

  //---------------------- BEGIN CALLBACKS ---------------------
  // Begin callback method /setChatAnchor/
  // Example  : setChatAnchor( 'closed' );
  // Purpose  : Change the chat component of the anchor
  // Arguments:
  //   * position_type - may be 'closed' or 'opened'
  // Action   :
  //   Changes the URI anchor parameter 'chat' to the requested
  //   value if possible.
  // Returns  :
  //   * true  - requested anchor part was updated
  //   * false - requested anchor part was not updated
  // Throws   : none
  //
  setChatAnchor = function ( position_type ) {
    return changeAnchorPart({ chat : position_type });
  };
  // End callback method /setChatAnchor/
  //----------------------- END CALLBACKS ----------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /initModule/
  // Example   : spa.shell.initModule( $('#app_div_id') );
  // Purpose   :
  //   Directs the Shell to offer its capability to the user
  // Arguments :
  //   * $container (example: $('#app_div_id')).
  //     A jQuery collection that should represent 
  //     a single DOM container
  // Action    :
  //   Populates $container with the shell of the UI
  //   and then configures and initializes feature modules.
  //   The Shell is also responsible for browser-wide issues
  //   such as URI anchor and cookie management
  // Returns   : none 
  // Throws    : none
  //
  initModule = function ( $container ) {
    // load HTML and map jQuery collections
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    // configure uriAnchor to use our schema
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    spa.sound.initModule();
    spa.sidebar.initModule( jqueryMap.$sidebar  );
    spa.performanceTable.initModule( jqueryMap.$container  );

    // Handle URI anchor change events.
    // This is done /after/ all feature modules are configured
    // and initialized, otherwise they will not be ready to handle
    // the trigger event, which is used to ensure the anchor
    // is considered on-load
    //
    $(window)
      .bind( 'resize',     onResize )
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );

    $.gevent.subscribe( $container, 'spa-login',  onLogin  );
    $.gevent.subscribe( $container, 'spa-logout', onLogout );

    $('body').on('click','.tp-sound-click', function(){
      spa.sound.playSound('click');
    });

    logInUser(); //log the user in through the model

  };
  // End PUBLIC method /initModule/
  // End PUBLIC method /initModule/

  return { initModule : initModule };
  //------------------- END PUBLIC METHODS ---------------------
}());
