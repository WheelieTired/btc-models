/* btc-app-server -- Server for the Bicycle Touring Companion
 * Copyright © 2016 Adventure Cycling Association
 *
 * This file is part of btc-app-server.
 *
 * btc-app-server is free software: you can redistribute it and/or modify
 * it under the terms of the Affero GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * btc-app-server is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * Affero GNU General Public License for more details.
 *
 * You should have received a copy of the Affero GNU General Public License
 * along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

import { mixinValidation, mergeSchemas } from './validation-mixin';
import { CouchModel, CouchCollection, keysBetween } from './base';

import { keys, fromPairs, includes, assign } from 'lodash';
import { createObjectURL } from 'blob-util';

import docuri from 'docuri';
import ngeohash from 'ngeohash';
import normalize from 'to-id';
import uuid from 'node-uuid';

const browser = ( typeof window !== 'undefined' );

var Promise = require('polyfill-promise');

// # Point Model
// The point represents a location on the map with associated metadata, geodata,
// and user provided data. The point is the base shared by services and alerts.
//
// The JSON schema stored in `Point`, and as patched by `Service` and `Alert`,
// is the authoritative definition of the point record.

// ## Point Model Uri
// Points are stored in CouchDB. CouchDB documents can have rich id strings
// to help store and access data without MapReduce jobs.
//
// The point model uri is composed of four parts:
//  1. The string 'point/'`
//  2. The type of point, either 'service' or 'alert'
//  3. The normalized (original) name of the point
//  4. The point's geohash
export const pointId = docuri.route( 'point/:type/:name/:geohash' );

export const Point = CouchModel.extend( {
  idAttribute: '_id',

  initialize: function( attributes, options ) {
    CouchModel.prototype.initialize.apply( this, arguments );
  
    const date = new Date().toISOString();
    this.set( {
      created_at: date,
      updated_at: date,
    } );

    this.coverBlob = false;
    this.coverUrl = false;
  },

  update: function() {
    this.set( 'updated_at', new Date().toISOString() );
  },

  // ## Specify
  // Fill in `_id` from the components of the point model uri.
  // Pull values from `attributes` if name and location are undefined.
  specify: function( type, name, location ) {
    // Only set the ID attribute here if it wasn't already set.
    // The original ID stays the ID for the lifetime of the point.
    if (typeof this.attributes._id === "undefined") {
      if ( name ) {
        const [lat, lng] = location;
        const _id = pointId( {
          type: type,
          name: normalize( name ),
          geohash: ngeohash.encode( lat, lng )
        } );
        this.set( { _id, type, name, location } );
      } else {
        const {name, location} = this.attributes;
        const [lat, lng] = location;
        const _id = pointId( {
          type: type,
          name: normalize( name ),
          geohash: ngeohash.encode( lat, lng )
        } );
        this.set( { _id } );
      }
    }
  },

  // ## Safeguard for Points
  // Points have image attachments, so we should let backbone pouch handle
  // those and we should not validate the _attachments key
  safeguard: [
    '_attachments'
  ],

  defaults: function() {
    return {
      flag: false,
      updated_by: 'unknown'
    };
  },

  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      name: {
        type: 'string'
      },
      location: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: {
          type: 'number'
        }
      },
      type: {
        type: 'string'
      },
      created_at: {
        type: 'string',
        format: 'date-time'
      },
      updated_at: {
        type: 'string',
        format: 'date-time'
      },
      updated_by: {
        type: 'string',
      },
      description: {
        type: 'string'
      },
      flag: {
        type: 'boolean'
      }
    },
    required: [
      'name',
      'location',
      'type',
      'created_at',
      'updated_at',
      'updated_by',	/* Added: To attach points to users via their _id */
      'flag'
    ]
  },

  clear: function() {
    CouchModel.prototype.clear.apply( this, arguments );
    this.coverUrl = false;
  },

  // ## Fetch
  // When fetching a point, should it have a cover attachment, extend the
  // promise to fetch the attachment and set `this.coverUrl`.
  fetch: function() {
    return CouchModel.prototype.fetch.apply( this, arguments ).then( res => {
      return this.getCover( res );
    } );
  },

  // # Get Cover
  // Should a point (already fetched) have a cover attachment, get the
  // attachment's data and store an object url for it in `this.coverUrl`
  //
  // As a utility to client functions, resolve the returned promise to the
  // single argument passed to `getCover`.
  getCover: function( ret ) {
    return Promise.resolve().then( ( ) => {
      const hasCover = includes( this.attachments(), 'cover.png' );
      if ( browser && hasCover ) {
        return this.attachment( 'cover.png' );
      } else {
        return;
      }
    } ).then( blob => {
      if ( blob ) {
        this.coverBlob = blob;
        this.coverUrl = createObjectURL( blob );
      }
    } ).then( ( ) => {
      return ret;
    } );
  },

  // ## Set Cover
  // If the user already has a cover blob and they want to use it with the
  // model before attach() can finish storing it to PouchDB, they can use
  // this method to manually insert it.
  //
  // The associated object url for the blob will then be available to other
  // functions like store().
  setCover: function( blob ) {
    this.coverBlob = blob;
    if ( browser ) {
      this.coverUrl = createObjectURL( blob );
    }
  },

  // ## Get Redux Representation
  // Return a nested object/arary representation of the model suitable for
  // use with redux.
  store: function() {
    return { ...this.toJSON(), coverUrl: this.coverUrl };
  }
}, {
  uri: pointId,

  for: id => {
    const pointIdComponents = pointId( id );
    const type = pointIdComponents.type;
    if ( type === 'service' ) {
      return new Service( { _id: id } );
    } else if ( type === 'alert' ) {
      return new Alert( { _id: id } );
    } else {
      throw 'A point must be a service or alert';
    }
  }
} );

// # Service Model
// A service is a buisness or point of interest to a cyclist. A cyclist needs
// to know where they want to stop well in advance of their travel through an
// area. The service record must contain enough information to help the cyclist
// make such decisions.
//
// The record includes contact information, and a schedule of hours of
// operation. It is important that we store the time zone of a service, since
// touring cyclists will cross time zones on their travels. Furthermore,
// services of interest to touring cyclists may be seasonal: we store
// schedules for different seasons.

// ## Service Types
// A Service may have a single type, indicating the primary purpose of the
// buisness or point of interest. Service types may also be included in a
// Service's amenities array.

/*esfmt-ignore-start*/
export const serviceTypes = {
  'airport': { display: 'Airport' },
  'bar': { display: 'Bar' },
  'bed_and_breakfast': { display: 'Bed & Breakfast' },
  'bike_shop': { display: 'Bike Shop' },
  'cabin': { display: 'Cabin' },
  'campground': { display: 'Campground' },
  'convenience_store': { display: 'Convenience Store' },
  'cyclists_camping': { display: 'Cyclists\' Camping' },
  'cyclists_lodging': { display: 'Cyclists\' Lodging' },
  'grocery': { display: 'Grocery' },
  'hostel': { display: 'Hostel' },
  'hot_spring': { display: 'Hot Spring' },
  'hotel': { display: 'Hotel' },
  'motel': { display: 'Motel' },
  'information': { display: 'Information' },
  'library': { display: 'Library' },
  'museum': { display: 'Museum' },
  'outdoor_store': { display: 'Outdoor Store' },
  'rest_area': { display: 'Rest Area' },
  'restaurant': { display: 'Restaurant' },
  'restroom': { display: 'Restroom' },
  'scenic_area': { display: 'Scenic Area' },
  'state_park': { display: 'State Park' },
  'other': { display: 'Other' }
};
/*esfmt-ignore-end*/

export const Service = Point.extend( {
  specify: function( name, location ) {
    Point.prototype.specify.call( this, 'service', name, location );
  },

  defaults: function() {
    return {
      ...Point.prototype.defaults.apply( this, arguments ),
      amenities: [],
      schedule: { 'default': [] },
      seasonal: false
    };
  },

  schema: mergeSchemas( Point.prototype.schema, {
    properties: {
      type: {
        enum: keys( serviceTypes )
      },
      amenities: {
        type: 'array',
        items: {
          type: 'string',
          enum: keys( serviceTypes )
        }
      },
      address: {
        type: 'string'
      },
      schedule: {
        type: 'object'
      },
      seasonal: {
        type: 'boolean'
      },
      phone: {
        type: 'string'
      },
      website: {
        type: 'string',
        format: 'uri'
      },
      updated: {
        type: 'boolean' // the updated attribute is not required
      }
    },
    required: [
      'seasonal'
    ]
  } )
} );

// Apply the validation mixin to the Service model. See validation-mixin.js.
mixinValidation( Service );

// # Alert Model
// An alert is something that might impede a cyclist's tour. When a cyclist
// sees an alert on the map, the know to plan around it.

/*esfmt-ignore-start*/
export const alertTypes = {
  'road_closure': { display: 'Road Closure' },
  'forest_fire': { display: 'Forest fire' },
  'flooding': { display: 'Flooding' },
  'detour': { display: 'Detour' },
  'other': { display: 'Other' }
};
/*esfmt-ignore-end*/

export const Alert = Point.extend( {
  specify: function( name, location ) {
    Point.prototype.specify.call( this, 'alert', name, location );
  },

  schema: mergeSchemas( Point.prototype.schema, {
    properties: {
      type: {
        enum: keys( alertTypes )
      }
    }
  } )
} );

mixinValidation( Alert );

// # Point Collection
// A heterogeneous collection of services and alerts. PouchDB is able to fetch
// this collection by looking for all keys starting with 'point/'.
//
// A connected PointCollection must be able to generate connected Alerts or
// Services on demands. Therefore, if PointCollection is connected, connect
// models before returning them.
export const PointCollection = CouchCollection.extend( {
  initialize: function( models, options ) {
    CouchCollection.prototype.initialize.apply( this, arguments );
    options = options || {};

    this.pouch = {
      options: {
        allDocs: assign(
          { include_docs: true },
          options.keys ? { keys: options.keys } : keysBetween( 'point/' )
        )
      }
    };

    const {connect, database} = this;
    this.service = connect ? connect( database, Service ) : Service;
    this.alert = connect ? connect( database, Alert ) : Alert;
  },

  // This handles the `options.keys` edge cases listed in the
  // [PouchDB api](https://pouchdb.com/api.html#batch_fetch)
  parse: function( response, options ) {
    return response.rows.filter(
      row => !( row.deleted || row.error )
    ).map(
      row => row.doc
    );
  },

  model: function( attributes, options ) {
    const pointIdComponents = pointId( attributes._id );
    const type = pointIdComponents.type;
    const map = {
      'service': options.collection.service,
      'alert': options.collection.alert
    };
    const constructor = map[ type ];
    if ( constructor ) {
      const instance = new constructor( attributes, options );

      if ( options.deindex && instance.has( 'index' ) ) {
        instance.index = instance.get( 'index' );
        instance.unset( 'index ' );
      }

      return instance;
    } else {
      throw 'A point must be a service or alert';
    }
  },

  // ## Fetch Cover Images for all Points
  // Returns a promise that resolves when all points in the array have
  // their cover images available.
  getCovers: function() {
    return Promise.all( this.models.map( point => point.getCover() ) );
  },

  // ## Get Redux Representation
  // Return a nested object/arary representation of the collection suitable for
  // use with redux.
  store: function() {
    return fromPairs( this.models.map( point => [ point.id, point.store() ] ) );
  }
} );

// # Display Name for Type
// Given a type key from either the service or alert type enumerations,
// return the type's display string, or null if it does not exist.
export function display( type ) {
  const values = serviceTypes[ type ] || alertTypes[ type ];
  if ( values ) {
    return values.display;
  } else {
    return null;
  }
}
