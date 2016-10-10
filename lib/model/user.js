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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC91c2VyLmpzIl0sIm5hbWVzIjpbInNjaGVtYSIsInR5cGUiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJlbWFpbCIsImZvcm1hdCIsImZpcnN0IiwibWluTGVuZ3RoIiwibGFzdCIsInZlcmlmaWNhdGlvbiIsInZlcmlmaWVkIiwicm9sZXMiLCJyZXF1aXJlZCIsIlVzZXJSZWYiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsInNhZmVndWFyZCIsImRlZmF1bHRzIiwidG9KU09OIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImF0dHJpYnV0ZXMiLCJfaWQiLCJuYW1lIiwiVXNlclJlZkNvbGxlY3Rpb24iLCJtb2RlbCIsInBvdWNoIiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsInN0YXJ0a2V5IiwiZW5ka2V5IiwiVXNlciIsInByb3RvdHlwZSIsInBhc3N3b3JkIiwiVXNlckNvbGxlY3Rpb24iLCJMb2dpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQW1CQTs7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQS9CQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdDQSxJQUFNQSxTQUFTO0FBQ2JDLFFBQU0sUUFETztBQUViQyx3QkFBc0IsS0FGVDtBQUdiQyxjQUFZO0FBQ1ZDLFdBQU87QUFDTEgsWUFBTSxRQUREO0FBRUxJLGNBQVE7QUFGSCxLQURHO0FBS1ZDLFdBQU87QUFDTEwsWUFBTSxRQUREO0FBRUxNLGlCQUFXO0FBRk4sS0FMRztBQVNWQyxVQUFNO0FBQ0pQLFlBQU0sUUFERjtBQUVKTSxpQkFBVztBQUZQLEtBVEk7QUFhVkUsa0JBQWM7QUFDWlIsWUFBTTtBQURNLEtBYko7QUFnQlZTLGNBQVU7QUFDUlQsWUFBTTtBQURFLEtBaEJBO0FBbUJWVSxXQUFPO0FBQ0xWLFlBQU07QUFERDtBQW5CRyxHQUhDO0FBMEJiVyxZQUFVLENBQ1IsT0FEUSxFQUVSLE9BRlEsRUFHUixNQUhRLEVBSVIsVUFKUSxFQUtSLE9BTFE7QUExQkcsQ0FBZjs7QUFtQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLElBQU1DLDRCQUFVLGlCQUFXQyxNQUFYLENBQW1CO0FBQ3hDQyxlQUFhLE9BRDJCOztBQUd4Q0MsYUFBVyxDQUNULE1BRFMsRUFFVCxNQUZTLEVBR1QsYUFIUyxFQUlULFlBSlMsRUFLVCxpQkFMUyxFQU1ULE1BTlMsQ0FINkI7O0FBWXhDQyxZQUFVO0FBQ1JOLFdBQU8sRUFEQztBQUVSRCxjQUFVO0FBRkYsR0FaOEI7O0FBaUJ4Q1YsVUFBUUEsTUFqQmdDOztBQW1CeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQWtCLFVBQVEsZ0JBQVVDLE9BQVYsRUFBb0I7QUFDMUIsV0FBT0MsT0FBT0MsTUFBUCxDQUFlLEVBQWYsRUFBbUIsS0FBS0MsVUFBeEIsRUFBb0M7QUFDekNDLGlDQUF5QixLQUFLRCxVQUFMLENBQWdCbEIsS0FEQTtBQUV6Q29CLFlBQU0sS0FBS0YsVUFBTCxDQUFnQmxCLEtBRm1CO0FBR3pDSCxZQUFNO0FBSG1DLEtBQXBDLENBQVA7QUFLRDtBQWhDdUMsQ0FBbkIsQ0FBaEI7QUFrQ1Asc0NBQWlCWSxPQUFqQjs7QUFFQTtBQUNBO0FBQ08sSUFBTVksZ0RBQW9CLHNCQUFnQlgsTUFBaEIsQ0FBd0I7QUFDdkRZLFNBQU9iLE9BRGdEOztBQUd2RGMsU0FBTztBQUNMUixhQUFTO0FBQ1BTLGVBQVM7QUFDUEMsc0JBQWMsSUFEUDtBQUVQQyxrQkFBVSxtQkFGSDtBQUdQQyxnQkFBUTtBQUhEO0FBREY7QUFESjtBQUhnRCxDQUF4QixDQUExQjs7QUFjUDtBQUNBO0FBQ0E7QUFDTyxJQUFNQyxzQkFBT25CLFFBQVFDLE1BQVIsQ0FBZ0I7QUFDbENkLFVBQVEsbUNBQWMsRUFBZCxFQUFrQmEsUUFBUW9CLFNBQVIsQ0FBa0JqQyxNQUFwQyxFQUE0QztBQUNsREcsZ0JBQVk7QUFDVitCLGdCQUFVO0FBQ1JqQyxjQUFNLFFBREU7QUFFUk0sbUJBQVc7QUFGSDtBQURBLEtBRHNDO0FBT2xESyxjQUFVLENBQ1IsVUFEUTtBQVB3QyxHQUE1QztBQUQwQixDQUFoQixDQUFiO0FBYVAsc0NBQWlCb0IsSUFBakI7O0FBRUE7QUFDQTtBQUNPLElBQU1HLDBDQUFpQlYsa0JBQWtCWCxNQUFsQixDQUEwQjtBQUN0RFksU0FBT007QUFEK0MsQ0FBMUIsQ0FBdkI7O0FBSVA7QUFDQTtBQUNPLElBQU1JLHdCQUFRLGlCQUFXdEIsTUFBWCxDQUFtQjtBQUN0Q2QsVUFBUTtBQUNOQyxVQUFNLFFBREE7QUFFTkMsMEJBQXNCLEtBRmhCO0FBR05DLGdCQUFZO0FBQ1ZDLGFBQU87QUFDTEgsY0FBTSxRQUREO0FBRUxJLGdCQUFRO0FBRkgsT0FERztBQUtWNkIsZ0JBQVU7QUFDUmpDLGNBQU0sUUFERTtBQUVSTSxtQkFBVztBQUZIO0FBTEEsS0FITjtBQWFOSyxjQUFVLENBQ1IsT0FEUSxFQUVSLFVBRlE7QUFiSjtBQUQ4QixDQUFuQixDQUFkO0FBb0JQLHNDQUFpQndCLEtBQWpCIiwiZmlsZSI6InVzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBidGMtYXBwLXNlcnZlciAtLSBTZXJ2ZXIgZm9yIHRoZSBCaWN5Y2xlIFRvdXJpbmcgQ29tcGFuaW9uXG4gKiBDb3B5cmlnaHQgwqkgMjAxNiBBZHZlbnR1cmUgQ3ljbGluZyBBc3NvY2lhdGlvblxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGJ0Yy1hcHAtc2VydmVyLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogYnRjLWFwcC1zZXJ2ZXIgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRm9vYmFyLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCB7IENvdWNoTW9kZWwsIENvdWNoQ29sbGVjdGlvbiB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBtaXhpblZhbGlkYXRpb24sIG1lcmdlU2NoZW1hcyB9IGZyb20gJy4vdmFsaWRhdGlvbi1taXhpbic7XG5cbi8vIEJhc2Ugc2NoZW1hIGZvciBib3RoIFVzZXIgYW5kIFVzZXJSZWYuXG4vL1xuLy8gVGhpcyBzY2hlbWEgaW5jbHVkZXMgdGhlIGZpZWxkcyB3ZSB3YW50IHRvIHN0b3JlIGFsb25nIHdpdGggYSB1c2VyIGRvY3VtZW50LFxuLy8gaW5jbHVkaW5nOiBlbWFpbCwgZmlyc3QgbmFtZSwgbGFzdCBuYW1lLCB1c2VybmFtZSA8Tk9XIFJFTU9WRUQgYXMgb2YgT2N0IDJuZCwgMjAxNj4sIFxuLy8gdmVyaWZpY2F0aW9uICh0aGUgdG9rZW4pLFxuLy8gYW5kIHZlcmlmaWVkIChhIGJvb2xlYW4pLlxuLy9cbi8vIFdlIGFsc28gdXNlIENvdWNoREIncyAncm9sZXMnIGRpcmVjdGx5LiBUaGlzIHNjaGVtYSBkb2VzIG5vdCByZXF1aXJlIGFcbi8vIHBhc3N3b3JkLCBiZWNhdXNlIGFmdGVyIGEgcGFzc3dvcmQgaXMgd3JpdHRlbiB0byBhIENvdWNoREIgZG9jdW1lbnQsIGl0XG4vLyBjYW5ub3QgdGhlbiBiZSByZXRyaWV2ZWQgKGFuZCB0aHVzIHdvdWxkIGZhaWwgdmFsaWRhdGlvbikuXG5jb25zdCBzY2hlbWEgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBlbWFpbDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBmb3JtYXQ6ICdlbWFpbCdcbiAgICB9LFxuICAgIGZpcnN0OiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIG1pbkxlbmd0aDogMVxuICAgIH0sXG4gICAgbGFzdDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBtaW5MZW5ndGg6IDFcbiAgICB9LFxuICAgIHZlcmlmaWNhdGlvbjoge1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICB9LFxuICAgIHZlcmlmaWVkOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICB9LFxuICAgIHJvbGVzOiB7XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgfVxuICB9LFxuICByZXF1aXJlZDogW1xuICAgICdlbWFpbCcsXG4gICAgJ2ZpcnN0JyxcbiAgICAnbGFzdCcsXG4gICAgJ3ZlcmlmaWVkJyxcbiAgICAncm9sZXMnXG4gIF1cbn07XG5cbi8vICMgVXNlciBSZWZlcmVuY2Vcbi8vIFdlIHVuaXF1ZWx5IHJlZmVyZW5jZSBVc2VycyBieSB0aGVpciBlbWFpbHMuIFdoZW4gbW9kZWxzIGFyZSBzZXJpYWxpemVkIGludG9cbi8vIENvdWNoREIgZG9jcywgdGhlIGBfaWRgIGFuZCBgbmFtZWAga2V5cyB3aWxsIGJlIHNldC4gVXNlIGEgVXNlclJlZiBXaGVuXG4vLyB5b3UgYXJlIHJldHJpdmluZyB1c2VyIGluZnJvbWF0aW9uIGZyb20gdGhlIHNlcnZlciAoaXQgd2lsbCBub3QgaW5jbHVkZVxuLy8gdGhlIHBhc3N3b3JkKS5cbmV4cG9ydCBjb25zdCBVc2VyUmVmID0gQ291Y2hNb2RlbC5leHRlbmQoIHtcbiAgaWRBdHRyaWJ1dGU6ICdlbWFpbCcsXG5cbiAgc2FmZWd1YXJkOiBbXG4gICAgJ25hbWUnLFxuICAgICd0eXBlJyxcbiAgICAnZGVyaXZlZF9rZXknLFxuICAgICdpdGVyYXRpb25zJyxcbiAgICAncGFzc3dvcmRfc2NoZW1lJyxcbiAgICAnc2FsdCdcbiAgXSxcblxuICBkZWZhdWx0czoge1xuICAgIHJvbGVzOiBbXSxcbiAgICB2ZXJpZmllZDogZmFsc2VcbiAgfSxcblxuICBzY2hlbWE6IHNjaGVtYSxcblxuICAvLyAjIHRvSlNPTlxuICAvLyBTZXJpYWxpemUgdGhlIFVzZXIgb2JqZWN0IGludG8gYSBkb2MgZm9yIENvdWNoREIuXG4gIC8vXG4gIC8vIENvdWNoREIncyBzcGVjaWFsIHVzZXJzIGRhdGFiYXNlIGhhcyBleHRyYSByZXF1aXJlbWVudHMuXG4gIC8vICAtIF9pZCBtdXN0IG1hdGNoIGAvb3JnLmNvdWNoZGIudXNlcjovYGBcbiAgLy8gIC0gbmFtZSBpcyBlcXVhbCB0byB0aGUgcG9ydGlvbiBhZnRlciB0aGUgY29sb25cbiAgLy8gIC0gdHlwZSBtdXN0IGJlICd1c2VyJy5cbiAgdG9KU09OOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbigge30sIHRoaXMuYXR0cmlidXRlcywge1xuICAgICAgX2lkOiBgb3JnLmNvdWNoZGIudXNlcjoke3RoaXMuYXR0cmlidXRlcy5lbWFpbH1gLFxuICAgICAgbmFtZTogdGhpcy5hdHRyaWJ1dGVzLmVtYWlsLFxuICAgICAgdHlwZTogJ3VzZXInXG4gICAgfSApO1xuICB9XG59ICk7XG5taXhpblZhbGlkYXRpb24oIFVzZXJSZWYgKTtcblxuLy8gIyBVc2VyIFJlZmVyZW5jZSBDb2xsZWN0aW9uIENvbGxlY3Rpb25cbi8vIEdldCBhbGwgQ291Y2hEQiB1c2VycywgcHJlZml4ZWQgYnkgJ29yZy5jb3VjaGRiLnVzZXI6Jy5cbmV4cG9ydCBjb25zdCBVc2VyUmVmQ29sbGVjdGlvbiA9IENvdWNoQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgbW9kZWw6IFVzZXJSZWYsXG5cbiAgcG91Y2g6IHtcbiAgICBvcHRpb25zOiB7XG4gICAgICBhbGxEb2NzOiB7XG4gICAgICAgIGluY2x1ZGVfZG9jczogdHJ1ZSxcbiAgICAgICAgc3RhcnRrZXk6ICdvcmcuY291Y2hkYi51c2VyOicsXG4gICAgICAgIGVuZGtleTogJ29yZy5jb3VjaGRiLnVzZXI6XFx1ZmZmZidcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0gKTtcblxuLy8gIyBVc2VyIE1vZGVsXG4vLyBVc2UgdGhpcyBtb2RlbCB3aGVuIHlvdSB3YW50IHRvIGNyZWF0ZSBuZXcgdXNlcnMuIFRoaXMgbW9kZWwgdmFsaWRhdGVzXG4vLyBwYXNzd29yZHMgaW4gYWRkaXRpb24gdG8gdGhlIG90aGVyIGluZm9ybWF0aW9uLlxuZXhwb3J0IGNvbnN0IFVzZXIgPSBVc2VyUmVmLmV4dGVuZCgge1xuICBzY2hlbWE6IG1lcmdlU2NoZW1hcygge30sIFVzZXJSZWYucHJvdG90eXBlLnNjaGVtYSwge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHBhc3N3b3JkOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBtaW5MZW5ndGg6IDhcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAncGFzc3dvcmQnXG4gICAgXVxuICB9IClcbn0gKTtcbm1peGluVmFsaWRhdGlvbiggVXNlciApO1xuXG4vLyAjIFVzZXIgQ29sbGVjdGlvblxuLy8gR2V0IGFsbCBDb3VjaERCIHVzZXJzLCBwcmVmaXhlZCBieSAnb3JnLmNvdWNoZGIudXNlcjonLlxuZXhwb3J0IGNvbnN0IFVzZXJDb2xsZWN0aW9uID0gVXNlclJlZkNvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIG1vZGVsOiBVc2VyXG59ICk7XG5cbi8vICMgTG9naW4gbW9kZWxcbi8vIEp1c3QgYSB1c2VyJ3MgZW1haWwgYW5kIHBhc3N3b3JkXG5leHBvcnQgY29uc3QgTG9naW4gPSBDb3VjaE1vZGVsLmV4dGVuZCgge1xuICBzY2hlbWE6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgZW1haWw6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2VtYWlsJ1xuICAgICAgfSxcbiAgICAgIHBhc3N3b3JkOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBtaW5MZW5ndGg6IDhcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAnZW1haWwnLFxuICAgICAgJ3Bhc3N3b3JkJ1xuICAgIF1cbiAgfVxufSApO1xubWl4aW5WYWxpZGF0aW9uKCBMb2dpbiApO1xuIl19