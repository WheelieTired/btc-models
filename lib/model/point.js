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

var _blobUtil = require('blob-util');

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

var Point = exports.Point = _base.CouchModel.extend({
  idAttribute: '_id',

  initialize: function initialize(attributes, options) {
    _base.CouchModel.prototype.initialize.apply(this, arguments);

    var date = new Date().toISOString();
    this.set({
      created_at: date,
      updated_at: date
    });

    this.coverBlob = false;
    this.coverUrl = false;
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
        var _location = _slicedToArray(location, 2);

        var lat = _location[0];
        var lng = _location[1];

        var _id = pointId({
          type: type,
          name: (0, _toId2.default)(name),
          geohash: _ngeohash2.default.encode(lat, lng)
        });
        this.set({ _id: _id, type: type, name: name, location: location });
      } else {
        var _attributes = this.attributes;
        var _name = _attributes.name;
        var _location2 = _attributes.location;

        var _location3 = _slicedToArray(_location2, 2);

        var _lat = _location3[0];
        var _lng = _location3[1];

        var _id2 = pointId({
          type: type,
          name: (0, _toId2.default)(_name),
          geohash: _ngeohash2.default.encode(_lat, _lng)
        });
        this.set({ _id: _id2 });
      }
    }
  },

  // ## Safeguard for Points
  // Points have image attachments, so we should let backbone pouch handle
  // those and we should not validate the _attachments key
  safeguard: ['_attachments'],

  defaults: function defaults() {
    return {
      flagged_by: [],
      updated_by: 'unknown'
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
          type: 'string'
        }
      },
      description: {
        type: 'string'
      }
    },
    required: ['name', 'location', 'type', 'created_at', 'updated_at', 'updated_by', /* Added: To attach points to users via their _id */
    'flagged_by']
  },

  clear: function clear() {
    _base.CouchModel.prototype.clear.apply(this, arguments);
    this.coverUrl = false;
  },

  // ## Fetch
  // When fetching a point, should it have a cover attachment, extend the
  // promise to fetch the attachment and set `this.coverUrl`.
  fetch: function fetch() {
    var _this = this;

    return _base.CouchModel.prototype.fetch.apply(this, arguments).then(function (res) {
      return _this.getCover(res);
    });
  },

  // # Get Cover
  // Should a point (already fetched) have a cover attachment, get the
  // attachment's data and store an object url for it in `this.coverUrl`
  //
  // As a utility to client functions, resolve the returned promise to the
  // single argument passed to `getCover`.
  getCover: function getCover(ret) {
    var _this2 = this;

    return Promise.resolve().then(function () {
      var hasCover = (0, _lodash.includes)(_this2.attachments(), 'cover.png');
      if (browser && hasCover) {
        return _this2.attachment('cover.png');
      } else {
        return;
      }
    }).then(function (blob) {
      if (blob) {
        _this2.coverBlob = blob;
        _this2.coverUrl = (0, _blobUtil.createObjectURL)(blob);
      }
    }).then(function () {
      return ret;
    });
  },

  // ## Set Cover
  // If the user already has a cover blob and they want to use it with the
  // model before attach() can finish storing it to PouchDB, they can use
  // this method to manually insert it.
  //
  // The associated object url for the blob will then be available to other
  // functions like store().
  setCover: function setCover(blob) {
    this.coverBlob = blob;
    if (browser) {
      this.coverUrl = (0, _blobUtil.createObjectURL)(blob);
    }
  },

  // ## Get Redux Representation
  // Return a nested object/arary representation of the model suitable for
  // use with redux.
  store: function store() {
    return _extends({}, this.toJSON(), { coverUrl: this.coverUrl });
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

    var connect = this.connect;
    var database = this.database;

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

  // ## Fetch Cover Images for all Points
  // Returns a promise that resolves when all points in the array have
  // their cover images available.
  getCovers: function getCovers() {
    return Promise.all(this.models.map(function (point) {
      return point.getCover();
    }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwiY292ZXJCbG9iIiwiY292ZXJVcmwiLCJ1cGRhdGUiLCJzcGVjaWZ5IiwidHlwZSIsIm5hbWUiLCJsb2NhdGlvbiIsIl9pZCIsImxhdCIsImxuZyIsImdlb2hhc2giLCJlbmNvZGUiLCJzYWZlZ3VhcmQiLCJkZWZhdWx0cyIsImZsYWdnZWRfYnkiLCJ1cGRhdGVkX2J5Iiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwibWluSXRlbXMiLCJtYXhJdGVtcyIsIml0ZW1zIiwiZm9ybWF0IiwiZGVzY3JpcHRpb24iLCJyZXF1aXJlZCIsImNsZWFyIiwiZmV0Y2giLCJ0aGVuIiwiZ2V0Q292ZXIiLCJyZXMiLCJyZXQiLCJyZXNvbHZlIiwiaGFzQ292ZXIiLCJhdHRhY2htZW50cyIsImF0dGFjaG1lbnQiLCJibG9iIiwic2V0Q292ZXIiLCJzdG9yZSIsInRvSlNPTiIsInVyaSIsImZvciIsInBvaW50SWRDb21wb25lbnRzIiwiaWQiLCJTZXJ2aWNlIiwiQWxlcnQiLCJzZXJ2aWNlVHlwZXMiLCJjYWxsIiwiYW1lbml0aWVzIiwic2NoZWR1bGUiLCJzZWFzb25hbCIsImVudW0iLCJhZGRyZXNzIiwicGhvbmUiLCJ3ZWJzaXRlIiwidXBkYXRlZCIsImFsZXJ0VHlwZXMiLCJQb2ludENvbGxlY3Rpb24iLCJtb2RlbHMiLCJwb3VjaCIsImFsbERvY3MiLCJpbmNsdWRlX2RvY3MiLCJrZXlzIiwiY29ubmVjdCIsImRhdGFiYXNlIiwic2VydmljZSIsImFsZXJ0IiwicGFyc2UiLCJyZXNwb25zZSIsInJvd3MiLCJmaWx0ZXIiLCJyb3ciLCJkZWxldGVkIiwiZXJyb3IiLCJtYXAiLCJkb2MiLCJtb2RlbCIsImNvbGxlY3Rpb24iLCJjb25zdHJ1Y3RvciIsImluc3RhbmNlIiwiZGVpbmRleCIsImhhcyIsImluZGV4IiwiZ2V0IiwidW5zZXQiLCJnZXRDb3ZlcnMiLCJhbGwiLCJwb2ludCIsInZhbHVlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3lwQkFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQTZiZ0JBLE8sR0FBQUEsTzs7QUExYWhCOztBQUNBOztBQUVBOztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxVQUFZLE9BQU9DLE1BQVAsS0FBa0IsV0FBcEM7O0FBRUEsSUFBSUMsVUFBVUMsUUFBUSxrQkFBUixDQUFkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxJQUFNQyw0QkFBVSxpQkFBT0MsS0FBUCxDQUFjLDRCQUFkLENBQWhCOztBQUVBLElBQU1DLHdCQUFRLGlCQUFXQyxNQUFYLENBQW1CO0FBQ3RDQyxlQUFhLEtBRHlCOztBQUd0Q0MsY0FBWSxvQkFBVUMsVUFBVixFQUFzQkMsT0FBdEIsRUFBZ0M7QUFDMUMscUJBQVdDLFNBQVgsQ0FBcUJILFVBQXJCLENBQWdDSSxLQUFoQyxDQUF1QyxJQUF2QyxFQUE2Q0MsU0FBN0M7O0FBRUEsUUFBTUMsT0FBTyxJQUFJQyxJQUFKLEdBQVdDLFdBQVgsRUFBYjtBQUNBLFNBQUtDLEdBQUwsQ0FBVTtBQUNSQyxrQkFBWUosSUFESjtBQUVSSyxrQkFBWUw7QUFGSixLQUFWOztBQUtBLFNBQUtNLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxTQUFLQyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0Qs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U0FBUzNELE9BQVQsQ0FBa0IwQixJQUFsQixFQUF5QjtBQUM5QixNQUFNbUYsU0FBUzFDLGFBQWN6QyxJQUFkLEtBQXdCbUQsV0FBWW5ELElBQVosQ0FBdkM7QUFDQSxNQUFLbUYsTUFBTCxFQUFjO0FBQ1osV0FBT0EsT0FBTzdHLE9BQWQ7QUFDRCxHQUZELE1BRU87QUFDTCxXQUFPLElBQVA7QUFDRDtBQUNGIiwiZmlsZSI6InBvaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogYnRjLWFwcC1zZXJ2ZXIgLS0gU2VydmVyIGZvciB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvblxuICogQ29weXJpZ2h0IMKpIDIwMTYgQWR2ZW50dXJlIEN5Y2xpbmcgQXNzb2NpYXRpb25cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBidGMtYXBwLXNlcnZlci5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEZvb2Jhci4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgeyBtaXhpblZhbGlkYXRpb24sIG1lcmdlU2NoZW1hcyB9IGZyb20gJy4vdmFsaWRhdGlvbi1taXhpbic7XG5pbXBvcnQgeyBDb3VjaE1vZGVsLCBDb3VjaENvbGxlY3Rpb24sIGtleXNCZXR3ZWVuIH0gZnJvbSAnLi9iYXNlJztcblxuaW1wb3J0IHsga2V5cywgZnJvbVBhaXJzLCBpbmNsdWRlcywgYXNzaWduIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGNyZWF0ZU9iamVjdFVSTCB9IGZyb20gJ2Jsb2ItdXRpbCc7XG5cbmltcG9ydCBkb2N1cmkgZnJvbSAnZG9jdXJpJztcbmltcG9ydCBuZ2VvaGFzaCBmcm9tICduZ2VvaGFzaCc7XG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ3RvLWlkJztcbmltcG9ydCB1dWlkIGZyb20gJ25vZGUtdXVpZCc7XG5cbmNvbnN0IGJyb3dzZXIgPSAoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICk7XG5cbnZhciBQcm9taXNlID0gcmVxdWlyZSgncG9seWZpbGwtcHJvbWlzZScpO1xuXG4vLyAjIFBvaW50IE1vZGVsXG4vLyBUaGUgcG9pbnQgcmVwcmVzZW50cyBhIGxvY2F0aW9uIG9uIHRoZSBtYXAgd2l0aCBhc3NvY2lhdGVkIG1ldGFkYXRhLCBnZW9kYXRhLFxuLy8gYW5kIHVzZXIgcHJvdmlkZWQgZGF0YS4gVGhlIHBvaW50IGlzIHRoZSBiYXNlIHNoYXJlZCBieSBzZXJ2aWNlcyBhbmQgYWxlcnRzLlxuLy9cbi8vIFRoZSBKU09OIHNjaGVtYSBzdG9yZWQgaW4gYFBvaW50YCwgYW5kIGFzIHBhdGNoZWQgYnkgYFNlcnZpY2VgIGFuZCBgQWxlcnRgLFxuLy8gaXMgdGhlIGF1dGhvcml0YXRpdmUgZGVmaW5pdGlvbiBvZiB0aGUgcG9pbnQgcmVjb3JkLlxuXG4vLyAjIyBQb2ludCBNb2RlbCBVcmlcbi8vIFBvaW50cyBhcmUgc3RvcmVkIGluIENvdWNoREIuIENvdWNoREIgZG9jdW1lbnRzIGNhbiBoYXZlIHJpY2ggaWQgc3RyaW5nc1xuLy8gdG8gaGVscCBzdG9yZSBhbmQgYWNjZXNzIGRhdGEgd2l0aG91dCBNYXBSZWR1Y2Ugam9icy5cbi8vXG4vLyBUaGUgcG9pbnQgbW9kZWwgdXJpIGlzIGNvbXBvc2VkIG9mIGZvdXIgcGFydHM6XG4vLyAgMS4gVGhlIHN0cmluZyAncG9pbnQvJ2Bcbi8vICAyLiBUaGUgdHlwZSBvZiBwb2ludCwgZWl0aGVyICdzZXJ2aWNlJyBvciAnYWxlcnQnXG4vLyAgMy4gVGhlIG5vcm1hbGl6ZWQgKG9yaWdpbmFsKSBuYW1lIG9mIHRoZSBwb2ludFxuLy8gIDQuIFRoZSBwb2ludCdzIGdlb2hhc2hcbmV4cG9ydCBjb25zdCBwb2ludElkID0gZG9jdXJpLnJvdXRlKCAncG9pbnQvOnR5cGUvOm5hbWUvOmdlb2hhc2gnICk7XG5cbmV4cG9ydCBjb25zdCBQb2ludCA9IENvdWNoTW9kZWwuZXh0ZW5kKCB7XG4gIGlkQXR0cmlidXRlOiAnX2lkJyxcblxuICBpbml0aWFsaXplOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBDb3VjaE1vZGVsLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB0aGlzLnNldCgge1xuICAgICAgY3JlYXRlZF9hdDogZGF0ZSxcbiAgICAgIHVwZGF0ZWRfYXQ6IGRhdGUsXG4gICAgfSApO1xuXG4gICAgdGhpcy5jb3ZlckJsb2IgPSBmYWxzZTtcbiAgICB0aGlzLmNvdmVyVXJsID0gZmFsc2U7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldCggJ3VwZGF0ZWRfYXQnLCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgKTtcbiAgfSxcblxuICAvLyAjIyBTcGVjaWZ5XG4gIC8vIEZpbGwgaW4gYF9pZGAgZnJvbSB0aGUgY29tcG9uZW50cyBvZiB0aGUgcG9pbnQgbW9kZWwgdXJpLlxuICAvLyBQdWxsIHZhbHVlcyBmcm9tIGBhdHRyaWJ1dGVzYCBpZiBuYW1lIGFuZCBsb2NhdGlvbiBhcmUgdW5kZWZpbmVkLlxuICBzcGVjaWZ5OiBmdW5jdGlvbiggdHlwZSwgbmFtZSwgbG9jYXRpb24gKSB7XG4gICAgLy8gT25seSBzZXQgdGhlIElEIGF0dHJpYnV0ZSBoZXJlIGlmIGl0IHdhc24ndCBhbHJlYWR5IHNldC5cbiAgICAvLyBUaGUgb3JpZ2luYWwgSUQgc3RheXMgdGhlIElEIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHBvaW50LlxuICAgIGlmICh0eXBlb2YgdGhpcy5hdHRyaWJ1dGVzLl9pZCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKCBuYW1lICkge1xuICAgICAgICBjb25zdCBbbGF0LCBsbmddID0gbG9jYXRpb247XG4gICAgICAgIGNvbnN0IF9pZCA9IHBvaW50SWQoIHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIG5hbWU6IG5vcm1hbGl6ZSggbmFtZSApLFxuICAgICAgICAgIGdlb2hhc2g6IG5nZW9oYXNoLmVuY29kZSggbGF0LCBsbmcgKVxuICAgICAgICB9ICk7XG4gICAgICAgIHRoaXMuc2V0KCB7IF9pZCwgdHlwZSwgbmFtZSwgbG9jYXRpb24gfSApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qge25hbWUsIGxvY2F0aW9ufSA9IHRoaXMuYXR0cmlidXRlcztcbiAgICAgICAgY29uc3QgW2xhdCwgbG5nXSA9IGxvY2F0aW9uO1xuICAgICAgICBjb25zdCBfaWQgPSBwb2ludElkKCB7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBuYW1lOiBub3JtYWxpemUoIG5hbWUgKSxcbiAgICAgICAgICBnZW9oYXNoOiBuZ2VvaGFzaC5lbmNvZGUoIGxhdCwgbG5nIClcbiAgICAgICAgfSApO1xuICAgICAgICB0aGlzLnNldCggeyBfaWQgfSApO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyAjIyBTYWZlZ3VhcmQgZm9yIFBvaW50c1xuICAvLyBQb2ludHMgaGF2ZSBpbWFnZSBhdHRhY2htZW50cywgc28gd2Ugc2hvdWxkIGxldCBiYWNrYm9uZSBwb3VjaCBoYW5kbGVcbiAgLy8gdGhvc2UgYW5kIHdlIHNob3VsZCBub3QgdmFsaWRhdGUgdGhlIF9hdHRhY2htZW50cyBrZXlcbiAgc2FmZWd1YXJkOiBbXG4gICAgJ19hdHRhY2htZW50cydcbiAgXSxcblxuICBkZWZhdWx0czogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZsYWdnZWRfYnk6IFtdLFxuICAgICAgdXBkYXRlZF9ieTogJ3Vua25vd24nXG4gICAgfTtcbiAgfSxcblxuICBzY2hlbWE6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgbmFtZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIG1pbkl0ZW1zOiAyLFxuICAgICAgICBtYXhJdGVtczogMixcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdHlwZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGNyZWF0ZWRfYXQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkX2F0OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICB9LFxuICAgICAgdXBkYXRlZF9ieToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIH0sXG4gICAgICBmbGFnZ2VkX2J5OntcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9XG4gICAgfSxcbiAgICByZXF1aXJlZDogW1xuICAgICAgJ25hbWUnLFxuICAgICAgJ2xvY2F0aW9uJyxcbiAgICAgICd0eXBlJyxcbiAgICAgICdjcmVhdGVkX2F0JyxcbiAgICAgICd1cGRhdGVkX2F0JyxcbiAgICAgICd1cGRhdGVkX2J5JyxcdC8qIEFkZGVkOiBUbyBhdHRhY2ggcG9pbnRzIHRvIHVzZXJzIHZpYSB0aGVpciBfaWQgKi9cbiAgICAgICdmbGFnZ2VkX2J5J1xuICAgIF1cbiAgfSxcblxuICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgQ291Y2hNb2RlbC5wcm90b3R5cGUuY2xlYXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIHRoaXMuY292ZXJVcmwgPSBmYWxzZTtcbiAgfSxcblxuICAvLyAjIyBGZXRjaFxuICAvLyBXaGVuIGZldGNoaW5nIGEgcG9pbnQsIHNob3VsZCBpdCBoYXZlIGEgY292ZXIgYXR0YWNobWVudCwgZXh0ZW5kIHRoZVxuICAvLyBwcm9taXNlIHRvIGZldGNoIHRoZSBhdHRhY2htZW50IGFuZCBzZXQgYHRoaXMuY292ZXJVcmxgLlxuICBmZXRjaDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIENvdWNoTW9kZWwucHJvdG90eXBlLmZldGNoLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKS50aGVuKCByZXMgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Q292ZXIoIHJlcyApO1xuICAgIH0gKTtcbiAgfSxcblxuICAvLyAjIEdldCBDb3ZlclxuICAvLyBTaG91bGQgYSBwb2ludCAoYWxyZWFkeSBmZXRjaGVkKSBoYXZlIGEgY292ZXIgYXR0YWNobWVudCwgZ2V0IHRoZVxuICAvLyBhdHRhY2htZW50J3MgZGF0YSBhbmQgc3RvcmUgYW4gb2JqZWN0IHVybCBmb3IgaXQgaW4gYHRoaXMuY292ZXJVcmxgXG4gIC8vXG4gIC8vIEFzIGEgdXRpbGl0eSB0byBjbGllbnQgZnVuY3Rpb25zLCByZXNvbHZlIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIHRoZVxuICAvLyBzaW5nbGUgYXJndW1lbnQgcGFzc2VkIHRvIGBnZXRDb3ZlcmAuXG4gIGdldENvdmVyOiBmdW5jdGlvbiggcmV0ICkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCAoICkgPT4ge1xuICAgICAgY29uc3QgaGFzQ292ZXIgPSBpbmNsdWRlcyggdGhpcy5hdHRhY2htZW50cygpLCAnY292ZXIucG5nJyApO1xuICAgICAgaWYgKCBicm93c2VyICYmIGhhc0NvdmVyICkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2htZW50KCAnY292ZXIucG5nJyApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gKS50aGVuKCBibG9iID0+IHtcbiAgICAgIGlmICggYmxvYiApIHtcbiAgICAgICAgdGhpcy5jb3ZlckJsb2IgPSBibG9iO1xuICAgICAgICB0aGlzLmNvdmVyVXJsID0gY3JlYXRlT2JqZWN0VVJMKCBibG9iICk7XG4gICAgICB9XG4gICAgfSApLnRoZW4oICggKSA9PiB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gKTtcbiAgfSxcblxuICAvLyAjIyBTZXQgQ292ZXJcbiAgLy8gSWYgdGhlIHVzZXIgYWxyZWFkeSBoYXMgYSBjb3ZlciBibG9iIGFuZCB0aGV5IHdhbnQgdG8gdXNlIGl0IHdpdGggdGhlXG4gIC8vIG1vZGVsIGJlZm9yZSBhdHRhY2goKSBjYW4gZmluaXNoIHN0b3JpbmcgaXQgdG8gUG91Y2hEQiwgdGhleSBjYW4gdXNlXG4gIC8vIHRoaXMgbWV0aG9kIHRvIG1hbnVhbGx5IGluc2VydCBpdC5cbiAgLy9cbiAgLy8gVGhlIGFzc29jaWF0ZWQgb2JqZWN0IHVybCBmb3IgdGhlIGJsb2Igd2lsbCB0aGVuIGJlIGF2YWlsYWJsZSB0byBvdGhlclxuICAvLyBmdW5jdGlvbnMgbGlrZSBzdG9yZSgpLlxuICBzZXRDb3ZlcjogZnVuY3Rpb24oIGJsb2IgKSB7XG4gICAgdGhpcy5jb3ZlckJsb2IgPSBibG9iO1xuICAgIGlmICggYnJvd3NlciApIHtcbiAgICAgIHRoaXMuY292ZXJVcmwgPSBjcmVhdGVPYmplY3RVUkwoIGJsb2IgKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gIyMgR2V0IFJlZHV4IFJlcHJlc2VudGF0aW9uXG4gIC8vIFJldHVybiBhIG5lc3RlZCBvYmplY3QvYXJhcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1vZGVsIHN1aXRhYmxlIGZvclxuICAvLyB1c2Ugd2l0aCByZWR1eC5cbiAgc3RvcmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IC4uLnRoaXMudG9KU09OKCksIGNvdmVyVXJsOiB0aGlzLmNvdmVyVXJsIH07XG4gIH1cbn0sIHtcbiAgdXJpOiBwb2ludElkLFxuXG4gIGZvcjogaWQgPT4ge1xuICAgIGNvbnN0IHBvaW50SWRDb21wb25lbnRzID0gcG9pbnRJZCggaWQgKTtcbiAgICBjb25zdCB0eXBlID0gcG9pbnRJZENvbXBvbmVudHMudHlwZTtcbiAgICBpZiAoIHR5cGUgPT09ICdzZXJ2aWNlJyApIHtcbiAgICAgIHJldHVybiBuZXcgU2VydmljZSggeyBfaWQ6IGlkIH0gKTtcbiAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAnYWxlcnQnICkge1xuICAgICAgcmV0dXJuIG5ldyBBbGVydCggeyBfaWQ6IGlkIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ0EgcG9pbnQgbXVzdCBiZSBhIHNlcnZpY2Ugb3IgYWxlcnQnO1xuICAgIH1cbiAgfVxufSApO1xuXG4vLyAjIFNlcnZpY2UgTW9kZWxcbi8vIEEgc2VydmljZSBpcyBhIGJ1aXNuZXNzIG9yIHBvaW50IG9mIGludGVyZXN0IHRvIGEgY3ljbGlzdC4gQSBjeWNsaXN0IG5lZWRzXG4vLyB0byBrbm93IHdoZXJlIHRoZXkgd2FudCB0byBzdG9wIHdlbGwgaW4gYWR2YW5jZSBvZiB0aGVpciB0cmF2ZWwgdGhyb3VnaCBhblxuLy8gYXJlYS4gVGhlIHNlcnZpY2UgcmVjb3JkIG11c3QgY29udGFpbiBlbm91Z2ggaW5mb3JtYXRpb24gdG8gaGVscCB0aGUgY3ljbGlzdFxuLy8gbWFrZSBzdWNoIGRlY2lzaW9ucy5cbi8vXG4vLyBUaGUgcmVjb3JkIGluY2x1ZGVzIGNvbnRhY3QgaW5mb3JtYXRpb24sIGFuZCBhIHNjaGVkdWxlIG9mIGhvdXJzIG9mXG4vLyBvcGVyYXRpb24uIEl0IGlzIGltcG9ydGFudCB0aGF0IHdlIHN0b3JlIHRoZSB0aW1lIHpvbmUgb2YgYSBzZXJ2aWNlLCBzaW5jZVxuLy8gdG91cmluZyBjeWNsaXN0cyB3aWxsIGNyb3NzIHRpbWUgem9uZXMgb24gdGhlaXIgdHJhdmVscy4gRnVydGhlcm1vcmUsXG4vLyBzZXJ2aWNlcyBvZiBpbnRlcmVzdCB0byB0b3VyaW5nIGN5Y2xpc3RzIG1heSBiZSBzZWFzb25hbDogd2Ugc3RvcmVcbi8vIHNjaGVkdWxlcyBmb3IgZGlmZmVyZW50IHNlYXNvbnMuXG5cbi8vICMjIFNlcnZpY2UgVHlwZXNcbi8vIEEgU2VydmljZSBtYXkgaGF2ZSBhIHNpbmdsZSB0eXBlLCBpbmRpY2F0aW5nIHRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhlXG4vLyBidWlzbmVzcyBvciBwb2ludCBvZiBpbnRlcmVzdC4gU2VydmljZSB0eXBlcyBtYXkgYWxzbyBiZSBpbmNsdWRlZCBpbiBhXG4vLyBTZXJ2aWNlJ3MgYW1lbml0aWVzIGFycmF5LlxuXG4vKmVzZm10LWlnbm9yZS1zdGFydCovXG5leHBvcnQgY29uc3Qgc2VydmljZVR5cGVzID0ge1xuICAnYWlycG9ydCc6IHsgZGlzcGxheTogJ0FpcnBvcnQnIH0sXG4gICdiYXInOiB7IGRpc3BsYXk6ICdCYXInIH0sXG4gICdiZWRfYW5kX2JyZWFrZmFzdCc6IHsgZGlzcGxheTogJ0JlZCAmIEJyZWFrZmFzdCcgfSxcbiAgJ2Jpa2Vfc2hvcCc6IHsgZGlzcGxheTogJ0Jpa2UgU2hvcCcgfSxcbiAgJ2NhYmluJzogeyBkaXNwbGF5OiAnQ2FiaW4nIH0sXG4gICdjYW1wZ3JvdW5kJzogeyBkaXNwbGF5OiAnQ2FtcGdyb3VuZCcgfSxcbiAgJ2NvbnZlbmllbmNlX3N0b3JlJzogeyBkaXNwbGF5OiAnQ29udmVuaWVuY2UgU3RvcmUnIH0sXG4gICdjeWNsaXN0c19jYW1waW5nJzogeyBkaXNwbGF5OiAnQ3ljbGlzdHNcXCcgQ2FtcGluZycgfSxcbiAgJ2N5Y2xpc3RzX2xvZGdpbmcnOiB7IGRpc3BsYXk6ICdDeWNsaXN0c1xcJyBMb2RnaW5nJyB9LFxuICAnZ3JvY2VyeSc6IHsgZGlzcGxheTogJ0dyb2NlcnknIH0sXG4gICdob3N0ZWwnOiB7IGRpc3BsYXk6ICdIb3N0ZWwnIH0sXG4gICdob3Rfc3ByaW5nJzogeyBkaXNwbGF5OiAnSG90IFNwcmluZycgfSxcbiAgJ2hvdGVsJzogeyBkaXNwbGF5OiAnSG90ZWwnIH0sXG4gICdtb3RlbCc6IHsgZGlzcGxheTogJ01vdGVsJyB9LFxuICAnaW5mb3JtYXRpb24nOiB7IGRpc3BsYXk6ICdJbmZvcm1hdGlvbicgfSxcbiAgJ2xpYnJhcnknOiB7IGRpc3BsYXk6ICdMaWJyYXJ5JyB9LFxuICAnbXVzZXVtJzogeyBkaXNwbGF5OiAnTXVzZXVtJyB9LFxuICAnb3V0ZG9vcl9zdG9yZSc6IHsgZGlzcGxheTogJ091dGRvb3IgU3RvcmUnIH0sXG4gICdyZXN0X2FyZWEnOiB7IGRpc3BsYXk6ICdSZXN0IEFyZWEnIH0sXG4gICdyZXN0YXVyYW50JzogeyBkaXNwbGF5OiAnUmVzdGF1cmFudCcgfSxcbiAgJ3Jlc3Ryb29tJzogeyBkaXNwbGF5OiAnUmVzdHJvb20nIH0sXG4gICdzY2VuaWNfYXJlYSc6IHsgZGlzcGxheTogJ1NjZW5pYyBBcmVhJyB9LFxuICAnc3RhdGVfcGFyayc6IHsgZGlzcGxheTogJ1N0YXRlIFBhcmsnIH0sXG4gICdvdGhlcic6IHsgZGlzcGxheTogJ090aGVyJyB9XG59O1xuLyplc2ZtdC1pZ25vcmUtZW5kKi9cblxuZXhwb3J0IGNvbnN0IFNlcnZpY2UgPSBQb2ludC5leHRlbmQoIHtcbiAgc3BlY2lmeTogZnVuY3Rpb24oIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIFBvaW50LnByb3RvdHlwZS5zcGVjaWZ5LmNhbGwoIHRoaXMsICdzZXJ2aWNlJywgbmFtZSwgbG9jYXRpb24gKTtcbiAgfSxcblxuICBkZWZhdWx0czogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLlBvaW50LnByb3RvdHlwZS5kZWZhdWx0cy5hcHBseSggdGhpcywgYXJndW1lbnRzICksXG4gICAgICBhbWVuaXRpZXM6IFtdLFxuICAgICAgc2NoZWR1bGU6IHsgJ2RlZmF1bHQnOiBbXSB9LFxuICAgICAgc2Vhc29uYWw6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBzY2hlbWE6IG1lcmdlU2NoZW1hcyggUG9pbnQucHJvdG90eXBlLnNjaGVtYSwge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgZW51bToga2V5cyggc2VydmljZVR5cGVzIClcbiAgICAgIH0sXG4gICAgICBhbWVuaXRpZXM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBlbnVtOiBrZXlzKCBzZXJ2aWNlVHlwZXMgKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYWRkcmVzczoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIHNjaGVkdWxlOiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICB9LFxuICAgICAgc2Vhc29uYWw6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICB9LFxuICAgICAgcGhvbmU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICB3ZWJzaXRlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICd1cmknXG4gICAgICB9LFxuICAgICAgdXBkYXRlZDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicgLy8gdGhlIHVwZGF0ZWQgYXR0cmlidXRlIGlzIG5vdCByZXF1aXJlZFxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICdzZWFzb25hbCdcbiAgICBdXG4gIH0gKVxufSApO1xuXG4vLyBBcHBseSB0aGUgdmFsaWRhdGlvbiBtaXhpbiB0byB0aGUgU2VydmljZSBtb2RlbC4gU2VlIHZhbGlkYXRpb24tbWl4aW4uanMuXG5taXhpblZhbGlkYXRpb24oIFNlcnZpY2UgKTtcblxuLy8gIyBBbGVydCBNb2RlbFxuLy8gQW4gYWxlcnQgaXMgc29tZXRoaW5nIHRoYXQgbWlnaHQgaW1wZWRlIGEgY3ljbGlzdCdzIHRvdXIuIFdoZW4gYSBjeWNsaXN0XG4vLyBzZWVzIGFuIGFsZXJ0IG9uIHRoZSBtYXAsIHRoZSBrbm93IHRvIHBsYW4gYXJvdW5kIGl0LlxuXG4vKmVzZm10LWlnbm9yZS1zdGFydCovXG5leHBvcnQgY29uc3QgYWxlcnRUeXBlcyA9IHtcbiAgJ3JvYWRfY2xvc3VyZSc6IHsgZGlzcGxheTogJ1JvYWQgQ2xvc3VyZScgfSxcbiAgJ2ZvcmVzdF9maXJlJzogeyBkaXNwbGF5OiAnRm9yZXN0IGZpcmUnIH0sXG4gICdmbG9vZGluZyc6IHsgZGlzcGxheTogJ0Zsb29kaW5nJyB9LFxuICAnZGV0b3VyJzogeyBkaXNwbGF5OiAnRGV0b3VyJyB9LFxuICAnb3RoZXInOiB7IGRpc3BsYXk6ICdPdGhlcicgfVxufTtcbi8qZXNmbXQtaWdub3JlLWVuZCovXG5cbmV4cG9ydCBjb25zdCBBbGVydCA9IFBvaW50LmV4dGVuZCgge1xuICBzcGVjaWZ5OiBmdW5jdGlvbiggbmFtZSwgbG9jYXRpb24gKSB7XG4gICAgUG9pbnQucHJvdG90eXBlLnNwZWNpZnkuY2FsbCggdGhpcywgJ2FsZXJ0JywgbmFtZSwgbG9jYXRpb24gKTtcbiAgfSxcblxuICBzY2hlbWE6IG1lcmdlU2NoZW1hcyggUG9pbnQucHJvdG90eXBlLnNjaGVtYSwge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgZW51bToga2V5cyggYWxlcnRUeXBlcyApXG4gICAgICB9XG4gICAgfVxuICB9IClcbn0gKTtcblxubWl4aW5WYWxpZGF0aW9uKCBBbGVydCApO1xuXG4vLyAjIFBvaW50IENvbGxlY3Rpb25cbi8vIEEgaGV0ZXJvZ2VuZW91cyBjb2xsZWN0aW9uIG9mIHNlcnZpY2VzIGFuZCBhbGVydHMuIFBvdWNoREIgaXMgYWJsZSB0byBmZXRjaFxuLy8gdGhpcyBjb2xsZWN0aW9uIGJ5IGxvb2tpbmcgZm9yIGFsbCBrZXlzIHN0YXJ0aW5nIHdpdGggJ3BvaW50LycuXG4vL1xuLy8gQSBjb25uZWN0ZWQgUG9pbnRDb2xsZWN0aW9uIG11c3QgYmUgYWJsZSB0byBnZW5lcmF0ZSBjb25uZWN0ZWQgQWxlcnRzIG9yXG4vLyBTZXJ2aWNlcyBvbiBkZW1hbmRzLiBUaGVyZWZvcmUsIGlmIFBvaW50Q29sbGVjdGlvbiBpcyBjb25uZWN0ZWQsIGNvbm5lY3Rcbi8vIG1vZGVscyBiZWZvcmUgcmV0dXJuaW5nIHRoZW0uXG5leHBvcnQgY29uc3QgUG9pbnRDb2xsZWN0aW9uID0gQ291Y2hDb2xsZWN0aW9uLmV4dGVuZCgge1xuICBpbml0aWFsaXplOiBmdW5jdGlvbiggbW9kZWxzLCBvcHRpb25zICkge1xuICAgIENvdWNoQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLnBvdWNoID0ge1xuICAgICAgb3B0aW9uczoge1xuICAgICAgICBhbGxEb2NzOiBhc3NpZ24oXG4gICAgICAgICAgeyBpbmNsdWRlX2RvY3M6IHRydWUgfSxcbiAgICAgICAgICBvcHRpb25zLmtleXMgPyB7IGtleXM6IG9wdGlvbnMua2V5cyB9IDoga2V5c0JldHdlZW4oICdwb2ludC8nIClcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB7Y29ubmVjdCwgZGF0YWJhc2V9ID0gdGhpcztcbiAgICB0aGlzLnNlcnZpY2UgPSBjb25uZWN0ID8gY29ubmVjdCggZGF0YWJhc2UsIFNlcnZpY2UgKSA6IFNlcnZpY2U7XG4gICAgdGhpcy5hbGVydCA9IGNvbm5lY3QgPyBjb25uZWN0KCBkYXRhYmFzZSwgQWxlcnQgKSA6IEFsZXJ0O1xuICB9LFxuXG4gIC8vIFRoaXMgaGFuZGxlcyB0aGUgYG9wdGlvbnMua2V5c2AgZWRnZSBjYXNlcyBsaXN0ZWQgaW4gdGhlXG4gIC8vIFtQb3VjaERCIGFwaV0oaHR0cHM6Ly9wb3VjaGRiLmNvbS9hcGkuaHRtbCNiYXRjaF9mZXRjaClcbiAgcGFyc2U6IGZ1bmN0aW9uKCByZXNwb25zZSwgb3B0aW9ucyApIHtcbiAgICByZXR1cm4gcmVzcG9uc2Uucm93cy5maWx0ZXIoXG4gICAgICByb3cgPT4gISggcm93LmRlbGV0ZWQgfHwgcm93LmVycm9yIClcbiAgICApLm1hcChcbiAgICAgIHJvdyA9PiByb3cuZG9jXG4gICAgKTtcbiAgfSxcblxuICBtb2RlbDogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG4gICAgY29uc3QgcG9pbnRJZENvbXBvbmVudHMgPSBwb2ludElkKCBhdHRyaWJ1dGVzLl9pZCApO1xuICAgIGNvbnN0IHR5cGUgPSBwb2ludElkQ29tcG9uZW50cy50eXBlO1xuICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICdzZXJ2aWNlJzogb3B0aW9ucy5jb2xsZWN0aW9uLnNlcnZpY2UsXG4gICAgICAnYWxlcnQnOiBvcHRpb25zLmNvbGxlY3Rpb24uYWxlcnRcbiAgICB9O1xuICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gbWFwWyB0eXBlIF07XG4gICAgaWYgKCBjb25zdHJ1Y3RvciApIHtcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IGNvbnN0cnVjdG9yKCBhdHRyaWJ1dGVzLCBvcHRpb25zICk7XG5cbiAgICAgIGlmICggb3B0aW9ucy5kZWluZGV4ICYmIGluc3RhbmNlLmhhcyggJ2luZGV4JyApICkge1xuICAgICAgICBpbnN0YW5jZS5pbmRleCA9IGluc3RhbmNlLmdldCggJ2luZGV4JyApO1xuICAgICAgICBpbnN0YW5jZS51bnNldCggJ2luZGV4ICcgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnQSBwb2ludCBtdXN0IGJlIGEgc2VydmljZSBvciBhbGVydCc7XG4gICAgfVxuICB9LFxuXG4gIC8vICMjIEZldGNoIENvdmVyIEltYWdlcyBmb3IgYWxsIFBvaW50c1xuICAvLyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYWxsIHBvaW50cyBpbiB0aGUgYXJyYXkgaGF2ZVxuICAvLyB0aGVpciBjb3ZlciBpbWFnZXMgYXZhaWxhYmxlLlxuICBnZXRDb3ZlcnM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbCggdGhpcy5tb2RlbHMubWFwKCBwb2ludCA9PiBwb2ludC5nZXRDb3ZlcigpICkgKTtcbiAgfSxcblxuICAvLyAjIyBHZXQgUmVkdXggUmVwcmVzZW50YXRpb25cbiAgLy8gUmV0dXJuIGEgbmVzdGVkIG9iamVjdC9hcmFyeSByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sbGVjdGlvbiBzdWl0YWJsZSBmb3JcbiAgLy8gdXNlIHdpdGggcmVkdXguXG4gIHN0b3JlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnJvbVBhaXJzKCB0aGlzLm1vZGVscy5tYXAoIHBvaW50ID0+IFsgcG9pbnQuaWQsIHBvaW50LnN0b3JlKCkgXSApICk7XG4gIH1cbn0gKTtcblxuLy8gIyBEaXNwbGF5IE5hbWUgZm9yIFR5cGVcbi8vIEdpdmVuIGEgdHlwZSBrZXkgZnJvbSBlaXRoZXIgdGhlIHNlcnZpY2Ugb3IgYWxlcnQgdHlwZSBlbnVtZXJhdGlvbnMsXG4vLyByZXR1cm4gdGhlIHR5cGUncyBkaXNwbGF5IHN0cmluZywgb3IgbnVsbCBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5KCB0eXBlICkge1xuICBjb25zdCB2YWx1ZXMgPSBzZXJ2aWNlVHlwZXNbIHR5cGUgXSB8fCBhbGVydFR5cGVzWyB0eXBlIF07XG4gIGlmICggdmFsdWVzICkge1xuICAgIHJldHVybiB2YWx1ZXMuZGlzcGxheTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19