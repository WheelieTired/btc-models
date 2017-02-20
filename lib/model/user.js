'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Reset = exports.Forgot = exports.Login = exports.UserCollection = exports.User = exports.UserRefCollection = exports.UserRef = undefined;

var _base = require('./base');

var _validationMixin = require('./validation-mixin');

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

var schema = {
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
  required: ['email', 'first', 'last', 'verified', 'roles']
};

// # User Reference
// We uniquely reference Users by their emails. When models are serialized into
// CouchDB docs, the `_id` and `name` keys will be set. Use a UserRef When
// you are retriving user infromation from the server (it will not include
// the password).
var UserRef = exports.UserRef = _base.CouchModel.extend({
  idAttribute: 'email',

  safeguard: ['name', 'type', 'derived_key', 'iterations', 'password_scheme', 'salt'],

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
  toJSON: function toJSON(options) {
    return Object.assign({}, this.attributes, {
      _id: 'org.couchdb.user:' + this.attributes.email,
      name: this.attributes.email,
      type: 'user'
    });
  }
});
(0, _validationMixin.mixinValidation)(UserRef);

// # User Reference Collection Collection
// Get all CouchDB users, prefixed by 'org.couchdb.user:'.
var UserRefCollection = exports.UserRefCollection = _base.CouchCollection.extend({
  model: UserRef,

  pouch: {
    options: {
      allDocs: {
        include_docs: true,
        startkey: 'org.couchdb.user:',
        endkey: 'org.couchdb.user:\uFFFF'
      }
    }
  }
});

// # User Model
// Use this model when you want to create new users. This model validates
// passwords in addition to the other information.
var User = exports.User = UserRef.extend({
  schema: (0, _validationMixin.mergeSchemas)(UserRef.prototype.schema, {
    properties: {
      password: {
        type: 'string',
        minLength: 8
      }
    },
    required: ['password']
  })
});
(0, _validationMixin.mixinValidation)(User);

// # User Collection
// Get all CouchDB users, prefixed by 'org.couchdb.user:'.
var UserCollection = exports.UserCollection = UserRefCollection.extend({
  model: User
});

// # Login model
// Just a user's email and password
var Login = exports.Login = _base.CouchModel.extend({
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
    required: ['email', 'password']
  }
});
(0, _validationMixin.mixinValidation)(Login);

// # Forgot Password model
// Just a user's email
var Forgot = exports.Forgot = _base.CouchModel.extend({
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      email: {
        type: 'string',
        format: 'email'
      }
    },
    required: ['email']
  }
});
(0, _validationMixin.mixinValidation)(Forgot);

// # Reset Password model
// Just a user's password, confirm password, and verification token
var Reset = exports.Reset = _base.CouchModel.extend({
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
    required: ['password', 'verification']
  }
});
(0, _validationMixin.mixinValidation)(Reset);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC91c2VyLmpzIl0sIm5hbWVzIjpbInNjaGVtYSIsInR5cGUiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJlbWFpbCIsImZvcm1hdCIsImZpcnN0IiwibWluTGVuZ3RoIiwibGFzdCIsInZlcmlmaWNhdGlvbiIsInZlcmlmaWVkIiwicm9sZXMiLCJyZXF1aXJlZCIsIlVzZXJSZWYiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsInNhZmVndWFyZCIsImRlZmF1bHRzIiwidG9KU09OIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImF0dHJpYnV0ZXMiLCJfaWQiLCJuYW1lIiwiVXNlclJlZkNvbGxlY3Rpb24iLCJtb2RlbCIsInBvdWNoIiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsInN0YXJ0a2V5IiwiZW5ka2V5IiwiVXNlciIsInByb3RvdHlwZSIsInBhc3N3b3JkIiwiVXNlckNvbGxlY3Rpb24iLCJMb2dpbiIsIkZvcmdvdCIsIlJlc2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBbUJBOztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBL0JDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0NELElBQU1BLFNBQVM7QUFDYkMsUUFBTSxRQURPO0FBRWJDLHdCQUFzQixLQUZUO0FBR2JDLGNBQVk7QUFDVkMsV0FBTztBQUNMSCxZQUFNLFFBREQ7QUFFTEksY0FBUTtBQUZILEtBREc7QUFLVkMsV0FBTztBQUNMTCxZQUFNLFFBREQ7QUFFTE0saUJBQVc7QUFGTixLQUxHO0FBU1ZDLFVBQU07QUFDSlAsWUFBTSxRQURGO0FBRUpNLGlCQUFXO0FBRlAsS0FUSTtBQWFWRSxrQkFBYztBQUNaUixZQUFNO0FBRE0sS0FiSjtBQWdCVlMsY0FBVTtBQUNSVCxZQUFNO0FBREUsS0FoQkE7QUFtQlZVLFdBQU87QUFDTFYsWUFBTTtBQUREO0FBbkJHLEdBSEM7QUEwQmJXLFlBQVUsQ0FDUixPQURRLEVBRVIsT0FGUSxFQUdSLE1BSFEsRUFJUixVQUpRLEVBS1IsT0FMUTtBQTFCRyxDQUFmOztBQW1DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sSUFBTUMsNEJBQVUsaUJBQVdDLE1BQVgsQ0FBbUI7QUFDeENDLGVBQWEsT0FEMkI7O0FBR3hDQyxhQUFXLENBQ1QsTUFEUyxFQUVULE1BRlMsRUFHVCxhQUhTLEVBSVQsWUFKUyxFQUtULGlCQUxTLEVBTVQsTUFOUyxDQUg2Qjs7QUFZeENDLFlBQVU7QUFDUk4sV0FBTyxFQURDO0FBRVJELGNBQVU7QUFGRixHQVo4Qjs7QUFpQnhDVixVQUFRQSxNQWpCZ0M7O0FBbUJ4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBa0IsVUFBUSxnQkFBVUMsT0FBVixFQUFvQjtBQUMxQixXQUFPQyxPQUFPQyxNQUFQLENBQWUsRUFBZixFQUFtQixLQUFLQyxVQUF4QixFQUFvQztBQUN6Q0MsaUNBQXlCLEtBQUtELFVBQUwsQ0FBZ0JsQixLQURBO0FBRXpDb0IsWUFBTSxLQUFLRixVQUFMLENBQWdCbEIsS0FGbUI7QUFHekNILFlBQU07QUFIbUMsS0FBcEMsQ0FBUDtBQUtEO0FBaEN1QyxDQUFuQixDQUFoQjtBQWtDUCxzQ0FBaUJZLE9BQWpCOztBQUVBO0FBQ0E7QUFDTyxJQUFNWSxnREFBb0Isc0JBQWdCWCxNQUFoQixDQUF3QjtBQUN2RFksU0FBT2IsT0FEZ0Q7O0FBR3ZEYyxTQUFPO0FBQ0xSLGFBQVM7QUFDUFMsZUFBUztBQUNQQyxzQkFBYyxJQURQO0FBRVBDLGtCQUFVLG1CQUZIO0FBR1BDLGdCQUFRO0FBSEQ7QUFERjtBQURKO0FBSGdELENBQXhCLENBQTFCOztBQWNQO0FBQ0E7QUFDQTtBQUNPLElBQU1DLHNCQUFPbkIsUUFBUUMsTUFBUixDQUFnQjtBQUNsQ2QsVUFBUSxtQ0FBY2EsUUFBUW9CLFNBQVIsQ0FBa0JqQyxNQUFoQyxFQUF3QztBQUM5Q0csZ0JBQVk7QUFDVitCLGdCQUFVO0FBQ1JqQyxjQUFNLFFBREU7QUFFUk0sbUJBQVc7QUFGSDtBQURBLEtBRGtDO0FBTzlDSyxjQUFVLENBQ1IsVUFEUTtBQVBvQyxHQUF4QztBQUQwQixDQUFoQixDQUFiO0FBYVAsc0NBQWlCb0IsSUFBakI7O0FBRUE7QUFDQTtBQUNPLElBQU1HLDBDQUFpQlYsa0JBQWtCWCxNQUFsQixDQUEwQjtBQUN0RFksU0FBT007QUFEK0MsQ0FBMUIsQ0FBdkI7O0FBSVA7QUFDQTtBQUNPLElBQU1JLHdCQUFRLGlCQUFXdEIsTUFBWCxDQUFtQjtBQUN0Q2QsVUFBUTtBQUNOQyxVQUFNLFFBREE7QUFFTkMsMEJBQXNCLEtBRmhCO0FBR05DLGdCQUFZO0FBQ1ZDLGFBQU87QUFDTEgsY0FBTSxRQUREO0FBRUxJLGdCQUFRO0FBRkgsT0FERztBQUtWNkIsZ0JBQVU7QUFDUmpDLGNBQU0sUUFERTtBQUVSTSxtQkFBVztBQUZIO0FBTEEsS0FITjtBQWFOSyxjQUFVLENBQ1IsT0FEUSxFQUVSLFVBRlE7QUFiSjtBQUQ4QixDQUFuQixDQUFkO0FBb0JQLHNDQUFpQndCLEtBQWpCOztBQUVBO0FBQ0E7QUFDTyxJQUFNQywwQkFBUyxpQkFBV3ZCLE1BQVgsQ0FBbUI7QUFDdkNkLFVBQVE7QUFDTkMsVUFBTSxRQURBO0FBRU5DLDBCQUFzQixLQUZoQjtBQUdOQyxnQkFBWTtBQUNWQyxhQUFPO0FBQ0xILGNBQU0sUUFERDtBQUVMSSxnQkFBUTtBQUZIO0FBREcsS0FITjtBQVNOTyxjQUFVLENBQ1IsT0FEUTtBQVRKO0FBRCtCLENBQW5CLENBQWY7QUFlUCxzQ0FBaUJ5QixNQUFqQjs7QUFFQTtBQUNBO0FBQ08sSUFBTUMsd0JBQVEsaUJBQVd4QixNQUFYLENBQW1CO0FBQ3RDZCxVQUFRO0FBQ05DLFVBQU0sUUFEQTtBQUVOQywwQkFBc0IsS0FGaEI7QUFHTkMsZ0JBQVk7QUFDVitCLGdCQUFVO0FBQ1JqQyxjQUFNLFFBREU7QUFFUk0sbUJBQVc7QUFGSCxPQURBO0FBS1ZFLG9CQUFjO0FBQ1pSLGNBQU07QUFETTtBQUxKLEtBSE47QUFZTlcsY0FBVSxDQUNSLFVBRFEsRUFFUixjQUZRO0FBWko7QUFEOEIsQ0FBbkIsQ0FBZDtBQW1CUCxzQ0FBaUIwQixLQUFqQiIsImZpbGUiOiJ1c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsi77u/LyogYnRjLWFwcC1zZXJ2ZXIgLS0gU2VydmVyIGZvciB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvblxuICogQ29weXJpZ2h0IMKpIDIwMTYgQWR2ZW50dXJlIEN5Y2xpbmcgQXNzb2NpYXRpb25cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBidGMtYXBwLXNlcnZlci5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEZvb2Jhci4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgeyBDb3VjaE1vZGVsLCBDb3VjaENvbGxlY3Rpb24gfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgbWl4aW5WYWxpZGF0aW9uLCBtZXJnZVNjaGVtYXMgfSBmcm9tICcuL3ZhbGlkYXRpb24tbWl4aW4nO1xuXG4vLyBCYXNlIHNjaGVtYSBmb3IgYm90aCBVc2VyIGFuZCBVc2VyUmVmLlxuLy9cbi8vIFRoaXMgc2NoZW1hIGluY2x1ZGVzIHRoZSBmaWVsZHMgd2Ugd2FudCB0byBzdG9yZSBhbG9uZyB3aXRoIGEgdXNlciBkb2N1bWVudCxcbi8vIGluY2x1ZGluZzogZW1haWwsIGZpcnN0IG5hbWUsIGxhc3QgbmFtZSwgdXNlcm5hbWUgPE5PVyBSRU1PVkVEIGFzIG9mIE9jdCAybmQsIDIwMTY+LFxuLy8gdmVyaWZpY2F0aW9uICh0aGUgdG9rZW4pLFxuLy8gYW5kIHZlcmlmaWVkIChhIGJvb2xlYW4pLlxuLy9cbi8vIFdlIGFsc28gdXNlIENvdWNoREIncyAncm9sZXMnIGRpcmVjdGx5LiBUaGlzIHNjaGVtYSBkb2VzIG5vdCByZXF1aXJlIGFcbi8vIHBhc3N3b3JkLCBiZWNhdXNlIGFmdGVyIGEgcGFzc3dvcmQgaXMgd3JpdHRlbiB0byBhIENvdWNoREIgZG9jdW1lbnQsIGl0XG4vLyBjYW5ub3QgdGhlbiBiZSByZXRyaWV2ZWQgKGFuZCB0aHVzIHdvdWxkIGZhaWwgdmFsaWRhdGlvbikuXG5jb25zdCBzY2hlbWEgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBlbWFpbDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBmb3JtYXQ6ICdlbWFpbCdcbiAgICB9LFxuICAgIGZpcnN0OiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIG1pbkxlbmd0aDogMVxuICAgIH0sXG4gICAgbGFzdDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBtaW5MZW5ndGg6IDFcbiAgICB9LFxuICAgIHZlcmlmaWNhdGlvbjoge1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICB9LFxuICAgIHZlcmlmaWVkOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICB9LFxuICAgIHJvbGVzOiB7XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgfVxuICB9LFxuICByZXF1aXJlZDogW1xuICAgICdlbWFpbCcsXG4gICAgJ2ZpcnN0JyxcbiAgICAnbGFzdCcsXG4gICAgJ3ZlcmlmaWVkJyxcbiAgICAncm9sZXMnXG4gIF1cbn07XG5cbi8vICMgVXNlciBSZWZlcmVuY2Vcbi8vIFdlIHVuaXF1ZWx5IHJlZmVyZW5jZSBVc2VycyBieSB0aGVpciBlbWFpbHMuIFdoZW4gbW9kZWxzIGFyZSBzZXJpYWxpemVkIGludG9cbi8vIENvdWNoREIgZG9jcywgdGhlIGBfaWRgIGFuZCBgbmFtZWAga2V5cyB3aWxsIGJlIHNldC4gVXNlIGEgVXNlclJlZiBXaGVuXG4vLyB5b3UgYXJlIHJldHJpdmluZyB1c2VyIGluZnJvbWF0aW9uIGZyb20gdGhlIHNlcnZlciAoaXQgd2lsbCBub3QgaW5jbHVkZVxuLy8gdGhlIHBhc3N3b3JkKS5cbmV4cG9ydCBjb25zdCBVc2VyUmVmID0gQ291Y2hNb2RlbC5leHRlbmQoIHtcbiAgaWRBdHRyaWJ1dGU6ICdlbWFpbCcsXG5cbiAgc2FmZWd1YXJkOiBbXG4gICAgJ25hbWUnLFxuICAgICd0eXBlJyxcbiAgICAnZGVyaXZlZF9rZXknLFxuICAgICdpdGVyYXRpb25zJyxcbiAgICAncGFzc3dvcmRfc2NoZW1lJyxcbiAgICAnc2FsdCdcbiAgXSxcblxuICBkZWZhdWx0czoge1xuICAgIHJvbGVzOiBbXSxcbiAgICB2ZXJpZmllZDogZmFsc2VcbiAgfSxcblxuICBzY2hlbWE6IHNjaGVtYSxcblxuICAvLyAjIHRvSlNPTlxuICAvLyBTZXJpYWxpemUgdGhlIFVzZXIgb2JqZWN0IGludG8gYSBkb2MgZm9yIENvdWNoREIuXG4gIC8vXG4gIC8vIENvdWNoREIncyBzcGVjaWFsIHVzZXJzIGRhdGFiYXNlIGhhcyBleHRyYSByZXF1aXJlbWVudHMuXG4gIC8vICAtIF9pZCBtdXN0IG1hdGNoIGAvb3JnLmNvdWNoZGIudXNlcjovYGBcbiAgLy8gIC0gbmFtZSBpcyBlcXVhbCB0byB0aGUgcG9ydGlvbiBhZnRlciB0aGUgY29sb25cbiAgLy8gIC0gdHlwZSBtdXN0IGJlICd1c2VyJy5cbiAgdG9KU09OOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbigge30sIHRoaXMuYXR0cmlidXRlcywge1xuICAgICAgX2lkOiBgb3JnLmNvdWNoZGIudXNlcjoke3RoaXMuYXR0cmlidXRlcy5lbWFpbH1gLFxuICAgICAgbmFtZTogdGhpcy5hdHRyaWJ1dGVzLmVtYWlsLFxuICAgICAgdHlwZTogJ3VzZXInXG4gICAgfSApO1xuICB9XG59ICk7XG5taXhpblZhbGlkYXRpb24oIFVzZXJSZWYgKTtcblxuLy8gIyBVc2VyIFJlZmVyZW5jZSBDb2xsZWN0aW9uIENvbGxlY3Rpb25cbi8vIEdldCBhbGwgQ291Y2hEQiB1c2VycywgcHJlZml4ZWQgYnkgJ29yZy5jb3VjaGRiLnVzZXI6Jy5cbmV4cG9ydCBjb25zdCBVc2VyUmVmQ29sbGVjdGlvbiA9IENvdWNoQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgbW9kZWw6IFVzZXJSZWYsXG5cbiAgcG91Y2g6IHtcbiAgICBvcHRpb25zOiB7XG4gICAgICBhbGxEb2NzOiB7XG4gICAgICAgIGluY2x1ZGVfZG9jczogdHJ1ZSxcbiAgICAgICAgc3RhcnRrZXk6ICdvcmcuY291Y2hkYi51c2VyOicsXG4gICAgICAgIGVuZGtleTogJ29yZy5jb3VjaGRiLnVzZXI6XFx1ZmZmZidcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0gKTtcblxuLy8gIyBVc2VyIE1vZGVsXG4vLyBVc2UgdGhpcyBtb2RlbCB3aGVuIHlvdSB3YW50IHRvIGNyZWF0ZSBuZXcgdXNlcnMuIFRoaXMgbW9kZWwgdmFsaWRhdGVzXG4vLyBwYXNzd29yZHMgaW4gYWRkaXRpb24gdG8gdGhlIG90aGVyIGluZm9ybWF0aW9uLlxuZXhwb3J0IGNvbnN0IFVzZXIgPSBVc2VyUmVmLmV4dGVuZCgge1xuICBzY2hlbWE6IG1lcmdlU2NoZW1hcyggVXNlclJlZi5wcm90b3R5cGUuc2NoZW1hLCB7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgcGFzc3dvcmQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIG1pbkxlbmd0aDogOFxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICdwYXNzd29yZCdcbiAgICBdXG4gIH0gKVxufSApO1xubWl4aW5WYWxpZGF0aW9uKCBVc2VyICk7XG5cbi8vICMgVXNlciBDb2xsZWN0aW9uXG4vLyBHZXQgYWxsIENvdWNoREIgdXNlcnMsIHByZWZpeGVkIGJ5ICdvcmcuY291Y2hkYi51c2VyOicuXG5leHBvcnQgY29uc3QgVXNlckNvbGxlY3Rpb24gPSBVc2VyUmVmQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgbW9kZWw6IFVzZXJcbn0gKTtcblxuLy8gIyBMb2dpbiBtb2RlbFxuLy8gSnVzdCBhIHVzZXIncyBlbWFpbCBhbmQgcGFzc3dvcmRcbmV4cG9ydCBjb25zdCBMb2dpbiA9IENvdWNoTW9kZWwuZXh0ZW5kKCB7XG4gIHNjaGVtYToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBlbWFpbDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZW1haWwnXG4gICAgICB9LFxuICAgICAgcGFzc3dvcmQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIG1pbkxlbmd0aDogOFxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICdlbWFpbCcsXG4gICAgICAncGFzc3dvcmQnXG4gICAgXVxuICB9XG59ICk7XG5taXhpblZhbGlkYXRpb24oIExvZ2luICk7XG5cbi8vICMgRm9yZ290IFBhc3N3b3JkIG1vZGVsXG4vLyBKdXN0IGEgdXNlcidzIGVtYWlsXG5leHBvcnQgY29uc3QgRm9yZ290ID0gQ291Y2hNb2RlbC5leHRlbmQoIHtcbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGVtYWlsOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdlbWFpbCdcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAnZW1haWwnXG4gICAgXVxuICB9XG59ICk7XG5taXhpblZhbGlkYXRpb24oIEZvcmdvdCApO1xuXG4vLyAjIFJlc2V0IFBhc3N3b3JkIG1vZGVsXG4vLyBKdXN0IGEgdXNlcidzIHBhc3N3b3JkLCBjb25maXJtIHBhc3N3b3JkLCBhbmQgdmVyaWZpY2F0aW9uIHRva2VuXG5leHBvcnQgY29uc3QgUmVzZXQgPSBDb3VjaE1vZGVsLmV4dGVuZCgge1xuICBzY2hlbWE6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgcGFzc3dvcmQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIG1pbkxlbmd0aDogOFxuICAgICAgfSxcbiAgICAgIHZlcmlmaWNhdGlvbjoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICdwYXNzd29yZCcsXG4gICAgICAndmVyaWZpY2F0aW9uJ1xuICAgIF1cbiAgfVxufSApO1xubWl4aW5WYWxpZGF0aW9uKCBSZXNldCApO1xuIl19