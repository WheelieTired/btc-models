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

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiQ09NTUVOVF9NSU5fTEVOR1RIIiwiQ09NTUVOVF9NQVhfTEVOR1RIIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwidXBkYXRlIiwic3BlY2lmeSIsInR5cGUiLCJuYW1lIiwibG9jYXRpb24iLCJfaWQiLCJsYXQiLCJsbmciLCJnZW9oYXNoIiwiZW5jb2RlIiwiZGVmYXVsdHMiLCJmbGFnZ2VkX2J5IiwidXBkYXRlZF9ieSIsImNvbW1lbnRzIiwiaXNfaGlkZGVuIiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwibWluSXRlbXMiLCJtYXhJdGVtcyIsIml0ZW1zIiwiZm9ybWF0IiwidXNlciIsInJlYXNvbiIsIm1pbkxlbmd0aCIsIm1heExlbmd0aCIsInJlcXVpcmVkIiwiZGVzY3JpcHRpb24iLCJ0ZXh0IiwicmF0aW5nIiwibWluaW11bSIsIm1heGltdW0iLCJ1dWlkIiwiY2xlYXIiLCJzdG9yZSIsInRvSlNPTiIsInVyaSIsImZvciIsInBvaW50SWRDb21wb25lbnRzIiwiaWQiLCJTZXJ2aWNlIiwiQWxlcnQiLCJzZXJ2aWNlVHlwZXMiLCJjYWxsIiwiYW1lbml0aWVzIiwic2NoZWR1bGUiLCJzZWFzb25hbCIsImVudW0iLCJhZGRyZXNzIiwicGhvbmUiLCJ3ZWJzaXRlIiwidXBkYXRlZCIsImFsZXJ0VHlwZXMiLCJleHBpcmF0aW9uX2RhdGUiLCJQb2ludENvbGxlY3Rpb24iLCJtb2RlbHMiLCJwb3VjaCIsImFsbERvY3MiLCJpbmNsdWRlX2RvY3MiLCJrZXlzIiwiY29ubmVjdCIsImRhdGFiYXNlIiwic2VydmljZSIsImFsZXJ0IiwicGFyc2UiLCJyZXNwb25zZSIsInJvd3MiLCJmaWx0ZXIiLCJyb3ciLCJkZWxldGVkIiwiZXJyb3IiLCJtYXAiLCJkb2MiLCJtb2RlbCIsImNvbGxlY3Rpb24iLCJjb25zdHJ1Y3RvciIsImluc3RhbmNlIiwiZGVpbmRleCIsImhhcyIsImluZGV4IiwiZ2V0IiwidW5zZXQiLCJwb2ludCIsInZhbHVlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3lwQkFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQXNiZ0JBLE8sR0FBQUEsTzs7QUFuYWhCOztBQUNBOztBQUVBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxVQUFZLE9BQU9DLE1BQVAsS0FBa0IsV0FBcEM7O0FBRUEsSUFBSUMsVUFBVUMsUUFBUSxrQkFBUixDQUFkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxJQUFNQyw0QkFBVSxpQkFBT0MsS0FBUCxDQUFjLDRCQUFkLENBQWhCOztBQUVQLElBQU1DLHFCQUFxQixDQUEzQjtBQUNBLElBQU1DLHFCQUFxQixHQUEzQjs7QUFFTyxJQUFNQyx3QkFBUSxpQkFBV0MsTUFBWCxDQUFtQjtBQUN0Q0MsZUFBYSxLQUR5Qjs7QUFHdENDLGNBQVksb0JBQVVDLFVBQVYsRUFBc0JDLE9BQXRCLEVBQWdDO0FBQzFDLHFCQUFXQyxTQUFYLENBQXFCSCxVQUFyQixDQUFnQ0ksS0FBaEMsQ0FBdUMsSUFBdkMsRUFBNkNDLFNBQTdDOztBQUVBLFFBQU1DLE9BQU8sSUFBSUMsSUFBSixHQUFXQyxXQUFYLEVBQWI7QUFDQSxTQUFLQyxHQUFMLENBQVU7QUFDUkMsa0JBQVlKLElBREo7QUFFUkssa0JBQVlMO0FBRkosS0FBVjtBQUtELEdBWnFDOztBQWN0Q00sVUFBUSxrQkFBVztBQUNqQixTQUFLSCxHQUFMLENBQVUsWUFBVixFQUF3QixJQUFJRixJQUFKLEdBQVdDLFdBQVgsRUFBeEI7QUFDRCxHQWhCcUM7O0FBa0J0QztBQUNBO0FBQ0E7QUFDQUssV0FBUyxpQkFBVUMsSUFBVixFQUFnQkMsSUFBaEIsRUFBc0JDLFFBQXRCLEVBQWlDO0FBQ3hDO0FBQ0E7QUFDQSxRQUFJLE9BQU8sS0FBS2YsVUFBTCxDQUFnQmdCLEdBQXZCLEtBQStCLFdBQW5DLEVBQWdEO0FBQzlDLFVBQUtGLElBQUwsRUFBWTtBQUFBLHVDQUNTQyxRQURUO0FBQUEsWUFDSEUsR0FERztBQUFBLFlBQ0VDLEdBREY7O0FBRVYsWUFBTUYsTUFBTXhCLFFBQVM7QUFDbkJxQixnQkFBTUEsSUFEYTtBQUVuQkMsZ0JBQU0sb0JBQVdBLElBQVgsQ0FGYTtBQUduQkssbUJBQVMsbUJBQVNDLE1BQVQsQ0FBaUJILEdBQWpCLEVBQXNCQyxHQUF0QjtBQUhVLFNBQVQsQ0FBWjtBQUtBLGFBQUtWLEdBQUwsQ0FBVSxFQUFFUSxRQUFGLEVBQU9ILFVBQVAsRUFBYUMsVUFBYixFQUFtQkMsa0JBQW5CLEVBQVY7QUFDRCxPQVJELE1BUU87QUFBQSwwQkFDb0IsS0FBS2YsVUFEekI7QUFBQSxZQUNFYyxLQURGLGVBQ0VBLElBREY7QUFBQSxZQUNRQyxVQURSLGVBQ1FBLFFBRFI7O0FBQUEsd0NBRWNBLFVBRmQ7QUFBQSxZQUVFRSxJQUZGO0FBQUEsWUFFT0MsSUFGUDs7QUFHTCxZQUFNRixPQUFNeEIsUUFBUztBQUNuQnFCLGdCQUFNQSxJQURhO0FBRW5CQyxnQkFBTSxvQkFBV0EsS0FBWCxDQUZhO0FBR25CSyxtQkFBUyxtQkFBU0MsTUFBVCxDQUFpQkgsSUFBakIsRUFBc0JDLElBQXRCO0FBSFUsU0FBVCxDQUFaO0FBS0EsYUFBS1YsR0FBTCxDQUFVLEVBQUVRLFNBQUYsRUFBVjtBQUNEO0FBQ0Y7QUFDRixHQTVDcUM7O0FBOEN0Q0ssWUFBVSxvQkFBVztBQUNuQixXQUFPO0FBQ0xDLGtCQUFZLEVBRFA7QUFFTEMsa0JBQVksU0FGUDtBQUdMQyxnQkFBVSxFQUhMO0FBSUxDLGlCQUFXO0FBSk4sS0FBUDtBQU1ELEdBckRxQzs7QUF1RHRDQyxVQUFRO0FBQ05iLFVBQU0sUUFEQTtBQUVOYywwQkFBc0IsS0FGaEI7QUFHTkMsZ0JBQVk7QUFDVmQsWUFBTTtBQUNKRCxjQUFNO0FBREYsT0FESTtBQUlWRSxnQkFBVTtBQUNSRixjQUFNLE9BREU7QUFFUmdCLGtCQUFVLENBRkY7QUFHUkMsa0JBQVUsQ0FIRjtBQUlSQyxlQUFPO0FBQ0xsQixnQkFBTTtBQUREO0FBSkMsT0FKQTtBQVlWQSxZQUFNO0FBQ0pBLGNBQU07QUFERixPQVpJO0FBZVZKLGtCQUFZO0FBQ1ZJLGNBQU0sUUFESTtBQUVWbUIsZ0JBQVE7QUFGRSxPQWZGO0FBbUJWdEIsa0JBQVk7QUFDVkcsY0FBTSxRQURJO0FBRVZtQixnQkFBUTtBQUZFLE9BbkJGO0FBdUJWVCxrQkFBWTtBQUNWVixjQUFNO0FBREksT0F2QkY7QUEwQlZTLGtCQUFXO0FBQ1RULGNBQU0sT0FERztBQUVSa0IsZUFBTztBQUNObEIsZ0JBQU0sUUFEQTtBQUVOZSxzQkFBWTtBQUNWSyxrQkFBTSxFQUFDcEIsTUFBTSxRQUFQLEVBREk7QUFFVnFCLG9CQUFRLEVBQUNyQixNQUFNLFFBQVAsRUFBaUJzQixXQUFXekMsa0JBQTVCLEVBQWdEMEMsV0FBV3pDLGtCQUEzRDtBQUZFLFdBRk47QUFNSjBDLG9CQUFVLENBQ1YsTUFEVSxFQUVWLFFBRlU7QUFOTjtBQUZDLE9BMUJEO0FBd0NWWixpQkFBVTtBQUNSWixjQUFNO0FBREUsT0F4Q0E7QUEyQ1Z5QixtQkFBYTtBQUNYekIsY0FBTTtBQURLLE9BM0NIO0FBOENWVyxnQkFBVTtBQUNSWCxjQUFNLE9BREU7QUFFUmtCLGVBQU87QUFDTGxCLGdCQUFNLFFBREQ7QUFFTGMsZ0NBQXNCLEtBRmpCO0FBR0xDLHNCQUFZO0FBQ1ZLLGtCQUFNO0FBQ0pwQixvQkFBTTtBQURGLGFBREk7QUFJVlIsa0JBQU07QUFDSlEsb0JBQU0sUUFERjtBQUVKbUIsc0JBQVE7QUFGSixhQUpJO0FBUVZPLGtCQUFNO0FBQ0oxQixvQkFBTSxRQURGO0FBRUosMkJBQWFuQixrQkFGVDtBQUdKLDJCQUFhQztBQUhULGFBUkk7QUFhVjZDLG9CQUFRO0FBQ04zQixvQkFBTSxTQURBO0FBRU40Qix1QkFBUyxDQUZIO0FBR05DLHVCQUFTO0FBSEgsYUFiRTtBQWtCVkMsa0JBQU07QUFDSjlCLG9CQUFNO0FBREY7QUFsQkksV0FIUDtBQXlCTHdCLG9CQUFVLENBQ1IsTUFEUSxFQUVSLE1BRlEsRUFHUixNQUhRLEVBSVIsUUFKUSxFQUtSLE1BTFE7QUF6Qkw7QUFGQztBQTlDQSxLQUhOO0FBc0ZOQSxjQUFVLENBQ1IsTUFEUSxFQUVSLFVBRlEsRUFHUixNQUhRLEVBSVIsWUFKUSxFQUtSLFlBTFEsRUFNUixZQU5RLEVBTU07QUFDZCxnQkFQUSxFQVFSLFdBUlEsRUFTUixVQVRRO0FBdEZKLEdBdkQ4Qjs7QUEwSnRDTyxTQUFPLGlCQUFXO0FBQ2hCLHFCQUFXMUMsU0FBWCxDQUFxQjBDLEtBQXJCLENBQTJCekMsS0FBM0IsQ0FBa0MsSUFBbEMsRUFBd0NDLFNBQXhDO0FBQ0QsR0E1SnFDOztBQThKdEM7QUFDQTtBQUNBO0FBQ0F5QyxTQUFPLGlCQUFXO0FBQ2hCLHdCQUFZLEtBQUtDLE1BQUwsRUFBWjtBQUNEO0FBbktxQyxDQUFuQixFQW9LbEI7QUFDREMsT0FBS3ZELE9BREo7O0FBR0R3RCxPQUFLLGtCQUFNO0FBQ1QsUUFBTUMsb0JBQW9CekQsUUFBUzBELEVBQVQsQ0FBMUI7QUFDQSxRQUFNckMsT0FBT29DLGtCQUFrQnBDLElBQS9CO0FBQ0EsUUFBS0EsU0FBUyxTQUFkLEVBQTBCO0FBQ3hCLGFBQU8sSUFBSXNDLE9BQUosQ0FBYSxFQUFFbkMsS0FBS2tDLEVBQVAsRUFBYixDQUFQO0FBQ0QsS0FGRCxNQUVPLElBQUtyQyxTQUFTLE9BQWQsRUFBd0I7QUFDN0IsYUFBTyxJQUFJdUMsS0FBSixDQUFXLEVBQUVwQyxLQUFLa0MsRUFBUCxFQUFYLENBQVA7QUFDRCxLQUZNLE1BRUE7QUFDTCxZQUFNLG9DQUFOO0FBQ0Q7QUFDRjtBQWJBLENBcEtrQixDQUFkOztBQW9MUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ08sSUFBTUcsc0NBQWU7QUFDMUIsYUFBVyxFQUFFbEUsU0FBUyxTQUFYLEVBRGU7QUFFMUIsU0FBTyxFQUFFQSxTQUFTLEtBQVgsRUFGbUI7QUFHMUIsdUJBQXFCLEVBQUVBLFNBQVMsaUJBQVgsRUFISztBQUkxQixlQUFhLEVBQUVBLFNBQVMsV0FBWCxFQUphO0FBSzFCLFdBQVMsRUFBRUEsU0FBUyxPQUFYLEVBTGlCO0FBTTFCLGdCQUFjLEVBQUVBLFNBQVMsWUFBWCxFQU5ZO0FBTzFCLHVCQUFxQixFQUFFQSxTQUFTLG1CQUFYLEVBUEs7QUFRMUIsc0JBQW9CLEVBQUVBLFNBQVMsb0JBQVgsRUFSTTtBQVMxQixzQkFBb0IsRUFBRUEsU0FBUyxvQkFBWCxFQVRNO0FBVTFCLGFBQVcsRUFBRUEsU0FBUyxTQUFYLEVBVmU7QUFXMUIsWUFBVSxFQUFFQSxTQUFTLFFBQVgsRUFYZ0I7QUFZMUIsZ0JBQWMsRUFBRUEsU0FBUyxZQUFYLEVBWlk7QUFhMUIsV0FBUyxFQUFFQSxTQUFTLE9BQVgsRUFiaUI7QUFjMUIsV0FBUyxFQUFFQSxTQUFTLE9BQVgsRUFkaUI7QUFlMUIsaUJBQWUsRUFBRUEsU0FBUyxhQUFYLEVBZlc7QUFnQjFCLGFBQVcsRUFBRUEsU0FBUyxTQUFYLEVBaEJlO0FBaUIxQixZQUFVLEVBQUVBLFNBQVMsUUFBWCxFQWpCZ0I7QUFrQjFCLG1CQUFpQixFQUFFQSxTQUFTLGVBQVgsRUFsQlM7QUFtQjFCLGVBQWEsRUFBRUEsU0FBUyxXQUFYLEVBbkJhO0FBb0IxQixnQkFBYyxFQUFFQSxTQUFTLFlBQVgsRUFwQlk7QUFxQjFCLGNBQVksRUFBRUEsU0FBUyxVQUFYLEVBckJjO0FBc0IxQixpQkFBZSxFQUFFQSxTQUFTLGFBQVgsRUF0Qlc7QUF1QjFCLGdCQUFjLEVBQUVBLFNBQVMsWUFBWCxFQXZCWTtBQXdCMUIsV0FBUyxFQUFFQSxTQUFTLE9BQVg7QUF4QmlCLENBQXJCO0FBMEJQOztBQUVPLElBQU1nRSw0QkFBVXZELE1BQU1DLE1BQU4sQ0FBYztBQUNuQ2UsV0FBUyxpQkFBVUUsSUFBVixFQUFnQkMsUUFBaEIsRUFBMkI7QUFDbENuQixVQUFNTSxTQUFOLENBQWdCVSxPQUFoQixDQUF3QjBDLElBQXhCLENBQThCLElBQTlCLEVBQW9DLFNBQXBDLEVBQStDeEMsSUFBL0MsRUFBcURDLFFBQXJEO0FBQ0QsR0FIa0M7O0FBS25DTSxZQUFVLG9CQUFXO0FBQ25CLHdCQUNLekIsTUFBTU0sU0FBTixDQUFnQm1CLFFBQWhCLENBQXlCbEIsS0FBekIsQ0FBZ0MsSUFBaEMsRUFBc0NDLFNBQXRDLENBREw7QUFFRW1ELGlCQUFXLEVBRmI7QUFHRUMsZ0JBQVUsRUFBRSxXQUFXLEVBQWIsRUFIWjtBQUlFQyxnQkFBVTtBQUpaO0FBTUQsR0Faa0M7O0FBY25DL0IsVUFBUSxtQ0FBYzlCLE1BQU1NLFNBQU4sQ0FBZ0J3QixNQUE5QixFQUFzQztBQUM1Q0UsZ0JBQVk7QUFDVmYsWUFBTTtBQUNKNkMsY0FBTSxrQkFBTUwsWUFBTjtBQURGLE9BREk7QUFJVkUsaUJBQVc7QUFDVDFDLGNBQU0sT0FERztBQUVUa0IsZUFBTztBQUNMbEIsZ0JBQU0sUUFERDtBQUVMNkMsZ0JBQU0sa0JBQU1MLFlBQU47QUFGRDtBQUZFLE9BSkQ7QUFXVk0sZUFBUztBQUNQOUMsY0FBTTtBQURDLE9BWEM7QUFjVjJDLGdCQUFVO0FBQ1IzQyxjQUFNO0FBREUsT0FkQTtBQWlCVjRDLGdCQUFVO0FBQ1I1QyxjQUFNO0FBREUsT0FqQkE7QUFvQlYrQyxhQUFPO0FBQ0wvQyxjQUFNO0FBREQsT0FwQkc7QUF1QlZnRCxlQUFTO0FBQ1BoRCxjQUFNLFFBREM7QUFFUG1CLGdCQUFRO0FBRkQsT0F2QkM7QUEyQlY4QixlQUFTO0FBQ1BqRCxjQUFNLFNBREMsQ0FDUztBQURUO0FBM0JDLEtBRGdDO0FBZ0M1Q3dCLGNBQVUsQ0FDUixVQURRO0FBaENrQyxHQUF0QztBQWQyQixDQUFkLENBQWhCOztBQW9EUDtBQUNBLHNDQUFpQmMsT0FBakI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ08sSUFBTVksa0NBQWE7QUFDeEIsa0JBQWdCLEVBQUU1RSxTQUFTLGNBQVgsRUFEUTtBQUV4QixpQkFBZSxFQUFFQSxTQUFTLGFBQVgsRUFGUztBQUd4QixjQUFZLEVBQUVBLFNBQVMsVUFBWCxFQUhZO0FBSXhCLFlBQVUsRUFBRUEsU0FBUyxRQUFYLEVBSmM7QUFLeEIsV0FBUyxFQUFFQSxTQUFTLE9BQVg7QUFMZSxDQUFuQjtBQU9QOztBQUVPLElBQU1pRSx3QkFBUXhELE1BQU1DLE1BQU4sQ0FBYztBQUNqQ2UsV0FBUyxpQkFBVUUsSUFBVixFQUFnQkMsUUFBaEIsRUFBMkI7QUFDbENuQixVQUFNTSxTQUFOLENBQWdCVSxPQUFoQixDQUF3QjBDLElBQXhCLENBQThCLElBQTlCLEVBQW9DLE9BQXBDLEVBQTZDeEMsSUFBN0MsRUFBbURDLFFBQW5EO0FBQ0QsR0FIZ0M7O0FBS2pDVyxVQUFRLG1DQUFjOUIsTUFBTU0sU0FBTixDQUFnQndCLE1BQTlCLEVBQXNDO0FBQzVDRSxnQkFBWTtBQUNWZixZQUFNO0FBQ0o2QyxjQUFNLGtCQUFNSyxVQUFOO0FBREYsT0FESTtBQUlUQyx1QkFBaUI7QUFDaEJuRCxjQUFNLFFBRFU7QUFFaEJtQixnQkFBUTtBQUZRO0FBSlI7QUFEZ0MsR0FBdEM7QUFMeUIsQ0FBZCxDQUFkOztBQWtCUCxzQ0FBaUJvQixLQUFqQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLElBQU1hLDRDQUFrQixzQkFBZ0JwRSxNQUFoQixDQUF3QjtBQUNyREUsY0FBWSxvQkFBVW1FLE1BQVYsRUFBa0JqRSxPQUFsQixFQUE0QjtBQUN0QywwQkFBZ0JDLFNBQWhCLENBQTBCSCxVQUExQixDQUFxQ0ksS0FBckMsQ0FBNEMsSUFBNUMsRUFBa0RDLFNBQWxEO0FBQ0FILGNBQVVBLFdBQVcsRUFBckI7O0FBRUEsU0FBS2tFLEtBQUwsR0FBYTtBQUNYbEUsZUFBUztBQUNQbUUsaUJBQVMsb0JBQ1AsRUFBRUMsY0FBYyxJQUFoQixFQURPLEVBRVBwRSxRQUFRcUUsSUFBUixHQUFlLEVBQUVBLE1BQU1yRSxRQUFRcUUsSUFBaEIsRUFBZixHQUF3Qyx1QkFBYSxRQUFiLENBRmpDO0FBREY7QUFERSxLQUFiOztBQUpzQyxRQWEvQkMsT0FiK0IsR0FhVixJQWJVLENBYS9CQSxPQWIrQjtBQUFBLFFBYXRCQyxRQWJzQixHQWFWLElBYlUsQ0FhdEJBLFFBYnNCOztBQWN0QyxTQUFLQyxPQUFMLEdBQWVGLFVBQVVBLFFBQVNDLFFBQVQsRUFBbUJyQixPQUFuQixDQUFWLEdBQXlDQSxPQUF4RDtBQUNBLFNBQUt1QixLQUFMLEdBQWFILFVBQVVBLFFBQVNDLFFBQVQsRUFBbUJwQixLQUFuQixDQUFWLEdBQXVDQSxLQUFwRDtBQUNELEdBakJvRDs7QUFtQnJEO0FBQ0E7QUFDQXVCLFNBQU8sZUFBVUMsUUFBVixFQUFvQjNFLE9BQXBCLEVBQThCO0FBQ25DLFdBQU8yRSxTQUFTQyxJQUFULENBQWNDLE1BQWQsQ0FDTDtBQUFBLGFBQU8sRUFBR0MsSUFBSUMsT0FBSixJQUFlRCxJQUFJRSxLQUF0QixDQUFQO0FBQUEsS0FESyxFQUVMQyxHQUZLLENBR0w7QUFBQSxhQUFPSCxJQUFJSSxHQUFYO0FBQUEsS0FISyxDQUFQO0FBS0QsR0EzQm9EOztBQTZCckRDLFNBQU8sZUFBVXBGLFVBQVYsRUFBc0JDLE9BQXRCLEVBQWdDO0FBQ3JDLFFBQU1nRCxvQkFBb0J6RCxRQUFTUSxXQUFXZ0IsR0FBcEIsQ0FBMUI7QUFDQSxRQUFNSCxPQUFPb0Msa0JBQWtCcEMsSUFBL0I7QUFDQSxRQUFNcUUsTUFBTTtBQUNWLGlCQUFXakYsUUFBUW9GLFVBQVIsQ0FBbUJaLE9BRHBCO0FBRVYsZUFBU3hFLFFBQVFvRixVQUFSLENBQW1CWDtBQUZsQixLQUFaO0FBSUEsUUFBTVksY0FBY0osSUFBS3JFLElBQUwsQ0FBcEI7QUFDQSxRQUFLeUUsV0FBTCxFQUFtQjtBQUNqQixVQUFNQyxXQUFXLElBQUlELFdBQUosQ0FBaUJ0RixVQUFqQixFQUE2QkMsT0FBN0IsQ0FBakI7O0FBRUEsVUFBS0EsUUFBUXVGLE9BQVIsSUFBbUJELFNBQVNFLEdBQVQsQ0FBYyxPQUFkLENBQXhCLEVBQWtEO0FBQ2hERixpQkFBU0csS0FBVCxHQUFpQkgsU0FBU0ksR0FBVCxDQUFjLE9BQWQsQ0FBakI7QUFDQUosaUJBQVNLLEtBQVQsQ0FBZ0IsUUFBaEI7QUFDRDs7QUFFRCxhQUFPTCxRQUFQO0FBQ0QsS0FURCxNQVNPO0FBQ0wsWUFBTSxvQ0FBTjtBQUNEO0FBQ0YsR0FqRG9EOztBQW1EckQ7QUFDQTtBQUNBO0FBQ0ExQyxTQUFPLGlCQUFXO0FBQ2hCLFdBQU8sdUJBQVcsS0FBS3FCLE1BQUwsQ0FBWWdCLEdBQVosQ0FBaUI7QUFBQSxhQUFTLENBQUVXLE1BQU0zQyxFQUFSLEVBQVkyQyxNQUFNaEQsS0FBTixFQUFaLENBQVQ7QUFBQSxLQUFqQixDQUFYLENBQVA7QUFDRDtBQXhEb0QsQ0FBeEIsQ0FBeEI7O0FBMkRQO0FBQ0E7QUFDQTtBQUNPLFNBQVMxRCxPQUFULENBQWtCMEIsSUFBbEIsRUFBeUI7QUFDOUIsTUFBTWlGLFNBQVN6QyxhQUFjeEMsSUFBZCxLQUF3QmtELFdBQVlsRCxJQUFaLENBQXZDO0FBQ0EsTUFBS2lGLE1BQUwsRUFBYztBQUNaLFdBQU9BLE9BQU8zRyxPQUFkO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBTyxJQUFQO0FBQ0Q7QUFDRiIsImZpbGUiOiJwb2ludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGJ0Yy1hcHAtc2VydmVyIC0tIFNlcnZlciBmb3IgdGhlIEJpY3ljbGUgVG91cmluZyBDb21wYW5pb25cbiAqIENvcHlyaWdodCDCqSAyMDE2IEFkdmVudHVyZSBDeWNsaW5nIEFzc29jaWF0aW9uXG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgYnRjLWFwcC1zZXJ2ZXIuXG4gKlxuICogYnRjLWFwcC1zZXJ2ZXIgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBGb29iYXIuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IHsgbWl4aW5WYWxpZGF0aW9uLCBtZXJnZVNjaGVtYXMgfSBmcm9tICcuL3ZhbGlkYXRpb24tbWl4aW4nO1xuaW1wb3J0IHsgQ291Y2hNb2RlbCwgQ291Y2hDb2xsZWN0aW9uLCBrZXlzQmV0d2VlbiB9IGZyb20gJy4vYmFzZSc7XG5cbmltcG9ydCB7IGtleXMsIGZyb21QYWlycywgaW5jbHVkZXMsIGFzc2lnbiB9IGZyb20gJ2xvZGFzaCc7XG5cbmltcG9ydCBkb2N1cmkgZnJvbSAnZG9jdXJpJztcbmltcG9ydCBuZ2VvaGFzaCBmcm9tICduZ2VvaGFzaCc7XG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ3RvLWlkJztcbmltcG9ydCB1dWlkIGZyb20gJ3V1aWQnO1xuXG5jb25zdCBicm93c2VyID0gKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyApO1xuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3BvbHlmaWxsLXByb21pc2UnKTtcblxuLy8gIyBQb2ludCBNb2RlbFxuLy8gVGhlIHBvaW50IHJlcHJlc2VudHMgYSBsb2NhdGlvbiBvbiB0aGUgbWFwIHdpdGggYXNzb2NpYXRlZCBtZXRhZGF0YSwgZ2VvZGF0YSxcbi8vIGFuZCB1c2VyIHByb3ZpZGVkIGRhdGEuIFRoZSBwb2ludCBpcyB0aGUgYmFzZSBzaGFyZWQgYnkgc2VydmljZXMgYW5kIGFsZXJ0cy5cbi8vXG4vLyBUaGUgSlNPTiBzY2hlbWEgc3RvcmVkIGluIGBQb2ludGAsIGFuZCBhcyBwYXRjaGVkIGJ5IGBTZXJ2aWNlYCBhbmQgYEFsZXJ0YCxcbi8vIGlzIHRoZSBhdXRob3JpdGF0aXZlIGRlZmluaXRpb24gb2YgdGhlIHBvaW50IHJlY29yZC5cblxuLy8gIyMgUG9pbnQgTW9kZWwgVXJpXG4vLyBQb2ludHMgYXJlIHN0b3JlZCBpbiBDb3VjaERCLiBDb3VjaERCIGRvY3VtZW50cyBjYW4gaGF2ZSByaWNoIGlkIHN0cmluZ3Ncbi8vIHRvIGhlbHAgc3RvcmUgYW5kIGFjY2VzcyBkYXRhIHdpdGhvdXQgTWFwUmVkdWNlIGpvYnMuXG4vL1xuLy8gVGhlIHBvaW50IG1vZGVsIHVyaSBpcyBjb21wb3NlZCBvZiBmb3VyIHBhcnRzOlxuLy8gIDEuIFRoZSBzdHJpbmcgJ3BvaW50LydgXG4vLyAgMi4gVGhlIHR5cGUgb2YgcG9pbnQsIGVpdGhlciAnc2VydmljZScgb3IgJ2FsZXJ0J1xuLy8gIDMuIFRoZSBub3JtYWxpemVkIChvcmlnaW5hbCkgbmFtZSBvZiB0aGUgcG9pbnRcbi8vICA0LiBUaGUgcG9pbnQncyBnZW9oYXNoXG5leHBvcnQgY29uc3QgcG9pbnRJZCA9IGRvY3VyaS5yb3V0ZSggJ3BvaW50Lzp0eXBlLzpuYW1lLzpnZW9oYXNoJyApO1xuXG5jb25zdCBDT01NRU5UX01JTl9MRU5HVEggPSAxO1xuY29uc3QgQ09NTUVOVF9NQVhfTEVOR1RIID0gMTQwO1xuXG5leHBvcnQgY29uc3QgUG9pbnQgPSBDb3VjaE1vZGVsLmV4dGVuZCgge1xuICBpZEF0dHJpYnV0ZTogJ19pZCcsXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG4gICAgQ291Y2hNb2RlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gIFxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgdGhpcy5zZXQoIHtcbiAgICAgIGNyZWF0ZWRfYXQ6IGRhdGUsXG4gICAgICB1cGRhdGVkX2F0OiBkYXRlLFxuICAgIH0gKTtcblxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXQoICd1cGRhdGVkX2F0JywgbmV3IERhdGUoKS50b0lTT1N0cmluZygpICk7XG4gIH0sXG5cbiAgLy8gIyMgU3BlY2lmeVxuICAvLyBGaWxsIGluIGBfaWRgIGZyb20gdGhlIGNvbXBvbmVudHMgb2YgdGhlIHBvaW50IG1vZGVsIHVyaS5cbiAgLy8gUHVsbCB2YWx1ZXMgZnJvbSBgYXR0cmlidXRlc2AgaWYgbmFtZSBhbmQgbG9jYXRpb24gYXJlIHVuZGVmaW5lZC5cbiAgc3BlY2lmeTogZnVuY3Rpb24oIHR5cGUsIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIC8vIE9ubHkgc2V0IHRoZSBJRCBhdHRyaWJ1dGUgaGVyZSBpZiBpdCB3YXNuJ3QgYWxyZWFkeSBzZXQuXG4gICAgLy8gVGhlIG9yaWdpbmFsIElEIHN0YXlzIHRoZSBJRCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBwb2ludC5cbiAgICBpZiAodHlwZW9mIHRoaXMuYXR0cmlidXRlcy5faWQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICggbmFtZSApIHtcbiAgICAgICAgY29uc3QgW2xhdCwgbG5nXSA9IGxvY2F0aW9uO1xuICAgICAgICBjb25zdCBfaWQgPSBwb2ludElkKCB7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBuYW1lOiBub3JtYWxpemUoIG5hbWUgKSxcbiAgICAgICAgICBnZW9oYXNoOiBuZ2VvaGFzaC5lbmNvZGUoIGxhdCwgbG5nIClcbiAgICAgICAgfSApO1xuICAgICAgICB0aGlzLnNldCggeyBfaWQsIHR5cGUsIG5hbWUsIGxvY2F0aW9uIH0gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHtuYW1lLCBsb2NhdGlvbn0gPSB0aGlzLmF0dHJpYnV0ZXM7XG4gICAgICAgIGNvbnN0IFtsYXQsIGxuZ10gPSBsb2NhdGlvbjtcbiAgICAgICAgY29uc3QgX2lkID0gcG9pbnRJZCgge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgbmFtZTogbm9ybWFsaXplKCBuYW1lICksXG4gICAgICAgICAgZ2VvaGFzaDogbmdlb2hhc2guZW5jb2RlKCBsYXQsIGxuZyApXG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5zZXQoIHsgX2lkIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmbGFnZ2VkX2J5OiBbXSxcbiAgICAgIHVwZGF0ZWRfYnk6ICd1bmtub3duJyxcbiAgICAgIGNvbW1lbnRzOiBbXSxcbiAgICAgIGlzX2hpZGRlbjogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgbWluSXRlbXM6IDIsXG4gICAgICAgIG1heEl0ZW1zOiAyLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0eXBlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgY3JlYXRlZF9hdDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWRfYXQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkX2J5OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgfSxcbiAgICAgIGZsYWdnZWRfYnk6e1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICB1c2VyOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgICAgICAgcmVhc29uOiB7dHlwZTogJ3N0cmluZycsIG1pbkxlbmd0aDogQ09NTUVOVF9NSU5fTEVOR1RILCBtYXhMZW5ndGg6IENPTU1FTlRfTUFYX0xFTkdUSH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVxdWlyZWQ6IFtcbiAgICAgICAgICAgICd1c2VyJyxcbiAgICAgICAgICAgICdyZWFzb24nXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaXNfaGlkZGVuOntcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICB9LFxuICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBjb21tZW50czoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0ZToge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICdtaW5MZW5ndGgnOiBDT01NRU5UX01JTl9MRU5HVEgsXG4gICAgICAgICAgICAgICdtYXhMZW5ndGgnOiBDT01NRU5UX01BWF9MRU5HVEhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByYXRpbmc6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgICAgICBtaW5pbXVtOiAxLFxuICAgICAgICAgICAgICBtYXhpbXVtOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdXVpZDoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVxdWlyZWQ6IFtcbiAgICAgICAgICAgICd1c2VyJyxcbiAgICAgICAgICAgICdkYXRlJyxcbiAgICAgICAgICAgICd0ZXh0JyxcbiAgICAgICAgICAgICdyYXRpbmcnLFxuICAgICAgICAgICAgJ3V1aWQnXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXF1aXJlZDogW1xuICAgICAgJ25hbWUnLFxuICAgICAgJ2xvY2F0aW9uJyxcbiAgICAgICd0eXBlJyxcbiAgICAgICdjcmVhdGVkX2F0JyxcbiAgICAgICd1cGRhdGVkX2F0JyxcbiAgICAgICd1cGRhdGVkX2J5JyxcdC8qIEFkZGVkOiBUbyBhdHRhY2ggcG9pbnRzIHRvIHVzZXJzIHZpYSB0aGVpciBfaWQgKi9cbiAgICAgICdmbGFnZ2VkX2J5JyxcbiAgICAgICdpc19oaWRkZW4nLFxuICAgICAgJ2NvbW1lbnRzJ1xuICAgIF1cbiAgfSxcblxuICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgQ291Y2hNb2RlbC5wcm90b3R5cGUuY2xlYXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICB9LFxuXG4gIC8vICMjIEdldCBSZWR1eCBSZXByZXNlbnRhdGlvblxuICAvLyBSZXR1cm4gYSBuZXN0ZWQgb2JqZWN0L2FyYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBzdWl0YWJsZSBmb3JcbiAgLy8gdXNlIHdpdGggcmVkdXguXG4gIHN0b3JlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geyAuLi50aGlzLnRvSlNPTigpIH07XG4gIH1cbn0sIHtcbiAgdXJpOiBwb2ludElkLFxuXG4gIGZvcjogaWQgPT4ge1xuICAgIGNvbnN0IHBvaW50SWRDb21wb25lbnRzID0gcG9pbnRJZCggaWQgKTtcbiAgICBjb25zdCB0eXBlID0gcG9pbnRJZENvbXBvbmVudHMudHlwZTtcbiAgICBpZiAoIHR5cGUgPT09ICdzZXJ2aWNlJyApIHtcbiAgICAgIHJldHVybiBuZXcgU2VydmljZSggeyBfaWQ6IGlkIH0gKTtcbiAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAnYWxlcnQnICkge1xuICAgICAgcmV0dXJuIG5ldyBBbGVydCggeyBfaWQ6IGlkIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ0EgcG9pbnQgbXVzdCBiZSBhIHNlcnZpY2Ugb3IgYWxlcnQnO1xuICAgIH1cbiAgfVxufSApO1xuXG4vLyAjIFNlcnZpY2UgTW9kZWxcbi8vIEEgc2VydmljZSBpcyBhIGJ1aXNuZXNzIG9yIHBvaW50IG9mIGludGVyZXN0IHRvIGEgY3ljbGlzdC4gQSBjeWNsaXN0IG5lZWRzXG4vLyB0byBrbm93IHdoZXJlIHRoZXkgd2FudCB0byBzdG9wIHdlbGwgaW4gYWR2YW5jZSBvZiB0aGVpciB0cmF2ZWwgdGhyb3VnaCBhblxuLy8gYXJlYS4gVGhlIHNlcnZpY2UgcmVjb3JkIG11c3QgY29udGFpbiBlbm91Z2ggaW5mb3JtYXRpb24gdG8gaGVscCB0aGUgY3ljbGlzdFxuLy8gbWFrZSBzdWNoIGRlY2lzaW9ucy5cbi8vXG4vLyBUaGUgcmVjb3JkIGluY2x1ZGVzIGNvbnRhY3QgaW5mb3JtYXRpb24sIGFuZCBhIHNjaGVkdWxlIG9mIGhvdXJzIG9mXG4vLyBvcGVyYXRpb24uIEl0IGlzIGltcG9ydGFudCB0aGF0IHdlIHN0b3JlIHRoZSB0aW1lIHpvbmUgb2YgYSBzZXJ2aWNlLCBzaW5jZVxuLy8gdG91cmluZyBjeWNsaXN0cyB3aWxsIGNyb3NzIHRpbWUgem9uZXMgb24gdGhlaXIgdHJhdmVscy4gRnVydGhlcm1vcmUsXG4vLyBzZXJ2aWNlcyBvZiBpbnRlcmVzdCB0byB0b3VyaW5nIGN5Y2xpc3RzIG1heSBiZSBzZWFzb25hbDogd2Ugc3RvcmVcbi8vIHNjaGVkdWxlcyBmb3IgZGlmZmVyZW50IHNlYXNvbnMuXG5cbi8vICMjIFNlcnZpY2UgVHlwZXNcbi8vIEEgU2VydmljZSBtYXkgaGF2ZSBhIHNpbmdsZSB0eXBlLCBpbmRpY2F0aW5nIHRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhlXG4vLyBidWlzbmVzcyBvciBwb2ludCBvZiBpbnRlcmVzdC4gU2VydmljZSB0eXBlcyBtYXkgYWxzbyBiZSBpbmNsdWRlZCBpbiBhXG4vLyBTZXJ2aWNlJ3MgYW1lbml0aWVzIGFycmF5LlxuXG4vKmVzZm10LWlnbm9yZS1zdGFydCovXG5leHBvcnQgY29uc3Qgc2VydmljZVR5cGVzID0ge1xuICAnYWlycG9ydCc6IHsgZGlzcGxheTogJ0FpcnBvcnQnIH0sXG4gICdiYXInOiB7IGRpc3BsYXk6ICdCYXInIH0sXG4gICdiZWRfYW5kX2JyZWFrZmFzdCc6IHsgZGlzcGxheTogJ0JlZCAmIEJyZWFrZmFzdCcgfSxcbiAgJ2Jpa2Vfc2hvcCc6IHsgZGlzcGxheTogJ0Jpa2UgU2hvcCcgfSxcbiAgJ2NhYmluJzogeyBkaXNwbGF5OiAnQ2FiaW4nIH0sXG4gICdjYW1wZ3JvdW5kJzogeyBkaXNwbGF5OiAnQ2FtcGdyb3VuZCcgfSxcbiAgJ2NvbnZlbmllbmNlX3N0b3JlJzogeyBkaXNwbGF5OiAnQ29udmVuaWVuY2UgU3RvcmUnIH0sXG4gICdjeWNsaXN0c19jYW1waW5nJzogeyBkaXNwbGF5OiAnQ3ljbGlzdHNcXCcgQ2FtcGluZycgfSxcbiAgJ2N5Y2xpc3RzX2xvZGdpbmcnOiB7IGRpc3BsYXk6ICdDeWNsaXN0c1xcJyBMb2RnaW5nJyB9LFxuICAnZ3JvY2VyeSc6IHsgZGlzcGxheTogJ0dyb2NlcnknIH0sXG4gICdob3N0ZWwnOiB7IGRpc3BsYXk6ICdIb3N0ZWwnIH0sXG4gICdob3Rfc3ByaW5nJzogeyBkaXNwbGF5OiAnSG90IFNwcmluZycgfSxcbiAgJ2hvdGVsJzogeyBkaXNwbGF5OiAnSG90ZWwnIH0sXG4gICdtb3RlbCc6IHsgZGlzcGxheTogJ01vdGVsJyB9LFxuICAnaW5mb3JtYXRpb24nOiB7IGRpc3BsYXk6ICdJbmZvcm1hdGlvbicgfSxcbiAgJ2xpYnJhcnknOiB7IGRpc3BsYXk6ICdMaWJyYXJ5JyB9LFxuICAnbXVzZXVtJzogeyBkaXNwbGF5OiAnTXVzZXVtJyB9LFxuICAnb3V0ZG9vcl9zdG9yZSc6IHsgZGlzcGxheTogJ091dGRvb3IgU3RvcmUnIH0sXG4gICdyZXN0X2FyZWEnOiB7IGRpc3BsYXk6ICdSZXN0IEFyZWEnIH0sXG4gICdyZXN0YXVyYW50JzogeyBkaXNwbGF5OiAnUmVzdGF1cmFudCcgfSxcbiAgJ3Jlc3Ryb29tJzogeyBkaXNwbGF5OiAnUmVzdHJvb20nIH0sXG4gICdzY2VuaWNfYXJlYSc6IHsgZGlzcGxheTogJ1NjZW5pYyBBcmVhJyB9LFxuICAnc3RhdGVfcGFyayc6IHsgZGlzcGxheTogJ1N0YXRlIFBhcmsnIH0sXG4gICdvdGhlcic6IHsgZGlzcGxheTogJ090aGVyJyB9XG59O1xuLyplc2ZtdC1pZ25vcmUtZW5kKi9cblxuZXhwb3J0IGNvbnN0IFNlcnZpY2UgPSBQb2ludC5leHRlbmQoIHtcbiAgc3BlY2lmeTogZnVuY3Rpb24oIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIFBvaW50LnByb3RvdHlwZS5zcGVjaWZ5LmNhbGwoIHRoaXMsICdzZXJ2aWNlJywgbmFtZSwgbG9jYXRpb24gKTtcbiAgfSxcblxuICBkZWZhdWx0czogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLlBvaW50LnByb3RvdHlwZS5kZWZhdWx0cy5hcHBseSggdGhpcywgYXJndW1lbnRzICksXG4gICAgICBhbWVuaXRpZXM6IFtdLFxuICAgICAgc2NoZWR1bGU6IHsgJ2RlZmF1bHQnOiBbXSB9LFxuICAgICAgc2Vhc29uYWw6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBzY2hlbWE6IG1lcmdlU2NoZW1hcyggUG9pbnQucHJvdG90eXBlLnNjaGVtYSwge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgZW51bToga2V5cyggc2VydmljZVR5cGVzIClcbiAgICAgIH0sXG4gICAgICBhbWVuaXRpZXM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBlbnVtOiBrZXlzKCBzZXJ2aWNlVHlwZXMgKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYWRkcmVzczoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIHNjaGVkdWxlOiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICB9LFxuICAgICAgc2Vhc29uYWw6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICB9LFxuICAgICAgcGhvbmU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICB3ZWJzaXRlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICd1cmknXG4gICAgICB9LFxuICAgICAgdXBkYXRlZDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicgLy8gdGhlIHVwZGF0ZWQgYXR0cmlidXRlIGlzIG5vdCByZXF1aXJlZFxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICdzZWFzb25hbCdcbiAgICBdXG4gIH0gKVxufSApO1xuXG4vLyBBcHBseSB0aGUgdmFsaWRhdGlvbiBtaXhpbiB0byB0aGUgU2VydmljZSBtb2RlbC4gU2VlIHZhbGlkYXRpb24tbWl4aW4uanMuXG5taXhpblZhbGlkYXRpb24oIFNlcnZpY2UgKTtcblxuLy8gIyBBbGVydCBNb2RlbFxuLy8gQW4gYWxlcnQgaXMgc29tZXRoaW5nIHRoYXQgbWlnaHQgaW1wZWRlIGEgY3ljbGlzdCdzIHRvdXIuIFdoZW4gYSBjeWNsaXN0XG4vLyBzZWVzIGFuIGFsZXJ0IG9uIHRoZSBtYXAsIHRoZSBrbm93IHRvIHBsYW4gYXJvdW5kIGl0LlxuXG4vKmVzZm10LWlnbm9yZS1zdGFydCovXG5leHBvcnQgY29uc3QgYWxlcnRUeXBlcyA9IHtcbiAgJ3JvYWRfY2xvc3VyZSc6IHsgZGlzcGxheTogJ1JvYWQgQ2xvc3VyZScgfSxcbiAgJ2ZvcmVzdF9maXJlJzogeyBkaXNwbGF5OiAnRm9yZXN0IGZpcmUnIH0sXG4gICdmbG9vZGluZyc6IHsgZGlzcGxheTogJ0Zsb29kaW5nJyB9LFxuICAnZGV0b3VyJzogeyBkaXNwbGF5OiAnRGV0b3VyJyB9LFxuICAnb3RoZXInOiB7IGRpc3BsYXk6ICdPdGhlcicgfVxufTtcbi8qZXNmbXQtaWdub3JlLWVuZCovXG5cbmV4cG9ydCBjb25zdCBBbGVydCA9IFBvaW50LmV4dGVuZCgge1xuICBzcGVjaWZ5OiBmdW5jdGlvbiggbmFtZSwgbG9jYXRpb24gKSB7XG4gICAgUG9pbnQucHJvdG90eXBlLnNwZWNpZnkuY2FsbCggdGhpcywgJ2FsZXJ0JywgbmFtZSwgbG9jYXRpb24gKTtcbiAgfSxcblxuICBzY2hlbWE6IG1lcmdlU2NoZW1hcyggUG9pbnQucHJvdG90eXBlLnNjaGVtYSwge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgZW51bToga2V5cyggYWxlcnRUeXBlcyApXG4gICAgICB9LFxuICAgICAgIGV4cGlyYXRpb25fZGF0ZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgfSxcbiAgICB9XG4gIH0gKVxufSApO1xuXG5taXhpblZhbGlkYXRpb24oIEFsZXJ0ICk7XG5cbi8vICMgUG9pbnQgQ29sbGVjdGlvblxuLy8gQSBoZXRlcm9nZW5lb3VzIGNvbGxlY3Rpb24gb2Ygc2VydmljZXMgYW5kIGFsZXJ0cy4gUG91Y2hEQiBpcyBhYmxlIHRvIGZldGNoXG4vLyB0aGlzIGNvbGxlY3Rpb24gYnkgbG9va2luZyBmb3IgYWxsIGtleXMgc3RhcnRpbmcgd2l0aCAncG9pbnQvJy5cbi8vXG4vLyBBIGNvbm5lY3RlZCBQb2ludENvbGxlY3Rpb24gbXVzdCBiZSBhYmxlIHRvIGdlbmVyYXRlIGNvbm5lY3RlZCBBbGVydHMgb3Jcbi8vIFNlcnZpY2VzIG9uIGRlbWFuZHMuIFRoZXJlZm9yZSwgaWYgUG9pbnRDb2xsZWN0aW9uIGlzIGNvbm5lY3RlZCwgY29ubmVjdFxuLy8gbW9kZWxzIGJlZm9yZSByZXR1cm5pbmcgdGhlbS5cbmV4cG9ydCBjb25zdCBQb2ludENvbGxlY3Rpb24gPSBDb3VjaENvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBtb2RlbHMsIG9wdGlvbnMgKSB7XG4gICAgQ291Y2hDb2xsZWN0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMucG91Y2ggPSB7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGFsbERvY3M6IGFzc2lnbihcbiAgICAgICAgICB7IGluY2x1ZGVfZG9jczogdHJ1ZSB9LFxuICAgICAgICAgIG9wdGlvbnMua2V5cyA/IHsga2V5czogb3B0aW9ucy5rZXlzIH0gOiBrZXlzQmV0d2VlbiggJ3BvaW50LycgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHtjb25uZWN0LCBkYXRhYmFzZX0gPSB0aGlzO1xuICAgIHRoaXMuc2VydmljZSA9IGNvbm5lY3QgPyBjb25uZWN0KCBkYXRhYmFzZSwgU2VydmljZSApIDogU2VydmljZTtcbiAgICB0aGlzLmFsZXJ0ID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBBbGVydCApIDogQWxlcnQ7XG4gIH0sXG5cbiAgLy8gVGhpcyBoYW5kbGVzIHRoZSBgb3B0aW9ucy5rZXlzYCBlZGdlIGNhc2VzIGxpc3RlZCBpbiB0aGVcbiAgLy8gW1BvdWNoREIgYXBpXShodHRwczovL3BvdWNoZGIuY29tL2FwaS5odG1sI2JhdGNoX2ZldGNoKVxuICBwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlLCBvcHRpb25zICkge1xuICAgIHJldHVybiByZXNwb25zZS5yb3dzLmZpbHRlcihcbiAgICAgIHJvdyA9PiAhKCByb3cuZGVsZXRlZCB8fCByb3cuZXJyb3IgKVxuICAgICkubWFwKFxuICAgICAgcm93ID0+IHJvdy5kb2NcbiAgICApO1xuICB9LFxuXG4gIG1vZGVsOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBjb25zdCBwb2ludElkQ29tcG9uZW50cyA9IHBvaW50SWQoIGF0dHJpYnV0ZXMuX2lkICk7XG4gICAgY29uc3QgdHlwZSA9IHBvaW50SWRDb21wb25lbnRzLnR5cGU7XG4gICAgY29uc3QgbWFwID0ge1xuICAgICAgJ3NlcnZpY2UnOiBvcHRpb25zLmNvbGxlY3Rpb24uc2VydmljZSxcbiAgICAgICdhbGVydCc6IG9wdGlvbnMuY29sbGVjdGlvbi5hbGVydFxuICAgIH07XG4gICAgY29uc3QgY29uc3RydWN0b3IgPSBtYXBbIHR5cGUgXTtcbiAgICBpZiAoIGNvbnN0cnVjdG9yICkge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgY29uc3RydWN0b3IoIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKTtcblxuICAgICAgaWYgKCBvcHRpb25zLmRlaW5kZXggJiYgaW5zdGFuY2UuaGFzKCAnaW5kZXgnICkgKSB7XG4gICAgICAgIGluc3RhbmNlLmluZGV4ID0gaW5zdGFuY2UuZ2V0KCAnaW5kZXgnICk7XG4gICAgICAgIGluc3RhbmNlLnVuc2V0KCAnaW5kZXggJyApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdBIHBvaW50IG11c3QgYmUgYSBzZXJ2aWNlIG9yIGFsZXJ0JztcbiAgICB9XG4gIH0sXG5cbiAgLy8gIyMgR2V0IFJlZHV4IFJlcHJlc2VudGF0aW9uXG4gIC8vIFJldHVybiBhIG5lc3RlZCBvYmplY3QvYXJhcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbGxlY3Rpb24gc3VpdGFibGUgZm9yXG4gIC8vIHVzZSB3aXRoIHJlZHV4LlxuICBzdG9yZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZyb21QYWlycyggdGhpcy5tb2RlbHMubWFwKCBwb2ludCA9PiBbIHBvaW50LmlkLCBwb2ludC5zdG9yZSgpIF0gKSApO1xuICB9XG59ICk7XG5cbi8vICMgRGlzcGxheSBOYW1lIGZvciBUeXBlXG4vLyBHaXZlbiBhIHR5cGUga2V5IGZyb20gZWl0aGVyIHRoZSBzZXJ2aWNlIG9yIGFsZXJ0IHR5cGUgZW51bWVyYXRpb25zLFxuLy8gcmV0dXJuIHRoZSB0eXBlJ3MgZGlzcGxheSBzdHJpbmcsIG9yIG51bGwgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGxheSggdHlwZSApIHtcbiAgY29uc3QgdmFsdWVzID0gc2VydmljZVR5cGVzWyB0eXBlIF0gfHwgYWxlcnRUeXBlc1sgdHlwZSBdO1xuICBpZiAoIHZhbHVlcyApIHtcbiAgICByZXR1cm4gdmFsdWVzLmRpc3BsYXk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==