import { Model, Collection } from 'backbone';
import { assign } from 'lodash';

var Promise = require( 'polyfill-promise' );

// # Backbone Promises
// This file provides Model and Collection base classes that override
// backbone's callback api with a promise based api. We override save, destroy,
// and fetch. But we cannot override Collection.create. That method does not
// accept success and error callbacks anyways.

// ## Bakcbone Callback Factory
// This function takes either Promise.resolve or Promise.reject, and returns
// a new function that will call Promise.resolve or Promise.reject with the
// appropriate resolved object. The resolved object either has a
// collection key or a model key depending on the returned entity type.
const callback = finalize => ( entity, response, options ) => {
  if ( entity instanceof Collection ) {
    finalize( { collection: entity, response, options } );
  } else {
    finalize( { model: entity, response, options } );
  }
};

// ## Promise Factory
// This function returns a promise that adapts backbone's success and error
// callbacks to Promise's reject and resolve methods. However, if the client
// passes in success and error callbacks themselves, they expect to use
// the default callback api.
const promise = ( context, method, options, args ) => {
  const base = context instanceof Collection ? Collection : Model;
  const func = base.prototype[ method ];
  if ( options.success || options.error ) {
    return func.apply( context, args );
  } else {
    return new Promise( ( resolve, reject ) => {
      assign( options, {
        success: callback( resolve ),
        error: callback( reject )
      } );
      func.apply( context, args );
    } );
  }
};

// # Promise Model
// Overrides Model's save, destroy, and fetch functions with versions that
// return promises.
export const PromiseModel = Model.extend( {
  save: function( key, val, options ) {
    let opts, args;
    if ( key == null || typeof key === 'object' ) {
      opts = val || {};
      args = [ key, opts ];
    } else {
      opts = options || {};
      args = [ key, val, opts ];
    }

    return promise( this, 'save', opts, args );
  },

  destroy: function( options = {} ) {
    return promise( this, 'destroy', options, [ options ] );
  },

  fetch: function( options = {} ) {
    return promise( this, 'fetch', options, [ options ] );
  }
} );

// # PromiseCollection
// Overrides Collection's fetch function with a version that returns a promise.
export const PromiseCollection = Collection.extend( {
  fetch: function( options = {} ) {
    return promise( this, 'fetch', options, [ options ] );
  }
} );
