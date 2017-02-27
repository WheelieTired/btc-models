'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Photo = undefined;

var _base = require('./base');

// # Photo Model
// The photo model stores photo attachments in the db separate from points.

var Photo = exports.Photo = _base.CouchModel.extend({
  idAttribute: '_id',

  initialize: function initialize(attributes, options) {
    _base.CouchModel.prototype.initialize.apply(this, arguments);

    var date = new Date().toISOString();
    this.set({
      created_at: date,
      updated_at: date
    });
  },

  update: function update() {
    this.set('updated_at', new Date().toISOString());
  },

  // ## Safeguard
  // We should not validate image attachments' _attachments keys
  safeguard: ['_attachments'],

  defaults: function defaults() {
    return {
      updated_by: 'unknown'
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
        type: 'string'
      }
    },
    required: ['created_at', 'updated_at', 'updated_by']
  }
}); /* btc-app-server -- Server for the Bicycle Touring Companion
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9waG90by5qcyJdLCJuYW1lcyI6WyJQaG90byIsImV4dGVuZCIsImlkQXR0cmlidXRlIiwiaW5pdGlhbGl6ZSIsImF0dHJpYnV0ZXMiLCJvcHRpb25zIiwicHJvdG90eXBlIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJkYXRlIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwic2V0IiwiY3JlYXRlZF9hdCIsInVwZGF0ZWRfYXQiLCJ1cGRhdGUiLCJzYWZlZ3VhcmQiLCJkZWZhdWx0cyIsInVwZGF0ZWRfYnkiLCJzY2hlbWEiLCJ0eXBlIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwiZm9ybWF0IiwicmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFtQkE7O0FBRUE7QUFDQTs7QUFFTyxJQUFNQSx3QkFBUSxpQkFBV0MsTUFBWCxDQUFtQjtBQUN0Q0MsZUFBYSxLQUR5Qjs7QUFHdENDLGNBQVksb0JBQVVDLFVBQVYsRUFBc0JDLE9BQXRCLEVBQWdDO0FBQzFDLHFCQUFXQyxTQUFYLENBQXFCSCxVQUFyQixDQUFnQ0ksS0FBaEMsQ0FBdUMsSUFBdkMsRUFBNkNDLFNBQTdDOztBQUVBLFFBQU1DLE9BQU8sSUFBSUMsSUFBSixHQUFXQyxXQUFYLEVBQWI7QUFDQSxTQUFLQyxHQUFMLENBQVU7QUFDUkMsa0JBQVlKLElBREo7QUFFUkssa0JBQVlMO0FBRkosS0FBVjtBQUtELEdBWnFDOztBQWN0Q00sVUFBUSxrQkFBVztBQUNqQixTQUFLSCxHQUFMLENBQVUsWUFBVixFQUF3QixJQUFJRixJQUFKLEdBQVdDLFdBQVgsRUFBeEI7QUFDRCxHQWhCcUM7O0FBa0J0QztBQUNBO0FBQ0FLLGFBQVcsQ0FDVCxjQURTLENBcEIyQjs7QUF3QnRDQyxZQUFVLG9CQUFXO0FBQ25CLFdBQU87QUFDTEMsa0JBQVk7QUFEUCxLQUFQO0FBR0QsR0E1QnFDOztBQThCdENDLFVBQVE7QUFDTkMsVUFBTSxRQURBO0FBRU5DLDBCQUFzQixLQUZoQjtBQUdOQyxnQkFBWTtBQUNWVCxrQkFBWTtBQUNWTyxjQUFNLFFBREk7QUFFVkcsZ0JBQVE7QUFGRSxPQURGO0FBS1ZULGtCQUFZO0FBQ1ZNLGNBQU0sUUFESTtBQUVWRyxnQkFBUTtBQUZFLE9BTEY7QUFTVkwsa0JBQVk7QUFDVkUsY0FBTTtBQURJO0FBVEYsS0FITjtBQWdCTkksY0FBVSxDQUNSLFlBRFEsRUFFUixZQUZRLEVBR1IsWUFIUTtBQWhCSjtBQTlCOEIsQ0FBbkIsQ0FBZCxDLENBeEJQIiwiZmlsZSI6InBob3RvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogYnRjLWFwcC1zZXJ2ZXIgLS0gU2VydmVyIGZvciB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvblxuICogQ29weXJpZ2h0IMKpIDIwMTYgQWR2ZW50dXJlIEN5Y2xpbmcgQXNzb2NpYXRpb25cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBidGMtYXBwLXNlcnZlci5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEZvb2Jhci4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgeyBDb3VjaE1vZGVsIH0gZnJvbSAnLi9iYXNlJztcblxuLy8gIyBQaG90byBNb2RlbFxuLy8gVGhlIHBob3RvIG1vZGVsIHN0b3JlcyBwaG90byBhdHRhY2htZW50cyBpbiB0aGUgZGIgc2VwYXJhdGUgZnJvbSBwb2ludHMuXG5cbmV4cG9ydCBjb25zdCBQaG90byA9IENvdWNoTW9kZWwuZXh0ZW5kKCB7XG4gIGlkQXR0cmlidXRlOiAnX2lkJyxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBDb3VjaE1vZGVsLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB0aGlzLnNldCgge1xuICAgICAgY3JlYXRlZF9hdDogZGF0ZSxcbiAgICAgIHVwZGF0ZWRfYXQ6IGRhdGUsXG4gICAgfSApO1xuXG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldCggJ3VwZGF0ZWRfYXQnLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgKTtcbiAgfSxcblxuICAvLyAjIyBTYWZlZ3VhcmRcbiAgLy8gV2Ugc2hvdWxkIG5vdCB2YWxpZGF0ZSBpbWFnZSBhdHRhY2htZW50cycgX2F0dGFjaG1lbnRzIGtleXNcbiAgc2FmZWd1YXJkOiBbXG4gICAgJ19hdHRhY2htZW50cydcbiAgXSxcblxuICBkZWZhdWx0czogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZWRfYnk6ICd1bmtub3duJyxcbiAgICB9O1xuICB9LFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBjcmVhdGVkX2F0OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICB9LFxuICAgICAgdXBkYXRlZF9hdDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWRfYnk6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9XG4gICAgfSxcbiAgICByZXF1aXJlZDogW1xuICAgICAgJ2NyZWF0ZWRfYXQnLFxuICAgICAgJ3VwZGF0ZWRfYXQnLFxuICAgICAgJ3VwZGF0ZWRfYnknXG4gICAgXVxuICB9LFxufSApO1xuIl19