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

import { CouchModel, CouchCollection } from './base';
import { mixinValidation, mergeSchemas } from './validation-mixin';

// Base schema for both User and UserRef.
//
// This schema includes the fields we want to store along with a user document,
// including: email, first name, last name, username <NOW REMOVED as of Oct 2nd, 2016>,
// verification (the token),
// and verified (a boolean).
//
// We also use CouchDB's 'roles' directly. This schema does not require a
// password, because after a password is written to a CouchDB document, it
// cannot then be retrieved (and thus would fail validation).
const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    first: {
      type: 'string',
      minLength: 1
    },
    last: {
      type: 'string',
      minLength: 1
    },
    verification: {
      type: 'string'
    },
    verified: {
      type: 'boolean'
    },
    roles: {
      type: 'array'
    }
  },
  required: [
    'email',
    'first',
    'last',
    'verified',
    'roles'
  ]
};

// # User Reference
// We uniquely reference Users by their emails. When models are serialized into
// CouchDB docs, the `_id` and `name` keys will be set. Use a UserRef When
// you are retriving user infromation from the server (it will not include
// the password).
export const UserRef = CouchModel.extend( {
  idAttribute: 'email',

  safeguard: [
    'name',
    'type',
    'derived_key',
    'iterations',
    'password_scheme',
    'salt'
  ],

  defaults: {
    roles: [],
    verified: false
  },

  schema: schema,

  // # toJSON
  // Serialize the User object into a doc for CouchDB.
  //
  // CouchDB's special users database has extra requirements.
  //  - _id must match `/org.couchdb.user:/``
  //  - name is equal to the portion after the colon
  //  - type must be 'user'.
  toJSON: function( options ) {
    return Object.assign( {}, this.attributes, {
      _id: `org.couchdb.user:${this.attributes.email}`,
      name: this.attributes.email,
      type: 'user'
    } );
  }
} );
mixinValidation( UserRef );

// # User Reference Collection Collection
// Get all CouchDB users, prefixed by 'org.couchdb.user:'.
export const UserRefCollection = CouchCollection.extend( {
  model: UserRef,

  pouch: {
    options: {
      allDocs: {
        include_docs: true,
        startkey: 'org.couchdb.user:',
        endkey: 'org.couchdb.user:\uffff'
      }
    }
  }
} );

// # User Model
// Use this model when you want to create new users. This model validates
// passwords in addition to the other information.
export const User = UserRef.extend( {
  schema: mergeSchemas( UserRef.prototype.schema, {
    properties: {
      password: {
        type: 'string',
        minLength: 8
      }
    },
    required: [
      'password'
    ]
  } )
} );
mixinValidation( User );

// # User Collection
// Get all CouchDB users, prefixed by 'org.couchdb.user:'.
export const UserCollection = UserRefCollection.extend( {
  model: User
} );

// # Login model
// Just a user's email and password
export const Login = CouchModel.extend( {
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      password: {
        type: 'string',
        minLength: 8
      }
    },
    required: [
      'email',
      'password'
    ]
  }
} );
mixinValidation( Login );

// # Forgot Password model
// Just a user's email
export const Forgot = CouchModel.extend( {
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      email: {
        type: 'string',
        format: 'email'
      }
    },
    required: [
      'email'
    ]
  }
} );
mixinValidation( Forgot );

// # Reset Password model
// Just a user's password, confirm password, and verification token
export const Reset = CouchModel.extend( {
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      password: {
        type: 'string',
        minLength: 8
      },
      verification: {
        type: 'string'
      }
    },
    required: [
      'password',
      'verification'
    ]
  }
} );
mixinValidation( Reset );
