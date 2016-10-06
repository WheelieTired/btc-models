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
// including: email, first name, last name, username, verification (the token),
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
    username: {
      type: 'string',
      minLength: 3
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
  required: ['email', 'first', 'last', 'username', 'verified', 'roles']
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
        endkey: 'org.couchdb.user:￿'
      }
    }
  }
});

// # User Model
// Use this model when you want to create new users. This model validates
// passwords in addition to the other information.
var User = exports.User = UserRef.extend({
  schema: (0, _validationMixin.mergeSchemas)({}, UserRef.prototype.schema, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC91c2VyLmpzIl0sIm5hbWVzIjpbInNjaGVtYSIsInR5cGUiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJlbWFpbCIsImZvcm1hdCIsImZpcnN0IiwibWluTGVuZ3RoIiwibGFzdCIsInVzZXJuYW1lIiwidmVyaWZpY2F0aW9uIiwidmVyaWZpZWQiLCJyb2xlcyIsInJlcXVpcmVkIiwiVXNlclJlZiIsImV4dGVuZCIsImlkQXR0cmlidXRlIiwic2FmZWd1YXJkIiwiZGVmYXVsdHMiLCJ0b0pTT04iLCJvcHRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwiYXR0cmlidXRlcyIsIl9pZCIsIm5hbWUiLCJVc2VyUmVmQ29sbGVjdGlvbiIsIm1vZGVsIiwicG91Y2giLCJhbGxEb2NzIiwiaW5jbHVkZV9kb2NzIiwic3RhcnRrZXkiLCJlbmRrZXkiLCJVc2VyIiwicHJvdG90eXBlIiwicGFzc3dvcmQiLCJVc2VyQ29sbGVjdGlvbiIsIkxvZ2luIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBbUJBOztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTlCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStCQSxJQUFNQSxTQUFTO0FBQ2JDLFFBQU0sUUFETztBQUViQyx3QkFBc0IsS0FGVDtBQUdiQyxjQUFZO0FBQ1ZDLFdBQU87QUFDTEgsWUFBTSxRQUREO0FBRUxJLGNBQVE7QUFGSCxLQURHO0FBS1ZDLFdBQU87QUFDTEwsWUFBTSxRQUREO0FBRUxNLGlCQUFXO0FBRk4sS0FMRztBQVNWQyxVQUFNO0FBQ0pQLFlBQU0sUUFERjtBQUVKTSxpQkFBVztBQUZQLEtBVEk7QUFhVkUsY0FBVTtBQUNSUixZQUFNLFFBREU7QUFFUk0saUJBQVc7QUFGSCxLQWJBO0FBaUJWRyxrQkFBYztBQUNaVCxZQUFNO0FBRE0sS0FqQko7QUFvQlZVLGNBQVU7QUFDUlYsWUFBTTtBQURFLEtBcEJBO0FBdUJWVyxXQUFPO0FBQ0xYLFlBQU07QUFERDtBQXZCRyxHQUhDO0FBOEJiWSxZQUFVLENBQ1IsT0FEUSxFQUVSLE9BRlEsRUFHUixNQUhRLEVBSVIsVUFKUSxFQUtSLFVBTFEsRUFNUixPQU5RO0FBOUJHLENBQWY7O0FBd0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxJQUFNQyw0QkFBVSxpQkFBV0MsTUFBWCxDQUFtQjtBQUN4Q0MsZUFBYSxPQUQyQjs7QUFHeENDLGFBQVcsQ0FDVCxNQURTLEVBRVQsTUFGUyxFQUdULGFBSFMsRUFJVCxZQUpTLEVBS1QsaUJBTFMsRUFNVCxNQU5TLENBSDZCOztBQVl4Q0MsWUFBVTtBQUNSTixXQUFPLEVBREM7QUFFUkQsY0FBVTtBQUZGLEdBWjhCOztBQWlCeENYLFVBQVFBLE1BakJnQzs7QUFtQnhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FtQixVQUFRLGdCQUFVQyxPQUFWLEVBQW9CO0FBQzFCLFdBQU9DLE9BQU9DLE1BQVAsQ0FBZSxFQUFmLEVBQW1CLEtBQUtDLFVBQXhCLEVBQW9DO0FBQ3pDQyxpQ0FBeUIsS0FBS0QsVUFBTCxDQUFnQm5CLEtBREE7QUFFekNxQixZQUFNLEtBQUtGLFVBQUwsQ0FBZ0JuQixLQUZtQjtBQUd6Q0gsWUFBTTtBQUhtQyxLQUFwQyxDQUFQO0FBS0Q7QUFoQ3VDLENBQW5CLENBQWhCO0FBa0NQLHNDQUFpQmEsT0FBakI7O0FBRUE7QUFDQTtBQUNPLElBQU1ZLGdEQUFvQixzQkFBZ0JYLE1BQWhCLENBQXdCO0FBQ3ZEWSxTQUFPYixPQURnRDs7QUFHdkRjLFNBQU87QUFDTFIsYUFBUztBQUNQUyxlQUFTO0FBQ1BDLHNCQUFjLElBRFA7QUFFUEMsa0JBQVUsbUJBRkg7QUFHUEMsZ0JBQVE7QUFIRDtBQURGO0FBREo7QUFIZ0QsQ0FBeEIsQ0FBMUI7O0FBY1A7QUFDQTtBQUNBO0FBQ08sSUFBTUMsc0JBQU9uQixRQUFRQyxNQUFSLENBQWdCO0FBQ2xDZixVQUFRLG1DQUFjLEVBQWQsRUFBa0JjLFFBQVFvQixTQUFSLENBQWtCbEMsTUFBcEMsRUFBNEM7QUFDbERHLGdCQUFZO0FBQ1ZnQyxnQkFBVTtBQUNSbEMsY0FBTSxRQURFO0FBRVJNLG1CQUFXO0FBRkg7QUFEQSxLQURzQztBQU9sRE0sY0FBVSxDQUNSLFVBRFE7QUFQd0MsR0FBNUM7QUFEMEIsQ0FBaEIsQ0FBYjtBQWFQLHNDQUFpQm9CLElBQWpCOztBQUVBO0FBQ0E7QUFDTyxJQUFNRywwQ0FBaUJWLGtCQUFrQlgsTUFBbEIsQ0FBMEI7QUFDdERZLFNBQU9NO0FBRCtDLENBQTFCLENBQXZCOztBQUlQO0FBQ0E7QUFDTyxJQUFNSSx3QkFBUSxpQkFBV3RCLE1BQVgsQ0FBbUI7QUFDdENmLFVBQVE7QUFDTkMsVUFBTSxRQURBO0FBRU5DLDBCQUFzQixLQUZoQjtBQUdOQyxnQkFBWTtBQUNWQyxhQUFPO0FBQ0xILGNBQU0sUUFERDtBQUVMSSxnQkFBUTtBQUZILE9BREc7QUFLVjhCLGdCQUFVO0FBQ1JsQyxjQUFNLFFBREU7QUFFUk0sbUJBQVc7QUFGSDtBQUxBLEtBSE47QUFhTk0sY0FBVSxDQUNSLE9BRFEsRUFFUixVQUZRO0FBYko7QUFEOEIsQ0FBbkIsQ0FBZDtBQW9CUCxzQ0FBaUJ3QixLQUFqQiIsImZpbGUiOiJ1c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogYnRjLWFwcC1zZXJ2ZXIgLS0gU2VydmVyIGZvciB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvblxuICogQ29weXJpZ2h0IMKpIDIwMTYgQWR2ZW50dXJlIEN5Y2xpbmcgQXNzb2NpYXRpb25cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBidGMtYXBwLXNlcnZlci5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEZvb2Jhci4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgeyBDb3VjaE1vZGVsLCBDb3VjaENvbGxlY3Rpb24gfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgbWl4aW5WYWxpZGF0aW9uLCBtZXJnZVNjaGVtYXMgfSBmcm9tICcuL3ZhbGlkYXRpb24tbWl4aW4nO1xuXG4vLyBCYXNlIHNjaGVtYSBmb3IgYm90aCBVc2VyIGFuZCBVc2VyUmVmLlxuLy9cbi8vIFRoaXMgc2NoZW1hIGluY2x1ZGVzIHRoZSBmaWVsZHMgd2Ugd2FudCB0byBzdG9yZSBhbG9uZyB3aXRoIGEgdXNlciBkb2N1bWVudCxcbi8vIGluY2x1ZGluZzogZW1haWwsIGZpcnN0IG5hbWUsIGxhc3QgbmFtZSwgdXNlcm5hbWUsIHZlcmlmaWNhdGlvbiAodGhlIHRva2VuKSxcbi8vIGFuZCB2ZXJpZmllZCAoYSBib29sZWFuKS5cbi8vXG4vLyBXZSBhbHNvIHVzZSBDb3VjaERCJ3MgJ3JvbGVzJyBkaXJlY3RseS4gVGhpcyBzY2hlbWEgZG9lcyBub3QgcmVxdWlyZSBhXG4vLyBwYXNzd29yZCwgYmVjYXVzZSBhZnRlciBhIHBhc3N3b3JkIGlzIHdyaXR0ZW4gdG8gYSBDb3VjaERCIGRvY3VtZW50LCBpdFxuLy8gY2Fubm90IHRoZW4gYmUgcmV0cmlldmVkIChhbmQgdGh1cyB3b3VsZCBmYWlsIHZhbGlkYXRpb24pLlxuY29uc3Qgc2NoZW1hID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgZW1haWw6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZm9ybWF0OiAnZW1haWwnXG4gICAgfSxcbiAgICBmaXJzdDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBtaW5MZW5ndGg6IDFcbiAgICB9LFxuICAgIGxhc3Q6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgbWluTGVuZ3RoOiAxXG4gICAgfSxcbiAgICB1c2VybmFtZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBtaW5MZW5ndGg6IDNcbiAgICB9LFxuICAgIHZlcmlmaWNhdGlvbjoge1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICB9LFxuICAgIHZlcmlmaWVkOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICB9LFxuICAgIHJvbGVzOiB7XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgfVxuICB9LFxuICByZXF1aXJlZDogW1xuICAgICdlbWFpbCcsXG4gICAgJ2ZpcnN0JyxcbiAgICAnbGFzdCcsXG4gICAgJ3VzZXJuYW1lJyxcbiAgICAndmVyaWZpZWQnLFxuICAgICdyb2xlcydcbiAgXVxufTtcblxuLy8gIyBVc2VyIFJlZmVyZW5jZVxuLy8gV2UgdW5pcXVlbHkgcmVmZXJlbmNlIFVzZXJzIGJ5IHRoZWlyIGVtYWlscy4gV2hlbiBtb2RlbHMgYXJlIHNlcmlhbGl6ZWQgaW50b1xuLy8gQ291Y2hEQiBkb2NzLCB0aGUgYF9pZGAgYW5kIGBuYW1lYCBrZXlzIHdpbGwgYmUgc2V0LiBVc2UgYSBVc2VyUmVmIFdoZW5cbi8vIHlvdSBhcmUgcmV0cml2aW5nIHVzZXIgaW5mcm9tYXRpb24gZnJvbSB0aGUgc2VydmVyIChpdCB3aWxsIG5vdCBpbmNsdWRlXG4vLyB0aGUgcGFzc3dvcmQpLlxuZXhwb3J0IGNvbnN0IFVzZXJSZWYgPSBDb3VjaE1vZGVsLmV4dGVuZCgge1xuICBpZEF0dHJpYnV0ZTogJ2VtYWlsJyxcblxuICBzYWZlZ3VhcmQ6IFtcbiAgICAnbmFtZScsXG4gICAgJ3R5cGUnLFxuICAgICdkZXJpdmVkX2tleScsXG4gICAgJ2l0ZXJhdGlvbnMnLFxuICAgICdwYXNzd29yZF9zY2hlbWUnLFxuICAgICdzYWx0J1xuICBdLFxuXG4gIGRlZmF1bHRzOiB7XG4gICAgcm9sZXM6IFtdLFxuICAgIHZlcmlmaWVkOiBmYWxzZVxuICB9LFxuXG4gIHNjaGVtYTogc2NoZW1hLFxuXG4gIC8vICMgdG9KU09OXG4gIC8vIFNlcmlhbGl6ZSB0aGUgVXNlciBvYmplY3QgaW50byBhIGRvYyBmb3IgQ291Y2hEQi5cbiAgLy9cbiAgLy8gQ291Y2hEQidzIHNwZWNpYWwgdXNlcnMgZGF0YWJhc2UgaGFzIGV4dHJhIHJlcXVpcmVtZW50cy5cbiAgLy8gIC0gX2lkIG11c3QgbWF0Y2ggYC9vcmcuY291Y2hkYi51c2VyOi9gYFxuICAvLyAgLSBuYW1lIGlzIGVxdWFsIHRvIHRoZSBwb3J0aW9uIGFmdGVyIHRoZSBjb2xvblxuICAvLyAgLSB0eXBlIG11c3QgYmUgJ3VzZXInLlxuICB0b0pTT046IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKCB7fSwgdGhpcy5hdHRyaWJ1dGVzLCB7XG4gICAgICBfaWQ6IGBvcmcuY291Y2hkYi51c2VyOiR7dGhpcy5hdHRyaWJ1dGVzLmVtYWlsfWAsXG4gICAgICBuYW1lOiB0aGlzLmF0dHJpYnV0ZXMuZW1haWwsXG4gICAgICB0eXBlOiAndXNlcidcbiAgICB9ICk7XG4gIH1cbn0gKTtcbm1peGluVmFsaWRhdGlvbiggVXNlclJlZiApO1xuXG4vLyAjIFVzZXIgUmVmZXJlbmNlIENvbGxlY3Rpb24gQ29sbGVjdGlvblxuLy8gR2V0IGFsbCBDb3VjaERCIHVzZXJzLCBwcmVmaXhlZCBieSAnb3JnLmNvdWNoZGIudXNlcjonLlxuZXhwb3J0IGNvbnN0IFVzZXJSZWZDb2xsZWN0aW9uID0gQ291Y2hDb2xsZWN0aW9uLmV4dGVuZCgge1xuICBtb2RlbDogVXNlclJlZixcblxuICBwb3VjaDoge1xuICAgIG9wdGlvbnM6IHtcbiAgICAgIGFsbERvY3M6IHtcbiAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlLFxuICAgICAgICBzdGFydGtleTogJ29yZy5jb3VjaGRiLnVzZXI6JyxcbiAgICAgICAgZW5ka2V5OiAnb3JnLmNvdWNoZGIudXNlcjpcXHVmZmZmJ1xuICAgICAgfVxuICAgIH1cbiAgfVxufSApO1xuXG4vLyAjIFVzZXIgTW9kZWxcbi8vIFVzZSB0aGlzIG1vZGVsIHdoZW4geW91IHdhbnQgdG8gY3JlYXRlIG5ldyB1c2Vycy4gVGhpcyBtb2RlbCB2YWxpZGF0ZXNcbi8vIHBhc3N3b3JkcyBpbiBhZGRpdGlvbiB0byB0aGUgb3RoZXIgaW5mb3JtYXRpb24uXG5leHBvcnQgY29uc3QgVXNlciA9IFVzZXJSZWYuZXh0ZW5kKCB7XG4gIHNjaGVtYTogbWVyZ2VTY2hlbWFzKCB7fSwgVXNlclJlZi5wcm90b3R5cGUuc2NoZW1hLCB7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgcGFzc3dvcmQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIG1pbkxlbmd0aDogOFxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICdwYXNzd29yZCdcbiAgICBdXG4gIH0gKVxufSApO1xubWl4aW5WYWxpZGF0aW9uKCBVc2VyICk7XG5cbi8vICMgVXNlciBDb2xsZWN0aW9uXG4vLyBHZXQgYWxsIENvdWNoREIgdXNlcnMsIHByZWZpeGVkIGJ5ICdvcmcuY291Y2hkYi51c2VyOicuXG5leHBvcnQgY29uc3QgVXNlckNvbGxlY3Rpb24gPSBVc2VyUmVmQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgbW9kZWw6IFVzZXJcbn0gKTtcblxuLy8gIyBMb2dpbiBtb2RlbFxuLy8gSnVzdCBhIHVzZXIncyBlbWFpbCBhbmQgcGFzc3dvcmRcbmV4cG9ydCBjb25zdCBMb2dpbiA9IENvdWNoTW9kZWwuZXh0ZW5kKCB7XG4gIHNjaGVtYToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBlbWFpbDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZW1haWwnXG4gICAgICB9LFxuICAgICAgcGFzc3dvcmQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIG1pbkxlbmd0aDogOFxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICdlbWFpbCcsXG4gICAgICAncGFzc3dvcmQnXG4gICAgXVxuICB9XG59ICk7XG5taXhpblZhbGlkYXRpb24oIExvZ2luICk7XG4iXX0=