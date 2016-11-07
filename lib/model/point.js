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
      flag: false,
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
      description: {
        type: 'string'
      },
      flag: {
        type: 'boolean'
      }
    },
    required: ['name', 'location', 'type', 'created_at', 'updated_at', 'updated_by', /* Added: To attach points to users via their _id */
    'flag']
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwiY292ZXJCbG9iIiwiY292ZXJVcmwiLCJ1cGRhdGUiLCJzcGVjaWZ5IiwidHlwZSIsIm5hbWUiLCJsb2NhdGlvbiIsIl9pZCIsImxhdCIsImxuZyIsImdlb2hhc2giLCJlbmNvZGUiLCJzYWZlZ3VhcmQiLCJkZWZhdWx0cyIsImZsYWciLCJ1cGRhdGVkX2J5Iiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwibWluSXRlbXMiLCJtYXhJdGVtcyIsIml0ZW1zIiwiZm9ybWF0IiwiZGVzY3JpcHRpb24iLCJyZXF1aXJlZCIsImNsZWFyIiwiZmV0Y2giLCJ0aGVuIiwiZ2V0Q292ZXIiLCJyZXMiLCJyZXQiLCJyZXNvbHZlIiwiaGFzQ292ZXIiLCJhdHRhY2htZW50cyIsImF0dGFjaG1lbnQiLCJibG9iIiwic2V0Q292ZXIiLCJzdG9yZSIsInRvSlNPTiIsInVyaSIsImZvciIsInBvaW50SWRDb21wb25lbnRzIiwiaWQiLCJTZXJ2aWNlIiwiQWxlcnQiLCJzZXJ2aWNlVHlwZXMiLCJjYWxsIiwiYW1lbml0aWVzIiwic2NoZWR1bGUiLCJzZWFzb25hbCIsImVudW0iLCJhZGRyZXNzIiwicGhvbmUiLCJ3ZWJzaXRlIiwidXBkYXRlZCIsImFsZXJ0VHlwZXMiLCJQb2ludENvbGxlY3Rpb24iLCJtb2RlbHMiLCJwb3VjaCIsImFsbERvY3MiLCJpbmNsdWRlX2RvY3MiLCJrZXlzIiwiY29ubmVjdCIsImRhdGFiYXNlIiwic2VydmljZSIsImFsZXJ0IiwicGFyc2UiLCJyZXNwb25zZSIsInJvd3MiLCJmaWx0ZXIiLCJyb3ciLCJkZWxldGVkIiwiZXJyb3IiLCJtYXAiLCJkb2MiLCJtb2RlbCIsImNvbGxlY3Rpb24iLCJjb25zdHJ1Y3RvciIsImluc3RhbmNlIiwiZGVpbmRleCIsImhhcyIsImluZGV4IiwiZ2V0IiwidW5zZXQiLCJnZXRDb3ZlcnMiLCJhbGwiLCJwb2ludCIsInZhbHVlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O3lwQkFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQTBiZ0JBLE8sR0FBQUEsTzs7QUF2YWhCOztBQUNBOztBQUVBOztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQyxVQUFZLE9BQU9DLE1BQVAsS0FBa0IsV0FBcEM7O0FBRUEsSUFBSUMsVUFBVUMsUUFBUSxrQkFBUixDQUFkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxJQUFNQyw0QkFBVSxpQkFBT0MsS0FBUCxDQUFjLDRCQUFkLENBQWhCOztBQUVBLElBQU1DLHdCQUFRLGlCQUFXQyxNQUFYLENBQW1CO0FBQ3RDQyxlQUFhLEtBRHlCOztBQUd0Q0MsY0FBWSxvQkFBVUMsVUFBVixFQUFzQkMsT0FBdEIsRUFBZ0M7QUFDMUMscUJBQVdDLFNBQVgsQ0FBcUJILFVBQXJCLENBQWdDSSxLQUFoQyxDQUF1QyxJQUF2QyxFQUE2Q0MsU0FBN0M7O0FBRUEsUUFBTUMsT0FBTyxJQUFJQyxJQUFKLEdBQVdDLFdBQVgsRUFBYjtBQUNBLFNBQUtDLEdBQUwsQ0FBVTtBQUNSQyxrQkFBWUosSUFESjtBQUVSSyxrQkFBWUw7QUFGSixLQUFWOztBQUtBLFNBQUtNLFNBQUwsR0FBaUIsS0FBakI7QUFDQSxTQUFLQyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0QsR0FkcUM7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LFNBQVMxQyxhQUFjekMsSUFBZCxLQUF3Qm1ELFdBQVluRCxJQUFaLENBQXZDO0FBQ0EsTUFBS21GLE1BQUwsRUFBYztBQUNaLFdBQU9BLE9BQU83RyxPQUFkO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBTyxJQUFQO0FBQ0Q7QUFDRiIsImZpbGUiOiJwb2ludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGJ0Yy1hcHAtc2VydmVyIC0tIFNlcnZlciBmb3IgdGhlIEJpY3ljbGUgVG91cmluZyBDb21wYW5pb25cbiAqIENvcHlyaWdodCDCqSAyMDE2IEFkdmVudHVyZSBDeWNsaW5nIEFzc29jaWF0aW9uXG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgYnRjLWFwcC1zZXJ2ZXIuXG4gKlxuICogYnRjLWFwcC1zZXJ2ZXIgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBGb29iYXIuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IHsgbWl4aW5WYWxpZGF0aW9uLCBtZXJnZVNjaGVtYXMgfSBmcm9tICcuL3ZhbGlkYXRpb24tbWl4aW4nO1xuaW1wb3J0IHsgQ291Y2hNb2RlbCwgQ291Y2hDb2xsZWN0aW9uLCBrZXlzQmV0d2VlbiB9IGZyb20gJy4vYmFzZSc7XG5cbmltcG9ydCB7IGtleXMsIGZyb21QYWlycywgaW5jbHVkZXMsIGFzc2lnbiB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBjcmVhdGVPYmplY3RVUkwgfSBmcm9tICdibG9iLXV0aWwnO1xuXG5pbXBvcnQgZG9jdXJpIGZyb20gJ2RvY3VyaSc7XG5pbXBvcnQgbmdlb2hhc2ggZnJvbSAnbmdlb2hhc2gnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICd0by1pZCc7XG5pbXBvcnQgdXVpZCBmcm9tICdub2RlLXV1aWQnO1xuXG5jb25zdCBicm93c2VyID0gKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyApO1xuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3BvbHlmaWxsLXByb21pc2UnKTtcblxuLy8gIyBQb2ludCBNb2RlbFxuLy8gVGhlIHBvaW50IHJlcHJlc2VudHMgYSBsb2NhdGlvbiBvbiB0aGUgbWFwIHdpdGggYXNzb2NpYXRlZCBtZXRhZGF0YSwgZ2VvZGF0YSxcbi8vIGFuZCB1c2VyIHByb3ZpZGVkIGRhdGEuIFRoZSBwb2ludCBpcyB0aGUgYmFzZSBzaGFyZWQgYnkgc2VydmljZXMgYW5kIGFsZXJ0cy5cbi8vXG4vLyBUaGUgSlNPTiBzY2hlbWEgc3RvcmVkIGluIGBQb2ludGAsIGFuZCBhcyBwYXRjaGVkIGJ5IGBTZXJ2aWNlYCBhbmQgYEFsZXJ0YCxcbi8vIGlzIHRoZSBhdXRob3JpdGF0aXZlIGRlZmluaXRpb24gb2YgdGhlIHBvaW50IHJlY29yZC5cblxuLy8gIyMgUG9pbnQgTW9kZWwgVXJpXG4vLyBQb2ludHMgYXJlIHN0b3JlZCBpbiBDb3VjaERCLiBDb3VjaERCIGRvY3VtZW50cyBjYW4gaGF2ZSByaWNoIGlkIHN0cmluZ3Ncbi8vIHRvIGhlbHAgc3RvcmUgYW5kIGFjY2VzcyBkYXRhIHdpdGhvdXQgTWFwUmVkdWNlIGpvYnMuXG4vL1xuLy8gVGhlIHBvaW50IG1vZGVsIHVyaSBpcyBjb21wb3NlZCBvZiBmb3VyIHBhcnRzOlxuLy8gIDEuIFRoZSBzdHJpbmcgJ3BvaW50LydgXG4vLyAgMi4gVGhlIHR5cGUgb2YgcG9pbnQsIGVpdGhlciAnc2VydmljZScgb3IgJ2FsZXJ0J1xuLy8gIDMuIFRoZSBub3JtYWxpemVkIChvcmlnaW5hbCkgbmFtZSBvZiB0aGUgcG9pbnRcbi8vICA0LiBUaGUgcG9pbnQncyBnZW9oYXNoXG5leHBvcnQgY29uc3QgcG9pbnRJZCA9IGRvY3VyaS5yb3V0ZSggJ3BvaW50Lzp0eXBlLzpuYW1lLzpnZW9oYXNoJyApO1xuXG5leHBvcnQgY29uc3QgUG9pbnQgPSBDb3VjaE1vZGVsLmV4dGVuZCgge1xuICBpZEF0dHJpYnV0ZTogJ19pZCcsXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG4gICAgQ291Y2hNb2RlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gIFxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgdGhpcy5zZXQoIHtcbiAgICAgIGNyZWF0ZWRfYXQ6IGRhdGUsXG4gICAgICB1cGRhdGVkX2F0OiBkYXRlLFxuICAgIH0gKTtcblxuICAgIHRoaXMuY292ZXJCbG9iID0gZmFsc2U7XG4gICAgdGhpcy5jb3ZlclVybCA9IGZhbHNlO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXQoICd1cGRhdGVkX2F0JywgbmV3IERhdGUoKS50b0lTT1N0cmluZygpICk7XG4gIH0sXG5cbiAgLy8gIyMgU3BlY2lmeVxuICAvLyBGaWxsIGluIGBfaWRgIGZyb20gdGhlIGNvbXBvbmVudHMgb2YgdGhlIHBvaW50IG1vZGVsIHVyaS5cbiAgLy8gUHVsbCB2YWx1ZXMgZnJvbSBgYXR0cmlidXRlc2AgaWYgbmFtZSBhbmQgbG9jYXRpb24gYXJlIHVuZGVmaW5lZC5cbiAgc3BlY2lmeTogZnVuY3Rpb24oIHR5cGUsIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIC8vIE9ubHkgc2V0IHRoZSBJRCBhdHRyaWJ1dGUgaGVyZSBpZiBpdCB3YXNuJ3QgYWxyZWFkeSBzZXQuXG4gICAgLy8gVGhlIG9yaWdpbmFsIElEIHN0YXlzIHRoZSBJRCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBwb2ludC5cbiAgICBpZiAodHlwZW9mIHRoaXMuYXR0cmlidXRlcy5faWQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICggbmFtZSApIHtcbiAgICAgICAgY29uc3QgW2xhdCwgbG5nXSA9IGxvY2F0aW9uO1xuICAgICAgICBjb25zdCBfaWQgPSBwb2ludElkKCB7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBuYW1lOiBub3JtYWxpemUoIG5hbWUgKSxcbiAgICAgICAgICBnZW9oYXNoOiBuZ2VvaGFzaC5lbmNvZGUoIGxhdCwgbG5nIClcbiAgICAgICAgfSApO1xuICAgICAgICB0aGlzLnNldCggeyBfaWQsIHR5cGUsIG5hbWUsIGxvY2F0aW9uIH0gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHtuYW1lLCBsb2NhdGlvbn0gPSB0aGlzLmF0dHJpYnV0ZXM7XG4gICAgICAgIGNvbnN0IFtsYXQsIGxuZ10gPSBsb2NhdGlvbjtcbiAgICAgICAgY29uc3QgX2lkID0gcG9pbnRJZCgge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgbmFtZTogbm9ybWFsaXplKCBuYW1lICksXG4gICAgICAgICAgZ2VvaGFzaDogbmdlb2hhc2guZW5jb2RlKCBsYXQsIGxuZyApXG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5zZXQoIHsgX2lkIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gIyMgU2FmZWd1YXJkIGZvciBQb2ludHNcbiAgLy8gUG9pbnRzIGhhdmUgaW1hZ2UgYXR0YWNobWVudHMsIHNvIHdlIHNob3VsZCBsZXQgYmFja2JvbmUgcG91Y2ggaGFuZGxlXG4gIC8vIHRob3NlIGFuZCB3ZSBzaG91bGQgbm90IHZhbGlkYXRlIHRoZSBfYXR0YWNobWVudHMga2V5XG4gIHNhZmVndWFyZDogW1xuICAgICdfYXR0YWNobWVudHMnXG4gIF0sXG5cbiAgZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmbGFnOiBmYWxzZSxcbiAgICAgIHVwZGF0ZWRfYnk6ICd1bmtub3duJ1xuICAgIH07XG4gIH0sXG5cbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBsb2NhdGlvbjoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBtaW5JdGVtczogMixcbiAgICAgICAgbWF4SXRlbXM6IDIsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBjcmVhdGVkX2F0OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICB9LFxuICAgICAgdXBkYXRlZF9hdDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWRfYnk6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9LFxuICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBmbGFnOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICduYW1lJyxcbiAgICAgICdsb2NhdGlvbicsXG4gICAgICAndHlwZScsXG4gICAgICAnY3JlYXRlZF9hdCcsXG4gICAgICAndXBkYXRlZF9hdCcsXG4gICAgICAndXBkYXRlZF9ieScsXHQvKiBBZGRlZDogVG8gYXR0YWNoIHBvaW50cyB0byB1c2VycyB2aWEgdGhlaXIgX2lkICovXG4gICAgICAnZmxhZydcbiAgICBdXG4gIH0sXG5cbiAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgIENvdWNoTW9kZWwucHJvdG90eXBlLmNsZWFyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICB0aGlzLmNvdmVyVXJsID0gZmFsc2U7XG4gIH0sXG5cbiAgLy8gIyMgRmV0Y2hcbiAgLy8gV2hlbiBmZXRjaGluZyBhIHBvaW50LCBzaG91bGQgaXQgaGF2ZSBhIGNvdmVyIGF0dGFjaG1lbnQsIGV4dGVuZCB0aGVcbiAgLy8gcHJvbWlzZSB0byBmZXRjaCB0aGUgYXR0YWNobWVudCBhbmQgc2V0IGB0aGlzLmNvdmVyVXJsYC5cbiAgZmV0Y2g6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBDb3VjaE1vZGVsLnByb3RvdHlwZS5mZXRjaC5hcHBseSggdGhpcywgYXJndW1lbnRzICkudGhlbiggcmVzID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdldENvdmVyKCByZXMgKTtcbiAgICB9ICk7XG4gIH0sXG5cbiAgLy8gIyBHZXQgQ292ZXJcbiAgLy8gU2hvdWxkIGEgcG9pbnQgKGFscmVhZHkgZmV0Y2hlZCkgaGF2ZSBhIGNvdmVyIGF0dGFjaG1lbnQsIGdldCB0aGVcbiAgLy8gYXR0YWNobWVudCdzIGRhdGEgYW5kIHN0b3JlIGFuIG9iamVjdCB1cmwgZm9yIGl0IGluIGB0aGlzLmNvdmVyVXJsYFxuICAvL1xuICAvLyBBcyBhIHV0aWxpdHkgdG8gY2xpZW50IGZ1bmN0aW9ucywgcmVzb2x2ZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byB0aGVcbiAgLy8gc2luZ2xlIGFyZ3VtZW50IHBhc3NlZCB0byBgZ2V0Q292ZXJgLlxuICBnZXRDb3ZlcjogZnVuY3Rpb24oIHJldCApIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbiggKCApID0+IHtcbiAgICAgIGNvbnN0IGhhc0NvdmVyID0gaW5jbHVkZXMoIHRoaXMuYXR0YWNobWVudHMoKSwgJ2NvdmVyLnBuZycgKTtcbiAgICAgIGlmICggYnJvd3NlciAmJiBoYXNDb3ZlciApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNobWVudCggJ2NvdmVyLnBuZycgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9ICkudGhlbiggYmxvYiA9PiB7XG4gICAgICBpZiAoIGJsb2IgKSB7XG4gICAgICAgIHRoaXMuY292ZXJCbG9iID0gYmxvYjtcbiAgICAgICAgdGhpcy5jb3ZlclVybCA9IGNyZWF0ZU9iamVjdFVSTCggYmxvYiApO1xuICAgICAgfVxuICAgIH0gKS50aGVuKCAoICkgPT4ge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9ICk7XG4gIH0sXG5cbiAgLy8gIyMgU2V0IENvdmVyXG4gIC8vIElmIHRoZSB1c2VyIGFscmVhZHkgaGFzIGEgY292ZXIgYmxvYiBhbmQgdGhleSB3YW50IHRvIHVzZSBpdCB3aXRoIHRoZVxuICAvLyBtb2RlbCBiZWZvcmUgYXR0YWNoKCkgY2FuIGZpbmlzaCBzdG9yaW5nIGl0IHRvIFBvdWNoREIsIHRoZXkgY2FuIHVzZVxuICAvLyB0aGlzIG1ldGhvZCB0byBtYW51YWxseSBpbnNlcnQgaXQuXG4gIC8vXG4gIC8vIFRoZSBhc3NvY2lhdGVkIG9iamVjdCB1cmwgZm9yIHRoZSBibG9iIHdpbGwgdGhlbiBiZSBhdmFpbGFibGUgdG8gb3RoZXJcbiAgLy8gZnVuY3Rpb25zIGxpa2Ugc3RvcmUoKS5cbiAgc2V0Q292ZXI6IGZ1bmN0aW9uKCBibG9iICkge1xuICAgIHRoaXMuY292ZXJCbG9iID0gYmxvYjtcbiAgICBpZiAoIGJyb3dzZXIgKSB7XG4gICAgICB0aGlzLmNvdmVyVXJsID0gY3JlYXRlT2JqZWN0VVJMKCBibG9iICk7XG4gICAgfVxuICB9LFxuXG4gIC8vICMjIEdldCBSZWR1eCBSZXByZXNlbnRhdGlvblxuICAvLyBSZXR1cm4gYSBuZXN0ZWQgb2JqZWN0L2FyYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBzdWl0YWJsZSBmb3JcbiAgLy8gdXNlIHdpdGggcmVkdXguXG4gIHN0b3JlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geyAuLi50aGlzLnRvSlNPTigpLCBjb3ZlclVybDogdGhpcy5jb3ZlclVybCB9O1xuICB9XG59LCB7XG4gIHVyaTogcG9pbnRJZCxcblxuICBmb3I6IGlkID0+IHtcbiAgICBjb25zdCBwb2ludElkQ29tcG9uZW50cyA9IHBvaW50SWQoIGlkICk7XG4gICAgY29uc3QgdHlwZSA9IHBvaW50SWRDb21wb25lbnRzLnR5cGU7XG4gICAgaWYgKCB0eXBlID09PSAnc2VydmljZScgKSB7XG4gICAgICByZXR1cm4gbmV3IFNlcnZpY2UoIHsgX2lkOiBpZCB9ICk7XG4gICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ2FsZXJ0JyApIHtcbiAgICAgIHJldHVybiBuZXcgQWxlcnQoIHsgX2lkOiBpZCB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdBIHBvaW50IG11c3QgYmUgYSBzZXJ2aWNlIG9yIGFsZXJ0JztcbiAgICB9XG4gIH1cbn0gKTtcblxuLy8gIyBTZXJ2aWNlIE1vZGVsXG4vLyBBIHNlcnZpY2UgaXMgYSBidWlzbmVzcyBvciBwb2ludCBvZiBpbnRlcmVzdCB0byBhIGN5Y2xpc3QuIEEgY3ljbGlzdCBuZWVkc1xuLy8gdG8ga25vdyB3aGVyZSB0aGV5IHdhbnQgdG8gc3RvcCB3ZWxsIGluIGFkdmFuY2Ugb2YgdGhlaXIgdHJhdmVsIHRocm91Z2ggYW5cbi8vIGFyZWEuIFRoZSBzZXJ2aWNlIHJlY29yZCBtdXN0IGNvbnRhaW4gZW5vdWdoIGluZm9ybWF0aW9uIHRvIGhlbHAgdGhlIGN5Y2xpc3Rcbi8vIG1ha2Ugc3VjaCBkZWNpc2lvbnMuXG4vL1xuLy8gVGhlIHJlY29yZCBpbmNsdWRlcyBjb250YWN0IGluZm9ybWF0aW9uLCBhbmQgYSBzY2hlZHVsZSBvZiBob3VycyBvZlxuLy8gb3BlcmF0aW9uLiBJdCBpcyBpbXBvcnRhbnQgdGhhdCB3ZSBzdG9yZSB0aGUgdGltZSB6b25lIG9mIGEgc2VydmljZSwgc2luY2Vcbi8vIHRvdXJpbmcgY3ljbGlzdHMgd2lsbCBjcm9zcyB0aW1lIHpvbmVzIG9uIHRoZWlyIHRyYXZlbHMuIEZ1cnRoZXJtb3JlLFxuLy8gc2VydmljZXMgb2YgaW50ZXJlc3QgdG8gdG91cmluZyBjeWNsaXN0cyBtYXkgYmUgc2Vhc29uYWw6IHdlIHN0b3JlXG4vLyBzY2hlZHVsZXMgZm9yIGRpZmZlcmVudCBzZWFzb25zLlxuXG4vLyAjIyBTZXJ2aWNlIFR5cGVzXG4vLyBBIFNlcnZpY2UgbWF5IGhhdmUgYSBzaW5nbGUgdHlwZSwgaW5kaWNhdGluZyB0aGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoZVxuLy8gYnVpc25lc3Mgb3IgcG9pbnQgb2YgaW50ZXJlc3QuIFNlcnZpY2UgdHlwZXMgbWF5IGFsc28gYmUgaW5jbHVkZWQgaW4gYVxuLy8gU2VydmljZSdzIGFtZW5pdGllcyBhcnJheS5cblxuLyplc2ZtdC1pZ25vcmUtc3RhcnQqL1xuZXhwb3J0IGNvbnN0IHNlcnZpY2VUeXBlcyA9IHtcbiAgJ2FpcnBvcnQnOiB7IGRpc3BsYXk6ICdBaXJwb3J0JyB9LFxuICAnYmFyJzogeyBkaXNwbGF5OiAnQmFyJyB9LFxuICAnYmVkX2FuZF9icmVha2Zhc3QnOiB7IGRpc3BsYXk6ICdCZWQgJiBCcmVha2Zhc3QnIH0sXG4gICdiaWtlX3Nob3AnOiB7IGRpc3BsYXk6ICdCaWtlIFNob3AnIH0sXG4gICdjYWJpbic6IHsgZGlzcGxheTogJ0NhYmluJyB9LFxuICAnY2FtcGdyb3VuZCc6IHsgZGlzcGxheTogJ0NhbXBncm91bmQnIH0sXG4gICdjb252ZW5pZW5jZV9zdG9yZSc6IHsgZGlzcGxheTogJ0NvbnZlbmllbmNlIFN0b3JlJyB9LFxuICAnY3ljbGlzdHNfY2FtcGluZyc6IHsgZGlzcGxheTogJ0N5Y2xpc3RzXFwnIENhbXBpbmcnIH0sXG4gICdjeWNsaXN0c19sb2RnaW5nJzogeyBkaXNwbGF5OiAnQ3ljbGlzdHNcXCcgTG9kZ2luZycgfSxcbiAgJ2dyb2NlcnknOiB7IGRpc3BsYXk6ICdHcm9jZXJ5JyB9LFxuICAnaG9zdGVsJzogeyBkaXNwbGF5OiAnSG9zdGVsJyB9LFxuICAnaG90X3NwcmluZyc6IHsgZGlzcGxheTogJ0hvdCBTcHJpbmcnIH0sXG4gICdob3RlbCc6IHsgZGlzcGxheTogJ0hvdGVsJyB9LFxuICAnbW90ZWwnOiB7IGRpc3BsYXk6ICdNb3RlbCcgfSxcbiAgJ2luZm9ybWF0aW9uJzogeyBkaXNwbGF5OiAnSW5mb3JtYXRpb24nIH0sXG4gICdsaWJyYXJ5JzogeyBkaXNwbGF5OiAnTGlicmFyeScgfSxcbiAgJ211c2V1bSc6IHsgZGlzcGxheTogJ011c2V1bScgfSxcbiAgJ291dGRvb3Jfc3RvcmUnOiB7IGRpc3BsYXk6ICdPdXRkb29yIFN0b3JlJyB9LFxuICAncmVzdF9hcmVhJzogeyBkaXNwbGF5OiAnUmVzdCBBcmVhJyB9LFxuICAncmVzdGF1cmFudCc6IHsgZGlzcGxheTogJ1Jlc3RhdXJhbnQnIH0sXG4gICdyZXN0cm9vbSc6IHsgZGlzcGxheTogJ1Jlc3Ryb29tJyB9LFxuICAnc2NlbmljX2FyZWEnOiB7IGRpc3BsYXk6ICdTY2VuaWMgQXJlYScgfSxcbiAgJ3N0YXRlX3BhcmsnOiB7IGRpc3BsYXk6ICdTdGF0ZSBQYXJrJyB9LFxuICAnb3RoZXInOiB7IGRpc3BsYXk6ICdPdGhlcicgfVxufTtcbi8qZXNmbXQtaWdub3JlLWVuZCovXG5cbmV4cG9ydCBjb25zdCBTZXJ2aWNlID0gUG9pbnQuZXh0ZW5kKCB7XG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICBQb2ludC5wcm90b3R5cGUuc3BlY2lmeS5jYWxsKCB0aGlzLCAnc2VydmljZScsIG5hbWUsIGxvY2F0aW9uICk7XG4gIH0sXG5cbiAgZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5Qb2ludC5wcm90b3R5cGUuZGVmYXVsdHMuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApLFxuICAgICAgYW1lbml0aWVzOiBbXSxcbiAgICAgIHNjaGVkdWxlOiB7ICdkZWZhdWx0JzogW10gfSxcbiAgICAgIHNlYXNvbmFsOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgc2NoZW1hOiBtZXJnZVNjaGVtYXMoIFBvaW50LnByb3RvdHlwZS5zY2hlbWEsIHtcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB0eXBlOiB7XG4gICAgICAgIGVudW06IGtleXMoIHNlcnZpY2VUeXBlcyApXG4gICAgICB9LFxuICAgICAgYW1lbml0aWVzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZW51bToga2V5cyggc2VydmljZVR5cGVzIClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFkZHJlc3M6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBzY2hlZHVsZToge1xuICAgICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgfSxcbiAgICAgIHNlYXNvbmFsOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgfSxcbiAgICAgIHBob25lOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgd2Vic2l0ZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAndXJpJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWQ6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nIC8vIHRoZSB1cGRhdGVkIGF0dHJpYnV0ZSBpcyBub3QgcmVxdWlyZWRcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAnc2Vhc29uYWwnXG4gICAgXVxuICB9IClcbn0gKTtcblxuLy8gQXBwbHkgdGhlIHZhbGlkYXRpb24gbWl4aW4gdG8gdGhlIFNlcnZpY2UgbW9kZWwuIFNlZSB2YWxpZGF0aW9uLW1peGluLmpzLlxubWl4aW5WYWxpZGF0aW9uKCBTZXJ2aWNlICk7XG5cbi8vICMgQWxlcnQgTW9kZWxcbi8vIEFuIGFsZXJ0IGlzIHNvbWV0aGluZyB0aGF0IG1pZ2h0IGltcGVkZSBhIGN5Y2xpc3QncyB0b3VyLiBXaGVuIGEgY3ljbGlzdFxuLy8gc2VlcyBhbiBhbGVydCBvbiB0aGUgbWFwLCB0aGUga25vdyB0byBwbGFuIGFyb3VuZCBpdC5cblxuLyplc2ZtdC1pZ25vcmUtc3RhcnQqL1xuZXhwb3J0IGNvbnN0IGFsZXJ0VHlwZXMgPSB7XG4gICdyb2FkX2Nsb3N1cmUnOiB7IGRpc3BsYXk6ICdSb2FkIENsb3N1cmUnIH0sXG4gICdmb3Jlc3RfZmlyZSc6IHsgZGlzcGxheTogJ0ZvcmVzdCBmaXJlJyB9LFxuICAnZmxvb2RpbmcnOiB7IGRpc3BsYXk6ICdGbG9vZGluZycgfSxcbiAgJ2RldG91cic6IHsgZGlzcGxheTogJ0RldG91cicgfSxcbiAgJ290aGVyJzogeyBkaXNwbGF5OiAnT3RoZXInIH1cbn07XG4vKmVzZm10LWlnbm9yZS1lbmQqL1xuXG5leHBvcnQgY29uc3QgQWxlcnQgPSBQb2ludC5leHRlbmQoIHtcbiAgc3BlY2lmeTogZnVuY3Rpb24oIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIFBvaW50LnByb3RvdHlwZS5zcGVjaWZ5LmNhbGwoIHRoaXMsICdhbGVydCcsIG5hbWUsIGxvY2F0aW9uICk7XG4gIH0sXG5cbiAgc2NoZW1hOiBtZXJnZVNjaGVtYXMoIFBvaW50LnByb3RvdHlwZS5zY2hlbWEsIHtcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB0eXBlOiB7XG4gICAgICAgIGVudW06IGtleXMoIGFsZXJ0VHlwZXMgKVxuICAgICAgfVxuICAgIH1cbiAgfSApXG59ICk7XG5cbm1peGluVmFsaWRhdGlvbiggQWxlcnQgKTtcblxuLy8gIyBQb2ludCBDb2xsZWN0aW9uXG4vLyBBIGhldGVyb2dlbmVvdXMgY29sbGVjdGlvbiBvZiBzZXJ2aWNlcyBhbmQgYWxlcnRzLiBQb3VjaERCIGlzIGFibGUgdG8gZmV0Y2hcbi8vIHRoaXMgY29sbGVjdGlvbiBieSBsb29raW5nIGZvciBhbGwga2V5cyBzdGFydGluZyB3aXRoICdwb2ludC8nLlxuLy9cbi8vIEEgY29ubmVjdGVkIFBvaW50Q29sbGVjdGlvbiBtdXN0IGJlIGFibGUgdG8gZ2VuZXJhdGUgY29ubmVjdGVkIEFsZXJ0cyBvclxuLy8gU2VydmljZXMgb24gZGVtYW5kcy4gVGhlcmVmb3JlLCBpZiBQb2ludENvbGxlY3Rpb24gaXMgY29ubmVjdGVkLCBjb25uZWN0XG4vLyBtb2RlbHMgYmVmb3JlIHJldHVybmluZyB0aGVtLlxuZXhwb3J0IGNvbnN0IFBvaW50Q29sbGVjdGlvbiA9IENvdWNoQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oIG1vZGVscywgb3B0aW9ucyApIHtcbiAgICBDb3VjaENvbGxlY3Rpb24ucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5wb3VjaCA9IHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYWxsRG9jczogYXNzaWduKFxuICAgICAgICAgIHsgaW5jbHVkZV9kb2NzOiB0cnVlIH0sXG4gICAgICAgICAgb3B0aW9ucy5rZXlzID8geyBrZXlzOiBvcHRpb25zLmtleXMgfSA6IGtleXNCZXR3ZWVuKCAncG9pbnQvJyApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qge2Nvbm5lY3QsIGRhdGFiYXNlfSA9IHRoaXM7XG4gICAgdGhpcy5zZXJ2aWNlID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBTZXJ2aWNlICkgOiBTZXJ2aWNlO1xuICAgIHRoaXMuYWxlcnQgPSBjb25uZWN0ID8gY29ubmVjdCggZGF0YWJhc2UsIEFsZXJ0ICkgOiBBbGVydDtcbiAgfSxcblxuICAvLyBUaGlzIGhhbmRsZXMgdGhlIGBvcHRpb25zLmtleXNgIGVkZ2UgY2FzZXMgbGlzdGVkIGluIHRoZVxuICAvLyBbUG91Y2hEQiBhcGldKGh0dHBzOi8vcG91Y2hkYi5jb20vYXBpLmh0bWwjYmF0Y2hfZmV0Y2gpXG4gIHBhcnNlOiBmdW5jdGlvbiggcmVzcG9uc2UsIG9wdGlvbnMgKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnJvd3MuZmlsdGVyKFxuICAgICAgcm93ID0+ICEoIHJvdy5kZWxldGVkIHx8IHJvdy5lcnJvciApXG4gICAgKS5tYXAoXG4gICAgICByb3cgPT4gcm93LmRvY1xuICAgICk7XG4gIH0sXG5cbiAgbW9kZWw6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIGNvbnN0IHBvaW50SWRDb21wb25lbnRzID0gcG9pbnRJZCggYXR0cmlidXRlcy5faWQgKTtcbiAgICBjb25zdCB0eXBlID0gcG9pbnRJZENvbXBvbmVudHMudHlwZTtcbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAnc2VydmljZSc6IG9wdGlvbnMuY29sbGVjdGlvbi5zZXJ2aWNlLFxuICAgICAgJ2FsZXJ0Jzogb3B0aW9ucy5jb2xsZWN0aW9uLmFsZXJ0XG4gICAgfTtcbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9IG1hcFsgdHlwZSBdO1xuICAgIGlmICggY29uc3RydWN0b3IgKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBjb25zdHJ1Y3RvciggYXR0cmlidXRlcywgb3B0aW9ucyApO1xuXG4gICAgICBpZiAoIG9wdGlvbnMuZGVpbmRleCAmJiBpbnN0YW5jZS5oYXMoICdpbmRleCcgKSApIHtcbiAgICAgICAgaW5zdGFuY2UuaW5kZXggPSBpbnN0YW5jZS5nZXQoICdpbmRleCcgKTtcbiAgICAgICAgaW5zdGFuY2UudW5zZXQoICdpbmRleCAnICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ0EgcG9pbnQgbXVzdCBiZSBhIHNlcnZpY2Ugb3IgYWxlcnQnO1xuICAgIH1cbiAgfSxcblxuICAvLyAjIyBGZXRjaCBDb3ZlciBJbWFnZXMgZm9yIGFsbCBQb2ludHNcbiAgLy8gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGFsbCBwb2ludHMgaW4gdGhlIGFycmF5IGhhdmVcbiAgLy8gdGhlaXIgY292ZXIgaW1hZ2VzIGF2YWlsYWJsZS5cbiAgZ2V0Q292ZXJzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoIHRoaXMubW9kZWxzLm1hcCggcG9pbnQgPT4gcG9pbnQuZ2V0Q292ZXIoKSApICk7XG4gIH0sXG5cbiAgLy8gIyMgR2V0IFJlZHV4IFJlcHJlc2VudGF0aW9uXG4gIC8vIFJldHVybiBhIG5lc3RlZCBvYmplY3QvYXJhcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbGxlY3Rpb24gc3VpdGFibGUgZm9yXG4gIC8vIHVzZSB3aXRoIHJlZHV4LlxuICBzdG9yZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZyb21QYWlycyggdGhpcy5tb2RlbHMubWFwKCBwb2ludCA9PiBbIHBvaW50LmlkLCBwb2ludC5zdG9yZSgpIF0gKSApO1xuICB9XG59ICk7XG5cbi8vICMgRGlzcGxheSBOYW1lIGZvciBUeXBlXG4vLyBHaXZlbiBhIHR5cGUga2V5IGZyb20gZWl0aGVyIHRoZSBzZXJ2aWNlIG9yIGFsZXJ0IHR5cGUgZW51bWVyYXRpb25zLFxuLy8gcmV0dXJuIHRoZSB0eXBlJ3MgZGlzcGxheSBzdHJpbmcsIG9yIG51bGwgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGxheSggdHlwZSApIHtcbiAgY29uc3QgdmFsdWVzID0gc2VydmljZVR5cGVzWyB0eXBlIF0gfHwgYWxlcnRUeXBlc1sgdHlwZSBdO1xuICBpZiAoIHZhbHVlcyApIHtcbiAgICByZXR1cm4gdmFsdWVzLmRpc3BsYXk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==