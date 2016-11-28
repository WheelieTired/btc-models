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
      updated_by: 'unknown',
      comments: []
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
              'type': 'string',
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
    'flagged_by', 'comments']
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiQ09NTUVOVF9NSU5fTEVOR1RIIiwiQ09NTUVOVF9NQVhfTEVOR1RIIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwiY292ZXJCbG9iIiwiY292ZXJVcmwiLCJ1cGRhdGUiLCJzcGVjaWZ5IiwidHlwZSIsIm5hbWUiLCJsb2NhdGlvbiIsIl9pZCIsImxhdCIsImxuZyIsImdlb2hhc2giLCJlbmNvZGUiLCJzYWZlZ3VhcmQiLCJkZWZhdWx0cyIsImZsYWdnZWRfYnkiLCJ1cGRhdGVkX2J5IiwiY29tbWVudHMiLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJtaW5JdGVtcyIsIm1heEl0ZW1zIiwiaXRlbXMiLCJmb3JtYXQiLCJkZXNjcmlwdGlvbiIsInVzZXIiLCJ0ZXh0IiwicmF0aW5nIiwibWluaW11bSIsIm1heGltdW0iLCJ1dWlkIiwicmVxdWlyZWQiLCJjbGVhciIsImZldGNoIiwidGhlbiIsImdldENvdmVyIiwicmVzIiwicmV0IiwicmVzb2x2ZSIsImhhc0NvdmVyIiwiYXR0YWNobWVudHMiLCJhdHRhY2htZW50IiwiYmxvYiIsInNldENvdmVyIiwic3RvcmUiLCJ0b0pTT04iLCJ1cmkiLCJmb3IiLCJwb2ludElkQ29tcG9uZW50cyIsImlkIiwiU2VydmljZSIsIkFsZXJ0Iiwic2VydmljZVR5cGVzIiwiY2FsbCIsImFtZW5pdGllcyIsInNjaGVkdWxlIiwic2Vhc29uYWwiLCJlbnVtIiwiYWRkcmVzcyIsInBob25lIiwid2Vic2l0ZSIsInVwZGF0ZWQiLCJhbGVydFR5cGVzIiwiUG9pbnRDb2xsZWN0aW9uIiwibW9kZWxzIiwicG91Y2giLCJhbGxEb2NzIiwiaW5jbHVkZV9kb2NzIiwia2V5cyIsImNvbm5lY3QiLCJkYXRhYmFzZSIsInNlcnZpY2UiLCJhbGVydCIsInBhcnNlIiwicmVzcG9uc2UiLCJyb3dzIiwiZmlsdGVyIiwicm93IiwiZGVsZXRlZCIsImVycm9yIiwibWFwIiwiZG9jIiwibW9kZWwiLCJjb2xsZWN0aW9uIiwiY29uc3RydWN0b3IiLCJpbnN0YW5jZSIsImRlaW5kZXgiLCJoYXMiLCJpbmRleCIsImdldCIsInVuc2V0IiwiZ2V0Q292ZXJzIiwiYWxsIiwicG9pbnQiLCJ2YWx1ZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozt5cEJBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFzZWdCQSxPLEdBQUFBLE87O0FBbmRoQjs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUMsVUFBWSxPQUFPQyxNQUFQLEtBQWtCLFdBQXBDOztBQUVBLElBQUlDLFVBQVVDLFFBQVEsa0JBQVIsQ0FBZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sSUFBTUMsNEJBQVUsaUJBQU9DLEtBQVAsQ0FBYyw0QkFBZCxDQUFoQjs7QUFFUCxJQUFNQyxxQkFBcUIsQ0FBM0I7QUFDQSxJQUFNQyxxQkFBcUIsR0FBM0I7O0FBRU8sSUFBTUMsd0JBQVEsaUJBQVdDLE1BQVgsQ0FBbUI7QUFDdENDLGVBQWEsS0FEeUI7O0FBR3RDQyxjQUFZLG9CQUFVQyxVQUFWLEVBQXNCQyxPQUF0QixFQUFnQztBQUMxQyxxQkFBV0MsU0FBWCxDQUFxQkgsVUFBckIsQ0FBZ0NJLEtBQWhDLENBQXVDLElBQXZDLEVBQTZDQyxTQUE3Qzs7QUFFQSxRQUFNQyxPQUFP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RCxXQUFKLENBQWlCL0YsVUFBakIsRUFBNkJDLE9BQTdCLENBQWpCOztBQUVBLFVBQUtBLFFBQVFnRyxPQUFSLElBQW1CRCxTQUFTRSxHQUFULENBQWMsT0FBZCxDQUF4QixFQUFrRDtBQUNoREYsaUJBQVNHLEtBQVQsR0FBaUJILFNBQVNJLEdBQVQsQ0FBYyxPQUFkLENBQWpCO0FBQ0FKLGlCQUFTSyxLQUFULENBQWdCLFFBQWhCO0FBQ0Q7O0FBRUQsYUFBT0wsUUFBUDtBQUNELEtBVEQsTUFTTztBQUNMLFlBQU0sb0NBQU47QUFDRDtBQUNGLEdBakRvRDs7QUFtRHJEO0FBQ0E7QUFDQTtBQUNBTSxhQUFXLHFCQUFXO0FBQ3BCLFdBQU9oSCxRQUFRaUgsR0FBUixDQUFhLEtBQUs1QixNQUFMLENBQVlnQixHQUFaLENBQWlCO0FBQUEsYUFBU2EsTUFBTTFELFFBQU4sRUFBVDtBQUFBLEtBQWpCLENBQWIsQ0FBUDtBQUNELEdBeERvRDs7QUEwRHJEO0FBQ0E7QUFDQTtBQUNBUyxTQUFPLGlCQUFXO0FBQ2hCLFdBQU8sdUJBQVcsS0FBS29CLE1BQUwsQ0FBWWdCLEdBQVosQ0FBaUI7QUFBQSxhQUFTLENBQUVhLE1BQU01QyxFQUFSLEVBQVk0QyxNQUFNakQsS0FBTixFQUFaLENBQVQ7QUFBQSxLQUFqQixDQUFYLENBQVA7QUFDRDtBQS9Eb0QsQ0FBeEIsQ0FBeEI7O0FBa0VQO0FBQ0E7QUFDQTtBQUNPLFNBQVNwRSxPQUFULENBQWtCNEIsSUFBbEIsRUFBeUI7QUFDOUIsTUFBTTBGLFNBQVMxQyxhQUFjaEQsSUFBZCxLQUF3QjBELFdBQVkxRCxJQUFaLENBQXZDO0FBQ0EsTUFBSzBGLE1BQUwsRUFBYztBQUNaLFdBQU9BLE9BQU90SCxPQUFkO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBTyxJQUFQO0FBQ0Q7QUFDRiIsImZpbGUiOiJwb2ludC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGJ0Yy1hcHAtc2VydmVyIC0tIFNlcnZlciBmb3IgdGhlIEJpY3ljbGUgVG91cmluZyBDb21wYW5pb25cbiAqIENvcHlyaWdodCDCqSAyMDE2IEFkdmVudHVyZSBDeWNsaW5nIEFzc29jaWF0aW9uXG4gKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgYnRjLWFwcC1zZXJ2ZXIuXG4gKlxuICogYnRjLWFwcC1zZXJ2ZXIgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBGb29iYXIuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IHsgbWl4aW5WYWxpZGF0aW9uLCBtZXJnZVNjaGVtYXMgfSBmcm9tICcuL3ZhbGlkYXRpb24tbWl4aW4nO1xuaW1wb3J0IHsgQ291Y2hNb2RlbCwgQ291Y2hDb2xsZWN0aW9uLCBrZXlzQmV0d2VlbiB9IGZyb20gJy4vYmFzZSc7XG5cbmltcG9ydCB7IGtleXMsIGZyb21QYWlycywgaW5jbHVkZXMsIGFzc2lnbiB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBjcmVhdGVPYmplY3RVUkwgfSBmcm9tICdibG9iLXV0aWwnO1xuXG5pbXBvcnQgZG9jdXJpIGZyb20gJ2RvY3VyaSc7XG5pbXBvcnQgbmdlb2hhc2ggZnJvbSAnbmdlb2hhc2gnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICd0by1pZCc7XG5pbXBvcnQgdXVpZCBmcm9tICdub2RlLXV1aWQnO1xuXG5jb25zdCBicm93c2VyID0gKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyApO1xuXG52YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3BvbHlmaWxsLXByb21pc2UnKTtcblxuLy8gIyBQb2ludCBNb2RlbFxuLy8gVGhlIHBvaW50IHJlcHJlc2VudHMgYSBsb2NhdGlvbiBvbiB0aGUgbWFwIHdpdGggYXNzb2NpYXRlZCBtZXRhZGF0YSwgZ2VvZGF0YSxcbi8vIGFuZCB1c2VyIHByb3ZpZGVkIGRhdGEuIFRoZSBwb2ludCBpcyB0aGUgYmFzZSBzaGFyZWQgYnkgc2VydmljZXMgYW5kIGFsZXJ0cy5cbi8vXG4vLyBUaGUgSlNPTiBzY2hlbWEgc3RvcmVkIGluIGBQb2ludGAsIGFuZCBhcyBwYXRjaGVkIGJ5IGBTZXJ2aWNlYCBhbmQgYEFsZXJ0YCxcbi8vIGlzIHRoZSBhdXRob3JpdGF0aXZlIGRlZmluaXRpb24gb2YgdGhlIHBvaW50IHJlY29yZC5cblxuLy8gIyMgUG9pbnQgTW9kZWwgVXJpXG4vLyBQb2ludHMgYXJlIHN0b3JlZCBpbiBDb3VjaERCLiBDb3VjaERCIGRvY3VtZW50cyBjYW4gaGF2ZSByaWNoIGlkIHN0cmluZ3Ncbi8vIHRvIGhlbHAgc3RvcmUgYW5kIGFjY2VzcyBkYXRhIHdpdGhvdXQgTWFwUmVkdWNlIGpvYnMuXG4vL1xuLy8gVGhlIHBvaW50IG1vZGVsIHVyaSBpcyBjb21wb3NlZCBvZiBmb3VyIHBhcnRzOlxuLy8gIDEuIFRoZSBzdHJpbmcgJ3BvaW50LydgXG4vLyAgMi4gVGhlIHR5cGUgb2YgcG9pbnQsIGVpdGhlciAnc2VydmljZScgb3IgJ2FsZXJ0J1xuLy8gIDMuIFRoZSBub3JtYWxpemVkIChvcmlnaW5hbCkgbmFtZSBvZiB0aGUgcG9pbnRcbi8vICA0LiBUaGUgcG9pbnQncyBnZW9oYXNoXG5leHBvcnQgY29uc3QgcG9pbnRJZCA9IGRvY3VyaS5yb3V0ZSggJ3BvaW50Lzp0eXBlLzpuYW1lLzpnZW9oYXNoJyApO1xuXG5jb25zdCBDT01NRU5UX01JTl9MRU5HVEggPSAxO1xuY29uc3QgQ09NTUVOVF9NQVhfTEVOR1RIID0gMTQwO1xuXG5leHBvcnQgY29uc3QgUG9pbnQgPSBDb3VjaE1vZGVsLmV4dGVuZCgge1xuICBpZEF0dHJpYnV0ZTogJ19pZCcsXG5cbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG4gICAgQ291Y2hNb2RlbC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gIFxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgdGhpcy5zZXQoIHtcbiAgICAgIGNyZWF0ZWRfYXQ6IGRhdGUsXG4gICAgICB1cGRhdGVkX2F0OiBkYXRlLFxuICAgIH0gKTtcblxuICAgIHRoaXMuY292ZXJCbG9iID0gZmFsc2U7XG4gICAgdGhpcy5jb3ZlclVybCA9IGZhbHNlO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXQoICd1cGRhdGVkX2F0JywgbmV3IERhdGUoKS50b0lTT1N0cmluZygpICk7XG4gIH0sXG5cbiAgLy8gIyMgU3BlY2lmeVxuICAvLyBGaWxsIGluIGBfaWRgIGZyb20gdGhlIGNvbXBvbmVudHMgb2YgdGhlIHBvaW50IG1vZGVsIHVyaS5cbiAgLy8gUHVsbCB2YWx1ZXMgZnJvbSBgYXR0cmlidXRlc2AgaWYgbmFtZSBhbmQgbG9jYXRpb24gYXJlIHVuZGVmaW5lZC5cbiAgc3BlY2lmeTogZnVuY3Rpb24oIHR5cGUsIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIC8vIE9ubHkgc2V0IHRoZSBJRCBhdHRyaWJ1dGUgaGVyZSBpZiBpdCB3YXNuJ3QgYWxyZWFkeSBzZXQuXG4gICAgLy8gVGhlIG9yaWdpbmFsIElEIHN0YXlzIHRoZSBJRCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBwb2ludC5cbiAgICBpZiAodHlwZW9mIHRoaXMuYXR0cmlidXRlcy5faWQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICggbmFtZSApIHtcbiAgICAgICAgY29uc3QgW2xhdCwgbG5nXSA9IGxvY2F0aW9uO1xuICAgICAgICBjb25zdCBfaWQgPSBwb2ludElkKCB7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBuYW1lOiBub3JtYWxpemUoIG5hbWUgKSxcbiAgICAgICAgICBnZW9oYXNoOiBuZ2VvaGFzaC5lbmNvZGUoIGxhdCwgbG5nIClcbiAgICAgICAgfSApO1xuICAgICAgICB0aGlzLnNldCggeyBfaWQsIHR5cGUsIG5hbWUsIGxvY2F0aW9uIH0gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHtuYW1lLCBsb2NhdGlvbn0gPSB0aGlzLmF0dHJpYnV0ZXM7XG4gICAgICAgIGNvbnN0IFtsYXQsIGxuZ10gPSBsb2NhdGlvbjtcbiAgICAgICAgY29uc3QgX2lkID0gcG9pbnRJZCgge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgbmFtZTogbm9ybWFsaXplKCBuYW1lICksXG4gICAgICAgICAgZ2VvaGFzaDogbmdlb2hhc2guZW5jb2RlKCBsYXQsIGxuZyApXG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5zZXQoIHsgX2lkIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gIyMgU2FmZWd1YXJkIGZvciBQb2ludHNcbiAgLy8gUG9pbnRzIGhhdmUgaW1hZ2UgYXR0YWNobWVudHMsIHNvIHdlIHNob3VsZCBsZXQgYmFja2JvbmUgcG91Y2ggaGFuZGxlXG4gIC8vIHRob3NlIGFuZCB3ZSBzaG91bGQgbm90IHZhbGlkYXRlIHRoZSBfYXR0YWNobWVudHMga2V5XG4gIHNhZmVndWFyZDogW1xuICAgICdfYXR0YWNobWVudHMnXG4gIF0sXG5cbiAgZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmbGFnZ2VkX2J5OiBbXSxcbiAgICAgIHVwZGF0ZWRfYnk6ICd1bmtub3duJyxcbiAgICAgIGNvbW1lbnRzOiBbXVxuICAgIH07XG4gIH0sXG5cbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG5hbWU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBsb2NhdGlvbjoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBtaW5JdGVtczogMixcbiAgICAgICAgbWF4SXRlbXM6IDIsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBjcmVhdGVkX2F0OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICB9LFxuICAgICAgdXBkYXRlZF9hdDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWRfYnk6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB9LFxuICAgICAgZmxhZ2dlZF9ieTp7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGNvbW1lbnRzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRlOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAndHlwZSc6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAnbWluTGVuZ3RoJzogQ09NTUVOVF9NSU5fTEVOR1RILFxuICAgICAgICAgICAgICAnbWF4TGVuZ3RoJzogQ09NTUVOVF9NQVhfTEVOR1RIXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmF0aW5nOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgICAgbWluaW11bTogMSxcbiAgICAgICAgICAgICAgbWF4aW11bTogNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHV1aWQ6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcXVpcmVkOiBbXG4gICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICAnZGF0ZScsXG4gICAgICAgICAgICAndGV4dCcsXG4gICAgICAgICAgICAncmF0aW5nJyxcbiAgICAgICAgICAgICd1dWlkJ1xuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICduYW1lJyxcbiAgICAgICdsb2NhdGlvbicsXG4gICAgICAndHlwZScsXG4gICAgICAnY3JlYXRlZF9hdCcsXG4gICAgICAndXBkYXRlZF9hdCcsXG4gICAgICAndXBkYXRlZF9ieScsXHQvKiBBZGRlZDogVG8gYXR0YWNoIHBvaW50cyB0byB1c2VycyB2aWEgdGhlaXIgX2lkICovXG4gICAgICAnZmxhZ2dlZF9ieScsXG4gICAgICAnY29tbWVudHMnXG4gICAgXVxuICB9LFxuXG4gIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBDb3VjaE1vZGVsLnByb3RvdHlwZS5jbGVhci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgdGhpcy5jb3ZlclVybCA9IGZhbHNlO1xuICB9LFxuXG4gIC8vICMjIEZldGNoXG4gIC8vIFdoZW4gZmV0Y2hpbmcgYSBwb2ludCwgc2hvdWxkIGl0IGhhdmUgYSBjb3ZlciBhdHRhY2htZW50LCBleHRlbmQgdGhlXG4gIC8vIHByb21pc2UgdG8gZmV0Y2ggdGhlIGF0dGFjaG1lbnQgYW5kIHNldCBgdGhpcy5jb3ZlclVybGAuXG4gIGZldGNoOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQ291Y2hNb2RlbC5wcm90b3R5cGUuZmV0Y2guYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApLnRoZW4oIHJlcyA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRDb3ZlciggcmVzICk7XG4gICAgfSApO1xuICB9LFxuXG4gIC8vICMgR2V0IENvdmVyXG4gIC8vIFNob3VsZCBhIHBvaW50IChhbHJlYWR5IGZldGNoZWQpIGhhdmUgYSBjb3ZlciBhdHRhY2htZW50LCBnZXQgdGhlXG4gIC8vIGF0dGFjaG1lbnQncyBkYXRhIGFuZCBzdG9yZSBhbiBvYmplY3QgdXJsIGZvciBpdCBpbiBgdGhpcy5jb3ZlclVybGBcbiAgLy9cbiAgLy8gQXMgYSB1dGlsaXR5IHRvIGNsaWVudCBmdW5jdGlvbnMsIHJlc29sdmUgdGhlIHJldHVybmVkIHByb21pc2UgdG8gdGhlXG4gIC8vIHNpbmdsZSBhcmd1bWVudCBwYXNzZWQgdG8gYGdldENvdmVyYC5cbiAgZ2V0Q292ZXI6IGZ1bmN0aW9uKCByZXQgKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oICggKSA9PiB7XG4gICAgICBjb25zdCBoYXNDb3ZlciA9IGluY2x1ZGVzKCB0aGlzLmF0dGFjaG1lbnRzKCksICdjb3Zlci5wbmcnICk7XG4gICAgICBpZiAoIGJyb3dzZXIgJiYgaGFzQ292ZXIgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dGFjaG1lbnQoICdjb3Zlci5wbmcnICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSApLnRoZW4oIGJsb2IgPT4ge1xuICAgICAgaWYgKCBibG9iICkge1xuICAgICAgICB0aGlzLmNvdmVyQmxvYiA9IGJsb2I7XG4gICAgICAgIHRoaXMuY292ZXJVcmwgPSBjcmVhdGVPYmplY3RVUkwoIGJsb2IgKTtcbiAgICAgIH1cbiAgICB9ICkudGhlbiggKCApID0+IHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSApO1xuICB9LFxuXG4gIC8vICMjIFNldCBDb3ZlclxuICAvLyBJZiB0aGUgdXNlciBhbHJlYWR5IGhhcyBhIGNvdmVyIGJsb2IgYW5kIHRoZXkgd2FudCB0byB1c2UgaXQgd2l0aCB0aGVcbiAgLy8gbW9kZWwgYmVmb3JlIGF0dGFjaCgpIGNhbiBmaW5pc2ggc3RvcmluZyBpdCB0byBQb3VjaERCLCB0aGV5IGNhbiB1c2VcbiAgLy8gdGhpcyBtZXRob2QgdG8gbWFudWFsbHkgaW5zZXJ0IGl0LlxuICAvL1xuICAvLyBUaGUgYXNzb2NpYXRlZCBvYmplY3QgdXJsIGZvciB0aGUgYmxvYiB3aWxsIHRoZW4gYmUgYXZhaWxhYmxlIHRvIG90aGVyXG4gIC8vIGZ1bmN0aW9ucyBsaWtlIHN0b3JlKCkuXG4gIHNldENvdmVyOiBmdW5jdGlvbiggYmxvYiApIHtcbiAgICB0aGlzLmNvdmVyQmxvYiA9IGJsb2I7XG4gICAgaWYgKCBicm93c2VyICkge1xuICAgICAgdGhpcy5jb3ZlclVybCA9IGNyZWF0ZU9iamVjdFVSTCggYmxvYiApO1xuICAgIH1cbiAgfSxcblxuICAvLyAjIyBHZXQgUmVkdXggUmVwcmVzZW50YXRpb25cbiAgLy8gUmV0dXJuIGEgbmVzdGVkIG9iamVjdC9hcmFyeSByZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgc3VpdGFibGUgZm9yXG4gIC8vIHVzZSB3aXRoIHJlZHV4LlxuICBzdG9yZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgLi4udGhpcy50b0pTT04oKSwgY292ZXJVcmw6IHRoaXMuY292ZXJVcmwgfTtcbiAgfVxufSwge1xuICB1cmk6IHBvaW50SWQsXG5cbiAgZm9yOiBpZCA9PiB7XG4gICAgY29uc3QgcG9pbnRJZENvbXBvbmVudHMgPSBwb2ludElkKCBpZCApO1xuICAgIGNvbnN0IHR5cGUgPSBwb2ludElkQ29tcG9uZW50cy50eXBlO1xuICAgIGlmICggdHlwZSA9PT0gJ3NlcnZpY2UnICkge1xuICAgICAgcmV0dXJuIG5ldyBTZXJ2aWNlKCB7IF9pZDogaWQgfSApO1xuICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09ICdhbGVydCcgKSB7XG4gICAgICByZXR1cm4gbmV3IEFsZXJ0KCB7IF9pZDogaWQgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnQSBwb2ludCBtdXN0IGJlIGEgc2VydmljZSBvciBhbGVydCc7XG4gICAgfVxuICB9XG59ICk7XG5cbi8vICMgU2VydmljZSBNb2RlbFxuLy8gQSBzZXJ2aWNlIGlzIGEgYnVpc25lc3Mgb3IgcG9pbnQgb2YgaW50ZXJlc3QgdG8gYSBjeWNsaXN0LiBBIGN5Y2xpc3QgbmVlZHNcbi8vIHRvIGtub3cgd2hlcmUgdGhleSB3YW50IHRvIHN0b3Agd2VsbCBpbiBhZHZhbmNlIG9mIHRoZWlyIHRyYXZlbCB0aHJvdWdoIGFuXG4vLyBhcmVhLiBUaGUgc2VydmljZSByZWNvcmQgbXVzdCBjb250YWluIGVub3VnaCBpbmZvcm1hdGlvbiB0byBoZWxwIHRoZSBjeWNsaXN0XG4vLyBtYWtlIHN1Y2ggZGVjaXNpb25zLlxuLy9cbi8vIFRoZSByZWNvcmQgaW5jbHVkZXMgY29udGFjdCBpbmZvcm1hdGlvbiwgYW5kIGEgc2NoZWR1bGUgb2YgaG91cnMgb2Zcbi8vIG9wZXJhdGlvbi4gSXQgaXMgaW1wb3J0YW50IHRoYXQgd2Ugc3RvcmUgdGhlIHRpbWUgem9uZSBvZiBhIHNlcnZpY2UsIHNpbmNlXG4vLyB0b3VyaW5nIGN5Y2xpc3RzIHdpbGwgY3Jvc3MgdGltZSB6b25lcyBvbiB0aGVpciB0cmF2ZWxzLiBGdXJ0aGVybW9yZSxcbi8vIHNlcnZpY2VzIG9mIGludGVyZXN0IHRvIHRvdXJpbmcgY3ljbGlzdHMgbWF5IGJlIHNlYXNvbmFsOiB3ZSBzdG9yZVxuLy8gc2NoZWR1bGVzIGZvciBkaWZmZXJlbnQgc2Vhc29ucy5cblxuLy8gIyMgU2VydmljZSBUeXBlc1xuLy8gQSBTZXJ2aWNlIG1heSBoYXZlIGEgc2luZ2xlIHR5cGUsIGluZGljYXRpbmcgdGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGVcbi8vIGJ1aXNuZXNzIG9yIHBvaW50IG9mIGludGVyZXN0LiBTZXJ2aWNlIHR5cGVzIG1heSBhbHNvIGJlIGluY2x1ZGVkIGluIGFcbi8vIFNlcnZpY2UncyBhbWVuaXRpZXMgYXJyYXkuXG5cbi8qZXNmbXQtaWdub3JlLXN0YXJ0Ki9cbmV4cG9ydCBjb25zdCBzZXJ2aWNlVHlwZXMgPSB7XG4gICdhaXJwb3J0JzogeyBkaXNwbGF5OiAnQWlycG9ydCcgfSxcbiAgJ2Jhcic6IHsgZGlzcGxheTogJ0JhcicgfSxcbiAgJ2JlZF9hbmRfYnJlYWtmYXN0JzogeyBkaXNwbGF5OiAnQmVkICYgQnJlYWtmYXN0JyB9LFxuICAnYmlrZV9zaG9wJzogeyBkaXNwbGF5OiAnQmlrZSBTaG9wJyB9LFxuICAnY2FiaW4nOiB7IGRpc3BsYXk6ICdDYWJpbicgfSxcbiAgJ2NhbXBncm91bmQnOiB7IGRpc3BsYXk6ICdDYW1wZ3JvdW5kJyB9LFxuICAnY29udmVuaWVuY2Vfc3RvcmUnOiB7IGRpc3BsYXk6ICdDb252ZW5pZW5jZSBTdG9yZScgfSxcbiAgJ2N5Y2xpc3RzX2NhbXBpbmcnOiB7IGRpc3BsYXk6ICdDeWNsaXN0c1xcJyBDYW1waW5nJyB9LFxuICAnY3ljbGlzdHNfbG9kZ2luZyc6IHsgZGlzcGxheTogJ0N5Y2xpc3RzXFwnIExvZGdpbmcnIH0sXG4gICdncm9jZXJ5JzogeyBkaXNwbGF5OiAnR3JvY2VyeScgfSxcbiAgJ2hvc3RlbCc6IHsgZGlzcGxheTogJ0hvc3RlbCcgfSxcbiAgJ2hvdF9zcHJpbmcnOiB7IGRpc3BsYXk6ICdIb3QgU3ByaW5nJyB9LFxuICAnaG90ZWwnOiB7IGRpc3BsYXk6ICdIb3RlbCcgfSxcbiAgJ21vdGVsJzogeyBkaXNwbGF5OiAnTW90ZWwnIH0sXG4gICdpbmZvcm1hdGlvbic6IHsgZGlzcGxheTogJ0luZm9ybWF0aW9uJyB9LFxuICAnbGlicmFyeSc6IHsgZGlzcGxheTogJ0xpYnJhcnknIH0sXG4gICdtdXNldW0nOiB7IGRpc3BsYXk6ICdNdXNldW0nIH0sXG4gICdvdXRkb29yX3N0b3JlJzogeyBkaXNwbGF5OiAnT3V0ZG9vciBTdG9yZScgfSxcbiAgJ3Jlc3RfYXJlYSc6IHsgZGlzcGxheTogJ1Jlc3QgQXJlYScgfSxcbiAgJ3Jlc3RhdXJhbnQnOiB7IGRpc3BsYXk6ICdSZXN0YXVyYW50JyB9LFxuICAncmVzdHJvb20nOiB7IGRpc3BsYXk6ICdSZXN0cm9vbScgfSxcbiAgJ3NjZW5pY19hcmVhJzogeyBkaXNwbGF5OiAnU2NlbmljIEFyZWEnIH0sXG4gICdzdGF0ZV9wYXJrJzogeyBkaXNwbGF5OiAnU3RhdGUgUGFyaycgfSxcbiAgJ290aGVyJzogeyBkaXNwbGF5OiAnT3RoZXInIH1cbn07XG4vKmVzZm10LWlnbm9yZS1lbmQqL1xuXG5leHBvcnQgY29uc3QgU2VydmljZSA9IFBvaW50LmV4dGVuZCgge1xuICBzcGVjaWZ5OiBmdW5jdGlvbiggbmFtZSwgbG9jYXRpb24gKSB7XG4gICAgUG9pbnQucHJvdG90eXBlLnNwZWNpZnkuY2FsbCggdGhpcywgJ3NlcnZpY2UnLCBuYW1lLCBsb2NhdGlvbiApO1xuICB9LFxuXG4gIGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uUG9pbnQucHJvdG90eXBlLmRlZmF1bHRzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKSxcbiAgICAgIGFtZW5pdGllczogW10sXG4gICAgICBzY2hlZHVsZTogeyAnZGVmYXVsdCc6IFtdIH0sXG4gICAgICBzZWFzb25hbDogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHNjaGVtYTogbWVyZ2VTY2hlbWFzKCBQb2ludC5wcm90b3R5cGUuc2NoZW1hLCB7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgdHlwZToge1xuICAgICAgICBlbnVtOiBrZXlzKCBzZXJ2aWNlVHlwZXMgKVxuICAgICAgfSxcbiAgICAgIGFtZW5pdGllczoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGVudW06IGtleXMoIHNlcnZpY2VUeXBlcyApXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhZGRyZXNzOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgc2NoZWR1bGU6IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIH0sXG4gICAgICBzZWFzb25hbDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIH0sXG4gICAgICBwaG9uZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIHdlYnNpdGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ3VyaSdcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyAvLyB0aGUgdXBkYXRlZCBhdHRyaWJ1dGUgaXMgbm90IHJlcXVpcmVkXG4gICAgICB9XG4gICAgfSxcbiAgICByZXF1aXJlZDogW1xuICAgICAgJ3NlYXNvbmFsJ1xuICAgIF1cbiAgfSApXG59ICk7XG5cbi8vIEFwcGx5IHRoZSB2YWxpZGF0aW9uIG1peGluIHRvIHRoZSBTZXJ2aWNlIG1vZGVsLiBTZWUgdmFsaWRhdGlvbi1taXhpbi5qcy5cbm1peGluVmFsaWRhdGlvbiggU2VydmljZSApO1xuXG4vLyAjIEFsZXJ0IE1vZGVsXG4vLyBBbiBhbGVydCBpcyBzb21ldGhpbmcgdGhhdCBtaWdodCBpbXBlZGUgYSBjeWNsaXN0J3MgdG91ci4gV2hlbiBhIGN5Y2xpc3Rcbi8vIHNlZXMgYW4gYWxlcnQgb24gdGhlIG1hcCwgdGhlIGtub3cgdG8gcGxhbiBhcm91bmQgaXQuXG5cbi8qZXNmbXQtaWdub3JlLXN0YXJ0Ki9cbmV4cG9ydCBjb25zdCBhbGVydFR5cGVzID0ge1xuICAncm9hZF9jbG9zdXJlJzogeyBkaXNwbGF5OiAnUm9hZCBDbG9zdXJlJyB9LFxuICAnZm9yZXN0X2ZpcmUnOiB7IGRpc3BsYXk6ICdGb3Jlc3QgZmlyZScgfSxcbiAgJ2Zsb29kaW5nJzogeyBkaXNwbGF5OiAnRmxvb2RpbmcnIH0sXG4gICdkZXRvdXInOiB7IGRpc3BsYXk6ICdEZXRvdXInIH0sXG4gICdvdGhlcic6IHsgZGlzcGxheTogJ090aGVyJyB9XG59O1xuLyplc2ZtdC1pZ25vcmUtZW5kKi9cblxuZXhwb3J0IGNvbnN0IEFsZXJ0ID0gUG9pbnQuZXh0ZW5kKCB7XG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICBQb2ludC5wcm90b3R5cGUuc3BlY2lmeS5jYWxsKCB0aGlzLCAnYWxlcnQnLCBuYW1lLCBsb2NhdGlvbiApO1xuICB9LFxuXG4gIHNjaGVtYTogbWVyZ2VTY2hlbWFzKCBQb2ludC5wcm90b3R5cGUuc2NoZW1hLCB7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgdHlwZToge1xuICAgICAgICBlbnVtOiBrZXlzKCBhbGVydFR5cGVzIClcbiAgICAgIH1cbiAgICB9XG4gIH0gKVxufSApO1xuXG5taXhpblZhbGlkYXRpb24oIEFsZXJ0ICk7XG5cbi8vICMgUG9pbnQgQ29sbGVjdGlvblxuLy8gQSBoZXRlcm9nZW5lb3VzIGNvbGxlY3Rpb24gb2Ygc2VydmljZXMgYW5kIGFsZXJ0cy4gUG91Y2hEQiBpcyBhYmxlIHRvIGZldGNoXG4vLyB0aGlzIGNvbGxlY3Rpb24gYnkgbG9va2luZyBmb3IgYWxsIGtleXMgc3RhcnRpbmcgd2l0aCAncG9pbnQvJy5cbi8vXG4vLyBBIGNvbm5lY3RlZCBQb2ludENvbGxlY3Rpb24gbXVzdCBiZSBhYmxlIHRvIGdlbmVyYXRlIGNvbm5lY3RlZCBBbGVydHMgb3Jcbi8vIFNlcnZpY2VzIG9uIGRlbWFuZHMuIFRoZXJlZm9yZSwgaWYgUG9pbnRDb2xsZWN0aW9uIGlzIGNvbm5lY3RlZCwgY29ubmVjdFxuLy8gbW9kZWxzIGJlZm9yZSByZXR1cm5pbmcgdGhlbS5cbmV4cG9ydCBjb25zdCBQb2ludENvbGxlY3Rpb24gPSBDb3VjaENvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBtb2RlbHMsIG9wdGlvbnMgKSB7XG4gICAgQ291Y2hDb2xsZWN0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMucG91Y2ggPSB7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGFsbERvY3M6IGFzc2lnbihcbiAgICAgICAgICB7IGluY2x1ZGVfZG9jczogdHJ1ZSB9LFxuICAgICAgICAgIG9wdGlvbnMua2V5cyA/IHsga2V5czogb3B0aW9ucy5rZXlzIH0gOiBrZXlzQmV0d2VlbiggJ3BvaW50LycgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHtjb25uZWN0LCBkYXRhYmFzZX0gPSB0aGlzO1xuICAgIHRoaXMuc2VydmljZSA9IGNvbm5lY3QgPyBjb25uZWN0KCBkYXRhYmFzZSwgU2VydmljZSApIDogU2VydmljZTtcbiAgICB0aGlzLmFsZXJ0ID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBBbGVydCApIDogQWxlcnQ7XG4gIH0sXG5cbiAgLy8gVGhpcyBoYW5kbGVzIHRoZSBgb3B0aW9ucy5rZXlzYCBlZGdlIGNhc2VzIGxpc3RlZCBpbiB0aGVcbiAgLy8gW1BvdWNoREIgYXBpXShodHRwczovL3BvdWNoZGIuY29tL2FwaS5odG1sI2JhdGNoX2ZldGNoKVxuICBwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlLCBvcHRpb25zICkge1xuICAgIHJldHVybiByZXNwb25zZS5yb3dzLmZpbHRlcihcbiAgICAgIHJvdyA9PiAhKCByb3cuZGVsZXRlZCB8fCByb3cuZXJyb3IgKVxuICAgICkubWFwKFxuICAgICAgcm93ID0+IHJvdy5kb2NcbiAgICApO1xuICB9LFxuXG4gIG1vZGVsOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBjb25zdCBwb2ludElkQ29tcG9uZW50cyA9IHBvaW50SWQoIGF0dHJpYnV0ZXMuX2lkICk7XG4gICAgY29uc3QgdHlwZSA9IHBvaW50SWRDb21wb25lbnRzLnR5cGU7XG4gICAgY29uc3QgbWFwID0ge1xuICAgICAgJ3NlcnZpY2UnOiBvcHRpb25zLmNvbGxlY3Rpb24uc2VydmljZSxcbiAgICAgICdhbGVydCc6IG9wdGlvbnMuY29sbGVjdGlvbi5hbGVydFxuICAgIH07XG4gICAgY29uc3QgY29uc3RydWN0b3IgPSBtYXBbIHR5cGUgXTtcbiAgICBpZiAoIGNvbnN0cnVjdG9yICkge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgY29uc3RydWN0b3IoIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKTtcblxuICAgICAgaWYgKCBvcHRpb25zLmRlaW5kZXggJiYgaW5zdGFuY2UuaGFzKCAnaW5kZXgnICkgKSB7XG4gICAgICAgIGluc3RhbmNlLmluZGV4ID0gaW5zdGFuY2UuZ2V0KCAnaW5kZXgnICk7XG4gICAgICAgIGluc3RhbmNlLnVuc2V0KCAnaW5kZXggJyApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdBIHBvaW50IG11c3QgYmUgYSBzZXJ2aWNlIG9yIGFsZXJ0JztcbiAgICB9XG4gIH0sXG5cbiAgLy8gIyMgRmV0Y2ggQ292ZXIgSW1hZ2VzIGZvciBhbGwgUG9pbnRzXG4gIC8vIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhbGwgcG9pbnRzIGluIHRoZSBhcnJheSBoYXZlXG4gIC8vIHRoZWlyIGNvdmVyIGltYWdlcyBhdmFpbGFibGUuXG4gIGdldENvdmVyczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKCB0aGlzLm1vZGVscy5tYXAoIHBvaW50ID0+IHBvaW50LmdldENvdmVyKCkgKSApO1xuICB9LFxuXG4gIC8vICMjIEdldCBSZWR1eCBSZXByZXNlbnRhdGlvblxuICAvLyBSZXR1cm4gYSBuZXN0ZWQgb2JqZWN0L2FyYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xsZWN0aW9uIHN1aXRhYmxlIGZvclxuICAvLyB1c2Ugd2l0aCByZWR1eC5cbiAgc3RvcmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmcm9tUGFpcnMoIHRoaXMubW9kZWxzLm1hcCggcG9pbnQgPT4gWyBwb2ludC5pZCwgcG9pbnQuc3RvcmUoKSBdICkgKTtcbiAgfVxufSApO1xuXG4vLyAjIERpc3BsYXkgTmFtZSBmb3IgVHlwZVxuLy8gR2l2ZW4gYSB0eXBlIGtleSBmcm9tIGVpdGhlciB0aGUgc2VydmljZSBvciBhbGVydCB0eXBlIGVudW1lcmF0aW9ucyxcbi8vIHJldHVybiB0aGUgdHlwZSdzIGRpc3BsYXkgc3RyaW5nLCBvciBudWxsIGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXkoIHR5cGUgKSB7XG4gIGNvbnN0IHZhbHVlcyA9IHNlcnZpY2VUeXBlc1sgdHlwZSBdIHx8IGFsZXJ0VHlwZXNbIHR5cGUgXTtcbiAgaWYgKCB2YWx1ZXMgKSB7XG4gICAgcmV0dXJuIHZhbHVlcy5kaXNwbGF5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=