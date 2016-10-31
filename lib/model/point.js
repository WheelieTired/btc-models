'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommentCollection = exports.Comment = exports.PointCollection = exports.Alert = exports.alertTypes = exports.Service = exports.serviceTypes = exports.Point = undefined;

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
var pointId = _docuri2.default.route('point/:type/:name/:geohash');

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
    var _pointId = pointId(id);

    var type = _pointId.type;

    if (type === 'service') {
      return new Service({ _id: id });
    } else if (type === 'alert') {
      return new Alert({ _id: id });
    } else {
      throw 'A point must either be a service or alert';
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
// This also has the effect of fetching comments for points. TODO: handle
// `Comment` in the model function.
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
    var parts = pointId(attributes._id);
    var map = {
      'service': options.collection.service,
      'alert': options.collection.alert
    };
    var constructor = map[parts.type];
    if (constructor) {
      var instance = new constructor(attributes, options);

      if (options.deindex && instance.has('index')) {
        instance.index = instance.get('index');
        instance.unset('index ');
      }

      return instance;
    } else {
      throw 'A point must be either a service or alert';
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

// # Comment Model
// Information about alerts and services encountered by cyclists is likely
// to change with the seasons or other reasons. Cyclists planning the next leg
// of a tour should be able to read the experiences of cyclists ahead of them.
//
// A comment must have both a rating and the text of the comment. Comments are
// limited to 140 characters to ensure they do not devolve into general alert
// or service information that should really be in the description. We really
// want users of the Bicycle Touring Companion to provide comments verifying
// info about points, or letting other cyclists know about changes in the
// service or alert.

// ## Comment Model Uri
// Comments are stored in CouchDB in the same database as points. The comment
// model uri is composed of three parts:
//  1. The entire id of the related point
//  2. The string 'comment/'
//  3. A time based UUID to uniquely identify comments
//
// We don't use `docuri` for the comment model uris because we don't have to
// parse them.

var COMMENT_MAX_LENGTH = 140;
var Comment = exports.Comment = _base.CouchModel.extend({
  idAttribute: '_id',

  // ## Constructor
  // Generate `_id`. `pointId` must be specified in options.
  constructor: function constructor(attributes, options) {
    options = options || {};
    if (!attributes.uuid) {
      attributes.uuid = _nodeUuid2.default.v1();
    }
    if (!attributes._id && options.pointId) {
      attributes._id = options.pointId + '/comment/' + attributes.uuid;
    }
    _base.CouchModel.apply(this, arguments);
  },

  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      text: {
        'type': 'string',
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
    required: ['text', 'rating', 'uuid']
  }
}, {
  MAX_LENGTH: COMMENT_MAX_LENGTH
});

(0, _validationMixin.mixinValidation)(Comment);

// # Comment Collection
// Fetch only comments associated with a given point.
var CommentCollection = exports.CommentCollection = _base.CouchCollection.extend({
  initialize: function initialize(models, options) {
    _base.CouchCollection.prototype.initialize.apply(this, arguments);
    var pointId = this.pointId = options.pointId;

    var connect = this.connect;
    var database = this.database;
    this.comment = connect ? connect(database, Comment) : Comment;

    this.pouch = {
      options: {
        allDocs: _extends({}, (0, _base.keysBetween)(pointId + '/comment'), {
          include_docs: true
        })
      }
    };
  },

  model: function model(attributes, options) {
    var _options$collection = options.collection;
    var comment = _options$collection.comment;
    var pointId = _options$collection.pointId;

    return new comment(attributes, _extends({ pointId: pointId }, options));
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwiY292ZXJCbG9iIiwiY292ZXJVcmwiLCJ1cGRhdGUiLCJzcGVjaWZ5IiwidHlwZSIsIm5hbWUiLCJsb2NhdGlvbiIsIl9pZCIsImxhdCIsImxuZyIsImdlb2hhc2giLCJlbmNvZGUiLCJzYWZlZ3VhcmQiLCJkZWZhdWx0cyIsImZsYWciLCJ1cGRhdGVkX2J5Iiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwibWluSXRlbXMiLCJtYXhJdGVtcyIsIml0ZW1zIiwiZm9ybWF0IiwiZGVzY3JpcHRpb24iLCJyZXF1aXJlZCIsImNsZWFyIiwiZmV0Y2giLCJ0aGVuIiwiZ2V0Q292ZXIiLCJyZXMiLCJyZXQiLCJyZXNvbHZlIiwiaGFzQ292ZXIiLCJhdHRhY2htZW50cyIsImF0dGFjaG1lbnQiLCJibG9iIiwic2V0Q292ZXIiLCJzdG9yZSIsInRvSlNPTiIsInVyaSIsImZvciIsImlkIiwiU2VydmljZSIsIkFsZXJ0Iiwic2VydmljZVR5cGVzIiwiY2FsbCIsImFtZW5pdGllcyIsInNjaGVkdWxlIiwic2Vhc29uYWwiLCJlbnVtIiwiYWRkcmVzcyIsInBob25lIiwid2Vic2l0ZSIsInVwZGF0ZWQiLCJhbGVydFR5cGVzIiwiUG9pbnRDb2xsZWN0aW9uIiwibW9kZWxzIiwicG91Y2giLCJhbGxEb2NzIiwiaW5jbHVkZV9kb2NzIiwia2V5cyIsImNvbm5lY3QiLCJkYXRhYmFzZSIsInNlcnZpY2UiLCJhbGVydCIsInBhcnNlIiwicmVzcG9uc2UiLCJyb3dzIiwiZmlsdGVyIiwicm93IiwiZGVsZXRlZCIsImVycm9yIiwibWFwIiwiZG9jIiwibW9kZWwiLCJwYXJ0cyIsImNvbGxlY3Rpb24iLCJjb25zdHJ1Y3RvciIsImluc3RhbmNlIiwiZGVpbmRleCIsImhhcyIsImluZGV4IiwiZ2V0IiwidW5zZXQiLCJnZXRDb3ZlcnMiLCJhbGwiLCJwb2ludCIsInZhbHVlcyIsIkNPTU1FTlRfTUFYX0xFTkdUSCIsIkNvbW1lbnQiLCJ1dWlkIiwidjEiLCJ0ZXh0IiwicmF0aW5nIiwibWluaW11bSIsIm1heGltdW0iLCJNQVhfTEVOR1RIIiwiQ29tbWVudENvbGxlY3Rpb24iLCJjb21tZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7eXBCQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBMmJnQkEsTyxHQUFBQSxPOztBQXhhaEI7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1DLFVBQVksT0FBT0MsTUFBUCxLQUFrQixXQUFwQzs7QUFFQSxJQUFJQyxVQUFVQyxRQUFRLGtCQUFSLENBQWQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLFVBQVUsaUJBQU9DLEtBQVAsQ0FBYyw0QkFBZCxDQUFoQjs7QUFFTyxJQUFNQyx3QkFBUSxpQkFBV0MsTUFBWCxDQUFtQjtBQUN0Q0MsZUFBYSxLQUR5Qjs7QUFHdENDLGNBQVksb0JBQVVDLFVBQVYsRUFBc0JDLE9BQXRCLEVBQWdDO0FBQzFDLHFCQUFXQyxTQUFYLENBQXFCSCxVQUFyQixDQUFnQ0ksS0FBaEMsQ0FBdUMsSUFBdkMsRUFBNkNDLFNBQTdDOztBQUVBLFFBQU1DLE9BQU8sSUFBSUMsSUFBSixHQUFXQyxXQUFYLEVBQWI7QUFDQSxTQUFLQyxHQUFMLENBQVU7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bnRlbnQiOlsiLyogYnRjLWFwcC1zZXJ2ZXIgLS0gU2VydmVyIGZvciB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvblxuICogQ29weXJpZ2h0IMKpIDIwMTYgQWR2ZW50dXJlIEN5Y2xpbmcgQXNzb2NpYXRpb25cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBidGMtYXBwLXNlcnZlci5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEZvb2Jhci4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgeyBtaXhpblZhbGlkYXRpb24sIG1lcmdlU2NoZW1hcyB9IGZyb20gJy4vdmFsaWRhdGlvbi1taXhpbic7XG5pbXBvcnQgeyBDb3VjaE1vZGVsLCBDb3VjaENvbGxlY3Rpb24sIGtleXNCZXR3ZWVuIH0gZnJvbSAnLi9iYXNlJztcblxuaW1wb3J0IHsga2V5cywgZnJvbVBhaXJzLCBpbmNsdWRlcywgYXNzaWduIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGNyZWF0ZU9iamVjdFVSTCB9IGZyb20gJ2Jsb2ItdXRpbCc7XG5cbmltcG9ydCBkb2N1cmkgZnJvbSAnZG9jdXJpJztcbmltcG9ydCBuZ2VvaGFzaCBmcm9tICduZ2VvaGFzaCc7XG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ3RvLWlkJztcbmltcG9ydCB1dWlkIGZyb20gJ25vZGUtdXVpZCc7XG5cbmNvbnN0IGJyb3dzZXIgPSAoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICk7XG5cbnZhciBQcm9taXNlID0gcmVxdWlyZSgncG9seWZpbGwtcHJvbWlzZScpO1xuXG4vLyAjIFBvaW50IE1vZGVsXG4vLyBUaGUgcG9pbnQgcmVwcmVzZW50cyBhIGxvY2F0aW9uIG9uIHRoZSBtYXAgd2l0aCBhc3NvY2lhdGVkIG1ldGFkYXRhLCBnZW9kYXRhLFxuLy8gYW5kIHVzZXIgcHJvdmlkZWQgZGF0YS4gVGhlIHBvaW50IGlzIHRoZSBiYXNlIHNoYXJlZCBieSBzZXJ2aWNlcyBhbmQgYWxlcnRzLlxuLy9cbi8vIFRoZSBKU09OIHNjaGVtYSBzdG9yZWQgaW4gYFBvaW50YCwgYW5kIGFzIHBhdGNoZWQgYnkgYFNlcnZpY2VgIGFuZCBgQWxlcnRgLFxuLy8gaXMgdGhlIGF1dGhvcml0YXRpdmUgZGVmaW5pdGlvbiBvZiB0aGUgcG9pbnQgcmVjb3JkLlxuXG4vLyAjIyBQb2ludCBNb2RlbCBVcmlcbi8vIFBvaW50cyBhcmUgc3RvcmVkIGluIENvdWNoREIuIENvdWNoREIgZG9jdW1lbnRzIGNhbiBoYXZlIHJpY2ggaWQgc3RyaW5nc1xuLy8gdG8gaGVscCBzdG9yZSBhbmQgYWNjZXNzIGRhdGEgd2l0aG91dCBNYXBSZWR1Y2Ugam9icy5cbi8vXG4vLyBUaGUgcG9pbnQgbW9kZWwgdXJpIGlzIGNvbXBvc2VkIG9mIGZvdXIgcGFydHM6XG4vLyAgMS4gVGhlIHN0cmluZyAncG9pbnQvJ2Bcbi8vICAyLiBUaGUgdHlwZSBvZiBwb2ludCwgZWl0aGVyICdzZXJ2aWNlJyBvciAnYWxlcnQnXG4vLyAgMy4gVGhlIG5vcm1hbGl6ZWQgKG9yaWdpbmFsKSBuYW1lIG9mIHRoZSBwb2ludFxuLy8gIDQuIFRoZSBwb2ludCdzIGdlb2hhc2hcbmNvbnN0IHBvaW50SWQgPSBkb2N1cmkucm91dGUoICdwb2ludC86dHlwZS86bmFtZS86Z2VvaGFzaCcgKTtcblxuZXhwb3J0IGNvbnN0IFBvaW50ID0gQ291Y2hNb2RlbC5leHRlbmQoIHtcbiAgaWRBdHRyaWJ1dGU6ICdfaWQnLFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIENvdWNoTW9kZWwucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICBcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIHRoaXMuc2V0KCB7XG4gICAgICBjcmVhdGVkX2F0OiBkYXRlLFxuICAgICAgdXBkYXRlZF9hdDogZGF0ZSxcbiAgICB9ICk7XG5cbiAgICB0aGlzLmNvdmVyQmxvYiA9IGZhbHNlO1xuICAgIHRoaXMuY292ZXJVcmwgPSBmYWxzZTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0KCAndXBkYXRlZF9hdCcsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSApO1xuICB9LFxuXG4gIC8vICMjIFNwZWNpZnlcbiAgLy8gRmlsbCBpbiBgX2lkYCBmcm9tIHRoZSBjb21wb25lbnRzIG9mIHRoZSBwb2ludCBtb2RlbCB1cmkuXG4gIC8vIFB1bGwgdmFsdWVzIGZyb20gYGF0dHJpYnV0ZXNgIGlmIG5hbWUgYW5kIGxvY2F0aW9uIGFyZSB1bmRlZmluZWQuXG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCB0eXBlLCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICAvLyBPbmx5IHNldCB0aGUgSUQgYXR0cmlidXRlIGhlcmUgaWYgaXQgd2Fzbid0IGFscmVhZHkgc2V0LlxuICAgIC8vIFRoZSBvcmlnaW5hbCBJRCBzdGF5cyB0aGUgSUQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgcG9pbnQuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmF0dHJpYnV0ZXMuX2lkID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgIGNvbnN0IFtsYXQsIGxuZ10gPSBsb2NhdGlvbjtcbiAgICAgICAgY29uc3QgX2lkID0gcG9pbnRJZCgge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgbmFtZTogbm9ybWFsaXplKCBuYW1lICksXG4gICAgICAgICAgZ2VvaGFzaDogbmdlb2hhc2guZW5jb2RlKCBsYXQsIGxuZyApXG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5zZXQoIHsgX2lkLCB0eXBlLCBuYW1lLCBsb2NhdGlvbiB9ICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7bmFtZSwgbG9jYXRpb259ID0gdGhpcy5hdHRyaWJ1dGVzO1xuICAgICAgICBjb25zdCBbbGF0LCBsbmddID0gbG9jYXRpb247XG4gICAgICAgIGNvbnN0IF9pZCA9IHBvaW50SWQoIHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIG5hbWU6IG5vcm1hbGl6ZSggbmFtZSApLFxuICAgICAgICAgIGdlb2hhc2g6IG5nZW9oYXNoLmVuY29kZSggbGF0LCBsbmcgKVxuICAgICAgICB9ICk7XG4gICAgICAgIHRoaXMuc2V0KCB7IF9pZCB9ICk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vICMjIFNhZmVndWFyZCBmb3IgUG9pbnRzXG4gIC8vIFBvaW50cyBoYXZlIGltYWdlIGF0dGFjaG1lbnRzLCBzbyB3ZSBzaG91bGQgbGV0IGJhY2tib25lIHBvdWNoIGhhbmRsZVxuICAvLyB0aG9zZSBhbmQgd2Ugc2hvdWxkIG5vdCB2YWxpZGF0ZSB0aGUgX2F0dGFjaG1lbnRzIGtleVxuICBzYWZlZ3VhcmQ6IFtcbiAgICAnX2F0dGFjaG1lbnRzJ1xuICBdLFxuXG4gIGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmxhZzogZmFsc2UsXG4gICAgICB1cGRhdGVkX2J5OiAndW5rbm93bidcbiAgICB9O1xuICB9LFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgbWluSXRlbXM6IDIsXG4gICAgICAgIG1heEl0ZW1zOiAyLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0eXBlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgY3JlYXRlZF9hdDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWRfYXQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkX2J5OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgfSxcbiAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgZmxhZzoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAnbmFtZScsXG4gICAgICAnbG9jYXRpb24nLFxuICAgICAgJ3R5cGUnLFxuICAgICAgJ2NyZWF0ZWRfYXQnLFxuICAgICAgJ3VwZGF0ZWRfYXQnLFxuICAgICAgJ3VwZGF0ZWRfYnknLFx0LyogQWRkZWQ6IFRvIGF0dGFjaCBwb2ludHMgdG8gdXNlcnMgdmlhIHRoZWlyIF9pZCAqL1xuICAgICAgJ2ZsYWcnXG4gICAgXVxuICB9LFxuXG4gIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBDb3VjaE1vZGVsLnByb3RvdHlwZS5jbGVhci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgdGhpcy5jb3ZlclVybCA9IGZhbHNlO1xuICB9LFxuXG4gIC8vICMjIEZldGNoXG4gIC8vIFdoZW4gZmV0Y2hpbmcgYSBwb2ludCwgc2hvdWxkIGl0IGhhdmUgYSBjb3ZlciBhdHRhY2htZW50LCBleHRlbmQgdGhlXG4gIC8vIHByb21pc2UgdG8gZmV0Y2ggdGhlIGF0dGFjaG1lbnQgYW5kIHNldCBgdGhpcy5jb3ZlclVybGAuXG4gIGZldGNoOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQ291Y2hNb2RlbC5wcm90b3R5cGUuZmV0Y2guYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApLnRoZW4oIHJlcyA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRDb3ZlciggcmVzICk7XG4gICAgfSApO1xuICB9LFxuXG4gIC8vICMgR2V0IENvdmVyXG4gIC8vIFNob3VsZCBhIHBvaW50IChhbHJlYWR5IGZldGNoZWQpIGhhdmUgYSBjb3ZlciBhdHRhY2htZW50LCBnZXQgdGhlXG4gIC8vIGF0dGFjaG1lbnQncyBkYXRhIGFuZCBzdG9yZSBhbiBvYmplY3QgdXJsIGZvciBpdCBpbiBgdGhpcy5jb3ZlclVybGBcbiAgLy9cbiAgLy8gQXMgYSB1dGlsaXR5IHRvIGNsaWVudCBmdW5jdGlvbnMsIHJlc29sdmUgdGhlIHJldHVybmVkIHByb21pc2UgdG8gdGhlXG4gIC8vIHNpbmdsZSBhcmd1bWVudCBwYXNzZWQgdG8gYGdldENvdmVyYC5cbiAgZ2V0Q292ZXI6IGZ1bmN0aW9uKCByZXQgKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oICggKSA9PiB7XG4gICAgICBjb25zdCBoYXNDb3ZlciA9IGluY2x1ZGVzKCB0aGlzLmF0dGFjaG1lbnRzKCksICdjb3Zlci5wbmcnICk7XG4gICAgICBpZiAoIGJyb3dzZXIgJiYgaGFzQ292ZXIgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dGFjaG1lbnQoICdjb3Zlci5wbmcnICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSApLnRoZW4oIGJsb2IgPT4ge1xuICAgICAgaWYgKCBibG9iICkge1xuICAgICAgICB0aGlzLmNvdmVyQmxvYiA9IGJsb2I7XG4gICAgICAgIHRoaXMuY292ZXJVcmwgPSBjcmVhdGVPYmplY3RVUkwoIGJsb2IgKTtcbiAgICAgIH1cbiAgICB9ICkudGhlbiggKCApID0+IHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSApO1xuICB9LFxuXG4gIC8vICMjIFNldCBDb3ZlclxuICAvLyBJZiB0aGUgdXNlciBhbHJlYWR5IGhhcyBhIGNvdmVyIGJsb2IgYW5kIHRoZXkgd2FudCB0byB1c2UgaXQgd2l0aCB0aGVcbiAgLy8gbW9kZWwgYmVmb3JlIGF0dGFjaCgpIGNhbiBmaW5pc2ggc3RvcmluZyBpdCB0byBQb3VjaERCLCB0aGV5IGNhbiB1c2VcbiAgLy8gdGhpcyBtZXRob2QgdG8gbWFudWFsbHkgaW5zZXJ0IGl0LlxuICAvL1xuICAvLyBUaGUgYXNzb2NpYXRlZCBvYmplY3QgdXJsIGZvciB0aGUgYmxvYiB3aWxsIHRoZW4gYmUgYXZhaWxhYmxlIHRvIG90aGVyXG4gIC8vIGZ1bmN0aW9ucyBsaWtlIHN0b3JlKCkuXG4gIHNldENvdmVyOiBmdW5jdGlvbiggYmxvYiApIHtcbiAgICB0aGlzLmNvdmVyQmxvYiA9IGJsb2I7XG4gICAgaWYgKCBicm93c2VyICkge1xuICAgICAgdGhpcy5jb3ZlclVybCA9IGNyZWF0ZU9iamVjdFVSTCggYmxvYiApO1xuICAgIH1cbiAgfSxcblxuICAvLyAjIyBHZXQgUmVkdXggUmVwcmVzZW50YXRpb25cbiAgLy8gUmV0dXJuIGEgbmVzdGVkIG9iamVjdC9hcmFyeSByZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgc3VpdGFibGUgZm9yXG4gIC8vIHVzZSB3aXRoIHJlZHV4LlxuICBzdG9yZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgLi4udGhpcy50b0pTT04oKSwgY292ZXJVcmw6IHRoaXMuY292ZXJVcmwgfTtcbiAgfVxufSwge1xuICB1cmk6IHBvaW50SWQsXG5cbiAgZm9yOiBpZCA9PiB7XG4gICAgY29uc3Qge3R5cGV9ID0gcG9pbnRJZCggaWQgKTtcbiAgICBpZiAoIHR5cGUgPT09ICdzZXJ2aWNlJyApIHtcbiAgICAgIHJldHVybiBuZXcgU2VydmljZSggeyBfaWQ6IGlkIH0gKTtcbiAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAnYWxlcnQnICkge1xuICAgICAgcmV0dXJuIG5ldyBBbGVydCggeyBfaWQ6IGlkIH0gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ0EgcG9pbnQgbXVzdCBlaXRoZXIgYmUgYSBzZXJ2aWNlIG9yIGFsZXJ0JztcbiAgICB9XG4gIH1cbn0gKTtcblxuLy8gIyBTZXJ2aWNlIE1vZGVsXG4vLyBBIHNlcnZpY2UgaXMgYSBidWlzbmVzcyBvciBwb2ludCBvZiBpbnRlcmVzdCB0byBhIGN5Y2xpc3QuIEEgY3ljbGlzdCBuZWVkc1xuLy8gdG8ga25vdyB3aGVyZSB0aGV5IHdhbnQgdG8gc3RvcCB3ZWxsIGluIGFkdmFuY2Ugb2YgdGhlaXIgdHJhdmVsIHRocm91Z2ggYW5cbi8vIGFyZWEuIFRoZSBzZXJ2aWNlIHJlY29yZCBtdXN0IGNvbnRhaW4gZW5vdWdoIGluZm9ybWF0aW9uIHRvIGhlbHAgdGhlIGN5Y2xpc3Rcbi8vIG1ha2Ugc3VjaCBkZWNpc2lvbnMuXG4vL1xuLy8gVGhlIHJlY29yZCBpbmNsdWRlcyBjb250YWN0IGluZm9ybWF0aW9uLCBhbmQgYSBzY2hlZHVsZSBvZiBob3VycyBvZlxuLy8gb3BlcmF0aW9uLiBJdCBpcyBpbXBvcnRhbnQgdGhhdCB3ZSBzdG9yZSB0aGUgdGltZSB6b25lIG9mIGEgc2VydmljZSwgc2luY2Vcbi8vIHRvdXJpbmcgY3ljbGlzdHMgd2lsbCBjcm9zcyB0aW1lIHpvbmVzIG9uIHRoZWlyIHRyYXZlbHMuIEZ1cnRoZXJtb3JlLFxuLy8gc2VydmljZXMgb2YgaW50ZXJlc3QgdG8gdG91cmluZyBjeWNsaXN0cyBtYXkgYmUgc2Vhc29uYWw6IHdlIHN0b3JlXG4vLyBzY2hlZHVsZXMgZm9yIGRpZmZlcmVudCBzZWFzb25zLlxuXG4vLyAjIyBTZXJ2aWNlIFR5cGVzXG4vLyBBIFNlcnZpY2UgbWF5IGhhdmUgYSBzaW5nbGUgdHlwZSwgaW5kaWNhdGluZyB0aGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoZVxuLy8gYnVpc25lc3Mgb3IgcG9pbnQgb2YgaW50ZXJlc3QuIFNlcnZpY2UgdHlwZXMgbWF5IGFsc28gYmUgaW5jbHVkZWQgaW4gYVxuLy8gU2VydmljZSdzIGFtZW5pdGllcyBhcnJheS5cblxuLyplc2ZtdC1pZ25vcmUtc3RhcnQqL1xuZXhwb3J0IGNvbnN0IHNlcnZpY2VUeXBlcyA9IHtcbiAgJ2FpcnBvcnQnOiB7IGRpc3BsYXk6ICdBaXJwb3J0JyB9LFxuICAnYmFyJzogeyBkaXNwbGF5OiAnQmFyJyB9LFxuICAnYmVkX2FuZF9icmVha2Zhc3QnOiB7IGRpc3BsYXk6ICdCZWQgJiBCcmVha2Zhc3QnIH0sXG4gICdiaWtlX3Nob3AnOiB7IGRpc3BsYXk6ICdCaWtlIFNob3AnIH0sXG4gICdjYWJpbic6IHsgZGlzcGxheTogJ0NhYmluJyB9LFxuICAnY2FtcGdyb3VuZCc6IHsgZGlzcGxheTogJ0NhbXBncm91bmQnIH0sXG4gICdjb252ZW5pZW5jZV9zdG9yZSc6IHsgZGlzcGxheTogJ0NvbnZlbmllbmNlIFN0b3JlJyB9LFxuICAnY3ljbGlzdHNfY2FtcGluZyc6IHsgZGlzcGxheTogJ0N5Y2xpc3RzXFwnIENhbXBpbmcnIH0sXG4gICdjeWNsaXN0c19sb2RnaW5nJzogeyBkaXNwbGF5OiAnQ3ljbGlzdHNcXCcgTG9kZ2luZycgfSxcbiAgJ2dyb2NlcnknOiB7IGRpc3BsYXk6ICdHcm9jZXJ5JyB9LFxuICAnaG9zdGVsJzogeyBkaXNwbGF5OiAnSG9zdGVsJyB9LFxuICAnaG90X3NwcmluZyc6IHsgZGlzcGxheTogJ0hvdCBTcHJpbmcnIH0sXG4gICdob3RlbCc6IHsgZGlzcGxheTogJ0hvdGVsJyB9LFxuICAnbW90ZWwnOiB7IGRpc3BsYXk6ICdNb3RlbCcgfSxcbiAgJ2luZm9ybWF0aW9uJzogeyBkaXNwbGF5OiAnSW5mb3JtYXRpb24nIH0sXG4gICdsaWJyYXJ5JzogeyBkaXNwbGF5OiAnTGlicmFyeScgfSxcbiAgJ211c2V1bSc6IHsgZGlzcGxheTogJ011c2V1bScgfSxcbiAgJ291dGRvb3Jfc3RvcmUnOiB7IGRpc3BsYXk6ICdPdXRkb29yIFN0b3JlJyB9LFxuICAncmVzdF9hcmVhJzogeyBkaXNwbGF5OiAnUmVzdCBBcmVhJyB9LFxuICAncmVzdGF1cmFudCc6IHsgZGlzcGxheTogJ1Jlc3RhdXJhbnQnIH0sXG4gICdyZXN0cm9vbSc6IHsgZGlzcGxheTogJ1Jlc3Ryb29tJyB9LFxuICAnc2NlbmljX2FyZWEnOiB7IGRpc3BsYXk6ICdTY2VuaWMgQXJlYScgfSxcbiAgJ3N0YXRlX3BhcmsnOiB7IGRpc3BsYXk6ICdTdGF0ZSBQYXJrJyB9LFxuICAnb3RoZXInOiB7IGRpc3BsYXk6ICdPdGhlcicgfVxufTtcbi8qZXNmbXQtaWdub3JlLWVuZCovXG5cbmV4cG9ydCBjb25zdCBTZXJ2aWNlID0gUG9pbnQuZXh0ZW5kKCB7XG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICBQb2ludC5wcm90b3R5cGUuc3BlY2lmeS5jYWxsKCB0aGlzLCAnc2VydmljZScsIG5hbWUsIGxvY2F0aW9uICk7XG4gIH0sXG5cbiAgZGVmYXVsdHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5Qb2ludC5wcm90b3R5cGUuZGVmYXVsdHMuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApLFxuICAgICAgYW1lbml0aWVzOiBbXSxcbiAgICAgIHNjaGVkdWxlOiB7ICdkZWZhdWx0JzogW10gfSxcbiAgICAgIHNlYXNvbmFsOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgc2NoZW1hOiBtZXJnZVNjaGVtYXMoIFBvaW50LnByb3RvdHlwZS5zY2hlbWEsIHtcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB0eXBlOiB7XG4gICAgICAgIGVudW06IGtleXMoIHNlcnZpY2VUeXBlcyApXG4gICAgICB9LFxuICAgICAgYW1lbml0aWVzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZW51bToga2V5cyggc2VydmljZVR5cGVzIClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGFkZHJlc3M6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBzY2hlZHVsZToge1xuICAgICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgfSxcbiAgICAgIHNlYXNvbmFsOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgfSxcbiAgICAgIHBob25lOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgd2Vic2l0ZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAndXJpJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWQ6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nIC8vIHRoZSB1cGRhdGVkIGF0dHJpYnV0ZSBpcyBub3QgcmVxdWlyZWRcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAnc2Vhc29uYWwnXG4gICAgXVxuICB9IClcbn0gKTtcblxuLy8gQXBwbHkgdGhlIHZhbGlkYXRpb24gbWl4aW4gdG8gdGhlIFNlcnZpY2UgbW9kZWwuIFNlZSB2YWxpZGF0aW9uLW1peGluLmpzLlxubWl4aW5WYWxpZGF0aW9uKCBTZXJ2aWNlICk7XG5cbi8vICMgQWxlcnQgTW9kZWxcbi8vIEFuIGFsZXJ0IGlzIHNvbWV0aGluZyB0aGF0IG1pZ2h0IGltcGVkZSBhIGN5Y2xpc3QncyB0b3VyLiBXaGVuIGEgY3ljbGlzdFxuLy8gc2VlcyBhbiBhbGVydCBvbiB0aGUgbWFwLCB0aGUga25vdyB0byBwbGFuIGFyb3VuZCBpdC5cblxuLyplc2ZtdC1pZ25vcmUtc3RhcnQqL1xuZXhwb3J0IGNvbnN0IGFsZXJ0VHlwZXMgPSB7XG4gICdyb2FkX2Nsb3N1cmUnOiB7IGRpc3BsYXk6ICdSb2FkIENsb3N1cmUnIH0sXG4gICdmb3Jlc3RfZmlyZSc6IHsgZGlzcGxheTogJ0ZvcmVzdCBmaXJlJyB9LFxuICAnZmxvb2RpbmcnOiB7IGRpc3BsYXk6ICdGbG9vZGluZycgfSxcbiAgJ2RldG91cic6IHsgZGlzcGxheTogJ0RldG91cicgfSxcbiAgJ290aGVyJzogeyBkaXNwbGF5OiAnT3RoZXInIH1cbn07XG4vKmVzZm10LWlnbm9yZS1lbmQqL1xuXG5leHBvcnQgY29uc3QgQWxlcnQgPSBQb2ludC5leHRlbmQoIHtcbiAgc3BlY2lmeTogZnVuY3Rpb24oIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIFBvaW50LnByb3RvdHlwZS5zcGVjaWZ5LmNhbGwoIHRoaXMsICdhbGVydCcsIG5hbWUsIGxvY2F0aW9uICk7XG4gIH0sXG5cbiAgc2NoZW1hOiBtZXJnZVNjaGVtYXMoIFBvaW50LnByb3RvdHlwZS5zY2hlbWEsIHtcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB0eXBlOiB7XG4gICAgICAgIGVudW06IGtleXMoIGFsZXJ0VHlwZXMgKVxuICAgICAgfVxuICAgIH1cbiAgfSApXG59ICk7XG5cbm1peGluVmFsaWRhdGlvbiggQWxlcnQgKTtcblxuLy8gIyBQb2ludCBDb2xsZWN0aW9uXG4vLyBBIGhldGVyb2dlbmVvdXMgY29sbGVjdGlvbiBvZiBzZXJ2aWNlcyBhbmQgYWxlcnRzLiBQb3VjaERCIGlzIGFibGUgdG8gZmV0Y2hcbi8vIHRoaXMgY29sbGVjdGlvbiBieSBsb29raW5nIGZvciBhbGwga2V5cyBzdGFydGluZyB3aXRoICdwb2ludC8nLlxuLy9cbi8vIFRoaXMgYWxzbyBoYXMgdGhlIGVmZmVjdCBvZiBmZXRjaGluZyBjb21tZW50cyBmb3IgcG9pbnRzLiBUT0RPOiBoYW5kbGVcbi8vIGBDb21tZW50YCBpbiB0aGUgbW9kZWwgZnVuY3Rpb24uXG4vL1xuLy8gQSBjb25uZWN0ZWQgUG9pbnRDb2xsZWN0aW9uIG11c3QgYmUgYWJsZSB0byBnZW5lcmF0ZSBjb25uZWN0ZWQgQWxlcnRzIG9yXG4vLyBTZXJ2aWNlcyBvbiBkZW1hbmRzLiBUaGVyZWZvcmUsIGlmIFBvaW50Q29sbGVjdGlvbiBpcyBjb25uZWN0ZWQsIGNvbm5lY3Rcbi8vIG1vZGVscyBiZWZvcmUgcmV0dXJuaW5nIHRoZW0uXG5leHBvcnQgY29uc3QgUG9pbnRDb2xsZWN0aW9uID0gQ291Y2hDb2xsZWN0aW9uLmV4dGVuZCgge1xuICBpbml0aWFsaXplOiBmdW5jdGlvbiggbW9kZWxzLCBvcHRpb25zICkge1xuICAgIENvdWNoQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLnBvdWNoID0ge1xuICAgICAgb3B0aW9uczoge1xuICAgICAgICBhbGxEb2NzOiBhc3NpZ24oXG4gICAgICAgICAgeyBpbmNsdWRlX2RvY3M6IHRydWUgfSxcbiAgICAgICAgICBvcHRpb25zLmtleXMgPyB7IGtleXM6IG9wdGlvbnMua2V5cyB9IDoga2V5c0JldHdlZW4oICdwb2ludC8nIClcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB7Y29ubmVjdCwgZGF0YWJhc2V9ID0gdGhpcztcbiAgICB0aGlzLnNlcnZpY2UgPSBjb25uZWN0ID8gY29ubmVjdCggZGF0YWJhc2UsIFNlcnZpY2UgKSA6IFNlcnZpY2U7XG4gICAgdGhpcy5hbGVydCA9IGNvbm5lY3QgPyBjb25uZWN0KCBkYXRhYmFzZSwgQWxlcnQgKSA6IEFsZXJ0O1xuICB9LFxuXG4gIC8vIFRoaXMgaGFuZGxlcyB0aGUgYG9wdGlvbnMua2V5c2AgZWRnZSBjYXNlcyBsaXN0ZWQgaW4gdGhlXG4gIC8vIFtQb3VjaERCIGFwaV0oaHR0cHM6Ly9wb3VjaGRiLmNvbS9hcGkuaHRtbCNiYXRjaF9mZXRjaClcbiAgcGFyc2U6IGZ1bmN0aW9uKCByZXNwb25zZSwgb3B0aW9ucyApIHtcbiAgICByZXR1cm4gcmVzcG9uc2Uucm93cy5maWx0ZXIoXG4gICAgICByb3cgPT4gISggcm93LmRlbGV0ZWQgfHwgcm93LmVycm9yIClcbiAgICApLm1hcChcbiAgICAgIHJvdyA9PiByb3cuZG9jXG4gICAgKTtcbiAgfSxcblxuICBtb2RlbDogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG4gICAgY29uc3QgcGFydHMgPSBwb2ludElkKCBhdHRyaWJ1dGVzLl9pZCApO1xuICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICdzZXJ2aWNlJzogb3B0aW9ucy5jb2xsZWN0aW9uLnNlcnZpY2UsXG4gICAgICAnYWxlcnQnOiBvcHRpb25zLmNvbGxlY3Rpb24uYWxlcnRcbiAgICB9O1xuICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gbWFwWyBwYXJ0cy50eXBlIF07XG4gICAgaWYgKCBjb25zdHJ1Y3RvciApIHtcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IGNvbnN0cnVjdG9yKCBhdHRyaWJ1dGVzLCBvcHRpb25zICk7XG5cbiAgICAgIGlmICggb3B0aW9ucy5kZWluZGV4ICYmIGluc3RhbmNlLmhhcyggJ2luZGV4JyApICkge1xuICAgICAgICBpbnN0YW5jZS5pbmRleCA9IGluc3RhbmNlLmdldCggJ2luZGV4JyApO1xuICAgICAgICBpbnN0YW5jZS51bnNldCggJ2luZGV4ICcgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnQSBwb2ludCBtdXN0IGJlIGVpdGhlciBhIHNlcnZpY2Ugb3IgYWxlcnQnO1xuICAgIH1cbiAgfSxcblxuICAvLyAjIyBGZXRjaCBDb3ZlciBJbWFnZXMgZm9yIGFsbCBQb2ludHNcbiAgLy8gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGFsbCBwb2ludHMgaW4gdGhlIGFycmF5IGhhdmVcbiAgLy8gdGhlaXIgY292ZXIgaW1hZ2VzIGF2YWlsYWJsZS5cbiAgZ2V0Q292ZXJzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoIHRoaXMubW9kZWxzLm1hcCggcG9pbnQgPT4gcG9pbnQuZ2V0Q292ZXIoKSApICk7XG4gIH0sXG5cbiAgLy8gIyMgR2V0IFJlZHV4IFJlcHJlc2VudGF0aW9uXG4gIC8vIFJldHVybiBhIG5lc3RlZCBvYmplY3QvYXJhcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbGxlY3Rpb24gc3VpdGFibGUgZm9yXG4gIC8vIHVzZSB3aXRoIHJlZHV4LlxuICBzdG9yZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZyb21QYWlycyggdGhpcy5tb2RlbHMubWFwKCBwb2ludCA9PiBbIHBvaW50LmlkLCBwb2ludC5zdG9yZSgpIF0gKSApO1xuICB9XG59ICk7XG5cbi8vICMgRGlzcGxheSBOYW1lIGZvciBUeXBlXG4vLyBHaXZlbiBhIHR5cGUga2V5IGZyb20gZWl0aGVyIHRoZSBzZXJ2aWNlIG9yIGFsZXJ0IHR5cGUgZW51bWVyYXRpb25zLFxuLy8gcmV0dXJuIHRoZSB0eXBlJ3MgZGlzcGxheSBzdHJpbmcsIG9yIG51bGwgaWYgaXQgZG9lcyBub3QgZXhpc3QuXG5leHBvcnQgZnVuY3Rpb24gZGlzcGxheSggdHlwZSApIHtcbiAgY29uc3QgdmFsdWVzID0gc2VydmljZVR5cGVzWyB0eXBlIF0gfHwgYWxlcnRUeXBlc1sgdHlwZSBdO1xuICBpZiAoIHZhbHVlcyApIHtcbiAgICByZXR1cm4gdmFsdWVzLmRpc3BsYXk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLy8gIyBDb21tZW50IE1vZGVsXG4vLyBJbmZvcm1hdGlvbiBhYm91dCBhbGVydHMgYW5kIHNlcnZpY2VzIGVuY291bnRlcmVkIGJ5IGN5Y2xpc3RzIGlzIGxpa2VseVxuLy8gdG8gY2hhbmdlIHdpdGggdGhlIHNlYXNvbnMgb3Igb3RoZXIgcmVhc29ucy4gQ3ljbGlzdHMgcGxhbm5pbmcgdGhlIG5leHQgbGVnXG4vLyBvZiBhIHRvdXIgc2hvdWxkIGJlIGFibGUgdG8gcmVhZCB0aGUgZXhwZXJpZW5jZXMgb2YgY3ljbGlzdHMgYWhlYWQgb2YgdGhlbS5cbi8vXG4vLyBBIGNvbW1lbnQgbXVzdCBoYXZlIGJvdGggYSByYXRpbmcgYW5kIHRoZSB0ZXh0IG9mIHRoZSBjb21tZW50LiBDb21tZW50cyBhcmVcbi8vIGxpbWl0ZWQgdG8gMTQwIGNoYXJhY3RlcnMgdG8gZW5zdXJlIHRoZXkgZG8gbm90IGRldm9sdmUgaW50byBnZW5lcmFsIGFsZXJ0XG4vLyBvciBzZXJ2aWNlIGluZm9ybWF0aW9uIHRoYXQgc2hvdWxkIHJlYWxseSBiZSBpbiB0aGUgZGVzY3JpcHRpb24uIFdlIHJlYWxseVxuLy8gd2FudCB1c2VycyBvZiB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvbiB0byBwcm92aWRlIGNvbW1lbnRzIHZlcmlmeWluZ1xuLy8gaW5mbyBhYm91dCBwb2ludHMsIG9yIGxldHRpbmcgb3RoZXIgY3ljbGlzdHMga25vdyBhYm91dCBjaGFuZ2VzIGluIHRoZVxuLy8gc2VydmljZSBvciBhbGVydC5cblxuLy8gIyMgQ29tbWVudCBNb2RlbCBVcmlcbi8vIENvbW1lbnRzIGFyZSBzdG9yZWQgaW4gQ291Y2hEQiBpbiB0aGUgc2FtZSBkYXRhYmFzZSBhcyBwb2ludHMuIFRoZSBjb21tZW50XG4vLyBtb2RlbCB1cmkgaXMgY29tcG9zZWQgb2YgdGhyZWUgcGFydHM6XG4vLyAgMS4gVGhlIGVudGlyZSBpZCBvZiB0aGUgcmVsYXRlZCBwb2ludFxuLy8gIDIuIFRoZSBzdHJpbmcgJ2NvbW1lbnQvJ1xuLy8gIDMuIEEgdGltZSBiYXNlZCBVVUlEIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IGNvbW1lbnRzXG4vL1xuLy8gV2UgZG9uJ3QgdXNlIGBkb2N1cmlgIGZvciB0aGUgY29tbWVudCBtb2RlbCB1cmlzIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSB0b1xuLy8gcGFyc2UgdGhlbS5cblxuY29uc3QgQ09NTUVOVF9NQVhfTEVOR1RIID0gMTQwO1xuZXhwb3J0IGNvbnN0IENvbW1lbnQgPSBDb3VjaE1vZGVsLmV4dGVuZCgge1xuICBpZEF0dHJpYnV0ZTogJ19pZCcsXG5cbiAgLy8gIyMgQ29uc3RydWN0b3JcbiAgLy8gR2VuZXJhdGUgYF9pZGAuIGBwb2ludElkYCBtdXN0IGJlIHNwZWNpZmllZCBpbiBvcHRpb25zLlxuICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgaWYgKCAhYXR0cmlidXRlcy51dWlkICkge1xuICAgICAgYXR0cmlidXRlcy51dWlkID0gdXVpZC52MSgpO1xuICAgIH1cbiAgICBpZiAoICFhdHRyaWJ1dGVzLl9pZCAmJiBvcHRpb25zLnBvaW50SWQgKSB7XG4gICAgICBhdHRyaWJ1dGVzLl9pZCA9IG9wdGlvbnMucG9pbnRJZCArICcvY29tbWVudC8nICsgYXR0cmlidXRlcy51dWlkO1xuICAgIH1cbiAgICBDb3VjaE1vZGVsLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgfSxcblxuICBzY2hlbWE6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgdGV4dDoge1xuICAgICAgICAndHlwZSc6ICdzdHJpbmcnLFxuICAgICAgICAnbWF4TGVuZ3RoJzogQ09NTUVOVF9NQVhfTEVOR1RIXG4gICAgICB9LFxuICAgICAgcmF0aW5nOiB7XG4gICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgbWluaW11bTogMSxcbiAgICAgICAgbWF4aW11bTogNVxuICAgICAgfSxcbiAgICAgIHV1aWQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlcXVpcmVkOiBbXG4gICAgICAndGV4dCcsXG4gICAgICAncmF0aW5nJyxcbiAgICAgICd1dWlkJ1xuICAgIF1cbiAgfVxufSwge1xuICBNQVhfTEVOR1RIOiBDT01NRU5UX01BWF9MRU5HVEhcbn0gKTtcblxubWl4aW5WYWxpZGF0aW9uKCBDb21tZW50ICk7XG5cbi8vICMgQ29tbWVudCBDb2xsZWN0aW9uXG4vLyBGZXRjaCBvbmx5IGNvbW1lbnRzIGFzc29jaWF0ZWQgd2l0aCBhIGdpdmVuIHBvaW50LlxuZXhwb3J0IGNvbnN0IENvbW1lbnRDb2xsZWN0aW9uID0gQ291Y2hDb2xsZWN0aW9uLmV4dGVuZCgge1xuICBpbml0aWFsaXplOiBmdW5jdGlvbiggbW9kZWxzLCBvcHRpb25zICkge1xuICAgIENvdWNoQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgY29uc3QgcG9pbnRJZCA9IHRoaXMucG9pbnRJZCA9IG9wdGlvbnMucG9pbnRJZDtcblxuICAgIGNvbnN0IGNvbm5lY3QgPSB0aGlzLmNvbm5lY3Q7XG4gICAgY29uc3QgZGF0YWJhc2UgPSB0aGlzLmRhdGFiYXNlO1xuICAgIHRoaXMuY29tbWVudCA9IGNvbm5lY3QgPyBjb25uZWN0KCBkYXRhYmFzZSwgQ29tbWVudCApIDogQ29tbWVudDtcblxuICAgIHRoaXMucG91Y2ggPSB7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGFsbERvY3M6IHtcbiAgICAgICAgICAuLi5rZXlzQmV0d2VlbiggcG9pbnRJZCArICcvY29tbWVudCcgKSxcbiAgICAgICAgICBpbmNsdWRlX2RvY3M6IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0sXG5cbiAgbW9kZWw6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIGNvbnN0IHtjb21tZW50LCBwb2ludElkfSA9IG9wdGlvbnMuY29sbGVjdGlvbjtcbiAgICByZXR1cm4gbmV3IGNvbW1lbnQoIGF0dHJpYnV0ZXMsIHsgcG9pbnRJZCwgLi4ub3B0aW9ucyB9ICk7XG4gIH1cbn0gKTtcbiJdfQ==