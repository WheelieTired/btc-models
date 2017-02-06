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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiQ09NTUVOVF9NSU5fTEVOR1RIIiwiQ09NTUVOVF9NQVhfTEVOR1RIIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwiY292ZXJCbG9iIiwiY292ZXJVcmwiLCJ1cGRhdGUiLCJzcGVjaWZ5IiwidHlwZSIsIm5hbWUiLCJsb2NhdGlvbiIsIl9pZCIsImxhdCIsImxuZyIsImdlb2hhc2giLCJlbmNvZGUiLCJzYWZlZ3VhcmQiLCJkZWZhdWx0cyIsImZsYWdnZWRfYnkiLCJ1cGRhdGVkX2J5IiwiY29tbWVudHMiLCJpc19oaWRkZW4iLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJtaW5JdGVtcyIsIm1heEl0ZW1zIiwiaXRlbXMiLCJmb3JtYXQiLCJ1c2VyIiwicmVhc29uIiwibWluTGVuZ3RoIiwibWF4TGVuZ3RoIiwicmVxdWlyZWQiLCJkZXNjcmlwdGlvbiIsInRleHQiLCJyYXRpbmciLCJtaW5pbXVtIiwibWF4aW11bSIsInV1aWQiLCJjbGVhciIsImZldGNoIiwidGhlbiIsImdldENvdmVyIiwicmVzIiwicmV0IiwicmVzb2x2ZSIsImhhc0NvdmVyIiwiYXR0YWNobWVudHMiLCJhdHRhY2htZW50IiwiYmxvYiIsInNldENvdmVyIiwic3RvcmUiLCJ0b0pTT04iLCJ1cmkiLCJmb3IiLCJwb2ludElkQ29tcG9uZW50cyIsImlkIiwiU2VydmljZSIsIkFsZXJ0Iiwic2VydmljZVR5cGVzIiwiY2FsbCIsImFtZW5pdGllcyIsInNjaGVkdWxlIiwic2Vhc29uYWwiLCJlbnVtIiwiYWRkcmVzcyIsInBob25lIiwid2Vic2l0ZSIsInVwZGF0ZWQiLCJhbGVydFR5cGVzIiwiUG9pbnRDb2xsZWN0aW9uIiwibW9kZWxzIiwicG91Y2giLCJhbGxEb2NzIiwiaW5jbHVkZV9kb2NzIiwia2V5cyIsImNvbm5lY3QiLCJkYXRhYmFzZSIsInNlcnZpY2UiLCJhbGVydCIsInBhcnNlIiwicmVzcG9uc2UiLCJyb3dzIiwiZmlsdGVyIiwicm93IiwiZGVsZXRlZCIsImVycm9yIiwibWFwIiwiZG9jIiwibW9kZWwiLCJjb2xsZWN0aW9uIiwiY29uc3RydWN0b3IiLCJpbnN0YW5jZSIsImRlaW5kZXgiLCJoYXMiLCJpbmRleCIsImdldCIsInVuc2V0IiwiZ2V0Q292ZXJzIiwiYWxsIiwicG9pbnQiLCJ2YWx1ZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozt5cEJBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFtZmdCQSxPLEdBQUFBLE87O0FBaGVoQjs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUMsVUFBWSxPQUFPQyxNQUFQLEtBQWtCLFdBQXBDOztBQUVBLElBQUlDLFVBQVVDLFFBQVEsa0JBQVIsQ0FBZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sSUFBTUMsNEJBQVUsaUJBQU9DLEtBQVAsQ0FBYyw0QkFBZCxDQUFoQjs7QUFFUCxJQUFNQyxxQkFBcUIsQ0FBM0I7QUFDQSxJQUFNQyxxQkFBcUIsR0FBM0I7O0FBRU8sSUFBTUMsd0JBQVEsaUJBQVdDLE1BQVgsQ0FBbUI7QUFDdENDLGVBQWEsS0FEeUI7O0FBR3RDQyxjQUFZLG9CQUFVQyxVQUFWLEVBQXNCQyxPQUF0QixFQUFnQztBQUMxQyxxQkFBV0MsU0FBWCxDQUFxQkgsVUFBckIsQ0FBZ0NJLEtB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QUFTeEUsT0FBVCxDQUFrQjRCLElBQWxCLEVBQXlCO0FBQzlCLE1BQU04RixTQUFTMUMsYUFBY3BELElBQWQsS0FBd0I4RCxXQUFZOUQsSUFBWixDQUF2QztBQUNBLE1BQUs4RixNQUFMLEVBQWM7QUFDWixXQUFPQSxPQUFPMUgsT0FBZDtBQUNELEdBRkQsTUFFTztBQUNMLFdBQU8sSUFBUDtBQUNEO0FBQ0YiLCJmaWxlIjoicG9pbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBidGMtYXBwLXNlcnZlciAtLSBTZXJ2ZXIgZm9yIHRoZSBCaWN5Y2xlIFRvdXJpbmcgQ29tcGFuaW9uXG4gKiBDb3B5cmlnaHQgwqkgMjAxNiBBZHZlbnR1cmUgQ3ljbGluZyBBc3NvY2lhdGlvblxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGJ0Yy1hcHAtc2VydmVyLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogYnRjLWFwcC1zZXJ2ZXIgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRm9vYmFyLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCB7IG1peGluVmFsaWRhdGlvbiwgbWVyZ2VTY2hlbWFzIH0gZnJvbSAnLi92YWxpZGF0aW9uLW1peGluJztcbmltcG9ydCB7IENvdWNoTW9kZWwsIENvdWNoQ29sbGVjdGlvbiwga2V5c0JldHdlZW4gfSBmcm9tICcuL2Jhc2UnO1xuXG5pbXBvcnQgeyBrZXlzLCBmcm9tUGFpcnMsIGluY2x1ZGVzLCBhc3NpZ24gfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgY3JlYXRlT2JqZWN0VVJMIH0gZnJvbSAnYmxvYi11dGlsJztcblxuaW1wb3J0IGRvY3VyaSBmcm9tICdkb2N1cmknO1xuaW1wb3J0IG5nZW9oYXNoIGZyb20gJ25nZW9oYXNoJztcbmltcG9ydCBub3JtYWxpemUgZnJvbSAndG8taWQnO1xuaW1wb3J0IHV1aWQgZnJvbSAnbm9kZS11dWlkJztcblxuY29uc3QgYnJvd3NlciA9ICggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgKTtcblxudmFyIFByb21pc2UgPSByZXF1aXJlKCdwb2x5ZmlsbC1wcm9taXNlJyk7XG5cbi8vICMgUG9pbnQgTW9kZWxcbi8vIFRoZSBwb2ludCByZXByZXNlbnRzIGEgbG9jYXRpb24gb24gdGhlIG1hcCB3aXRoIGFzc29jaWF0ZWQgbWV0YWRhdGEsIGdlb2RhdGEsXG4vLyBhbmQgdXNlciBwcm92aWRlZCBkYXRhLiBUaGUgcG9pbnQgaXMgdGhlIGJhc2Ugc2hhcmVkIGJ5IHNlcnZpY2VzIGFuZCBhbGVydHMuXG4vL1xuLy8gVGhlIEpTT04gc2NoZW1hIHN0b3JlZCBpbiBgUG9pbnRgLCBhbmQgYXMgcGF0Y2hlZCBieSBgU2VydmljZWAgYW5kIGBBbGVydGAsXG4vLyBpcyB0aGUgYXV0aG9yaXRhdGl2ZSBkZWZpbml0aW9uIG9mIHRoZSBwb2ludCByZWNvcmQuXG5cbi8vICMjIFBvaW50IE1vZGVsIFVyaVxuLy8gUG9pbnRzIGFyZSBzdG9yZWQgaW4gQ291Y2hEQi4gQ291Y2hEQiBkb2N1bWVudHMgY2FuIGhhdmUgcmljaCBpZCBzdHJpbmdzXG4vLyB0byBoZWxwIHN0b3JlIGFuZCBhY2Nlc3MgZGF0YSB3aXRob3V0IE1hcFJlZHVjZSBqb2JzLlxuLy9cbi8vIFRoZSBwb2ludCBtb2RlbCB1cmkgaXMgY29tcG9zZWQgb2YgZm91ciBwYXJ0czpcbi8vICAxLiBUaGUgc3RyaW5nICdwb2ludC8nYFxuLy8gIDIuIFRoZSB0eXBlIG9mIHBvaW50LCBlaXRoZXIgJ3NlcnZpY2UnIG9yICdhbGVydCdcbi8vICAzLiBUaGUgbm9ybWFsaXplZCAob3JpZ2luYWwpIG5hbWUgb2YgdGhlIHBvaW50XG4vLyAgNC4gVGhlIHBvaW50J3MgZ2VvaGFzaFxuZXhwb3J0IGNvbnN0IHBvaW50SWQgPSBkb2N1cmkucm91dGUoICdwb2ludC86dHlwZS86bmFtZS86Z2VvaGFzaCcgKTtcblxuY29uc3QgQ09NTUVOVF9NSU5fTEVOR1RIID0gMTtcbmNvbnN0IENPTU1FTlRfTUFYX0xFTkdUSCA9IDE0MDtcblxuZXhwb3J0IGNvbnN0IFBvaW50ID0gQ291Y2hNb2RlbC5leHRlbmQoIHtcbiAgaWRBdHRyaWJ1dGU6ICdfaWQnLFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIENvdWNoTW9kZWwucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICBcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIHRoaXMuc2V0KCB7XG4gICAgICBjcmVhdGVkX2F0OiBkYXRlLFxuICAgICAgdXBkYXRlZF9hdDogZGF0ZSxcbiAgICB9ICk7XG5cbiAgICB0aGlzLmNvdmVyQmxvYiA9IGZhbHNlO1xuICAgIHRoaXMuY292ZXJVcmwgPSBmYWxzZTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0KCAndXBkYXRlZF9hdCcsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSApO1xuICB9LFxuXG4gIC8vICMjIFNwZWNpZnlcbiAgLy8gRmlsbCBpbiBgX2lkYCBmcm9tIHRoZSBjb21wb25lbnRzIG9mIHRoZSBwb2ludCBtb2RlbCB1cmkuXG4gIC8vIFB1bGwgdmFsdWVzIGZyb20gYGF0dHJpYnV0ZXNgIGlmIG5hbWUgYW5kIGxvY2F0aW9uIGFyZSB1bmRlZmluZWQuXG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCB0eXBlLCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICAvLyBPbmx5IHNldCB0aGUgSUQgYXR0cmlidXRlIGhlcmUgaWYgaXQgd2Fzbid0IGFscmVhZHkgc2V0LlxuICAgIC8vIFRoZSBvcmlnaW5hbCBJRCBzdGF5cyB0aGUgSUQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgcG9pbnQuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmF0dHJpYnV0ZXMuX2lkID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgIGNvbnN0IFtsYXQsIGxuZ10gPSBsb2NhdGlvbjtcbiAgICAgICAgY29uc3QgX2lkID0gcG9pbnRJZCgge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgbmFtZTogbm9ybWFsaXplKCBuYW1lICksXG4gICAgICAgICAgZ2VvaGFzaDogbmdlb2hhc2guZW5jb2RlKCBsYXQsIGxuZyApXG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5zZXQoIHsgX2lkLCB0eXBlLCBuYW1lLCBsb2NhdGlvbiB9ICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7bmFtZSwgbG9jYXRpb259ID0gdGhpcy5hdHRyaWJ1dGVzO1xuICAgICAgICBjb25zdCBbbGF0LCBsbmddID0gbG9jYXRpb247XG4gICAgICAgIGNvbnN0IF9pZCA9IHBvaW50SWQoIHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIG5hbWU6IG5vcm1hbGl6ZSggbmFtZSApLFxuICAgICAgICAgIGdlb2hhc2g6IG5nZW9oYXNoLmVuY29kZSggbGF0LCBsbmcgKVxuICAgICAgICB9ICk7XG4gICAgICAgIHRoaXMuc2V0KCB7IF9pZCB9ICk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vICMjIFNhZmVndWFyZCBmb3IgUG9pbnRzXG4gIC8vIFBvaW50cyBoYXZlIGltYWdlIGF0dGFjaG1lbnRzLCBzbyB3ZSBzaG91bGQgbGV0IGJhY2tib25lIHBvdWNoIGhhbmRsZVxuICAvLyB0aG9zZSBhbmQgd2Ugc2hvdWxkIG5vdCB2YWxpZGF0ZSB0aGUgX2F0dGFjaG1lbnRzIGtleVxuICBzYWZlZ3VhcmQ6IFtcbiAgICAnX2F0dGFjaG1lbnRzJ1xuICBdLFxuXG4gIGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmxhZ2dlZF9ieTogW10sXG4gICAgICB1cGRhdGVkX2J5OiAndW5rbm93bicsXG4gICAgICBjb21tZW50czogW10sXG4gICAgICBpc19oaWRkZW46IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBzY2hlbWE6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgbmFtZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIG1pbkl0ZW1zOiAyLFxuICAgICAgICBtYXhJdGVtczogMixcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdHlwZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGNyZWF0ZWRfYXQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkX2F0OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICB9LFxuICAgICAgdXBkYXRlZF9ieToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIH0sXG4gICAgICBmbGFnZ2VkX2J5OntcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgdXNlcjoge3R5cGU6ICdzdHJpbmcnfSxcbiAgICAgICAgICAgIHJlYXNvbjoge3R5cGU6ICdzdHJpbmcnLCBtaW5MZW5ndGg6IENPTU1FTlRfTUlOX0xFTkdUSCwgbWF4TGVuZ3RoOiBDT01NRU5UX01BWF9MRU5HVEh9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlcXVpcmVkOiBbXG4gICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICAncmVhc29uJ1xuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGlzX2hpZGRlbjp7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgfSxcbiAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgY29tbWVudHM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGU6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAnbWluTGVuZ3RoJzogQ09NTUVOVF9NSU5fTEVOR1RILFxuICAgICAgICAgICAgICAnbWF4TGVuZ3RoJzogQ09NTUVOVF9NQVhfTEVOR1RIXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmF0aW5nOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgICAgbWluaW11bTogMSxcbiAgICAgICAgICAgICAgbWF4aW11bTogNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHV1aWQ6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcXVpcmVkOiBbXG4gICAgICAgICAgICAndXNlcicsXG4gICAgICAgICAgICAnZGF0ZScsXG4gICAgICAgICAgICAndGV4dCcsXG4gICAgICAgICAgICAncmF0aW5nJyxcbiAgICAgICAgICAgICd1dWlkJ1xuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICduYW1lJyxcbiAgICAgICdsb2NhdGlvbicsXG4gICAgICAndHlwZScsXG4gICAgICAnY3JlYXRlZF9hdCcsXG4gICAgICAndXBkYXRlZF9hdCcsXG4gICAgICAndXBkYXRlZF9ieScsXHQvKiBBZGRlZDogVG8gYXR0YWNoIHBvaW50cyB0byB1c2VycyB2aWEgdGhlaXIgX2lkICovXG4gICAgICAnZmxhZ2dlZF9ieScsXG4gICAgICAnaXNfaGlkZGVuJyxcbiAgICAgICdjb21tZW50cydcbiAgICBdXG4gIH0sXG5cbiAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgIENvdWNoTW9kZWwucHJvdG90eXBlLmNsZWFyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICB0aGlzLmNvdmVyVXJsID0gZmFsc2U7XG4gIH0sXG5cbiAgLy8gIyMgRmV0Y2hcbiAgLy8gV2hlbiBmZXRjaGluZyBhIHBvaW50LCBzaG91bGQgaXQgaGF2ZSBhIGNvdmVyIGF0dGFjaG1lbnQsIGV4dGVuZCB0aGVcbiAgLy8gcHJvbWlzZSB0byBmZXRjaCB0aGUgYXR0YWNobWVudCBhbmQgc2V0IGB0aGlzLmNvdmVyVXJsYC5cbiAgZmV0Y2g6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBDb3VjaE1vZGVsLnByb3RvdHlwZS5mZXRjaC5hcHBseSggdGhpcywgYXJndW1lbnRzICkudGhlbiggcmVzID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdldENvdmVyKCByZXMgKTtcbiAgICB9ICk7XG4gIH0sXG5cbiAgLy8gIyBHZXQgQ292ZXJcbiAgLy8gU2hvdWxkIGEgcG9pbnQgKGFscmVhZHkgZmV0Y2hlZCkgaGF2ZSBhIGNvdmVyIGF0dGFjaG1lbnQsIGdldCB0aGVcbiAgLy8gYXR0YWNobWVudCdzIGRhdGEgYW5kIHN0b3JlIGFuIG9iamVjdCB1cmwgZm9yIGl0IGluIGB0aGlzLmNvdmVyVXJsYFxuICAvL1xuICAvLyBBcyBhIHV0aWxpdHkgdG8gY2xpZW50IGZ1bmN0aW9ucywgcmVzb2x2ZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byB0aGVcbiAgLy8gc2luZ2xlIGFyZ3VtZW50IHBhc3NlZCB0byBgZ2V0Q292ZXJgLlxuICBnZXRDb3ZlcjogZnVuY3Rpb24oIHJldCApIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbiggKCApID0+IHtcbiAgICAgIGNvbnN0IGhhc0NvdmVyID0gaW5jbHVkZXMoIHRoaXMuYXR0YWNobWVudHMoKSwgJ2NvdmVyLnBuZycgKTtcbiAgICAgIGlmICggYnJvd3NlciAmJiBoYXNDb3ZlciApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNobWVudCggJ2NvdmVyLnBuZycgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9ICkudGhlbiggYmxvYiA9PiB7XG4gICAgICBpZiAoIGJsb2IgKSB7XG4gICAgICAgIHRoaXMuY292ZXJCbG9iID0gYmxvYjtcbiAgICAgICAgdGhpcy5jb3ZlclVybCA9IGNyZWF0ZU9iamVjdFVSTCggYmxvYiApO1xuICAgICAgfVxuICAgIH0gKS50aGVuKCAoICkgPT4ge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9ICk7XG4gIH0sXG5cbiAgLy8gIyMgU2V0IENvdmVyXG4gIC8vIElmIHRoZSB1c2VyIGFscmVhZHkgaGFzIGEgY292ZXIgYmxvYiBhbmQgdGhleSB3YW50IHRvIHVzZSBpdCB3aXRoIHRoZVxuICAvLyBtb2RlbCBiZWZvcmUgYXR0YWNoKCkgY2FuIGZpbmlzaCBzdG9yaW5nIGl0IHRvIFBvdWNoREIsIHRoZXkgY2FuIHVzZVxuICAvLyB0aGlzIG1ldGhvZCB0byBtYW51YWxseSBpbnNlcnQgaXQuXG4gIC8vXG4gIC8vIFRoZSBhc3NvY2lhdGVkIG9iamVjdCB1cmwgZm9yIHRoZSBibG9iIHdpbGwgdGhlbiBiZSBhdmFpbGFibGUgdG8gb3RoZXJcbiAgLy8gZnVuY3Rpb25zIGxpa2Ugc3RvcmUoKS5cbiAgc2V0Q292ZXI6IGZ1bmN0aW9uKCBibG9iICkge1xuICAgIHRoaXMuY292ZXJCbG9iID0gYmxvYjtcbiAgICBpZiAoIGJyb3dzZXIgKSB7XG4gICAgICB0aGlzLmNvdmVyVXJsID0gY3JlYXRlT2JqZWN0VVJMKCBibG9iICk7XG4gICAgfVxuICB9LFxuXG4gIC8vICMjIEdldCBSZWR1eCBSZXByZXNlbnRhdGlvblxuICAvLyBSZXR1cm4gYSBuZXN0ZWQgb2JqZWN0L2FyYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBzdWl0YWJsZSBmb3JcbiAgLy8gdXNlIHdpdGggcmVkdXguXG4gIHN0b3JlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geyAuLi50aGlzLnRvSlNPTigpLCBjb3ZlclVybDogdGhpcy5jb3ZlclVybCB9O1xuICB9XG59LCB7XG4gIHVyaTogcG9pbnRJZCxcblxuICBmb3I6IGlkID0+IHtcbiAgICBjb25zdCBwb2ludElkQ29tcG9uZW50cyA9IHBvaW50SWQoIGlkICk7XG4gICAgY29uc3QgdHlwZSA9IHBvaW50SWRDb21wb25lbnRzLnR5cGU7XG4gICAgaWYgKCB0eXBlID09PSAnc2VydmljZScgKSB7XG4gICAgICByZXR1cm4gbmV3IFNlcnZpY2UoIHsgX2lkOiBpZCB9ICk7XG4gICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ2FsZXJ0JyApIHtcbiAgICAgIHJldHVybiBuZXcgQWxlcnQoIHsgX2lkOiBpZCB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdBIHBvaW50IG11c3QgYmUgYSBzZXJ2aWNlIG9yIGFsZXJ0JztcbiAgICB9XG4gIH1cbn0gKTtcblxuLy8gIyBTZXJ2aWNlIE1vZGVsXG4vLyBBIHNlcnZpY2UgaXMgYSBidWlzbmVzcyBvciBwb2ludCBvZiBpbnRlcmVzdCB0byBhIGN5Y2xpc3QuIEEgY3ljbGlzdCBuZWVkc1xuLy8gdG8ga25vdyB3aGVyZSB0aGV5IHdhbnQgdG8gc3RvcCB3ZWxsIGluIGFkdmFuY2Ugb2YgdGhlaXIgdHJhdmVsIHRocm91Z2ggYW5cbi8vIGFyZWEuIFRoZSBzZXJ2aWNlIHJlY29yZCBtdXN0IGNvbnRhaW4gZW5vdWdoIGluZm9ybWF0aW9uIHRvIGhlbHAgdGhlIGN5Y2xpc3Rcbi8vIG1ha2Ugc3VjaCBkZWNpc2lvbnMuXG4vL1xuLy8gVGhlIHJlY29yZCBpbmNsdWRlcyBjb250YWN0IGluZm9ybWF0aW9uLCBhbmQgYSBzY2hlZHVsZSBvZiBob3VycyBvZlxuLy8gb3BlcmF0aW9uLiBJdCBpcyBpbXBvcnRhbnQgdGhhdCB3ZSBzdG9yZSB0aGUgdGltZSB6b25lIG9mIGEgc2VydmljZSwgc2luY2Vcbi8vIHRvdXJpbmcgY3ljbGlzdHMgd2lsbCBjcm9zcyB0aW1lIHpvbmVzIG9uIHRoZWlyIHRyYXZlbHMuIEZ1cnRoZXJtb3JlLFxuLy8gc2VydmljZXMgb2YgaW50ZXJlc3QgdG8gdG91cmluZyBjeWNsaXN0cyBtYXkgYmUgc2Vhc29uYWw6IHdlIHN0b3JlXG4vLyBzY2hlZHVsZXMgZm9yIGRpZmZlcmVudCBzZWFzb25zLlxuXG4vLyAjIyBTZXJ2aWNlIFR5cGVzXG4vLyBBIFNlcnZpY2UgbWF5IGhhdmUgYSBzaW5nbGUgdHlwZSwgaW5kaWNhdGluZyB0aGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoZVxuLy8gYnVpc25lc3Mgb3IgcG9pbnQgb2YgaW50ZXJlc3QuIFNlcnZpY2UgdHlwZXMgbWF5IGFsc28gYmUgaW5jbHVkZWQgaW4gYVxuLy8gU2VydmljZSdzIGFtZW5pdGllcyBhcnJheS5cblxuLyplc2ZtdC1pZ25vcmUtc3RhcnQqL1xuZXhwb3J0IGNvbnN0IHNlcnZpY2VUeXBlcyA9IHtcbiAgJ2FpcnBvcnQnOiB7IGRpc3BsYXk6ICdBaXJwb3J0JyB9LFxuICAnYmFyJzogeyBkaXNwbGF5OiAnQmFyJyB9LFxuICAnYmVkX2FuZF9icmVha2Zhc3QnOiB7IGRpc3BsYXk6ICdCZWQgJiBCcmVha2Zhc3QnIH0sXG4gICdiaWtlX3Nob3AnOiB7IGRpc3BsYXk6ICdCaWtlIFNob3AnIH0sXG4gICdjYWJpbic6IHsgZGlzcGxheTogJ0NhYmluJyB9LFxuICAnY2FtcGdyb3VuZCc6IHsgZGlzcGxheTogJ0NhbXBncm91bmQnIH0sXG4gICdjb252ZW5pZW5jZV9zdG9yZSc6IHsgZGlzcGxheTogJ0NvbnZlbmllbmNlIFN0b3JlJyB9LFxuICAnY3ljbGlzdHNfY2FtcGluZyc6IHsgZGlzcGxheTogJ0N5Y2xpc3RzXFwnIENhbXBpbmcnIH0sXG4gICdjeWNsaXN0c19sb2RnaW5nJzogeyBkaXNwbGF5OiAnQ3ljbGlzdHNcXCcgTG9kZ2luZycgfSxcbiAgJ2dyb2NlcnknOiB7IGRpc3BsYXk6ICdHcm9jZXJ5JyB9LFxuICAnaG9zdGVsJzogeyBkaXNwbGF5OiAnSG9zdGVsJyB9LFxuICAnaG90X3NwcmluZyc6IHsgZGlzcGxheTogJ0hvdCBTcHJpbmcnIH0sXG4gICdob3RlbCc6IHsgZGlzcGxheTogJ0hvdGVsJyB9LFxuICAnbW90ZWwnOiB7IGRpc3BsYXk6ICdNb3RlbCcgfSxcbiAgJ2luZm9ybWF0aW9uJzogeyBkaXNwbGF5OiAnSW5mb3JtYXRpb24nIH0sXG4gICdsaWJyYXJ5JzogeyBkaXNwbGF5OiAnTGlicmFyeScgfSxcbiAgJ211c2V1bSc6IHsgZGlzcGxheTogJ011c2V1bScgfSxcbiAgJ291dGRvb3Jfc3RvcmUnOiB7IGRpc3BsYXk6ICdPdXRkb29yIFN0b3JlJyB9LFxuICAncmVzdF9hcmVhJzogeyBkaXNwbGF5OiAnUmVzdCBBcmVhJyB9LFxuICAncmVzdGF1cmFudCc6IHsgZGlzcGxheTogJ1Jlc3RhdXJhbnQnIH0sXG4gICdyZXN0cm9vbSc6IHsgZGlzcGxheTogJ1Jlc3Ryb29tJyB9LFxuICAnc2NlbmljX2FyZWEnOiB7IGRpc3BsYXk6ICdTY2VuaWMgQXJlYScgfSxcbiAgJ3N0YXRlX3BhcmsnOiB7IGRpc3BsYXk6ICdTdGF0ZSBQYXJrJyB9LFxuICAnb3RoZXInOiB7IGRpc3BsYXk6ICdPdGhlcicgfVxufTtcbi8qZXNmbXQtaWdub3JlLWVuZCovXG5cbmV4cG9ydCBjb25zdCBTZXJ2aWNlID0gUG9pbnQuZXh0ZW5kKCB7XG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICBQb2ludC5wcm90b3R5cGUuc3BlY2lmeS5jYWxsKCB0aGlzLCAnc2VydmljZScsIG5hbWUsIGxvY2F0aW9uICk7XG4gIH0sXG5cbiAgZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5Qb2ludC5wcm90b3R5cGUuZGVmYXVsdHMuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApLFxuICAgICAgYW1lbml0aWVzOiBbXSxcbiAgICAgIHNjaGVkdWxlOiB7ICdkZWZhdWx0JzogW10gfSxcbiAgICAgIHNlYXNvbmFsOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgc2NoZW1hOiBtZXJnZVNjaGVtYXMoIFBvaW50LnByb3RvdHlwZS5zY2hlbWEsIHtcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB0eXBlOiB7XG4gICAgICAgIGVudW06IGtleXMoIHNlcnZpY2VUeXBlcyApXG4gICAgICB9LFxuICAgICAgYW1lbml0aWVzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZW51bToga2V5cyggc2VydmljZVR5cGVzIClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFkZHJlc3M6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBzY2hlZHVsZToge1xuICAgICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgfSxcbiAgICAgIHNlYXNvbmFsOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgfSxcbiAgICAgIHBob25lOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgd2Vic2l0ZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAndXJpJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWQ6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nIC8vIHRoZSB1cGRhdGVkIGF0dHJpYnV0ZSBpcyBub3QgcmVxdWlyZWRcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAnc2Vhc29uYWwnXG4gICAgXVxuICB9IClcbn0gKTtcblxuLy8gQXBwbHkgdGhlIHZhbGlkYXRpb24gbWl4aW4gdG8gdGhlIFNlcnZpY2UgbW9kZWwuIFNlZSB2YWxpZGF0aW9uLW1peGluLmpzLlxubWl4aW5WYWxpZGF0aW9uKCBTZXJ2aWNlICk7XG5cbi8vICMgQWxlcnQgTW9kZWxcbi8vIEFuIGFsZXJ0IGlzIHNvbWV0aGluZyB0aGF0IG1pZ2h0IGltcGVkZSBhIGN5Y2xpc3QncyB0b3VyLiBXaGVuIGEgY3ljbGlzdFxuLy8gc2VlcyBhbiBhbGVydCBvbiB0aGUgbWFwLCB0aGUga25vdyB0byBwbGFuIGFyb3VuZCBpdC5cblxuLyplc2ZtdC1pZ25vcmUtc3RhcnQqL1xuZXhwb3J0IGNvbnN0IGFsZXJ0VHlwZXMgPSB7XG4gICdyb2FkX2Nsb3N1cmUnOiB7IGRpc3BsYXk6ICdSb2FkIENsb3N1cmUnIH0sXG4gICdmb3Jlc3RfZmlyZSc6IHsgZGlzcGxheTogJ0ZvcmVzdCBmaXJlJyB9LFxuICAnZmxvb2RpbmcnOiB7IGRpc3BsYXk6ICdGbG9vZGluZycgfSxcbiAgJ2RldG91cic6IHsgZGlzcGxheTogJ0RldG91cicgfSxcbiAgJ290aGVyJzogeyBkaXNwbGF5OiAnT3RoZXInIH1cbn07XG4vKmVzZm10LWlnbm9yZS1lbmQqL1xuXG5leHBvcnQgY29uc3QgQWxlcnQgPSBQb2ludC5leHRlbmQoIHtcbiAgc3BlY2lmeTogZnVuY3Rpb24oIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIFBvaW50LnByb3RvdHlwZS5zcGVjaWZ5LmNhbGwoIHRoaXMsICdhbGVydCcsIG5hbWUsIGxvY2F0aW9uICk7XG4gIH0sXG5cbiAgc2NoZW1hOiBtZXJnZVNjaGVtYXMoIFBvaW50LnByb3RvdHlwZS5zY2hlbWEsIHtcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB0eXBlOiB7XG4gICAgICAgIGVudW06IGtleXMoIGFsZXJ0VHlwZXMgKVxuICAgICAgfVxuICAgIH1cbiAgfSApXG59ICk7XG5cbm1peGluVmFsaWRhdGlvbiggQWxlcnQgKTtcblxuLy8gIyBQb2ludCBDb2xsZWN0aW9uXG4vLyBBIGhldGVyb2dlbmVvdXMgY29sbGVjdGlvbiBvZiBzZXJ2aWNlcyBhbmQgYWxlcnRzLiBQb3VjaERCIGlzIGFibGUgdG8gZmV0Y2hcbi8vIHRoaXMgY29sbGVjdGlvbiBieSBsb29raW5nIGZvciBhbGwga2V5cyBzdGFydGluZyB3aXRoICdwb2ludC8nLlxuLy9cbi8vIEEgY29ubmVjdGVkIFBvaW50Q29sbGVjdGlvbiBtdXN0IGJlIGFibGUgdG8gZ2VuZXJhdGUgY29ubmVjdGVkIEFsZXJ0cyBvclxuLy8gU2VydmljZXMgb24gZGVtYW5kcy4gVGhlcmVmb3JlLCBpZiBQb2ludENvbGxlY3Rpb24gaXMgY29ubmVjdGVkLCBjb25uZWN0XG4vLyBtb2RlbHMgYmVmb3JlIHJldHVybmluZyB0aGVtLlxuZXhwb3J0IGNvbnN0IFBvaW50Q29sbGVjdGlvbiA9IENvdWNoQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oIG1vZGVscywgb3B0aW9ucyApIHtcbiAgICBDb3VjaENvbGxlY3Rpb24ucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5wb3VjaCA9IHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYWxsRG9jczogYXNzaWduKFxuICAgICAgICAgIHsgaW5jbHVkZV9kb2NzOiB0cnVlIH0sXG4gICAgICAgICAgb3B0aW9ucy5rZXlzID8geyBrZXlzOiBvcHRpb25zLmtleXMgfSA6IGtleXNCZXR3ZWVuKCAncG9pbnQvJyApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qge2Nvbm5lY3QsIGRhdGFiYXNlfSA9IHRoaXM7XG4gICAgdGhpcy5zZXJ2aWNlID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBTZXJ2aWNlICkgOiBTZXJ2aWNlO1xuICAgIHRoaXMuYWxlcnQgPSBjb25uZWN0ID8gY29ubmVjdCggZGF0YWJhc2UsIEFsZXJ0ICkgOiBBbGVydDtcbiAgfSxcblxuICAvLyBUaGlzIGhhbmRsZXMgdGhlIGBvcHRpb25zLmtleXNgIGVkZ2UgY2FzZXMgbGlzdGVkIGluIHRoZVxuICAvLyBbUG91Y2hEQiBhcGldKGh0dHBzOi8vcG91Y2hkYi5jb20vYXBpLmh0bWwjYmF0Y2hfZmV0Y2gpXG4gIHBhcnNlOiBmdW5jdGlvbiggcmVzcG9uc2UsIG9wdGlvbnMgKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnJvd3MuZmlsdGVyKFxuICAgICAgcm93ID0+ICEoIHJvdy5kZWxldGVkIHx8IHJvdy5lcnJvciApXG4gICAgKS5tYXAoXG4gICAgICByb3cgPT4gcm93LmRvY1xuICAgICk7XG4gIH0sXG5cbiAgbW9kZWw6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIGNvbnN0IHBvaW50SWRDb21wb25lbnRzID0gcG9pbnRJZCggYXR0cmlidXRlcy5faWQgKTtcbiAgICBjb25zdCB0eXBlID0gcG9pbnRJZENvbXBvbmVudHMudHlwZTtcbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAnc2VydmljZSc6IG9wdGlvbnMuY29sbGVjdGlvbi5zZXJ2aWNlLFxuICAgICAgJ2FsZXJ0Jzogb3B0aW9ucy5jb2xsZWN0aW9uLmFsZXJ0XG4gICAgfTtcbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9IG1hcFsgdHlwZSBdO1xuICAgIGlmICggY29uc3RydWN0b3IgKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBjb25zdHJ1Y3RvciggYXR0cmlidXRlcywgb3B0aW9ucyApO1xuXG4gICAgICBpZiAoIG9wdGlvbnMuZGVpbmRleCAmJiBpbnN0YW5jZS5oYXMoICdpbmRleCcgKSApIHtcbiAgICAgICAgaW5zdGFuY2UuaW5kZXggPSBpbnN0YW5jZS5nZXQoICdpbmRleCcgKTtcbiAgICAgICAgaW5zdGFuY2UudW5zZXQoICdpbmRleCAnICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ0EgcG9pbnQgbXVzdCBiZSBhIHNlcnZpY2Ugb3IgYWxlcnQnO1xuICAgIH1cbiAgfSxcblxuICAvLyAjIyBGZXRjaCBDb3ZlciBJbWFnZXMgZm9yIGFsbCBQb2ludHNcbiAgLy8gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGFsbCBwb2ludHMgaW4gdGhlIGFycmF5IGhhdmVcbiAgLy8gdGhlaXIgY292ZXIgaW1hZ2VzIGF2YWlsYWJsZS5cbiAgZ2V0Q292ZXJzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoIHRoaXMubW9kZWxzLm1hcCggcG9pbnQgPT4gcG9pbnQuZ2V0Q292ZXIoKSApICk7XG4gIH0sXG5cbiAgLy8gIyMgR2V0IFJlZHV4IFJlcHJlc2VudGF0aW9uXG4gIC8vIFJldHVybiBhIG5lc3RlZCBvYmplY3QvYXJhcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbGxlY3Rpb24gc3VpdGFibGUgZm9yXG4gIC8vIHVzZSB3aXRoIHJlZHV4LlxuICBzdG9yZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZyb21QYWlycyggdGhpcy5tb2RlbHMubWFwKCBwb2ludCA9PiBbIHBvaW50LmlkLCBwb2ludC5zdG9yZSgpIF0gKSApO1xuICB9XG59ICk7XG5cbi8vICMgRGlzcGxheSBOYW1lIGZvciBUeXBlXG4vLyBHaXZlbiBhIHR5cGUga2V5IGZyb20gZWl0aGVyIHRoZSBzZXJ2aWNlIG9yIGFsZXJ0IHR5cGUgZW51bWVyYXRpb25zLFxuLy8gcmV0dXJuIHRoZSB0eXBlJ3MgZGlzcGxheSBzdHJpbmcsIG9yIG51bGwgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGxheSggdHlwZSApIHtcbiAgY29uc3QgdmFsdWVzID0gc2VydmljZVR5cGVzWyB0eXBlIF0gfHwgYWxlcnRUeXBlc1sgdHlwZSBdO1xuICBpZiAoIHZhbHVlcyApIHtcbiAgICByZXR1cm4gdmFsdWVzLmRpc3BsYXk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==