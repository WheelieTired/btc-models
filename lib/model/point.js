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
      flag: false
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
      description: {
        type: 'string'
      },
      flag: {
        type: 'boolean'
      }
    },
    required: ['name', 'location', 'type', 'created_at', 'updated_at', 'flag']
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwiY292ZXJCbG9iIiwiY292ZXJVcmwiLCJ1cGRhdGUiLCJzcGVjaWZ5IiwidHlwZSIsIm5hbWUiLCJsb2NhdGlvbiIsIl9pZCIsImxhdCIsImxuZyIsImdlb2hhc2giLCJlbmNvZGUiLCJzYWZlZ3VhcmQiLCJkZWZhdWx0cyIsImZsYWciLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJtaW5JdGVtcyIsIm1heEl0ZW1zIiwiaXRlbXMiLCJmb3JtYXQiLCJkZXNjcmlwdGlvbiIsInJlcXVpcmVkIiwiY2xlYXIiLCJmZXRjaCIsInRoZW4iLCJnZXRDb3ZlciIsInJlcyIsInJldCIsInJlc29sdmUiLCJoYXNDb3ZlciIsImF0dGFjaG1lbnRzIiwiYXR0YWNobWVudCIsImJsb2IiLCJzZXRDb3ZlciIsInN0b3JlIiwidG9KU09OIiwidXJpIiwiZm9yIiwiaWQiLCJTZXJ2aWNlIiwiQWxlcnQiLCJzZXJ2aWNlVHlwZXMiLCJjYWxsIiwiYW1lbml0aWVzIiwic2NoZWR1bGUiLCJzZWFzb25hbCIsImVudW0iLCJhZGRyZXNzIiwicGhvbmUiLCJ3ZWJzaXRlIiwidXBkYXRlZCIsImFsZXJ0VHlwZXMiLCJQb2ludENvbGxlY3Rpb24iLCJtb2RlbHMiLCJwb3VjaCIsImFsbERvY3MiLCJpbmNsdWRlX2RvY3MiLCJrZXlzIiwiY29ubmVjdCIsImRhdGFiYXNlIiwic2VydmljZSIsImFsZXJ0IiwicGFyc2UiLCJyZXNwb25zZSIsInJvd3MiLCJmaWx0ZXIiLCJyb3ciLCJkZWxldGVkIiwiZXJyb3IiLCJtYXAiLCJkb2MiLCJtb2RlbCIsInBhcnRzIiwiY29sbGVjdGlvbiIsImNvbnN0cnVjdG9yIiwiaW5zdGFuY2UiLCJkZWluZGV4IiwiaGFzIiwiaW5kZXgiLCJnZXQiLCJ1bnNldCIsImdldENvdmVycyIsImFsbCIsInBvaW50IiwidmFsdWVzIiwiQ09NTUVOVF9NQVhfTEVOR1RIIiwiQ29tbWVudCIsInV1aWQiLCJ2MSIsInRleHQiLCJyYXRpbmciLCJtaW5pbXVtIiwibWF4aW11bSIsIk1BWF9MRU5HVEgiLCJDb21tZW50Q29sbGVjdGlvbiIsImNvbW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozt5cEJBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFzYmdCQSxPLEdBQUFBLE87O0FBbmFoQjs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUMsVUFBWSxPQUFPQyxNQUFQLEtBQWtCLFdBQXBDOztBQUVBLElBQUlDLFVBQVVDLFFBQVEsa0JBQVIsQ0FBZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsVUFBVSxpQkFBT0MsS0FBUCxDQUFjLDRCQUFkLENBQWhCOztBQUVPLElBQU1DLHdCQUFRLGlCQUFXQyxNQUFYLENBQW1CO0FBQ3RDQyxlQUFhLEtBRHlCOztBQUd0Q0MsY0FBWSxvQkFBVUMsVUFBVixFQUFzQkMsT0FBdEIsRUFBZ0M7QUFDMUMscUJBQVdDLFNBQVgsQ0FBcUJILFVBQXJCLENBQWdDSSxLQUFoQyxDQUF1QyxJQUF2QyxFQUE2Q0MsU0FBN0M7O0FBRUEsUUFBTUMsT0FBTyxJQUFJQyxJQUFKLEdBQVdDLFdBQVgsRUFBYjtBQUNBLFNBQUtDLEdBQUwsQ0FBVTtBQUNSQyxrQkFBWUos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TUFEUSxFQUVSLFFBRlEsRUFHUixNQUhRO0FBakJKO0FBaEJnQyxDQUFuQixFQXVDcEI7QUFDRHdFLGNBQVlSO0FBRFgsQ0F2Q29CLENBQWhCOztBQTJDUCxzQ0FBaUJDLE9BQWpCOztBQUVBO0FBQ0E7QUFDTyxJQUFNUSxnREFBb0Isc0JBQWdCOUcsTUFBaEIsQ0FBd0I7QUFDdkRFLGNBQVksb0JBQVVtRSxNQUFWLEVBQWtCakUsT0FBbEIsRUFBNEI7QUFDdEMsMEJBQWdCQyxTQUFoQixDQUEwQkgsVUFBMUIsQ0FBcUNJLEtBQXJDLENBQTRDLElBQTVDLEVBQWtEQyxTQUFsRDtBQUNBLFFBQU1WLFVBQVUsS0FBS0EsT0FBTCxHQUFlTyxRQUFRUCxPQUF2Qzs7QUFFQSxRQUFNNkUsVUFBVSxLQUFLQSxPQUFyQjtBQUNBLFFBQU1DLFdBQVcsS0FBS0EsUUFBdEI7QUFDQSxTQUFLb0MsT0FBTCxHQUFlckMsVUFBVUEsUUFBU0MsUUFBVCxFQUFtQjJCLE9BQW5CLENBQVYsR0FBeUNBLE9BQXhEOztBQUVBLFNBQUtoQyxLQUFMLEdBQWE7QUFDWGxFLGVBQVM7QUFDUG1FLDhCQUNLLHVCQUFhMUUsVUFBVSxVQUF2QixDQURMO0FBRUUyRSx3QkFBYztBQUZoQjtBQURPO0FBREUsS0FBYjtBQVFELEdBakJzRDs7QUFtQnZEZSxTQUFPLGVBQVVwRixVQUFWLEVBQXNCQyxPQUF0QixFQUFnQztBQUFBLDhCQUNWQSxRQUFRcUYsVUFERTtBQUFBLFFBQzlCc0IsT0FEOEIsdUJBQzlCQSxPQUQ4QjtBQUFBLFFBQ3JCbEgsT0FEcUIsdUJBQ3JCQSxPQURxQjs7QUFFckMsV0FBTyxJQUFJa0gsT0FBSixDQUFhNUcsVUFBYixhQUEyQk4sZ0JBQTNCLElBQXVDTyxPQUF2QyxFQUFQO0FBQ0Q7QUF0QnNELENBQXhCLENBQTFCIiwiZmlsZSI6InBvaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogYnRjLWFwcC1zZXJ2ZXIgLS0gU2VydmVyIGZvciB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvblxuICogQ29weXJpZ2h0IMKpIDIwMTYgQWR2ZW50dXJlIEN5Y2xpbmcgQXNzb2NpYXRpb25cbiAqXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBidGMtYXBwLXNlcnZlci5cbiAqXG4gKiBidGMtYXBwLXNlcnZlciBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEFmZmVybyBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEZvb2Jhci4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgeyBtaXhpblZhbGlkYXRpb24sIG1lcmdlU2NoZW1hcyB9IGZyb20gJy4vdmFsaWRhdGlvbi1taXhpbic7XG5pbXBvcnQgeyBDb3VjaE1vZGVsLCBDb3VjaENvbGxlY3Rpb24sIGtleXNCZXR3ZWVuIH0gZnJvbSAnLi9iYXNlJztcblxuaW1wb3J0IHsga2V5cywgZnJvbVBhaXJzLCBpbmNsdWRlcywgYXNzaWduIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGNyZWF0ZU9iamVjdFVSTCB9IGZyb20gJ2Jsb2ItdXRpbCc7XG5cbmltcG9ydCBkb2N1cmkgZnJvbSAnZG9jdXJpJztcbmltcG9ydCBuZ2VvaGFzaCBmcm9tICduZ2VvaGFzaCc7XG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ3RvLWlkJztcbmltcG9ydCB1dWlkIGZyb20gJ25vZGUtdXVpZCc7XG5cbmNvbnN0IGJyb3dzZXIgPSAoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICk7XG5cbnZhciBQcm9taXNlID0gcmVxdWlyZSgncG9seWZpbGwtcHJvbWlzZScpO1xuXG4vLyAjIFBvaW50IE1vZGVsXG4vLyBUaGUgcG9pbnQgcmVwcmVzZW50cyBhIGxvY2F0aW9uIG9uIHRoZSBtYXAgd2l0aCBhc3NvY2lhdGVkIG1ldGFkYXRhLCBnZW9kYXRhLFxuLy8gYW5kIHVzZXIgcHJvdmlkZWQgZGF0YS4gVGhlIHBvaW50IGlzIHRoZSBiYXNlIHNoYXJlZCBieSBzZXJ2aWNlcyBhbmQgYWxlcnRzLlxuLy9cbi8vIFRoZSBKU09OIHNjaGVtYSBzdG9yZWQgaW4gYFBvaW50YCwgYW5kIGFzIHBhdGNoZWQgYnkgYFNlcnZpY2VgIGFuZCBgQWxlcnRgLFxuLy8gaXMgdGhlIGF1dGhvcml0YXRpdmUgZGVmaW5pdGlvbiBvZiB0aGUgcG9pbnQgcmVjb3JkLlxuXG4vLyAjIyBQb2ludCBNb2RlbCBVcmlcbi8vIFBvaW50cyBhcmUgc3RvcmVkIGluIENvdWNoREIuIENvdWNoREIgZG9jdW1lbnRzIGNhbiBoYXZlIHJpY2ggaWQgc3RyaW5nc1xuLy8gdG8gaGVscCBzdG9yZSBhbmQgYWNjZXNzIGRhdGEgd2l0aG91dCBNYXBSZWR1Y2Ugam9icy5cbi8vXG4vLyBUaGUgcG9pbnQgbW9kZWwgdXJpIGlzIGNvbXBvc2VkIG9mIGZvdXIgcGFydHM6XG4vLyAgMS4gVGhlIHN0cmluZyAncG9pbnQvJ2Bcbi8vICAyLiBUaGUgdHlwZSBvZiBwb2ludCwgZWl0aGVyICdzZXJ2aWNlJyBvciAnYWxlcnQnXG4vLyAgMy4gVGhlIG5vcm1hbGl6ZWQgKG9yaWdpbmFsKSBuYW1lIG9mIHRoZSBwb2ludFxuLy8gIDQuIFRoZSBwb2ludCdzIGdlb2hhc2hcbmNvbnN0IHBvaW50SWQgPSBkb2N1cmkucm91dGUoICdwb2ludC86dHlwZS86bmFtZS86Z2VvaGFzaCcgKTtcblxuZXhwb3J0IGNvbnN0IFBvaW50ID0gQ291Y2hNb2RlbC5leHRlbmQoIHtcbiAgaWRBdHRyaWJ1dGU6ICdfaWQnLFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIENvdWNoTW9kZWwucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB0aGlzLnNldCgge1xuICAgICAgY3JlYXRlZF9hdDogZGF0ZSxcbiAgICAgIHVwZGF0ZWRfYXQ6IGRhdGVcbiAgICB9ICk7XG5cbiAgICB0aGlzLmNvdmVyQmxvYiA9IGZhbHNlO1xuICAgIHRoaXMuY292ZXJVcmwgPSBmYWxzZTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0KCAndXBkYXRlZF9hdCcsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSApO1xuICB9LFxuXG4gIC8vICMjIFNwZWNpZnlcbiAgLy8gRmlsbCBpbiBgX2lkYCBmcm9tIHRoZSBjb21wb25lbnRzIG9mIHRoZSBwb2ludCBtb2RlbCB1cmkuXG4gIC8vIFB1bGwgdmFsdWVzIGZyb20gYGF0dHJpYnV0ZXNgIGlmIG5hbWUgYW5kIGxvY2F0aW9uIGFyZSB1bmRlZmluZWQuXG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCB0eXBlLCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICAvLyBPbmx5IHNldCB0aGUgSUQgYXR0cmlidXRlIGhlcmUgaWYgaXQgd2Fzbid0IGFscmVhZHkgc2V0LlxuICAgIC8vIFRoZSBvcmlnaW5hbCBJRCBzdGF5cyB0aGUgSUQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgcG9pbnQuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmF0dHJpYnV0ZXMuX2lkID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgIGNvbnN0IFtsYXQsIGxuZ10gPSBsb2NhdGlvbjtcbiAgICAgICAgY29uc3QgX2lkID0gcG9pbnRJZCgge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgbmFtZTogbm9ybWFsaXplKCBuYW1lICksXG4gICAgICAgICAgZ2VvaGFzaDogbmdlb2hhc2guZW5jb2RlKCBsYXQsIGxuZyApXG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5zZXQoIHsgX2lkLCB0eXBlLCBuYW1lLCBsb2NhdGlvbiB9ICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7bmFtZSwgbG9jYXRpb259ID0gdGhpcy5hdHRyaWJ1dGVzO1xuICAgICAgICBjb25zdCBbbGF0LCBsbmddID0gbG9jYXRpb247XG4gICAgICAgIGNvbnN0IF9pZCA9IHBvaW50SWQoIHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIG5hbWU6IG5vcm1hbGl6ZSggbmFtZSApLFxuICAgICAgICAgIGdlb2hhc2g6IG5nZW9oYXNoLmVuY29kZSggbGF0LCBsbmcgKVxuICAgICAgICB9ICk7XG4gICAgICAgIHRoaXMuc2V0KCB7IF9pZCB9ICk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8vICMjIFNhZmVndWFyZCBmb3IgUG9pbnRzXG4gIC8vIFBvaW50cyBoYXZlIGltYWdlIGF0dGFjaG1lbnRzLCBzbyB3ZSBzaG91bGQgbGV0IGJhY2tib25lIHBvdWNoIGhhbmRsZVxuICAvLyB0aG9zZSBhbmQgd2Ugc2hvdWxkIG5vdCB2YWxpZGF0ZSB0aGUgX2F0dGFjaG1lbnRzIGtleVxuICBzYWZlZ3VhcmQ6IFtcbiAgICAnX2F0dGFjaG1lbnRzJ1xuICBdLFxuXG4gIGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmxhZzogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgbWluSXRlbXM6IDIsXG4gICAgICAgIG1heEl0ZW1zOiAyLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0eXBlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgY3JlYXRlZF9hdDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZm9ybWF0OiAnZGF0ZS10aW1lJ1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZWRfYXQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgIH0sXG4gICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGZsYWc6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICB9XG4gICAgfSxcbiAgICByZXF1aXJlZDogW1xuICAgICAgJ25hbWUnLFxuICAgICAgJ2xvY2F0aW9uJyxcbiAgICAgICd0eXBlJyxcbiAgICAgICdjcmVhdGVkX2F0JyxcbiAgICAgICd1cGRhdGVkX2F0JyxcbiAgICAgICdmbGFnJ1xuICAgIF1cbiAgfSxcblxuICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgQ291Y2hNb2RlbC5wcm90b3R5cGUuY2xlYXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIHRoaXMuY292ZXJVcmwgPSBmYWxzZTtcbiAgfSxcblxuICAvLyAjIyBGZXRjaFxuICAvLyBXaGVuIGZldGNoaW5nIGEgcG9pbnQsIHNob3VsZCBpdCBoYXZlIGEgY292ZXIgYXR0YWNobWVudCwgZXh0ZW5kIHRoZVxuICAvLyBwcm9taXNlIHRvIGZldGNoIHRoZSBhdHRhY2htZW50IGFuZCBzZXQgYHRoaXMuY292ZXJVcmxgLlxuICBmZXRjaDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIENvdWNoTW9kZWwucHJvdG90eXBlLmZldGNoLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKS50aGVuKCByZXMgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Q292ZXIoIHJlcyApO1xuICAgIH0gKTtcbiAgfSxcblxuICAvLyAjIEdldCBDb3ZlclxuICAvLyBTaG91bGQgYSBwb2ludCAoYWxyZWFkeSBmZXRjaGVkKSBoYXZlIGEgY292ZXIgYXR0YWNobWVudCwgZ2V0IHRoZVxuICAvLyBhdHRhY2htZW50J3MgZGF0YSBhbmQgc3RvcmUgYW4gb2JqZWN0IHVybCBmb3IgaXQgaW4gYHRoaXMuY292ZXJVcmxgXG4gIC8vXG4gIC8vIEFzIGEgdXRpbGl0eSB0byBjbGllbnQgZnVuY3Rpb25zLCByZXNvbHZlIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIHRoZVxuICAvLyBzaW5nbGUgYXJndW1lbnQgcGFzc2VkIHRvIGBnZXRDb3ZlcmAuXG4gIGdldENvdmVyOiBmdW5jdGlvbiggcmV0ICkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCAoICkgPT4ge1xuICAgICAgY29uc3QgaGFzQ292ZXIgPSBpbmNsdWRlcyggdGhpcy5hdHRhY2htZW50cygpLCAnY292ZXIucG5nJyApO1xuICAgICAgaWYgKCBicm93c2VyICYmIGhhc0NvdmVyICkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2htZW50KCAnY292ZXIucG5nJyApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gKS50aGVuKCBibG9iID0+IHtcbiAgICAgIGlmICggYmxvYiApIHtcbiAgICAgICAgdGhpcy5jb3ZlckJsb2IgPSBibG9iO1xuICAgICAgICB0aGlzLmNvdmVyVXJsID0gY3JlYXRlT2JqZWN0VVJMKCBibG9iICk7XG4gICAgICB9XG4gICAgfSApLnRoZW4oICggKSA9PiB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gKTtcbiAgfSxcblxuICAvLyAjIyBTZXQgQ292ZXJcbiAgLy8gSWYgdGhlIHVzZXIgYWxyZWFkeSBoYXMgYSBjb3ZlciBibG9iIGFuZCB0aGV5IHdhbnQgdG8gdXNlIGl0IHdpdGggdGhlXG4gIC8vIG1vZGVsIGJlZm9yZSBhdHRhY2goKSBjYW4gZmluaXNoIHN0b3JpbmcgaXQgdG8gUG91Y2hEQiwgdGhleSBjYW4gdXNlXG4gIC8vIHRoaXMgbWV0aG9kIHRvIG1hbnVhbGx5IGluc2VydCBpdC5cbiAgLy9cbiAgLy8gVGhlIGFzc29jaWF0ZWQgb2JqZWN0IHVybCBmb3IgdGhlIGJsb2Igd2lsbCB0aGVuIGJlIGF2YWlsYWJsZSB0byBvdGhlclxuICAvLyBmdW5jdGlvbnMgbGlrZSBzdG9yZSgpLlxuICBzZXRDb3ZlcjogZnVuY3Rpb24oIGJsb2IgKSB7XG4gICAgdGhpcy5jb3ZlckJsb2IgPSBibG9iO1xuICAgIGlmICggYnJvd3NlciApIHtcbiAgICAgIHRoaXMuY292ZXJVcmwgPSBjcmVhdGVPYmplY3RVUkwoIGJsb2IgKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gIyMgR2V0IFJlZHV4IFJlcHJlc2VudGF0aW9uXG4gIC8vIFJldHVybiBhIG5lc3RlZCBvYmplY3QvYXJhcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1vZGVsIHN1aXRhYmxlIGZvclxuICAvLyB1c2Ugd2l0aCByZWR1eC5cbiAgc3RvcmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IC4uLnRoaXMudG9KU09OKCksIGNvdmVyVXJsOiB0aGlzLmNvdmVyVXJsIH07XG4gIH1cbn0sIHtcbiAgdXJpOiBwb2ludElkLFxuXG4gIGZvcjogaWQgPT4ge1xuICAgIGNvbnN0IHt0eXBlfSA9IHBvaW50SWQoIGlkICk7XG4gICAgaWYgKCB0eXBlID09PSAnc2VydmljZScgKSB7XG4gICAgICByZXR1cm4gbmV3IFNlcnZpY2UoIHsgX2lkOiBpZCB9ICk7XG4gICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ2FsZXJ0JyApIHtcbiAgICAgIHJldHVybiBuZXcgQWxlcnQoIHsgX2lkOiBpZCB9ICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdBIHBvaW50IG11c3QgZWl0aGVyIGJlIGEgc2VydmljZSBvciBhbGVydCc7XG4gICAgfVxuICB9XG59ICk7XG5cbi8vICMgU2VydmljZSBNb2RlbFxuLy8gQSBzZXJ2aWNlIGlzIGEgYnVpc25lc3Mgb3IgcG9pbnQgb2YgaW50ZXJlc3QgdG8gYSBjeWNsaXN0LiBBIGN5Y2xpc3QgbmVlZHNcbi8vIHRvIGtub3cgd2hlcmUgdGhleSB3YW50IHRvIHN0b3Agd2VsbCBpbiBhZHZhbmNlIG9mIHRoZWlyIHRyYXZlbCB0aHJvdWdoIGFuXG4vLyBhcmVhLiBUaGUgc2VydmljZSByZWNvcmQgbXVzdCBjb250YWluIGVub3VnaCBpbmZvcm1hdGlvbiB0byBoZWxwIHRoZSBjeWNsaXN0XG4vLyBtYWtlIHN1Y2ggZGVjaXNpb25zLlxuLy9cbi8vIFRoZSByZWNvcmQgaW5jbHVkZXMgY29udGFjdCBpbmZvcm1hdGlvbiwgYW5kIGEgc2NoZWR1bGUgb2YgaG91cnMgb2Zcbi8vIG9wZXJhdGlvbi4gSXQgaXMgaW1wb3J0YW50IHRoYXQgd2Ugc3RvcmUgdGhlIHRpbWUgem9uZSBvZiBhIHNlcnZpY2UsIHNpbmNlXG4vLyB0b3VyaW5nIGN5Y2xpc3RzIHdpbGwgY3Jvc3MgdGltZSB6b25lcyBvbiB0aGVpciB0cmF2ZWxzLiBGdXJ0aGVybW9yZSxcbi8vIHNlcnZpY2VzIG9mIGludGVyZXN0IHRvIHRvdXJpbmcgY3ljbGlzdHMgbWF5IGJlIHNlYXNvbmFsOiB3ZSBzdG9yZVxuLy8gc2NoZWR1bGVzIGZvciBkaWZmZXJlbnQgc2Vhc29ucy5cblxuLy8gIyMgU2VydmljZSBUeXBlc1xuLy8gQSBTZXJ2aWNlIG1heSBoYXZlIGEgc2luZ2xlIHR5cGUsIGluZGljYXRpbmcgdGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGVcbi8vIGJ1aXNuZXNzIG9yIHBvaW50IG9mIGludGVyZXN0LiBTZXJ2aWNlIHR5cGVzIG1heSBhbHNvIGJlIGluY2x1ZGVkIGluIGFcbi8vIFNlcnZpY2UncyBhbWVuaXRpZXMgYXJyYXkuXG5cbi8qZXNmbXQtaWdub3JlLXN0YXJ0Ki9cbmV4cG9ydCBjb25zdCBzZXJ2aWNlVHlwZXMgPSB7XG4gICdhaXJwb3J0JzogeyBkaXNwbGF5OiAnQWlycG9ydCcgfSxcbiAgJ2Jhcic6IHsgZGlzcGxheTogJ0JhcicgfSxcbiAgJ2JlZF9hbmRfYnJlYWtmYXN0JzogeyBkaXNwbGF5OiAnQmVkICYgQnJlYWtmYXN0JyB9LFxuICAnYmlrZV9zaG9wJzogeyBkaXNwbGF5OiAnQmlrZSBTaG9wJyB9LFxuICAnY2FiaW4nOiB7IGRpc3BsYXk6ICdDYWJpbicgfSxcbiAgJ2NhbXBncm91bmQnOiB7IGRpc3BsYXk6ICdDYW1wZ3JvdW5kJyB9LFxuICAnY29udmVuaWVuY2Vfc3RvcmUnOiB7IGRpc3BsYXk6ICdDb252ZW5pZW5jZSBTdG9yZScgfSxcbiAgJ2N5Y2xpc3RzX2NhbXBpbmcnOiB7IGRpc3BsYXk6ICdDeWNsaXN0c1xcJyBDYW1waW5nJyB9LFxuICAnY3ljbGlzdHNfbG9kZ2luZyc6IHsgZGlzcGxheTogJ0N5Y2xpc3RzXFwnIExvZGdpbmcnIH0sXG4gICdncm9jZXJ5JzogeyBkaXNwbGF5OiAnR3JvY2VyeScgfSxcbiAgJ2hvc3RlbCc6IHsgZGlzcGxheTogJ0hvc3RlbCcgfSxcbiAgJ2hvdF9zcHJpbmcnOiB7IGRpc3BsYXk6ICdIb3QgU3ByaW5nJyB9LFxuICAnaG90ZWwnOiB7IGRpc3BsYXk6ICdIb3RlbCcgfSxcbiAgJ21vdGVsJzogeyBkaXNwbGF5OiAnTW90ZWwnIH0sXG4gICdpbmZvcm1hdGlvbic6IHsgZGlzcGxheTogJ0luZm9ybWF0aW9uJyB9LFxuICAnbGlicmFyeSc6IHsgZGlzcGxheTogJ0xpYnJhcnknIH0sXG4gICdtdXNldW0nOiB7IGRpc3BsYXk6ICdNdXNldW0nIH0sXG4gICdvdXRkb29yX3N0b3JlJzogeyBkaXNwbGF5OiAnT3V0ZG9vciBTdG9yZScgfSxcbiAgJ3Jlc3RfYXJlYSc6IHsgZGlzcGxheTogJ1Jlc3QgQXJlYScgfSxcbiAgJ3Jlc3RhdXJhbnQnOiB7IGRpc3BsYXk6ICdSZXN0YXVyYW50JyB9LFxuICAncmVzdHJvb20nOiB7IGRpc3BsYXk6ICdSZXN0cm9vbScgfSxcbiAgJ3NjZW5pY19hcmVhJzogeyBkaXNwbGF5OiAnU2NlbmljIEFyZWEnIH0sXG4gICdzdGF0ZV9wYXJrJzogeyBkaXNwbGF5OiAnU3RhdGUgUGFyaycgfSxcbiAgJ290aGVyJzogeyBkaXNwbGF5OiAnT3RoZXInIH1cbn07XG4vKmVzZm10LWlnbm9yZS1lbmQqL1xuXG5leHBvcnQgY29uc3QgU2VydmljZSA9IFBvaW50LmV4dGVuZCgge1xuICBzcGVjaWZ5OiBmdW5jdGlvbiggbmFtZSwgbG9jYXRpb24gKSB7XG4gICAgUG9pbnQucHJvdG90eXBlLnNwZWNpZnkuY2FsbCggdGhpcywgJ3NlcnZpY2UnLCBuYW1lLCBsb2NhdGlvbiApO1xuICB9LFxuXG4gIGRlZmF1bHRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uUG9pbnQucHJvdG90eXBlLmRlZmF1bHRzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKSxcbiAgICAgIGFtZW5pdGllczogW10sXG4gICAgICBzY2hlZHVsZTogeyAnZGVmYXVsdCc6IFtdIH0sXG4gICAgICBzZWFzb25hbDogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIHNjaGVtYTogbWVyZ2VTY2hlbWFzKCBQb2ludC5wcm90b3R5cGUuc2NoZW1hLCB7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgdHlwZToge1xuICAgICAgICBlbnVtOiBrZXlzKCBzZXJ2aWNlVHlwZXMgKVxuICAgICAgfSxcbiAgICAgIGFtZW5pdGllczoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGVudW06IGtleXMoIHNlcnZpY2VUeXBlcyApXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBhZGRyZXNzOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9LFxuICAgICAgc2NoZWR1bGU6IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIH0sXG4gICAgICBzZWFzb25hbDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIH0sXG4gICAgICBwaG9uZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIHdlYnNpdGU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ3VyaSdcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyAvLyB0aGUgdXBkYXRlZCBhdHRyaWJ1dGUgaXMgbm90IHJlcXVpcmVkXG4gICAgICB9XG4gICAgfSxcbiAgICByZXF1aXJlZDogW1xuICAgICAgJ3NlYXNvbmFsJ1xuICAgIF1cbiAgfSApXG59ICk7XG5cbi8vIEFwcGx5IHRoZSB2YWxpZGF0aW9uIG1peGluIHRvIHRoZSBTZXJ2aWNlIG1vZGVsLiBTZWUgdmFsaWRhdGlvbi1taXhpbi5qcy5cbm1peGluVmFsaWRhdGlvbiggU2VydmljZSApO1xuXG4vLyAjIEFsZXJ0IE1vZGVsXG4vLyBBbiBhbGVydCBpcyBzb21ldGhpbmcgdGhhdCBtaWdodCBpbXBlZGUgYSBjeWNsaXN0J3MgdG91ci4gV2hlbiBhIGN5Y2xpc3Rcbi8vIHNlZXMgYW4gYWxlcnQgb24gdGhlIG1hcCwgdGhlIGtub3cgdG8gcGxhbiBhcm91bmQgaXQuXG5cbi8qZXNmbXQtaWdub3JlLXN0YXJ0Ki9cbmV4cG9ydCBjb25zdCBhbGVydFR5cGVzID0ge1xuICAncm9hZF9jbG9zdXJlJzogeyBkaXNwbGF5OiAnUm9hZCBDbG9zdXJlJyB9LFxuICAnZm9yZXN0X2ZpcmUnOiB7IGRpc3BsYXk6ICdGb3Jlc3QgZmlyZScgfSxcbiAgJ2Zsb29kaW5nJzogeyBkaXNwbGF5OiAnRmxvb2RpbmcnIH0sXG4gICdkZXRvdXInOiB7IGRpc3BsYXk6ICdEZXRvdXInIH0sXG4gICdvdGhlcic6IHsgZGlzcGxheTogJ090aGVyJyB9XG59O1xuLyplc2ZtdC1pZ25vcmUtZW5kKi9cblxuZXhwb3J0IGNvbnN0IEFsZXJ0ID0gUG9pbnQuZXh0ZW5kKCB7XG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICBQb2ludC5wcm90b3R5cGUuc3BlY2lmeS5jYWxsKCB0aGlzLCAnYWxlcnQnLCBuYW1lLCBsb2NhdGlvbiApO1xuICB9LFxuXG4gIHNjaGVtYTogbWVyZ2VTY2hlbWFzKCBQb2ludC5wcm90b3R5cGUuc2NoZW1hLCB7XG4gICAgcHJvcGVydGllczoge1xuICAgICAgdHlwZToge1xuICAgICAgICBlbnVtOiBrZXlzKCBhbGVydFR5cGVzIClcbiAgICAgIH1cbiAgICB9XG4gIH0gKVxufSApO1xuXG5taXhpblZhbGlkYXRpb24oIEFsZXJ0ICk7XG5cbi8vICMgUG9pbnQgQ29sbGVjdGlvblxuLy8gQSBoZXRlcm9nZW5lb3VzIGNvbGxlY3Rpb24gb2Ygc2VydmljZXMgYW5kIGFsZXJ0cy4gUG91Y2hEQiBpcyBhYmxlIHRvIGZldGNoXG4vLyB0aGlzIGNvbGxlY3Rpb24gYnkgbG9va2luZyBmb3IgYWxsIGtleXMgc3RhcnRpbmcgd2l0aCAncG9pbnQvJy5cbi8vXG4vLyBUaGlzIGFsc28gaGFzIHRoZSBlZmZlY3Qgb2YgZmV0Y2hpbmcgY29tbWVudHMgZm9yIHBvaW50cy4gVE9ETzogaGFuZGxlXG4vLyBgQ29tbWVudGAgaW4gdGhlIG1vZGVsIGZ1bmN0aW9uLlxuLy9cbi8vIEEgY29ubmVjdGVkIFBvaW50Q29sbGVjdGlvbiBtdXN0IGJlIGFibGUgdG8gZ2VuZXJhdGUgY29ubmVjdGVkIEFsZXJ0cyBvclxuLy8gU2VydmljZXMgb24gZGVtYW5kcy4gVGhlcmVmb3JlLCBpZiBQb2ludENvbGxlY3Rpb24gaXMgY29ubmVjdGVkLCBjb25uZWN0XG4vLyBtb2RlbHMgYmVmb3JlIHJldHVybmluZyB0aGVtLlxuZXhwb3J0IGNvbnN0IFBvaW50Q29sbGVjdGlvbiA9IENvdWNoQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oIG1vZGVscywgb3B0aW9ucyApIHtcbiAgICBDb3VjaENvbGxlY3Rpb24ucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5wb3VjaCA9IHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYWxsRG9jczogYXNzaWduKFxuICAgICAgICAgIHsgaW5jbHVkZV9kb2NzOiB0cnVlIH0sXG4gICAgICAgICAgb3B0aW9ucy5rZXlzID8geyBrZXlzOiBvcHRpb25zLmtleXMgfSA6IGtleXNCZXR3ZWVuKCAncG9pbnQvJyApXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qge2Nvbm5lY3QsIGRhdGFiYXNlfSA9IHRoaXM7XG4gICAgdGhpcy5zZXJ2aWNlID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBTZXJ2aWNlICkgOiBTZXJ2aWNlO1xuICAgIHRoaXMuYWxlcnQgPSBjb25uZWN0ID8gY29ubmVjdCggZGF0YWJhc2UsIEFsZXJ0ICkgOiBBbGVydDtcbiAgfSxcblxuICAvLyBUaGlzIGhhbmRsZXMgdGhlIGBvcHRpb25zLmtleXNgIGVkZ2UgY2FzZXMgbGlzdGVkIGluIHRoZVxuICAvLyBbUG91Y2hEQiBhcGldKGh0dHBzOi8vcG91Y2hkYi5jb20vYXBpLmh0bWwjYmF0Y2hfZmV0Y2gpXG4gIHBhcnNlOiBmdW5jdGlvbiggcmVzcG9uc2UsIG9wdGlvbnMgKSB7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnJvd3MuZmlsdGVyKFxuICAgICAgcm93ID0+ICEoIHJvdy5kZWxldGVkIHx8IHJvdy5lcnJvciApXG4gICAgKS5tYXAoXG4gICAgICByb3cgPT4gcm93LmRvY1xuICAgICk7XG4gIH0sXG5cbiAgbW9kZWw6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIGNvbnN0IHBhcnRzID0gcG9pbnRJZCggYXR0cmlidXRlcy5faWQgKTtcbiAgICBjb25zdCBtYXAgPSB7XG4gICAgICAnc2VydmljZSc6IG9wdGlvbnMuY29sbGVjdGlvbi5zZXJ2aWNlLFxuICAgICAgJ2FsZXJ0Jzogb3B0aW9ucy5jb2xsZWN0aW9uLmFsZXJ0XG4gICAgfTtcbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9IG1hcFsgcGFydHMudHlwZSBdO1xuICAgIGlmICggY29uc3RydWN0b3IgKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBjb25zdHJ1Y3RvciggYXR0cmlidXRlcywgb3B0aW9ucyApO1xuXG4gICAgICBpZiAoIG9wdGlvbnMuZGVpbmRleCAmJiBpbnN0YW5jZS5oYXMoICdpbmRleCcgKSApIHtcbiAgICAgICAgaW5zdGFuY2UuaW5kZXggPSBpbnN0YW5jZS5nZXQoICdpbmRleCcgKTtcbiAgICAgICAgaW5zdGFuY2UudW5zZXQoICdpbmRleCAnICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgJ0EgcG9pbnQgbXVzdCBiZSBlaXRoZXIgYSBzZXJ2aWNlIG9yIGFsZXJ0JztcbiAgICB9XG4gIH0sXG5cbiAgLy8gIyMgRmV0Y2ggQ292ZXIgSW1hZ2VzIGZvciBhbGwgUG9pbnRzXG4gIC8vIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhbGwgcG9pbnRzIGluIHRoZSBhcnJheSBoYXZlXG4gIC8vIHRoZWlyIGNvdmVyIGltYWdlcyBhdmFpbGFibGUuXG4gIGdldENvdmVyczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKCB0aGlzLm1vZGVscy5tYXAoIHBvaW50ID0+IHBvaW50LmdldENvdmVyKCkgKSApO1xuICB9LFxuXG4gIC8vICMjIEdldCBSZWR1eCBSZXByZXNlbnRhdGlvblxuICAvLyBSZXR1cm4gYSBuZXN0ZWQgb2JqZWN0L2FyYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xsZWN0aW9uIHN1aXRhYmxlIGZvclxuICAvLyB1c2Ugd2l0aCByZWR1eC5cbiAgc3RvcmU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmcm9tUGFpcnMoIHRoaXMubW9kZWxzLm1hcCggcG9pbnQgPT4gWyBwb2ludC5pZCwgcG9pbnQuc3RvcmUoKSBdICkgKTtcbiAgfVxufSApO1xuXG4vLyAjIERpc3BsYXkgTmFtZSBmb3IgVHlwZVxuLy8gR2l2ZW4gYSB0eXBlIGtleSBmcm9tIGVpdGhlciB0aGUgc2VydmljZSBvciBhbGVydCB0eXBlIGVudW1lcmF0aW9ucyxcbi8vIHJldHVybiB0aGUgdHlwZSdzIGRpc3BsYXkgc3RyaW5nLCBvciBudWxsIGlmIGl0IGRvZXMgbm90IGV4aXN0LlxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXkoIHR5cGUgKSB7XG4gIGNvbnN0IHZhbHVlcyA9IHNlcnZpY2VUeXBlc1sgdHlwZSBdIHx8IGFsZXJ0VHlwZXNbIHR5cGUgXTtcbiAgaWYgKCB2YWx1ZXMgKSB7XG4gICAgcmV0dXJuIHZhbHVlcy5kaXNwbGF5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vICMgQ29tbWVudCBNb2RlbFxuLy8gSW5mb3JtYXRpb24gYWJvdXQgYWxlcnRzIGFuZCBzZXJ2aWNlcyBlbmNvdW50ZXJlZCBieSBjeWNsaXN0cyBpcyBsaWtlbHlcbi8vIHRvIGNoYW5nZSB3aXRoIHRoZSBzZWFzb25zIG9yIG90aGVyIHJlYXNvbnMuIEN5Y2xpc3RzIHBsYW5uaW5nIHRoZSBuZXh0IGxlZ1xuLy8gb2YgYSB0b3VyIHNob3VsZCBiZSBhYmxlIHRvIHJlYWQgdGhlIGV4cGVyaWVuY2VzIG9mIGN5Y2xpc3RzIGFoZWFkIG9mIHRoZW0uXG4vL1xuLy8gQSBjb21tZW50IG11c3QgaGF2ZSBib3RoIGEgcmF0aW5nIGFuZCB0aGUgdGV4dCBvZiB0aGUgY29tbWVudC4gQ29tbWVudHMgYXJlXG4vLyBsaW1pdGVkIHRvIDE0MCBjaGFyYWN0ZXJzIHRvIGVuc3VyZSB0aGV5IGRvIG5vdCBkZXZvbHZlIGludG8gZ2VuZXJhbCBhbGVydFxuLy8gb3Igc2VydmljZSBpbmZvcm1hdGlvbiB0aGF0IHNob3VsZCByZWFsbHkgYmUgaW4gdGhlIGRlc2NyaXB0aW9uLiBXZSByZWFsbHlcbi8vIHdhbnQgdXNlcnMgb2YgdGhlIEJpY3ljbGUgVG91cmluZyBDb21wYW5pb24gdG8gcHJvdmlkZSBjb21tZW50cyB2ZXJpZnlpbmdcbi8vIGluZm8gYWJvdXQgcG9pbnRzLCBvciBsZXR0aW5nIG90aGVyIGN5Y2xpc3RzIGtub3cgYWJvdXQgY2hhbmdlcyBpbiB0aGVcbi8vIHNlcnZpY2Ugb3IgYWxlcnQuXG5cbi8vICMjIENvbW1lbnQgTW9kZWwgVXJpXG4vLyBDb21tZW50cyBhcmUgc3RvcmVkIGluIENvdWNoREIgaW4gdGhlIHNhbWUgZGF0YWJhc2UgYXMgcG9pbnRzLiBUaGUgY29tbWVudFxuLy8gbW9kZWwgdXJpIGlzIGNvbXBvc2VkIG9mIHRocmVlIHBhcnRzOlxuLy8gIDEuIFRoZSBlbnRpcmUgaWQgb2YgdGhlIHJlbGF0ZWQgcG9pbnRcbi8vICAyLiBUaGUgc3RyaW5nICdjb21tZW50Lydcbi8vICAzLiBBIHRpbWUgYmFzZWQgVVVJRCB0byB1bmlxdWVseSBpZGVudGlmeSBjb21tZW50c1xuLy9cbi8vIFdlIGRvbid0IHVzZSBgZG9jdXJpYCBmb3IgdGhlIGNvbW1lbnQgbW9kZWwgdXJpcyBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdG9cbi8vIHBhcnNlIHRoZW0uXG5cbmNvbnN0IENPTU1FTlRfTUFYX0xFTkdUSCA9IDE0MDtcbmV4cG9ydCBjb25zdCBDb21tZW50ID0gQ291Y2hNb2RlbC5leHRlbmQoIHtcbiAgaWRBdHRyaWJ1dGU6ICdfaWQnLFxuXG4gIC8vICMjIENvbnN0cnVjdG9yXG4gIC8vIEdlbmVyYXRlIGBfaWRgLiBgcG9pbnRJZGAgbXVzdCBiZSBzcGVjaWZpZWQgaW4gb3B0aW9ucy5cbiAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmICggIWF0dHJpYnV0ZXMudXVpZCApIHtcbiAgICAgIGF0dHJpYnV0ZXMudXVpZCA9IHV1aWQudjEoKTtcbiAgICB9XG4gICAgaWYgKCAhYXR0cmlidXRlcy5faWQgJiYgb3B0aW9ucy5wb2ludElkICkge1xuICAgICAgYXR0cmlidXRlcy5faWQgPSBvcHRpb25zLnBvaW50SWQgKyAnL2NvbW1lbnQvJyArIGF0dHJpYnV0ZXMudXVpZDtcbiAgICB9XG4gICAgQ291Y2hNb2RlbC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gIH0sXG5cbiAgc2NoZW1hOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHRleHQ6IHtcbiAgICAgICAgJ3R5cGUnOiAnc3RyaW5nJyxcbiAgICAgICAgJ21heExlbmd0aCc6IENPTU1FTlRfTUFYX0xFTkdUSFxuICAgICAgfSxcbiAgICAgIHJhdGluZzoge1xuICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgIG1pbmltdW06IDEsXG4gICAgICAgIG1heGltdW06IDVcbiAgICAgIH0sXG4gICAgICB1dWlkOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICB9XG4gICAgfSxcbiAgICByZXF1aXJlZDogW1xuICAgICAgJ3RleHQnLFxuICAgICAgJ3JhdGluZycsXG4gICAgICAndXVpZCdcbiAgICBdXG4gIH1cbn0sIHtcbiAgTUFYX0xFTkdUSDogQ09NTUVOVF9NQVhfTEVOR1RIXG59ICk7XG5cbm1peGluVmFsaWRhdGlvbiggQ29tbWVudCApO1xuXG4vLyAjIENvbW1lbnQgQ29sbGVjdGlvblxuLy8gRmV0Y2ggb25seSBjb21tZW50cyBhc3NvY2lhdGVkIHdpdGggYSBnaXZlbiBwb2ludC5cbmV4cG9ydCBjb25zdCBDb21tZW50Q29sbGVjdGlvbiA9IENvdWNoQ29sbGVjdGlvbi5leHRlbmQoIHtcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oIG1vZGVscywgb3B0aW9ucyApIHtcbiAgICBDb3VjaENvbGxlY3Rpb24ucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIGNvbnN0IHBvaW50SWQgPSB0aGlzLnBvaW50SWQgPSBvcHRpb25zLnBvaW50SWQ7XG5cbiAgICBjb25zdCBjb25uZWN0ID0gdGhpcy5jb25uZWN0O1xuICAgIGNvbnN0IGRhdGFiYXNlID0gdGhpcy5kYXRhYmFzZTtcbiAgICB0aGlzLmNvbW1lbnQgPSBjb25uZWN0ID8gY29ubmVjdCggZGF0YWJhc2UsIENvbW1lbnQgKSA6IENvbW1lbnQ7XG5cbiAgICB0aGlzLnBvdWNoID0ge1xuICAgICAgb3B0aW9uczoge1xuICAgICAgICBhbGxEb2NzOiB7XG4gICAgICAgICAgLi4ua2V5c0JldHdlZW4oIHBvaW50SWQgKyAnL2NvbW1lbnQnICksXG4gICAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9LFxuXG4gIG1vZGVsOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBjb25zdCB7Y29tbWVudCwgcG9pbnRJZH0gPSBvcHRpb25zLmNvbGxlY3Rpb247XG4gICAgcmV0dXJuIG5ldyBjb21tZW50KCBhdHRyaWJ1dGVzLCB7IHBvaW50SWQsIC4uLm9wdGlvbnMgfSApO1xuICB9XG59ICk7XG4iXX0=