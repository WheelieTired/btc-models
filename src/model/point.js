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

import docuri from 'docuri';
import ngeohash from 'ngeohash';
import normalize from 'to-id';
import uuid from 'uuid';

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

const COMMENT_MIN_LENGTH = 1;
const COMMENT_MAX_LENGTH = 140;

export const Point = CouchModel.extend( {
  idAttribute: '_id',

  initialize: function( attributes, options ) {
    CouchModel.prototype.initialize.apply( this, arguments );
  
    const date = new Date().toISOString();
    this.set( {
      created_at: date,
      updated_at: date,
    } );

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

  defaults: function() {
    return {
      flagged_by: [],
      updated_by: 'unknown',
      comments: [],
      is_hidden: false
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
      flagged_by:{
        type: 'array',
         items: {
          type: 'object',
          properties: {
            user: {type: 'string'},
            reason: {type: 'string', minLength: COMMENT_MIN_LENGTH, maxLength: COMMENT_MAX_LENGTH}
          },
            required: [
            'user',
            'reason'
          ]
        }
      },
      is_hidden:{
        type: 'boolean'
      },
      description: {
        type: 'string'
      },
      comments: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            user: {
              type: 'string'
            },
            date: {
              type: 'string',
              format: 'date-time'
            },
            text: {
              type: 'string',
              'minLength': COMMENT_MIN_LENGTH,
              'maxLength': COMMENT_MAX_LENGTH
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5
            },
            uuid: {
              type: 'string'
            }
          },
          required: [
            'user',
            'date',
            'text',
            'rating',
            'uuid'
          ]
        }
      }
    },
    required: [
      'name',
      'location',
      'type',
      'created_at',
      'updated_at',
      'updated_by',	/* Added: To attach points to users via their _id */
      'flagged_by',
      'is_hidden',
      'comments'
    ]
  },

  clear: function() {
    CouchModel.prototype.clear.apply( this, arguments );
  },

  // ## Get Redux Representation
  // Return a nested object/arary representation of the model suitable for
  // use with redux.
  store: function() {
    return { ...this.toJSON() };
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
	  //TODO: a malformed point shouldn't break the app's functionality
	  // the malformed point should be skipped and normal process continues
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
      },
       expiration_date: {
        type: 'string',
        format: 'date-time'
      },
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
	  //TODO: a malformed point shouldn't break the app's functionality
	  // the malformed point should be skipped and normal process continues
    }
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
