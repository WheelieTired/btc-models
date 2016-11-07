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

import { mixinValidation } from './validation-mixin';
import { CouchModel, CouchCollection, keysBetween } from './base';
import { pointId } from './point';

import docuri from 'docuri';
import uuid from 'node-uuid';

// # Comment Model
// Information about alerts and services encountered by cyclists is likely
// to change with the seasons or other reasons. Cyclists planning the next leg
// of a tour should be able to read the experiences of cyclists ahead of them.
//
// A comment must have both a rating and the text of the comment. Comments are
// limited to 140 characters to ensure they do not devolve into general alert
// or service information that should really be in the description. We really
// want users of the Bicycle Touring Companion to provide comments verifying
// info about points, or letting other cyclists know about changes in the
// service or alert.

// ## Comment Model Uri
// Comments are stored in CouchDB in the same database as points. The comment
// model uri is composed of three parts:
//  1. The entire id of the related point
//  2. The string 'comment/'
//  3. A time based UUID to uniquely identify comments
const commentId = docuri.route( 'point/:type/:name/:geohash/comment/:uuid' );

const COMMENT_MAX_LENGTH = 140;
export const Comment = CouchModel.extend( {
  idAttribute: '_id',

  // ## Constructor
  // Generate `_id`. `pointId` must be specified in options.
  constructor: function( attributes, options ) {
    options = options || {};
    if ( !attributes.uuid ) {
      attributes.uuid = uuid.v1();
    }
    if ( !attributes._id && options.pointId ) {
    	const pointIdComponents = pointId(options.pointId);
      attributes._id = commentId( {
          type: pointIdComponents.type,
          name: pointIdComponents.name,
          geohash: pointIdComponents.geohash,
          uuid: attributes.uuid
       } );
    }
    CouchModel.apply( this, arguments );
  },

  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      text: {
        'type': 'string',
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
      'text',
      'rating',
      'uuid'
    ]
  }
}, {
  MAX_LENGTH: COMMENT_MAX_LENGTH
} );

mixinValidation( Comment );

// # Comment Collection
// Fetch only comments associated with a given point.
export const CommentCollection = CouchCollection.extend( {
  initialize: function( models, options ) {
    CouchCollection.prototype.initialize.apply( this, arguments );
    const pointId = this.pointId = options.pointId;

    const connect = this.connect;
    const database = this.database;
    this.comment = connect ? connect( database, Comment ) : Comment;

    this.pouch = {
      options: {
        allDocs: {
          ...keysBetween( pointId + '/comment' ),
          include_docs: true
        }
      }
    };
  },

  model: function( attributes, options ) {
    const {comment, pointId} = options.collection;
    return new comment( attributes, { pointId, ...options } );
  }
} );
