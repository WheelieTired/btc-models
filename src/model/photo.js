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

import { CouchModel } from './base';

// # Photo Model
// The photo model stores photo attachments in the db separate from points.

export const Photo = CouchModel.extend( {
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

  // ## Safeguard
  // We should not validate image attachments' _attachments keys
  safeguard: [
    '_attachments'
  ],

  defaults: function() {
    return {
      updated_by: 'unknown',
    };
  },

  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
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
      }
    },
    required: [
      'created_at',
      'updated_at',
      'updated_by'
    ]
  },
} );
