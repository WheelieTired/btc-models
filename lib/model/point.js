'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PointCollection = exports.Alert = exports.alertTypes = exports.Service = exports.serviceTypes = exports.Point = exports.pointId = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /* btc-app-server -- Server for the Bicycle Touring Companion
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

exports.display = display;

var _validationMixin = require('./validation-mixin');

var _base = require('./base');

var _lodash = require('lodash');

var _docuri = require('docuri');

var _docuri2 = _interopRequireDefault(_docuri);

var _ngeohash = require('ngeohash');

var _ngeohash2 = _interopRequireDefault(_ngeohash);

var _toId = require('to-id');

var _toId2 = _interopRequireDefault(_toId);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var browser = typeof window !== 'undefined';

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
var pointId = exports.pointId = _docuri2.default.route('point/:type/:name/:geohash');

var COMMENT_MIN_LENGTH = 1;
var COMMENT_MAX_LENGTH = 140;

var Point = exports.Point = _base.CouchModel.extend({
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

  // ## Specify
  // Fill in `_id` from the components of the point model uri.
  // Pull values from `attributes` if name and location are undefined.
  specify: function specify(type, name, location) {
    // Only set the ID attribute here if it wasn't already set.
    // The original ID stays the ID for the lifetime of the point.
    if (typeof this.attributes._id === "undefined") {
      if (name) {
        var _location = _slicedToArray(location, 2),
            lat = _location[0],
            lng = _location[1];

        var _id = pointId({
          type: type,
          name: (0, _toId2.default)(name),
          geohash: _ngeohash2.default.encode(lat, lng)
        });
        this.set({ _id: _id, type: type, name: name, location: location });
      } else {
        var _attributes = this.attributes,
            _name = _attributes.name,
            _location2 = _attributes.location;

        var _location3 = _slicedToArray(_location2, 2),
            _lat = _location3[0],
            _lng = _location3[1];

        var _id2 = pointId({
          type: type,
          name: (0, _toId2.default)(_name),
          geohash: _ngeohash2.default.encode(_lat, _lng)
        });
        this.set({ _id: _id2 });
      }
    }
  },

  defaults: function defaults() {
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
        type: 'string'
      },
      flagged_by: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            user: { type: 'string' },
            reason: { type: 'string', minLength: COMMENT_MIN_LENGTH, maxLength: COMMENT_MAX_LENGTH }
          },
          required: ['user', 'reason']
        }
      },
      is_hidden: {
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
          required: ['user', 'date', 'text', 'rating', 'uuid']
        }
      }
    },
    required: ['name', 'location', 'type', 'created_at', 'updated_at', 'updated_by', /* Added: To attach points to users via their _id */
    'flagged_by', 'is_hidden', 'comments']
  },

  clear: function clear() {
    _base.CouchModel.prototype.clear.apply(this, arguments);
  },

  // ## Get Redux Representation
  // Return a nested object/arary representation of the model suitable for
  // use with redux.
  store: function store() {
    return _extends({}, this.toJSON());
  }
}, {
  uri: pointId,

  for: function _for(id) {
    var pointIdComponents = pointId(id);
    var type = pointIdComponents.type;
    if (type === 'service') {
      return new Service({ _id: id });
    } else if (type === 'alert') {
      return new Alert({ _id: id });
    } else {
      throw 'A point must be a service or alert';
    }
  }
});

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
var serviceTypes = exports.serviceTypes = {
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

var Service = exports.Service = Point.extend({
  specify: function specify(name, location) {
    Point.prototype.specify.call(this, 'service', name, location);
  },

  defaults: function defaults() {
    return _extends({}, Point.prototype.defaults.apply(this, arguments), {
      amenities: [],
      schedule: { 'default': [] },
      seasonal: false
    });
  },

  schema: (0, _validationMixin.mergeSchemas)(Point.prototype.schema, {
    properties: {
      type: {
        enum: (0, _lodash.keys)(serviceTypes)
      },
      amenities: {
        type: 'array',
        items: {
          type: 'string',
          enum: (0, _lodash.keys)(serviceTypes)
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
    required: ['seasonal']
  })
});

// Apply the validation mixin to the Service model. See validation-mixin.js.
(0, _validationMixin.mixinValidation)(Service);

// # Alert Model
// An alert is something that might impede a cyclist's tour. When a cyclist
// sees an alert on the map, the know to plan around it.

/*esfmt-ignore-start*/
var alertTypes = exports.alertTypes = {
  'road_closure': { display: 'Road Closure' },
  'forest_fire': { display: 'Forest fire' },
  'flooding': { display: 'Flooding' },
  'detour': { display: 'Detour' },
  'other': { display: 'Other' }
};
/*esfmt-ignore-end*/

var Alert = exports.Alert = Point.extend({
  specify: function specify(name, location) {
    Point.prototype.specify.call(this, 'alert', name, location);
  },

  schema: (0, _validationMixin.mergeSchemas)(Point.prototype.schema, {
    properties: {
      type: {
        enum: (0, _lodash.keys)(alertTypes)
      },
      expiration_date: {
        type: 'string',
        format: 'date-time'
      }
    }
  })
});

(0, _validationMixin.mixinValidation)(Alert);

// # Point Collection
// A heterogeneous collection of services and alerts. PouchDB is able to fetch
// this collection by looking for all keys starting with 'point/'.
//
// A connected PointCollection must be able to generate connected Alerts or
// Services on demands. Therefore, if PointCollection is connected, connect
// models before returning them.
var PointCollection = exports.PointCollection = _base.CouchCollection.extend({
  initialize: function initialize(models, options) {
    _base.CouchCollection.prototype.initialize.apply(this, arguments);
    options = options || {};

    this.pouch = {
      options: {
        allDocs: (0, _lodash.assign)({ include_docs: true }, options.keys ? { keys: options.keys } : (0, _base.keysBetween)('point/'))
      }
    };

    var connect = this.connect,
        database = this.database;

    this.service = connect ? connect(database, Service) : Service;
    this.alert = connect ? connect(database, Alert) : Alert;
  },

  // This handles the `options.keys` edge cases listed in the
  // [PouchDB api](https://pouchdb.com/api.html#batch_fetch)
  parse: function parse(response, options) {
    return response.rows.filter(function (row) {
      return !(row.deleted || row.error);
    }).map(function (row) {
      return row.doc;
    });
  },

  model: function model(attributes, options) {
    var pointIdComponents = pointId(attributes._id);
    var type = pointIdComponents.type;
    var map = {
      'service': options.collection.service,
      'alert': options.collection.alert
    };
    var constructor = map[type];
    if (constructor) {
      var instance = new constructor(attributes, options);

      if (options.deindex && instance.has('index')) {
        instance.index = instance.get('index');
        instance.unset('index ');
      }

      return instance;
    } else {
      throw 'A point must be a service or alert';
    }
  },

  // ## Get Redux Representation
  // Return a nested object/arary representation of the collection suitable for
  // use with redux.
  store: function store() {
    return (0, _lodash.fromPairs)(this.models.map(function (point) {
      return [point.id, point.store()];
    }));
  }
});

// # Display Name for Type
// Given a type key from either the service or alert type enumerations,
// return the type's display string, or null if it does not exist.
function display(type) {
  var values = serviceTypes[type] || alertTypes[type];
  if (values) {
    return values.display;
  } else {
    return null;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiQ09NTUVOVF9NSU5fTEVOR1RIIiwiQ09NTUVOVF9NQVhfTEVOR1RIIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwidXBkYXRlIiwic3BlY2lmeSIsInR5cGUiLCJuYW1lIiwibG9jYXRpb24iLCJfaWQiLCJsYXQiLCJsbmciLCJnZW9oYXNoIiwiZW5jb2RlIiwiZGVmYXVsdHMiLCJmbGFnZ2VkX2J5IiwidXBkYXRlZF9ieSIsImNvbW1lbnRzIiwiaXNfaGlkZGVuIiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwibWluSXRlbXMiLCJtYXhJdGVtcyIsIml0ZW1zIiwiZm9ybWF0IiwidXNlciIsInJlYXNvbiIsIm1pbkxlbmd0aCIsIm1heExlbmd0aCIsInJlcXVpcmVkIiwiZGVzY3JpcHRpb24iLCJ0ZXh0IiwicmF0aW5nIiwibWluaW11bSIsIm1heGltdW0iLCJ1dWlkIiwiY2xlYXIiLCJzdG9yZSIsInRvSlNPTiIsInVyaSIsImZvciIsInBvaW50SWRDb21wb25lbnRzIiwiaWQiLCJTZXJ2aWNlIiwiQWxlcnQiLCJzZXJ2aWNlVHlwZXMiLCJjYWxsIiwiYW1lbml0aWVzIiwic2NoZWR1bGUiLCJzZWFzb25hbCIsImVudW0iLCJhZGRyZXNzIiwicGhvbmUiLCJ3ZWJzaXRlIiwidXBkYXRlZCIsImFsZXJ0VHlwZXMiLCJleHBpcmF0aW9uX2RhdGUiLCJQb2ludENvbGxlY3Rpb24iLCJtb2RlbHMiLCJwb3VjaCIsImFsbERvY3MiLCJpbmNsdWRlX2RvY3MiLCJrZXlzIiwiY29ubmVjdCIsImRhdGFiYXNlIiwic2VydmljZSIsImFsZXJ0IiwicGFyc2UiLCJyZXNwb25zZSIsInJvd3MiLCJmaWx0ZXIiLCJyb3ciLCJkZWxldGVkIiwiZXJyb3IiLCJtYXAiLCJkb2MiLCJtb2RlbCIsImNvbGxlY3Rpb24iLCJjb25zdHJ1Y3RvciIsImluc3RhbmNlIiwiZGVpbmRleCIsImhhcyIsImluZGV4IiwiZ2V0IiwidW5zZXQiLCJwb2ludCIsInZhbHVlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3lwQkFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQXNiZ0JBLE8sR0FBQUEsTzs7QUFuYWhCOztBQUNBOztBQUVBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxVQUFZLE9BQU9DLE1BQVAsS0FBa0IsV0FBcEM7O0FBRUEsSUFBSUMsVUFBVUMsUUFBUSxrQkFBUixDQUFkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxJQUFNQyw0QkFBVSxpQkFBT0MsS0FBUCxDQUFjLDRCQUFkLENBQWhCOztBQUVQLElBQU1DLHFCQUFxQixDQUEzQjtBQUNBLElBQU1DLHFCQUFxQixHQUEzQjs7QUFFTyxJQUFNQyx3QkFBUSxpQkFBV0MsTUFBWCxDQUFtQjtBQUN0Q0MsZUFBYSxLQUR5Qjs7QUFHdENDLGNBQVksb0JBQVVDLFVBQVYsRUFBc0JDLE9BQXRCLEVBQWdDO0FBQzFDLHFCQUFXQyxTQUFYLENBQXFCSCxVQUFyQixDQUFnQ0ksS0FBaEMsQ0FBdUMsSUFBdkMsRUFBNkNDLFNBQTdDOztBQUVBLFFBQU1DLE9BQU8sSUFBSUMsSUFBSixHQUFXQyxXQUFYLEVBQWI7QUFDQSxTQUFLQyxHQUFMLENBQVU7QUFDUkMsa0JBQVlKLElBREo7QUFFUkssa0JBQVlMO0FBRkosS0FBVjtBQUtELEdBWnFD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LElBQUwsQ0FBcEI7QUFDQSxRQUFLeUUsV0FBTCxFQUFtQjtBQUNqQixVQUFNQyxXQUFXLElBQUlELFdBQUosQ0FBaUJ0RixVQUFqQixFQUE2QkMsT0FBN0IsQ0FBakI7O0FBRUEsVUFBS0EsUUFBUXVGLE9BQVIsSUFBbUJELFNBQVNFLEdBQVQsQ0FBYyxPQUFkLENBQXhCLEVBQWtEO0FBQ2hERixpQkFBU0csS0FBVCxHQUFpQkgsU0FBU0ksR0FBVCxDQUFjLE9BQWQsQ0FBakI7QUFDQUosaUJBQVNLLEtBQVQsQ0FBZ0IsUUFBaEI7QUFDRDs7QUFFRCxhQUFPTCxRQUFQO0FBQ0QsS0FURCxNQVNPO0FBQ0wsWUFBTSxvQ0FBTjtBQUNEO0FBQ0YsR0FqRG9EOztBQW1EckQ7QUFDQTtBQUNBO0FBQ0ExQyxTQUFPLGlCQUFXO0FBQ2hCLFdBQU8sdUJBQVcsS0FBS3FCLE1BQUwsQ0FBWWdCLEdBQVosQ0FBaUI7QUFBQSxhQUFTLENBQUVXLE1BQU0zQyxFQUFSLEVBQVkyQyxNQUFNaEQsS0FBTixFQUFaLENBQVQ7QUFBQSxLQUFqQixDQUFYLENBQVA7QUFDRDtBQXhEb0QsQ0FBeEIsQ0FBeEI7O0FBMkRQO0FBQ0E7QUFDQTtBQUNPLFNBQVMxRCxPQUFULENBQWtCMEIsSUFBbEIsRUFBeUI7QUFDOUIsTUFBTWlGLFNBQVN6QyxhQUFjeEMsSUFBZCxLQUF3QmtELFdBQVlsRCxJQUFaLENBQXZDO0FBQ0EsTUFBS2lGLE1BQUwsRUFBYztBQUNaLFdBQU9BLE9BQU8zRyxPQUFkO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBTyxJQUFQO0FBQ0Q7QUFDRiIsImZpbGUiOiJwb2ludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGJ0Yy1hcHAtc2VydmVyIC0tIFNlcnZlciBmb3IgdGhlIEJpY3ljbGUgVG91cmluZyBDb21wYW5pb25cbiAqIENvcHlyaWdodCDCqSAyMDE2IEFkdmVudHVyZSBDeWNsaW5nIEFzc29jaWF0aW9uXG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgYnRjLWFwcC1zZXJ2ZXIuXG4gKlxuICogYnRjLWFwcC1zZXJ2ZXIgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBGb29iYXIuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IHsgbWl4aW5WYWxpZGF0aW9uLCBtZXJnZVNjaGVtYXMgfSBmcm9tICcuL3ZhbGlkYXRpb24tbWl4aW4nO1xuaW1wb3J0IHsgQ291Y2hNb2RlbCwgQ291Y2hDb2xsZWN0aW9uLCBrZXlzQmV0d2VlbiB9IGZyb20gJy4vYmFzZSc7XG5cbmltcG9ydCB7IGtleXMsIGZyb21QYWlycywgaW5jbHVkZXMsIGFzc2lnbiB9IGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCBkb2N1cmkgZnJvbSAnZG9jdXJpJztcbmltcG9ydCBuZ2VvaGFzaCBmcm9tICduZ2VvaGFzaCc7XG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ3RvLWlkJztcbmltcG9ydCB1dWlkIGZyb20gJ25vZGUtdXVpZCc7XG5cbmNvbnN0IGJyb3dzZXIgPSAoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICk7XG5cbnZhciBQcm9taXNlID0gcmVxdWlyZSgncG9seWZpbGwtcHJvbWlzZScpO1xuXG4vLyAjIFBvaW50IE1vZGVsXG4vLyBUaGUgcG9pbnQgcmVwcmVzZW50cyBhIGxvY2F0aW9uIG9uIHRoZSBtYXAgd2l0aCBhc3NvY2lhdGVkIG1ldGFkYXRhLCBnZW9kYXRhLFxuLy8gYW5kIHVzZXIgcHJvdmlkZWQgZGF0YS4gVGhlIHBvaW50IGlzIHRoZSBiYXNlIHNoYXJlZCBieSBzZXJ2aWNlcyBhbmQgYWxlcnRzLlxuLy9cbi8vIFRoZSBKU09OIHNjaGVtYSBzdG9yZWQgaW4gYFBvaW50YCwgYW5kIGFzIHBhdGNoZWQgYnkgYFNlcnZpY2VgIGFuZCBgQWxlcnRgLFxuLy8gaXMgdGhlIGF1dGhvcml0YXRpdmUgZGVmaW5pdGlvbiBvZiB0aGUgcG9pbnQgcmVjb3JkLlxuXG4vLyAjIyBQb2ludCBNb2RlbCBVcmlcbi8vIFBvaW50cyBhcmUgc3RvcmVkIGluIENvdWNoREIuIENvdWNoREIgZG9jdW1lbnRzIGNhbiBoYXZlIHJpY2ggaWQgc3RyaW5nc1xuLy8gdG8gaGVscCBzdG9yZSBhbmQgYWNjZXNzIGRhdGEgd2l0aG91dCBNYXBSZWR1Y2Ugam9icy5cbi8vXG4vLyBUaGUgcG9pbnQgbW9kZWwgdXJpIGlzIGNvbXBvc2VkIG9mIGZvdXIgcGFydHM6XG4vLyAgMS4gVGhlIHN0cmluZyAncG9pbnQvJ2Bcbi8vICAyLiBUaGUgdHlwZSBvZiBwb2ludCwgZWl0aGVyICdzZXJ2aWNlJyBvciAnYWxlcnQnXG4vLyAgMy4gVGhlIG5vcm1hbGl6ZWQgKG9yaWdpbmFsKSBuYW1lIG9mIHRoZSBwb2ludFxuLy8gIDQuIFRoZSBwb2ludCdzIGdlb2hhc2hcbmV4cG9ydCBjb25zdCBwb2ludElkID0gZG9jdXJpLnJvdXRlKCAncG9pbnQvOnR5cGUvOm5hbWUvOmdlb2hhc2gnICk7XG5cbmNvbnN0IENPTU1FTlRfTUlOX0xFTkdUSCA9IDE7XG5jb25zdCBDT01NRU5UX01BWF9MRU5HVEggPSAxNDA7XG5cbmV4cG9ydCBjb25zdCBQb2ludCA9IENvdWNoTW9kZWwuZXh0ZW5kKCB7XG4gIGlkQXR0cmlidXRlOiAnX2lkJyxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBDb3VjaE1vZGVsLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB0aGlzLnNldCgge1xuICAgICAgY3JlYXRlZF9hdDogZGF0ZSxcbiAgICAgIHVwZGF0ZWRfYXQ6IGRhdGUsXG4gICAgfSApO1xuXG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldCggJ3VwZGF0ZWRfYXQnLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgKTtcbiAgfSxcblxuICAvLyAjIyBTcGVjaWZ5XG4gIC8vIEZpbGwgaW4gYF9pZGAgZnJvbSB0aGUgY29tcG9uZW50cyBvZiB0aGUgcG9pbnQgbW9kZWwgdXJpLlxuICAvLyBQdWxsIHZhbHVlcyBmcm9tIGBhdHRyaWJ1dGVzYCBpZiBuYW1lIGFuZCBsb2NhdGlvbiBhcmUgdW5kZWZpbmVkLlxuICBzcGVjaWZ5OiBmdW5jdGlvbiggdHlwZSwgbmFtZSwgbG9jYXRpb24gKSB7XG4gICAgLy8gT25seSBzZXQgdGhlIElEIGF0dHJpYnV0ZSBoZXJlIGlmIGl0IHdhc24ndCBhbHJlYWR5IHNldC5cbiAgICAvLyBUaGUgb3JpZ2luYWwgSUQgc3RheXMgdGhlIElEIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHBvaW50LlxuICAgIGlmICh0eXBlb2YgdGhpcy5hdHRyaWJ1dGVzLl9pZCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKCBuYW1lICkge1xuICAgICAgICBjb25zdCBbbGF0LCBsbmddID0gbG9jYXRpb247XG4gICAgICAgIGNvbnN0IF9pZCA9IHBvaW50SWQoIHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIG5hbWU6IG5vcm1hbGl6ZSggbmFtZSApLFxuICAgICAgICAgIGdlb2hhc2g6IG5nZW9oYXNoLmVuY29kZSggbGF0LCBsbmcgKVxuICAgICAgICB9ICk7XG4gICAgICAgIHRoaXMuc2V0KCB7IF9pZCwgdHlwZSwgbmFtZSwgbG9jYXRpb24gfSApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qge25hbWUsIGxvY2F0aW9ufSA9IHRoaXMuYXR0cmlidXRlcztcbiAgICAgICAgY29uc3QgW2xhdCwgbG5nXSA9IGxvY2F0aW9uO1xuICAgICAgICBjb25zdCBfaWQgPSBwb2ludElkKCB7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBuYW1lOiBub3JtYWxpemUoIG5hbWUgKSxcbiAgICAgICAgICBnZW9oYXNoOiBuZ2VvaGFzaC5lbmNvZGUoIGxhdCwgbG5nIClcbiAgICAgICAgfSApO1xuICAgICAgICB0aGlzLnNldCggeyBfaWQgfSApO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBkZWZhdWx0czogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZsYWdnZWRfYnk6IFtdLFxuICAgICAgdXBkYXRlZF9ieTogJ3Vua25vd24nLFxuICAgICAgY29tbWVudHM6IFtdLFxuICAgICAgaXNfaGlkZGVuOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBsb2NhdGlvbjoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBtaW5JdGVtczogMixcbiAgICAgICAgbWF4SXRlbXM6IDIsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBjcmVhdGVkX2F0OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICB9LFxuICAgICAgdXBkYXRlZF9hdDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWRfYnk6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9LFxuICAgICAgZmxhZ2dlZF9ieTp7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHVzZXI6IHt0eXBlOiAnc3RyaW5nJ30sXG4gICAgICAgICAgICByZWFzb246IHt0eXBlOiAnc3RyaW5nJywgbWluTGVuZ3RoOiBDT01NRU5UX01JTl9MRU5HVEgsIG1heExlbmd0aDogQ09NTUVOVF9NQVhfTEVOR1RIfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXF1aXJlZDogW1xuICAgICAgICAgICAgJ3VzZXInLFxuICAgICAgICAgICAgJ3JlYXNvbidcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpc19oaWRkZW46e1xuICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIH0sXG4gICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGNvbW1lbnRzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRlOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgJ21pbkxlbmd0aCc6IENPTU1FTlRfTUlOX0xFTkdUSCxcbiAgICAgICAgICAgICAgJ21heExlbmd0aCc6IENPTU1FTlRfTUFYX0xFTkdUSFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJhdGluZzoge1xuICAgICAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgICAgIG1pbmltdW06IDEsXG4gICAgICAgICAgICAgIG1heGltdW06IDVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1dWlkOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXF1aXJlZDogW1xuICAgICAgICAgICAgJ3VzZXInLFxuICAgICAgICAgICAgJ2RhdGUnLFxuICAgICAgICAgICAgJ3RleHQnLFxuICAgICAgICAgICAgJ3JhdGluZycsXG4gICAgICAgICAgICAndXVpZCdcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAnbmFtZScsXG4gICAgICAnbG9jYXRpb24nLFxuICAgICAgJ3R5cGUnLFxuICAgICAgJ2NyZWF0ZWRfYXQnLFxuICAgICAgJ3VwZGF0ZWRfYXQnLFxuICAgICAgJ3VwZGF0ZWRfYnknLFx0LyogQWRkZWQ6IFRvIGF0dGFjaCBwb2ludHMgdG8gdXNlcnMgdmlhIHRoZWlyIF9pZCAqL1xuICAgICAgJ2ZsYWdnZWRfYnknLFxuICAgICAgJ2lzX2hpZGRlbicsXG4gICAgICAnY29tbWVudHMnXG4gICAgXVxuICB9LFxuXG4gIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBDb3VjaE1vZGVsLnByb3RvdHlwZS5jbGVhci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gIH0sXG5cbiAgLy8gIyMgR2V0IFJlZHV4IFJlcHJlc2VudGF0aW9uXG4gIC8vIFJldHVybiBhIG5lc3RlZCBvYmplY3QvYXJhcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1vZGVsIHN1aXRhYmxlIGZvclxuICAvLyB1c2Ugd2l0aCByZWR1eC5cbiAgc3RvcmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IC4uLnRoaXMudG9KU09OKCkgfTtcbiAgfVxufSwge1xuICB1cmk6IHBvaW50SWQsXG5cbiAgZm9yOiBpZCA9PiB7XG4gICAgY29uc3QgcG9pbnRJZENvbXBvbmVudHMgPSBwb2ludElkKCBpZCApO1xuICAgIGNvbnN0IHR5cGUgPSBwb2ludElkQ29tcG9uZW50cy50eXBlO1xuICAgIGlmICggdHlwZSA9PT0gJ3NlcnZpY2UnICkge1xuICAgICAgcmV0dXJuIG5ldyBTZXJ2aWNlKCB7IF9pZDogaWQgfSApO1xuICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09ICdhbGVydCcgKSB7XG4gICAgICByZXR1cm4gbmV3IEFsZXJ0KCB7IF9pZDogaWQgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnQSBwb2ludCBtdXN0IGJlIGEgc2VydmljZSBvciBhbGVydCc7XG4gICAgfVxuICB9XG59ICk7XG5cbi8vICMgU2VydmljZSBNb2RlbFxuLy8gQSBzZXJ2aWNlIGlzIGEgYnVpc25lc3Mgb3IgcG9pbnQgb2YgaW50ZXJlc3QgdG8gYSBjeWNsaXN0LiBBIGN5Y2xpc3QgbmVlZHNcbi8vIHRvIGtub3cgd2hlcmUgdGhleSB3YW50IHRvIHN0b3Agd2VsbCBpbiBhZHZhbmNlIG9mIHRoZWlyIHRyYXZlbCB0aHJvdWdoIGFuXG4vLyBhcmVhLiBUaGUgc2VydmljZSByZWNvcmQgbXVzdCBjb250YWluIGVub3VnaCBpbmZvcm1hdGlvbiB0byBoZWxwIHRoZSBjeWNsaXN0XG4vLyBtYWtlIHN1Y2ggZGVjaXNpb25zLlxuLy9cbi8vIFRoZSByZWNvcmQgaW5jbHVkZXMgY29udGFjdCBpbmZvcm1hdGlvbiwgYW5kIGEgc2NoZWR1bGUgb2YgaG91cnMgb2Zcbi8vIG9wZXJhdGlvbi4gSXQgaXMgaW1wb3J0YW50IHRoYXQgd2Ugc3RvcmUgdGhlIHRpbWUgem9uZSBvZiBhIHNlcnZpY2UsIHNpbmNlXG4vLyB0b3VyaW5nIGN5Y2xpc3RzIHdpbGwgY3Jvc3MgdGltZSB6b25lcyBvbiB0aGVpciB0cmF2ZWxzLiBGdXJ0aGVybW9yZSxcbi8vIHNlcnZpY2VzIG9mIGludGVyZXN0IHRvIHRvdXJpbmcgY3ljbGlzdHMgbWF5IGJlIHNlYXNvbmFsOiB3ZSBzdG9yZVxuLy8gc2NoZWR1bGVzIGZvciBkaWZmZXJlbnQgc2Vhc29ucy5cblxuLy8gIyMgU2VydmljZSBUeXBlc1xuLy8gQSBTZXJ2aWNlIG1heSBoYXZlIGEgc2luZ2xlIHR5cGUsIGluZGljYXRpbmcgdGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGVcbi8vIGJ1aXNuZXNzIG9yIHBvaW50IG9mIGludGVyZXN0LiBTZXJ2aWNlIHR5cGVzIG1heSBhbHNvIGJlIGluY2x1ZGVkIGluIGFcbi8vIFNlcnZpY2UncyBhbWVuaXRpZXMgYXJyYXkuXG5cbi8qZXNmbXQtaWdub3JlLXN0YXJ0Ki9cbmV4cG9ydCBjb25zdCBzZXJ2aWNlVHlwZXMgPSB7XG4gICdhaXJwb3J0JzogeyBkaXNwbGF5OiAnQWlycG9ydCcgfSxcbiAgJ2Jhcic6IHsgZGlzcGxheTogJ0JhcicgfSxcbiAgJ2JlZF9hbmRfYnJlYWtmYXN0JzogeyBkaXNwbGF5OiAnQmVkICYgQnJlYWtmYXN0JyB9LFxuICAnYmlrZV9zaG9wJzogeyBkaXNwbGF5OiAnQmlrZSBTaG9wJyB9LFxuICAnY2FiaW4nOiB7IGRpc3BsYXk6ICdDYWJpbicgfSxcbiAgJ2NhbXBncm91bmQnOiB7IGRpc3BsYXk6ICdDYW1wZ3JvdW5kJyB9LFxuICAnY29udmVuaWVuY2Vfc3RvcmUnOiB7IGRpc3BsYXk6ICdDb252ZW5pZW5jZSBTdG9yZScgfSxcbiAgJ2N5Y2xpc3RzX2NhbXBpbmcnOiB7IGRpc3BsYXk6ICdDeWNsaXN0c1xcJyBDYW1waW5nJyB9LFxuICAnY3ljbGlzdHNfbG9kZ2luZyc6IHsgZGlzcGxheTogJ0N5Y2xpc3RzXFwnIExvZGdpbmcnIH0sXG4gICdncm9jZXJ5JzogeyBkaXNwbGF5OiAnR3JvY2VyeScgfSxcbiAgJ2hvc3RlbCc6IHsgZGlzcGxheTogJ0hvc3RlbCcgfSxcbiAgJ2hvdF9zcHJpbmcnOiB7IGRpc3BsYXk6ICdIb3QgU3ByaW5nJyB9LFxuICAnaG90ZWwnOiB7IGRpc3BsYXk6ICdIb3RlbCcgfSxcbiAgJ21vdGVsJzogeyBkaXNwbGF5OiAnTW90ZWwnIH0sXG4gICdpbmZvcm1hdGlvbic6IHsgZGlzcGxheTogJ0luZm9ybWF0aW9uJyB9LFxuICAnbGlicmFyeSc6IHsgZGlzcGxheTogJ0xpYnJhcnknIH0sXG4gICdtdXNldW0nOiB7IGRpc3BsYXk6ICdNdXNldW0nIH0sXG4gICdvdXRkb29yX3N0b3JlJzogeyBkaXNwbGF5OiAnT3V0ZG9vciBTdG9yZScgfSxcbiAgJ3Jlc3RfYXJlYSc6IHsgZGlzcGxheTogJ1Jlc3QgQXJlYScgfSxcbiAgJ3Jlc3RhdXJhbnQnOiB7IGRpc3BsYXk6ICdSZXN0YXVyYW50JyB9LFxuICAncmVzdHJvb20nOiB7IGRpc3BsYXk6ICdSZXN0cm9vbScgfSxcbiAgJ3NjZW5pY19hcmVhJzogeyBkaXNwbGF5OiAnU2NlbmljIEFyZWEnIH0sXG4gICdzdGF0ZV9wYXJrJzogeyBkaXNwbGF5OiAnU3RhdGUgUGFyaycgfSxcbiAgJ290aGVyJzogeyBkaXNwbGF5OiAnT3RoZXInIH1cbn07XG4vKmVzZm10LWlnbm9yZS1lbmQqL1xuXG5leHBvcnQgY29uc3QgU2VydmljZSA9IFBvaW50LmV4dGVuZCgge1xuICBzcGVjaWZ5OiBmdW5jdGlvbiggbmFtZSwgbG9jYXRpb24gKSB7XG4gICAgUG9pbnQucHJvdG90eXBlLnNwZWNpZnkuY2FsbCggdGhpcywgJ3NlcnZpY2UnLCBuYW1lLCBsb2NhdGlvbiApO1xuICB9LFxuXG4gIGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uUG9pbnQucHJvdG90eXBlLmRlZmF1bHRzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKSxcbiAgICAgIGFtZW5pdGllczogW10sXG4gICAgICBzY2hlZHVsZTogeyAnZGVmYXVsdCc6IFtdIH0sXG4gICAgICBzZWFzb25hbDogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHNjaGVtYTogbWVyZ2VTY2hlbWFzKCBQb2ludC5wcm90b3R5cGUuc2NoZW1hLCB7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgdHlwZToge1xuICAgICAgICBlbnVtOiBrZXlzKCBzZXJ2aWNlVHlwZXMgKVxuICAgICAgfSxcbiAgICAgIGFtZW5pdGllczoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGVudW06IGtleXMoIHNlcnZpY2VUeXBlcyApXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhZGRyZXNzOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgc2NoZWR1bGU6IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIH0sXG4gICAgICBzZWFzb25hbDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIH0sXG4gICAgICBwaG9uZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIHdlYnNpdGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ3VyaSdcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyAvLyB0aGUgdXBkYXRlZCBhdHRyaWJ1dGUgaXMgbm90IHJlcXVpcmVkXG4gICAgICB9XG4gICAgfSxcbiAgICByZXF1aXJlZDogW1xuICAgICAgJ3NlYXNvbmFsJ1xuICAgIF1cbiAgfSApXG59ICk7XG5cbi8vIEFwcGx5IHRoZSB2YWxpZGF0aW9uIG1peGluIHRvIHRoZSBTZXJ2aWNlIG1vZGVsLiBTZWUgdmFsaWRhdGlvbi1taXhpbi5qcy5cbm1peGluVmFsaWRhdGlvbiggU2VydmljZSApO1xuXG4vLyAjIEFsZXJ0IE1vZGVsXG4vLyBBbiBhbGVydCBpcyBzb21ldGhpbmcgdGhhdCBtaWdodCBpbXBlZGUgYSBjeWNsaXN0J3MgdG91ci4gV2hlbiBhIGN5Y2xpc3Rcbi8vIHNlZXMgYW4gYWxlcnQgb24gdGhlIG1hcCwgdGhlIGtub3cgdG8gcGxhbiBhcm91bmQgaXQuXG5cbi8qZXNmbXQtaWdub3JlLXN0YXJ0Ki9cbmV4cG9ydCBjb25zdCBhbGVydFR5cGVzID0ge1xuICAncm9hZF9jbG9zdXJlJzogeyBkaXNwbGF5OiAnUm9hZCBDbG9zdXJlJyB9LFxuICAnZm9yZXN0X2ZpcmUnOiB7IGRpc3BsYXk6ICdGb3Jlc3QgZmlyZScgfSxcbiAgJ2Zsb29kaW5nJzogeyBkaXNwbGF5OiAnRmxvb2RpbmcnIH0sXG4gICdkZXRvdXInOiB7IGRpc3BsYXk6ICdEZXRvdXInIH0sXG4gICdvdGhlcic6IHsgZGlzcGxheTogJ090aGVyJyB9XG59O1xuLyplc2ZtdC1pZ25vcmUtZW5kKi9cblxuZXhwb3J0IGNvbnN0IEFsZXJ0ID0gUG9pbnQuZXh0ZW5kKCB7XG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICBQb2ludC5wcm90b3R5cGUuc3BlY2lmeS5jYWxsKCB0aGlzLCAnYWxlcnQnLCBuYW1lLCBsb2NhdGlvbiApO1xuICB9LFxuXG4gIHNjaGVtYTogbWVyZ2VTY2hlbWFzKCBQb2ludC5wcm90b3R5cGUuc2NoZW1hLCB7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgdHlwZToge1xuICAgICAgICBlbnVtOiBrZXlzKCBhbGVydFR5cGVzIClcbiAgICAgIH0sXG4gICAgICAgZXhwaXJhdGlvbl9kYXRlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICB9LFxuICAgIH1cbiAgfSApXG59ICk7XG5cbm1peGluVmFsaWRhdGlvbiggQWxlcnQgKTtcblxuLy8gIyBQb2ludCBDb2xsZWN0aW9uXG4vLyBBIGhldGVyb2dlbmVvdXMgY29sbGVjdGlvbiBvZiBzZXJ2aWNlcyBhbmQgYWxlcnRzLiBQb3VjaERCIGlzIGFibGUgdG8gZmV0Y2hcbi8vIHRoaXMgY29sbGVjdGlvbiBieSBsb29raW5nIGZvciBhbGwga2V5cyBzdGFydGluZyB3aXRoICdwb2ludC8nLlxuLy9cbi8vIEEgY29ubmVjdGVkIFBvaW50Q29sbGVjdGlvbiBtdXN0IGJlIGFibGUgdG8gZ2VuZXJhdGUgY29ubmVjdGVkIEFsZXJ0cyBvclxuLy8gU2VydmljZXMgb24gZGVtYW5kcy4gVGhlcmVmb3JlLCBpZiBQb2ludENvbGxlY3Rpb24gaXMgY29ubmVjdGVkLCBjb25uZWN0XG4vLyBtb2RlbHMgYmVmb3JlIHJldHVybmluZyB0aGVtLlxuZXhwb3J0IGNvbnN0IFBvaW50Q29sbGVjdGlvbiA9IENvdWNoQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oIG1vZGVscywgb3B0aW9ucyApIHtcbiAgICBDb3VjaENvbGxlY3Rpb24ucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5wb3VjaCA9IHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYWxsRG9jczogYXNzaWduKFxuICAgICAgICAgIHsgaW5jbHVkZV9kb2NzOiB0cnVlIH0sXG4gICAgICAgICAgb3B0aW9ucy5rZXlzID8geyBrZXlzOiBvcHRpb25zLmtleXMgfSA6IGtleXNCZXR3ZWVuKCAncG9pbnQvJyApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qge2Nvbm5lY3QsIGRhdGFiYXNlfSA9IHRoaXM7XG4gICAgdGhpcy5zZXJ2aWNlID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBTZXJ2aWNlICkgOiBTZXJ2aWNlO1xuICAgIHRoaXMuYWxlcnQgPSBjb25uZWN0ID8gY29ubmVjdCggZGF0YWJhc2UsIEFsZXJ0ICkgOiBBbGVydDtcbiAgfSxcblxuICAvLyBUaGlzIGhhbmRsZXMgdGhlIGBvcHRpb25zLmtleXNgIGVkZ2UgY2FzZXMgbGlzdGVkIGluIHRoZVxuICAvLyBbUG91Y2hEQiBhcGldKGh0dHBzOi8vcG91Y2hkYi5jb20vYXBpLmh0bWwjYmF0Y2hfZmV0Y2gpXG4gIHBhcnNlOiBmdW5jdGlvbiggcmVzcG9uc2UsIG9wdGlvbnMgKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnJvd3MuZmlsdGVyKFxuICAgICAgcm93ID0+ICEoIHJvdy5kZWxldGVkIHx8IHJvdy5lcnJvciApXG4gICAgKS5tYXAoXG4gICAgICByb3cgPT4gcm93LmRvY1xuICAgICk7XG4gIH0sXG5cbiAgbW9kZWw6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIGNvbnN0IHBvaW50SWRDb21wb25lbnRzID0gcG9pbnRJZCggYXR0cmlidXRlcy5faWQgKTtcbiAgICBjb25zdCB0eXBlID0gcG9pbnRJZENvbXBvbmVudHMudHlwZTtcbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAnc2VydmljZSc6IG9wdGlvbnMuY29sbGVjdGlvbi5zZXJ2aWNlLFxuICAgICAgJ2FsZXJ0Jzogb3B0aW9ucy5jb2xsZWN0aW9uLmFsZXJ0XG4gICAgfTtcbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9IG1hcFsgdHlwZSBdO1xuICAgIGlmICggY29uc3RydWN0b3IgKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBjb25zdHJ1Y3RvciggYXR0cmlidXRlcywgb3B0aW9ucyApO1xuXG4gICAgICBpZiAoIG9wdGlvbnMuZGVpbmRleCAmJiBpbnN0YW5jZS5oYXMoICdpbmRleCcgKSApIHtcbiAgICAgICAgaW5zdGFuY2UuaW5kZXggPSBpbnN0YW5jZS5nZXQoICdpbmRleCcgKTtcbiAgICAgICAgaW5zdGFuY2UudW5zZXQoICdpbmRleCAnICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ0EgcG9pbnQgbXVzdCBiZSBhIHNlcnZpY2Ugb3IgYWxlcnQnO1xuICAgIH1cbiAgfSxcblxuICAvLyAjIyBHZXQgUmVkdXggUmVwcmVzZW50YXRpb25cbiAgLy8gUmV0dXJuIGEgbmVzdGVkIG9iamVjdC9hcmFyeSByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sbGVjdGlvbiBzdWl0YWJsZSBmb3JcbiAgLy8gdXNlIHdpdGggcmVkdXguXG4gIHN0b3JlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnJvbVBhaXJzKCB0aGlzLm1vZGVscy5tYXAoIHBvaW50ID0+IFsgcG9pbnQuaWQsIHBvaW50LnN0b3JlKCkgXSApICk7XG4gIH1cbn0gKTtcblxuLy8gIyBEaXNwbGF5IE5hbWUgZm9yIFR5cGVcbi8vIEdpdmVuIGEgdHlwZSBrZXkgZnJvbSBlaXRoZXIgdGhlIHNlcnZpY2Ugb3IgYWxlcnQgdHlwZSBlbnVtZXJhdGlvbnMsXG4vLyByZXR1cm4gdGhlIHR5cGUncyBkaXNwbGF5IHN0cmluZywgb3IgbnVsbCBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5KCB0eXBlICkge1xuICBjb25zdCB2YWx1ZXMgPSBzZXJ2aWNlVHlwZXNbIHR5cGUgXSB8fCBhbGVydFR5cGVzWyB0eXBlIF07XG4gIGlmICggdmFsdWVzICkge1xuICAgIHJldHVybiB2YWx1ZXMuZGlzcGxheTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19