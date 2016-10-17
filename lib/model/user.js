'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Login = exports.UserCollection = exports.User = exports.UserRefCollection = exports.UserRef = undefined;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC91c2VyLmpzIl0sIm5hbWVzIjpbInNjaGVtYSIsInR5cGUiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJlbWFpbCIsImZvcm1hdCIsImZpcnN0IiwibWluTGVuZ3RoIiwibGFzdCIsInZlcmlmaWNhdGlvbiIsInZlcmlmaWVkIiwicm9sZXMiLCJyZXF1aXJlZCIsIlVzZXJSZWYiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsInNhZmVndWFyZCIsImRlZmF1bHRzIiwidG9KU09OIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImF0dHJpYnV0ZXMiLCJfaWQiLCJuYW1lIiwiVXNlclJlZkNvbGxlY3Rpb24iLCJtb2RlbCIsInBvdWNoIiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsInN0YXJ0a2V5IiwiZW5ka2V5IiwiVXNlciIsInByb3RvdHlwZSIsInBhc3N3b3JkIiwiVXNlckNvbGxlY3Rpb24iLCJMb2dpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQW1CQTs7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQS9CQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdDQSxJQUFNQSxTQUFTO0FBQ2JDLFFBQU0sUUFETztBQUViQyx3QkFBc0IsS0FGVDtBQUdiQyxjQUFZO0FBQ1ZDLFdBQU87QUFDTEgsWUFBTSxRQUREO0FBRUxJLGNBQVE7QUFGSCxLQURHO0FBS1ZDLFdBQU87QUFDTEwsWUFBTSxRQUREO0FBRUxNLGlCQUFXO0FBRk4sS0FMRztBQVNWQyxVQUFNO0FBQ0pQLFlBQU0sUUFERjtBQUVKTSxpQkFBVztBQUZQLEtBVEk7QUFhVkUsa0JBQWM7QUFDWlIsWUFBTTtBQURNLEtBYko7QUFnQlZTLGNBQVU7QUFDUlQsWUFBTTtBQURFLEtBaEJBO0FBbUJWVSxXQUFPO0FBQ0xWLFlBQU07QUFERDtBQW5CRyxHQUhDO0FBMEJiVyxZQUFVLENBQ1IsT0FEUSxFQUVSLE9BRlEsRUFHUixNQUhRLEVBSVIsVUFKUSxFQUtSLE9BTFE7QUExQkcsQ0FBZjs7QUFtQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLElBQU1DLDRCQUFVLGlCQUFXQyxNQUFYLENBQW1CO0FBQ3hDQyxlQUFhLE9BRDJCOztBQUd4Q0MsYUFBVyxDQUNULE1BRFMsRUFFVCxNQUZTLEVBR1QsYUFIUyxFQUlULFlBSlMsRUFLVCxpQkFMUyxFQU1ULE1BTlMsQ0FINkI7O0FBWXhDQyxZQUFVO0FBQ1JOLFdBQU8sRUFEQztBQUVSRCxjQUFVO0FBRkYsR0FaOEI7O0FBaUJ4Q1YsVUFBUUEsTUFqQmdDOztBQW1CeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQWtCLFVBQVEsZ0JBQVVDLE9BQVYsRUFBb0I7QUFDMUIsV0FBT0MsT0FBT0MsTUFBUCxDQUFlLEVBQWYsRUFBbUIsS0FBS0MsVUFBeEIsRUFBb0M7QUFDekNDLGlDQUF5QixLQUFLRCxVQUFMLENBQWdCbEIsS0FEQTtBQUV6Q29CLFlBQU0sS0FBS0YsVUFBTCxDQUFnQmxCLEtBRm1CO0FBR3pDSCxZQUFNO0FBSG1DLEtBQXBDLENBQVA7QUFLRDtBQWhDdUMsQ0FBbkIsQ0FBaEI7QUFrQ1Asc0NBQWlCWSxPQUFqQjs7QUFFQTtBQUNBO0FBQ08sSUFBTVksZ0RBQW9CLHNCQUFnQlgsTUFBaEIsQ0FBd0I7QUFDdkRZLFNBQU9iLE9BRGdEOztBQUd2RGMsU0FBTztBQUNMUixhQUFTO0FBQ1BTLGVBQVM7QUFDUEMsc0JBQWMsSUFEUDtBQUVQQyxrQkFBVSxtQkFGSDtBQUdQQyxnQkFBUTtBQUhEO0FBREY7QUFESjtBQUhnRCxDQUF4QixDQUExQjs7QUFjUDtBQUNBO0FBQ0E7QUFDTyxJQUFNQyxzQkFBT25CLFFBQVFDLE1BQVIsQ0FBZ0I7QUFDbENkLFVBQVEsbUNBQWNhLFFBQVFvQixTQUFSLENBQWtCakMsTUFBaEMsRUFBd0M7QUFDOUNHLGdCQUFZO0FBQ1YrQixnQkFBVTtBQUNSakMsY0FBTSxRQURFO0FBRVJNLG1CQUFXO0FBRkg7QUFEQSxLQURrQztBQU85Q0ssY0FBVSxDQUNSLFVBRFE7QUFQb0MsR0FBeEM7QUFEMEIsQ0FBaEIsQ0FBYjtBQWFQLHNDQUFpQm9CLElBQWpCOztBQUVBO0FBQ0E7QUFDTyxJQUFNRywwQ0FBaUJWLGtCQUFrQlgsTUFBbEIsQ0FBMEI7QUFDdERZLFNBQU9NO0FBRCtDLENBQTFCLENBQXZCOztBQUlQO0FBQ0E7QUFDTyxJQUFNSSx3QkFBUSxpQkFBV3RCLE1BQVgsQ0FBbUI7QUFDdENkLFVBQVE7QUFDTkMsVUFBTSxRQURBO0FBRU5DLDBCQUFzQixLQUZoQjtBQUdOQyxnQkFBWTtBQUNWQyxhQUFPO0FBQ0xILGNBQU0sUUFERDtBQUVMSSxnQkFBUTtBQUZILE9BREc7QUFLVjZCLGdCQUFVO0FBQ1JqQyxjQUFNLFFBREU7QUFFUk0sbUJBQVc7QUFGSDtBQUxBLEtBSE47QUFhTkssY0FBVSxDQUNSLE9BRFEsRUFFUixVQUZRO0FBYko7QUFEOEIsQ0FBbkIsQ0FBZDtBQW9CUCxzQ0FBaUJ3QixLQUFqQiIsImZpbGUiOiJ1c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogYnRjLWFwcC1zZXJ2ZXIgLS0gU2VydmVyIGZvciB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvblxuICogQ29weXJpZ2h0IMKpIDIwMTYgQWR2ZW50dXJlIEN5Y2xpbmcgQXNzb2NpYXRpb25cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBidGMtYXBwLXNlcnZlci5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEZvb2Jhci4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgeyBDb3VjaE1vZGVsLCBDb3VjaENvbGxlY3Rpb24gfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgbWl4aW5WYWxpZGF0aW9uLCBtZXJnZVNjaGVtYXMgfSBmcm9tICcuL3ZhbGlkYXRpb24tbWl4aW4nO1xuXG4vLyBCYXNlIHNjaGVtYSBmb3IgYm90aCBVc2VyIGFuZCBVc2VyUmVmLlxuLy9cbi8vIFRoaXMgc2NoZW1hIGluY2x1ZGVzIHRoZSBmaWVsZHMgd2Ugd2FudCB0byBzdG9yZSBhbG9uZyB3aXRoIGEgdXNlciBkb2N1bWVudCxcbi8vIGluY2x1ZGluZzogZW1haWwsIGZpcnN0IG5hbWUsIGxhc3QgbmFtZSwgdXNlcm5hbWUgPE5PVyBSRU1PVkVEIGFzIG9mIE9jdCAybmQsIDIwMTY+LCBcbi8vIHZlcmlmaWNhdGlvbiAodGhlIHRva2VuKSxcbi8vIGFuZCB2ZXJpZmllZCAoYSBib29sZWFuKS5cbi8vXG4vLyBXZSBhbHNvIHVzZSBDb3VjaERCJ3MgJ3JvbGVzJyBkaXJlY3RseS4gVGhpcyBzY2hlbWEgZG9lcyBub3QgcmVxdWlyZSBhXG4vLyBwYXNzd29yZCwgYmVjYXVzZSBhZnRlciBhIHBhc3N3b3JkIGlzIHdyaXR0ZW4gdG8gYSBDb3VjaERCIGRvY3VtZW50LCBpdFxuLy8gY2Fubm90IHRoZW4gYmUgcmV0cmlldmVkIChhbmQgdGh1cyB3b3VsZCBmYWlsIHZhbGlkYXRpb24pLlxuY29uc3Qgc2NoZW1hID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgZW1haWw6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZm9ybWF0OiAnZW1haWwnXG4gICAgfSxcbiAgICBmaXJzdDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBtaW5MZW5ndGg6IDFcbiAgICB9LFxuICAgIGxhc3Q6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgbWluTGVuZ3RoOiAxXG4gICAgfSxcbiAgICB2ZXJpZmljYXRpb246IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgfSxcbiAgICB2ZXJpZmllZDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgfSxcbiAgICByb2xlczoge1xuICAgICAgdHlwZTogJ2FycmF5J1xuICAgIH1cbiAgfSxcbiAgcmVxdWlyZWQ6IFtcbiAgICAnZW1haWwnLFxuICAgICdmaXJzdCcsXG4gICAgJ2xhc3QnLFxuICAgICd2ZXJpZmllZCcsXG4gICAgJ3JvbGVzJ1xuICBdXG59O1xuXG4vLyAjIFVzZXIgUmVmZXJlbmNlXG4vLyBXZSB1bmlxdWVseSByZWZlcmVuY2UgVXNlcnMgYnkgdGhlaXIgZW1haWxzLiBXaGVuIG1vZGVscyBhcmUgc2VyaWFsaXplZCBpbnRvXG4vLyBDb3VjaERCIGRvY3MsIHRoZSBgX2lkYCBhbmQgYG5hbWVgIGtleXMgd2lsbCBiZSBzZXQuIFVzZSBhIFVzZXJSZWYgV2hlblxuLy8geW91IGFyZSByZXRyaXZpbmcgdXNlciBpbmZyb21hdGlvbiBmcm9tIHRoZSBzZXJ2ZXIgKGl0IHdpbGwgbm90IGluY2x1ZGVcbi8vIHRoZSBwYXNzd29yZCkuXG5leHBvcnQgY29uc3QgVXNlclJlZiA9IENvdWNoTW9kZWwuZXh0ZW5kKCB7XG4gIGlkQXR0cmlidXRlOiAnZW1haWwnLFxuXG4gIHNhZmVndWFyZDogW1xuICAgICduYW1lJyxcbiAgICAndHlwZScsXG4gICAgJ2Rlcml2ZWRfa2V5JyxcbiAgICAnaXRlcmF0aW9ucycsXG4gICAgJ3Bhc3N3b3JkX3NjaGVtZScsXG4gICAgJ3NhbHQnXG4gIF0sXG5cbiAgZGVmYXVsdHM6IHtcbiAgICByb2xlczogW10sXG4gICAgdmVyaWZpZWQ6IGZhbHNlXG4gIH0sXG5cbiAgc2NoZW1hOiBzY2hlbWEsXG5cbiAgLy8gIyB0b0pTT05cbiAgLy8gU2VyaWFsaXplIHRoZSBVc2VyIG9iamVjdCBpbnRvIGEgZG9jIGZvciBDb3VjaERCLlxuICAvL1xuICAvLyBDb3VjaERCJ3Mgc3BlY2lhbCB1c2VycyBkYXRhYmFzZSBoYXMgZXh0cmEgcmVxdWlyZW1lbnRzLlxuICAvLyAgLSBfaWQgbXVzdCBtYXRjaCBgL29yZy5jb3VjaGRiLnVzZXI6L2BgXG4gIC8vICAtIG5hbWUgaXMgZXF1YWwgdG8gdGhlIHBvcnRpb24gYWZ0ZXIgdGhlIGNvbG9uXG4gIC8vICAtIHR5cGUgbXVzdCBiZSAndXNlcicuXG4gIHRvSlNPTjogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHt9LCB0aGlzLmF0dHJpYnV0ZXMsIHtcbiAgICAgIF9pZDogYG9yZy5jb3VjaGRiLnVzZXI6JHt0aGlzLmF0dHJpYnV0ZXMuZW1haWx9YCxcbiAgICAgIG5hbWU6IHRoaXMuYXR0cmlidXRlcy5lbWFpbCxcbiAgICAgIHR5cGU6ICd1c2VyJ1xuICAgIH0gKTtcbiAgfVxufSApO1xubWl4aW5WYWxpZGF0aW9uKCBVc2VyUmVmICk7XG5cbi8vICMgVXNlciBSZWZlcmVuY2UgQ29sbGVjdGlvbiBDb2xsZWN0aW9uXG4vLyBHZXQgYWxsIENvdWNoREIgdXNlcnMsIHByZWZpeGVkIGJ5ICdvcmcuY291Y2hkYi51c2VyOicuXG5leHBvcnQgY29uc3QgVXNlclJlZkNvbGxlY3Rpb24gPSBDb3VjaENvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIG1vZGVsOiBVc2VyUmVmLFxuXG4gIHBvdWNoOiB7XG4gICAgb3B0aW9uczoge1xuICAgICAgYWxsRG9jczoge1xuICAgICAgICBpbmNsdWRlX2RvY3M6IHRydWUsXG4gICAgICAgIHN0YXJ0a2V5OiAnb3JnLmNvdWNoZGIudXNlcjonLFxuICAgICAgICBlbmRrZXk6ICdvcmcuY291Y2hkYi51c2VyOlxcdWZmZmYnXG4gICAgICB9XG4gICAgfVxuICB9XG59ICk7XG5cbi8vICMgVXNlciBNb2RlbFxuLy8gVXNlIHRoaXMgbW9kZWwgd2hlbiB5b3Ugd2FudCB0byBjcmVhdGUgbmV3IHVzZXJzLiBUaGlzIG1vZGVsIHZhbGlkYXRlc1xuLy8gcGFzc3dvcmRzIGluIGFkZGl0aW9uIHRvIHRoZSBvdGhlciBpbmZvcm1hdGlvbi5cbmV4cG9ydCBjb25zdCBVc2VyID0gVXNlclJlZi5leHRlbmQoIHtcbiAgc2NoZW1hOiBtZXJnZVNjaGVtYXMoIFVzZXJSZWYucHJvdG90eXBlLnNjaGVtYSwge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHBhc3N3b3JkOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBtaW5MZW5ndGg6IDhcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAncGFzc3dvcmQnXG4gICAgXVxuICB9IClcbn0gKTtcbm1peGluVmFsaWRhdGlvbiggVXNlciApO1xuXG4vLyAjIFVzZXIgQ29sbGVjdGlvblxuLy8gR2V0IGFsbCBDb3VjaERCIHVzZXJzLCBwcmVmaXhlZCBieSAnb3JnLmNvdWNoZGIudXNlcjonLlxuZXhwb3J0IGNvbnN0IFVzZXJDb2xsZWN0aW9uID0gVXNlclJlZkNvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIG1vZGVsOiBVc2VyXG59ICk7XG5cbi8vICMgTG9naW4gbW9kZWxcbi8vIEp1c3QgYSB1c2VyJ3MgZW1haWwgYW5kIHBhc3N3b3JkXG5leHBvcnQgY29uc3QgTG9naW4gPSBDb3VjaE1vZGVsLmV4dGVuZCgge1xuICBzY2hlbWE6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgZW1haWw6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2VtYWlsJ1xuICAgICAgfSxcbiAgICAgIHBhc3N3b3JkOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBtaW5MZW5ndGg6IDhcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAnZW1haWwnLFxuICAgICAgJ3Bhc3N3b3JkJ1xuICAgIF1cbiAgfVxufSApO1xubWl4aW5WYWxpZGF0aW9uKCBMb2dpbiApO1xuIl19