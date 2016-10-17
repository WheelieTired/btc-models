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
//  3. The normalized name of the point
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wb2ludC5qcyJdLCJuYW1lcyI6WyJkaXNwbGF5IiwiYnJvd3NlciIsIndpbmRvdyIsIlByb21pc2UiLCJyZXF1aXJlIiwicG9pbnRJZCIsInJvdXRlIiwiUG9pbnQiLCJleHRlbmQiLCJpZEF0dHJpYnV0ZSIsImluaXRpYWxpemUiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInByb3RvdHlwZSIsImFwcGx5IiwiYXJndW1lbnRzIiwiZGF0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsInNldCIsImNyZWF0ZWRfYXQiLCJ1cGRhdGVkX2F0IiwiY292ZXJCbG9iIiwiY292ZXJVcmwiLCJ1cGRhdGUiLCJzcGVjaWZ5IiwidHlwZSIsIm5hbWUiLCJsb2NhdGlvbiIsImxhdCIsImxuZyIsIl9pZCIsImdlb2hhc2giLCJlbmNvZGUiLCJzYWZlZ3VhcmQiLCJkZWZhdWx0cyIsImZsYWciLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJtaW5JdGVtcyIsIm1heEl0ZW1zIiwiaXRlbXMiLCJmb3JtYXQiLCJkZXNjcmlwdGlvbiIsInJlcXVpcmVkIiwiY2xlYXIiLCJmZXRjaCIsInRoZW4iLCJnZXRDb3ZlciIsInJlcyIsInJldCIsInJlc29sdmUiLCJoYXNDb3ZlciIsImF0dGFjaG1lbnRzIiwiYXR0YWNobWVudCIsImJsb2IiLCJzZXRDb3ZlciIsInN0b3JlIiwidG9KU09OIiwidXJpIiwiZm9yIiwiaWQiLCJTZXJ2aWNlIiwiQWxlcnQiLCJzZXJ2aWNlVHlwZXMiLCJjYWxsIiwiYW1lbml0aWVzIiwic2NoZWR1bGUiLCJzZWFzb25hbCIsImVudW0iLCJhZGRyZXNzIiwicGhvbmUiLCJ3ZWJzaXRlIiwidXBkYXRlZCIsImFsZXJ0VHlwZXMiLCJQb2ludENvbGxlY3Rpb24iLCJtb2RlbHMiLCJwb3VjaCIsImFsbERvY3MiLCJpbmNsdWRlX2RvY3MiLCJrZXlzIiwiY29ubmVjdCIsImRhdGFiYXNlIiwic2VydmljZSIsImFsZXJ0IiwicGFyc2UiLCJyZXNwb25zZSIsInJvd3MiLCJmaWx0ZXIiLCJyb3ciLCJkZWxldGVkIiwiZXJyb3IiLCJtYXAiLCJkb2MiLCJtb2RlbCIsInBhcnRzIiwiY29sbGVjdGlvbiIsImNvbnN0cnVjdG9yIiwiaW5zdGFuY2UiLCJkZWluZGV4IiwiaGFzIiwiaW5kZXgiLCJnZXQiLCJ1bnNldCIsImdldENvdmVycyIsImFsbCIsInBvaW50IiwidmFsdWVzIiwiQ09NTUVOVF9NQVhfTEVOR1RIIiwiQ29tbWVudCIsInV1aWQiLCJ2MSIsInRleHQiLCJyYXRpbmciLCJtaW5pbXVtIiwibWF4aW11bSIsIk1BWF9MRU5HVEgiLCJDb21tZW50Q29sbGVjdGlvbiIsImNvbW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozt5cEJBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFrYmdCQSxPLEdBQUFBLE87O0FBL1poQjs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUMsVUFBWSxPQUFPQyxNQUFQLEtBQWtCLFdBQXBDOztBQUVBLElBQUlDLFVBQVVDLFFBQVEsa0JBQVIsQ0FBZDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsVUFBVSxpQkFBT0MsS0FBUCxDQUFjLDRCQUFkLENBQWhCOztBQUVPLElBQU1DLHdCQUFRLGlCQUFXQyxNQUFYLENBQW1CO0FBQ3RDQyxlQUFhLEtBRHlCOztBQUd0Q0MsY0FBWSxvQkFBVUMsVUFBVixFQUFzQkMsT0FBdEIsRUFBZ0M7QUFDMUMscUJBQVdDLFNBQVgsQ0FBcUJILFVBQXJCLENBQWdDSSxLQUFoQyxDQUF1QyxJQUF2QyxFQUE2Q0MsU0FBN0M7O0FBRUEsUUFBTUMsT0FBTyxJQUFJQyxJQUFKLEdBQVdDLFdBQVgsRUFBYjtBQUNBLFNBQUtDLEdBQUwsQ0FBVTtBQUNSQyxrQkFBWUos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aEI7O0FBMkNQLHNDQUFpQkMsT0FBakI7O0FBRUE7QUFDQTtBQUNPLElBQU1RLGdEQUFvQixzQkFBZ0I5RyxNQUFoQixDQUF3QjtBQUN2REUsY0FBWSxvQkFBVW1FLE1BQVYsRUFBa0JqRSxPQUFsQixFQUE0QjtBQUN0QywwQkFBZ0JDLFNBQWhCLENBQTBCSCxVQUExQixDQUFxQ0ksS0FBckMsQ0FBNEMsSUFBNUMsRUFBa0RDLFNBQWxEO0FBQ0EsUUFBTVYsVUFBVSxLQUFLQSxPQUFMLEdBQWVPLFFBQVFQLE9BQXZDOztBQUVBLFFBQU02RSxVQUFVLEtBQUtBLE9BQXJCO0FBQ0EsUUFBTUMsV0FBVyxLQUFLQSxRQUF0QjtBQUNBLFNBQUtvQyxPQUFMLEdBQWVyQyxVQUFVQSxRQUFTQyxRQUFULEVBQW1CMkIsT0FBbkIsQ0FBVixHQUF5Q0EsT0FBeEQ7O0FBRUEsU0FBS2hDLEtBQUwsR0FBYTtBQUNYbEUsZUFBUztBQUNQbUUsOEJBQ0ssdUJBQWExRSxVQUFVLFVBQXZCLENBREw7QUFFRTJFLHdCQUFjO0FBRmhCO0FBRE87QUFERSxLQUFiO0FBUUQsR0FqQnNEOztBQW1CdkRlLFNBQU8sZUFBVXBGLFVBQVYsRUFBc0JDLE9BQXRCLEVBQWdDO0FBQUEsOEJBQ1ZBLFFBQVFxRixVQURFO0FBQUEsUUFDOUJzQixPQUQ4Qix1QkFDOUJBLE9BRDhCO0FBQUEsUUFDckJsSCxPQURxQix1QkFDckJBLE9BRHFCOztBQUVyQyxXQUFPLElBQUlrSCxPQUFKLENBQWE1RyxVQUFiLGFBQTJCTixnQkFBM0IsSUFBdUNPLE9BQXZDLEVBQVA7QUFDRDtBQXRCc0QsQ0FBeEIsQ0FBMUIiLCJmaWxlIjoicG9pbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBidGMtYXBwLXNlcnZlciAtLSBTZXJ2ZXIgZm9yIHRoZSBCaWN5Y2xlIFRvdXJpbmcgQ29tcGFuaW9uXG4gKiBDb3B5cmlnaHQgwqkgMjAxNiBBZHZlbnR1cmUgQ3ljbGluZyBBc3NvY2lhdGlvblxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGJ0Yy1hcHAtc2VydmVyLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogYnRjLWFwcC1zZXJ2ZXIgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRm9vYmFyLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCB7IG1peGluVmFsaWRhdGlvbiwgbWVyZ2VTY2hlbWFzIH0gZnJvbSAnLi92YWxpZGF0aW9uLW1peGluJztcbmltcG9ydCB7IENvdWNoTW9kZWwsIENvdWNoQ29sbGVjdGlvbiwga2V5c0JldHdlZW4gfSBmcm9tICcuL2Jhc2UnO1xuXG5pbXBvcnQgeyBrZXlzLCBmcm9tUGFpcnMsIGluY2x1ZGVzLCBhc3NpZ24gfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgY3JlYXRlT2JqZWN0VVJMIH0gZnJvbSAnYmxvYi11dGlsJztcblxuaW1wb3J0IGRvY3VyaSBmcm9tICdkb2N1cmknO1xuaW1wb3J0IG5nZW9oYXNoIGZyb20gJ25nZW9oYXNoJztcbmltcG9ydCBub3JtYWxpemUgZnJvbSAndG8taWQnO1xuaW1wb3J0IHV1aWQgZnJvbSAnbm9kZS11dWlkJztcblxuY29uc3QgYnJvd3NlciA9ICggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgKTtcblxudmFyIFByb21pc2UgPSByZXF1aXJlKCdwb2x5ZmlsbC1wcm9taXNlJyk7XG5cbi8vICMgUG9pbnQgTW9kZWxcbi8vIFRoZSBwb2ludCByZXByZXNlbnRzIGEgbG9jYXRpb24gb24gdGhlIG1hcCB3aXRoIGFzc29jaWF0ZWQgbWV0YWRhdGEsIGdlb2RhdGEsXG4vLyBhbmQgdXNlciBwcm92aWRlZCBkYXRhLiBUaGUgcG9pbnQgaXMgdGhlIGJhc2Ugc2hhcmVkIGJ5IHNlcnZpY2VzIGFuZCBhbGVydHMuXG4vL1xuLy8gVGhlIEpTT04gc2NoZW1hIHN0b3JlZCBpbiBgUG9pbnRgLCBhbmQgYXMgcGF0Y2hlZCBieSBgU2VydmljZWAgYW5kIGBBbGVydGAsXG4vLyBpcyB0aGUgYXV0aG9yaXRhdGl2ZSBkZWZpbml0aW9uIG9mIHRoZSBwb2ludCByZWNvcmQuXG5cbi8vICMjIFBvaW50IE1vZGVsIFVyaVxuLy8gUG9pbnRzIGFyZSBzdG9yZWQgaW4gQ291Y2hEQi4gQ291Y2hEQiBkb2N1bWVudHMgY2FuIGhhdmUgcmljaCBpZCBzdHJpbmdzXG4vLyB0byBoZWxwIHN0b3JlIGFuZCBhY2Nlc3MgZGF0YSB3aXRob3V0IE1hcFJlZHVjZSBqb2JzLlxuLy9cbi8vIFRoZSBwb2ludCBtb2RlbCB1cmkgaXMgY29tcG9zZWQgb2YgZm91ciBwYXJ0czpcbi8vICAxLiBUaGUgc3RyaW5nICdwb2ludC8nYFxuLy8gIDIuIFRoZSB0eXBlIG9mIHBvaW50LCBlaXRoZXIgJ3NlcnZpY2UnIG9yICdhbGVydCdcbi8vICAzLiBUaGUgbm9ybWFsaXplZCBuYW1lIG9mIHRoZSBwb2ludFxuLy8gIDQuIFRoZSBwb2ludCdzIGdlb2hhc2hcbmNvbnN0IHBvaW50SWQgPSBkb2N1cmkucm91dGUoICdwb2ludC86dHlwZS86bmFtZS86Z2VvaGFzaCcgKTtcblxuZXhwb3J0IGNvbnN0IFBvaW50ID0gQ291Y2hNb2RlbC5leHRlbmQoIHtcbiAgaWRBdHRyaWJ1dGU6ICdfaWQnLFxuXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzLCBvcHRpb25zICkge1xuICAgIENvdWNoTW9kZWwucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICB0aGlzLnNldCgge1xuICAgICAgY3JlYXRlZF9hdDogZGF0ZSxcbiAgICAgIHVwZGF0ZWRfYXQ6IGRhdGVcbiAgICB9ICk7XG5cbiAgICB0aGlzLmNvdmVyQmxvYiA9IGZhbHNlO1xuICAgIHRoaXMuY292ZXJVcmwgPSBmYWxzZTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0KCAndXBkYXRlZF9hdCcsIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSApO1xuICB9LFxuXG4gIC8vICMjIFNwZWNpZnlcbiAgLy8gRmlsbCBpbiBgX2lkYCBmcm9tIHRoZSBjb21wb25lbnRzIG9mIHRoZSBwb2ludCBtb2RlbCB1cmkuXG4gIC8vIFB1bGwgdmFsdWVzIGZyb20gYGF0dHJpYnV0ZXNgIGlmIG5hbWUgYW5kIGxvY2F0aW9uIGFyZSB1bmRlZmluZWQuXG4gIHNwZWNpZnk6IGZ1bmN0aW9uKCB0eXBlLCBuYW1lLCBsb2NhdGlvbiApIHtcbiAgICBpZiAoIG5hbWUgKSB7XG4gICAgICBjb25zdCBbbGF0LCBsbmddID0gbG9jYXRpb247XG4gICAgICBjb25zdCBfaWQgPSBwb2ludElkKCB7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIG5hbWU6IG5vcm1hbGl6ZSggbmFtZSApLFxuICAgICAgICBnZW9oYXNoOiBuZ2VvaGFzaC5lbmNvZGUoIGxhdCwgbG5nIClcbiAgICAgIH0gKTtcbiAgICAgIHRoaXMuc2V0KCB7IF9pZCwgdHlwZSwgbmFtZSwgbG9jYXRpb24gfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7bmFtZSwgbG9jYXRpb259ID0gdGhpcy5hdHRyaWJ1dGVzO1xuICAgICAgY29uc3QgW2xhdCwgbG5nXSA9IGxvY2F0aW9uO1xuICAgICAgY29uc3QgX2lkID0gcG9pbnRJZCgge1xuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBuYW1lOiBub3JtYWxpemUoIG5hbWUgKSxcbiAgICAgICAgZ2VvaGFzaDogbmdlb2hhc2guZW5jb2RlKCBsYXQsIGxuZyApXG4gICAgICB9ICk7XG4gICAgICB0aGlzLnNldCggeyBfaWQgfSApO1xuICAgIH1cbiAgfSxcblxuICAvLyAjIyBTYWZlZ3VhcmQgZm9yIFBvaW50c1xuICAvLyBQb2ludHMgaGF2ZSBpbWFnZSBhdHRhY2htZW50cywgc28gd2Ugc2hvdWxkIGxldCBiYWNrYm9uZSBwb3VjaCBoYW5kbGVcbiAgLy8gdGhvc2UgYW5kIHdlIHNob3VsZCBub3QgdmFsaWRhdGUgdGhlIF9hdHRhY2htZW50cyBrZXlcbiAgc2FmZWd1YXJkOiBbXG4gICAgJ19hdHRhY2htZW50cydcbiAgXSxcblxuICBkZWZhdWx0czogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZsYWc6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBzY2hlbWE6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgbmFtZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIG1pbkl0ZW1zOiAyLFxuICAgICAgICBtYXhJdGVtczogMixcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdHlwZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIGNyZWF0ZWRfYXQ6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgIH0sXG4gICAgICB1cGRhdGVkX2F0OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICdkYXRlLXRpbWUnXG4gICAgICB9LFxuICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICBmbGFnOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICduYW1lJyxcbiAgICAgICdsb2NhdGlvbicsXG4gICAgICAndHlwZScsXG4gICAgICAnY3JlYXRlZF9hdCcsXG4gICAgICAndXBkYXRlZF9hdCcsXG4gICAgICAnZmxhZydcbiAgICBdXG4gIH0sXG5cbiAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgIENvdWNoTW9kZWwucHJvdG90eXBlLmNsZWFyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICB0aGlzLmNvdmVyVXJsID0gZmFsc2U7XG4gIH0sXG5cbiAgLy8gIyMgRmV0Y2hcbiAgLy8gV2hlbiBmZXRjaGluZyBhIHBvaW50LCBzaG91bGQgaXQgaGF2ZSBhIGNvdmVyIGF0dGFjaG1lbnQsIGV4dGVuZCB0aGVcbiAgLy8gcHJvbWlzZSB0byBmZXRjaCB0aGUgYXR0YWNobWVudCBhbmQgc2V0IGB0aGlzLmNvdmVyVXJsYC5cbiAgZmV0Y2g6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBDb3VjaE1vZGVsLnByb3RvdHlwZS5mZXRjaC5hcHBseSggdGhpcywgYXJndW1lbnRzICkudGhlbiggcmVzID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmdldENvdmVyKCByZXMgKTtcbiAgICB9ICk7XG4gIH0sXG5cbiAgLy8gIyBHZXQgQ292ZXJcbiAgLy8gU2hvdWxkIGEgcG9pbnQgKGFscmVhZHkgZmV0Y2hlZCkgaGF2ZSBhIGNvdmVyIGF0dGFjaG1lbnQsIGdldCB0aGVcbiAgLy8gYXR0YWNobWVudCdzIGRhdGEgYW5kIHN0b3JlIGFuIG9iamVjdCB1cmwgZm9yIGl0IGluIGB0aGlzLmNvdmVyVXJsYFxuICAvL1xuICAvLyBBcyBhIHV0aWxpdHkgdG8gY2xpZW50IGZ1bmN0aW9ucywgcmVzb2x2ZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byB0aGVcbiAgLy8gc2luZ2xlIGFyZ3VtZW50IHBhc3NlZCB0byBgZ2V0Q292ZXJgLlxuICBnZXRDb3ZlcjogZnVuY3Rpb24oIHJldCApIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbiggKCApID0+IHtcbiAgICAgIGNvbnN0IGhhc0NvdmVyID0gaW5jbHVkZXMoIHRoaXMuYXR0YWNobWVudHMoKSwgJ2NvdmVyLnBuZycgKTtcbiAgICAgIGlmICggYnJvd3NlciAmJiBoYXNDb3ZlciApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNobWVudCggJ2NvdmVyLnBuZycgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9ICkudGhlbiggYmxvYiA9PiB7XG4gICAgICBpZiAoIGJsb2IgKSB7XG4gICAgICAgIHRoaXMuY292ZXJCbG9iID0gYmxvYjtcbiAgICAgICAgdGhpcy5jb3ZlclVybCA9IGNyZWF0ZU9iamVjdFVSTCggYmxvYiApO1xuICAgICAgfVxuICAgIH0gKS50aGVuKCAoICkgPT4ge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9ICk7XG4gIH0sXG5cbiAgLy8gIyMgU2V0IENvdmVyXG4gIC8vIElmIHRoZSB1c2VyIGFscmVhZHkgaGFzIGEgY292ZXIgYmxvYiBhbmQgdGhleSB3YW50IHRvIHVzZSBpdCB3aXRoIHRoZVxuICAvLyBtb2RlbCBiZWZvcmUgYXR0YWNoKCkgY2FuIGZpbmlzaCBzdG9yaW5nIGl0IHRvIFBvdWNoREIsIHRoZXkgY2FuIHVzZVxuICAvLyB0aGlzIG1ldGhvZCB0byBtYW51YWxseSBpbnNlcnQgaXQuXG4gIC8vXG4gIC8vIFRoZSBhc3NvY2lhdGVkIG9iamVjdCB1cmwgZm9yIHRoZSBibG9iIHdpbGwgdGhlbiBiZSBhdmFpbGFibGUgdG8gb3RoZXJcbiAgLy8gZnVuY3Rpb25zIGxpa2Ugc3RvcmUoKS5cbiAgc2V0Q292ZXI6IGZ1bmN0aW9uKCBibG9iICkge1xuICAgIHRoaXMuY292ZXJCbG9iID0gYmxvYjtcbiAgICBpZiAoIGJyb3dzZXIgKSB7XG4gICAgICB0aGlzLmNvdmVyVXJsID0gY3JlYXRlT2JqZWN0VVJMKCBibG9iICk7XG4gICAgfVxuICB9LFxuXG4gIC8vICMjIEdldCBSZWR1eCBSZXByZXNlbnRhdGlvblxuICAvLyBSZXR1cm4gYSBuZXN0ZWQgb2JqZWN0L2FyYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBzdWl0YWJsZSBmb3JcbiAgLy8gdXNlIHdpdGggcmVkdXguXG4gIHN0b3JlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geyAuLi50aGlzLnRvSlNPTigpLCBjb3ZlclVybDogdGhpcy5jb3ZlclVybCB9O1xuICB9XG59LCB7XG4gIHVyaTogcG9pbnRJZCxcblxuICBmb3I6IGlkID0+IHtcbiAgICBjb25zdCB7dHlwZX0gPSBwb2ludElkKCBpZCApO1xuICAgIGlmICggdHlwZSA9PT0gJ3NlcnZpY2UnICkge1xuICAgICAgcmV0dXJuIG5ldyBTZXJ2aWNlKCB7IF9pZDogaWQgfSApO1xuICAgIH0gZWxzZSBpZiAoIHR5cGUgPT09ICdhbGVydCcgKSB7XG4gICAgICByZXR1cm4gbmV3IEFsZXJ0KCB7IF9pZDogaWQgfSApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyAnQSBwb2ludCBtdXN0IGVpdGhlciBiZSBhIHNlcnZpY2Ugb3IgYWxlcnQnO1xuICAgIH1cbiAgfVxufSApO1xuXG4vLyAjIFNlcnZpY2UgTW9kZWxcbi8vIEEgc2VydmljZSBpcyBhIGJ1aXNuZXNzIG9yIHBvaW50IG9mIGludGVyZXN0IHRvIGEgY3ljbGlzdC4gQSBjeWNsaXN0IG5lZWRzXG4vLyB0byBrbm93IHdoZXJlIHRoZXkgd2FudCB0byBzdG9wIHdlbGwgaW4gYWR2YW5jZSBvZiB0aGVpciB0cmF2ZWwgdGhyb3VnaCBhblxuLy8gYXJlYS4gVGhlIHNlcnZpY2UgcmVjb3JkIG11c3QgY29udGFpbiBlbm91Z2ggaW5mb3JtYXRpb24gdG8gaGVscCB0aGUgY3ljbGlzdFxuLy8gbWFrZSBzdWNoIGRlY2lzaW9ucy5cbi8vXG4vLyBUaGUgcmVjb3JkIGluY2x1ZGVzIGNvbnRhY3QgaW5mb3JtYXRpb24sIGFuZCBhIHNjaGVkdWxlIG9mIGhvdXJzIG9mXG4vLyBvcGVyYXRpb24uIEl0IGlzIGltcG9ydGFudCB0aGF0IHdlIHN0b3JlIHRoZSB0aW1lIHpvbmUgb2YgYSBzZXJ2aWNlLCBzaW5jZVxuLy8gdG91cmluZyBjeWNsaXN0cyB3aWxsIGNyb3NzIHRpbWUgem9uZXMgb24gdGhlaXIgdHJhdmVscy4gRnVydGhlcm1vcmUsXG4vLyBzZXJ2aWNlcyBvZiBpbnRlcmVzdCB0byB0b3VyaW5nIGN5Y2xpc3RzIG1heSBiZSBzZWFzb25hbDogd2Ugc3RvcmVcbi8vIHNjaGVkdWxlcyBmb3IgZGlmZmVyZW50IHNlYXNvbnMuXG5cbi8vICMjIFNlcnZpY2UgVHlwZXNcbi8vIEEgU2VydmljZSBtYXkgaGF2ZSBhIHNpbmdsZSB0eXBlLCBpbmRpY2F0aW5nIHRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhlXG4vLyBidWlzbmVzcyBvciBwb2ludCBvZiBpbnRlcmVzdC4gU2VydmljZSB0eXBlcyBtYXkgYWxzbyBiZSBpbmNsdWRlZCBpbiBhXG4vLyBTZXJ2aWNlJ3MgYW1lbml0aWVzIGFycmF5LlxuXG4vKmVzZm10LWlnbm9yZS1zdGFydCovXG5leHBvcnQgY29uc3Qgc2VydmljZVR5cGVzID0ge1xuICAnYWlycG9ydCc6IHsgZGlzcGxheTogJ0FpcnBvcnQnIH0sXG4gICdiYXInOiB7IGRpc3BsYXk6ICdCYXInIH0sXG4gICdiZWRfYW5kX2JyZWFrZmFzdCc6IHsgZGlzcGxheTogJ0JlZCAmIEJyZWFrZmFzdCcgfSxcbiAgJ2Jpa2Vfc2hvcCc6IHsgZGlzcGxheTogJ0Jpa2UgU2hvcCcgfSxcbiAgJ2NhYmluJzogeyBkaXNwbGF5OiAnQ2FiaW4nIH0sXG4gICdjYW1wZ3JvdW5kJzogeyBkaXNwbGF5OiAnQ2FtcGdyb3VuZCcgfSxcbiAgJ2NvbnZlbmllbmNlX3N0b3JlJzogeyBkaXNwbGF5OiAnQ29udmVuaWVuY2UgU3RvcmUnIH0sXG4gICdjeWNsaXN0c19jYW1waW5nJzogeyBkaXNwbGF5OiAnQ3ljbGlzdHNcXCcgQ2FtcGluZycgfSxcbiAgJ2N5Y2xpc3RzX2xvZGdpbmcnOiB7IGRpc3BsYXk6ICdDeWNsaXN0c1xcJyBMb2RnaW5nJyB9LFxuICAnZ3JvY2VyeSc6IHsgZGlzcGxheTogJ0dyb2NlcnknIH0sXG4gICdob3N0ZWwnOiB7IGRpc3BsYXk6ICdIb3N0ZWwnIH0sXG4gICdob3Rfc3ByaW5nJzogeyBkaXNwbGF5OiAnSG90IFNwcmluZycgfSxcbiAgJ2hvdGVsJzogeyBkaXNwbGF5OiAnSG90ZWwnIH0sXG4gICdtb3RlbCc6IHsgZGlzcGxheTogJ01vdGVsJyB9LFxuICAnaW5mb3JtYXRpb24nOiB7IGRpc3BsYXk6ICdJbmZvcm1hdGlvbicgfSxcbiAgJ2xpYnJhcnknOiB7IGRpc3BsYXk6ICdMaWJyYXJ5JyB9LFxuICAnbXVzZXVtJzogeyBkaXNwbGF5OiAnTXVzZXVtJyB9LFxuICAnb3V0ZG9vcl9zdG9yZSc6IHsgZGlzcGxheTogJ091dGRvb3IgU3RvcmUnIH0sXG4gICdyZXN0X2FyZWEnOiB7IGRpc3BsYXk6ICdSZXN0IEFyZWEnIH0sXG4gICdyZXN0YXVyYW50JzogeyBkaXNwbGF5OiAnUmVzdGF1cmFudCcgfSxcbiAgJ3Jlc3Ryb29tJzogeyBkaXNwbGF5OiAnUmVzdHJvb20nIH0sXG4gICdzY2VuaWNfYXJlYSc6IHsgZGlzcGxheTogJ1NjZW5pYyBBcmVhJyB9LFxuICAnc3RhdGVfcGFyayc6IHsgZGlzcGxheTogJ1N0YXRlIFBhcmsnIH0sXG4gICdvdGhlcic6IHsgZGlzcGxheTogJ090aGVyJyB9XG59O1xuLyplc2ZtdC1pZ25vcmUtZW5kKi9cblxuZXhwb3J0IGNvbnN0IFNlcnZpY2UgPSBQb2ludC5leHRlbmQoIHtcbiAgc3BlY2lmeTogZnVuY3Rpb24oIG5hbWUsIGxvY2F0aW9uICkge1xuICAgIFBvaW50LnByb3RvdHlwZS5zcGVjaWZ5LmNhbGwoIHRoaXMsICdzZXJ2aWNlJywgbmFtZSwgbG9jYXRpb24gKTtcbiAgfSxcblxuICBkZWZhdWx0czogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLlBvaW50LnByb3RvdHlwZS5kZWZhdWx0cy5hcHBseSggdGhpcywgYXJndW1lbnRzICksXG4gICAgICBhbWVuaXRpZXM6IFtdLFxuICAgICAgc2NoZWR1bGU6IHsgJ2RlZmF1bHQnOiBbXSB9LFxuICAgICAgc2Vhc29uYWw6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBzY2hlbWE6IG1lcmdlU2NoZW1hcyggUG9pbnQucHJvdG90eXBlLnNjaGVtYSwge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgZW51bToga2V5cyggc2VydmljZVR5cGVzIClcbiAgICAgIH0sXG4gICAgICBhbWVuaXRpZXM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBlbnVtOiBrZXlzKCBzZXJ2aWNlVHlwZXMgKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYWRkcmVzczoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfSxcbiAgICAgIHNjaGVkdWxlOiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICB9LFxuICAgICAgc2Vhc29uYWw6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICB9LFxuICAgICAgcGhvbmU6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIH0sXG4gICAgICB3ZWJzaXRlOiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmb3JtYXQ6ICd1cmknXG4gICAgICB9LFxuICAgICAgdXBkYXRlZDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicgLy8gdGhlIHVwZGF0ZWQgYXR0cmlidXRlIGlzIG5vdCByZXF1aXJlZFxuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICdzZWFzb25hbCdcbiAgICBdXG4gIH0gKVxufSApO1xuXG4vLyBBcHBseSB0aGUgdmFsaWRhdGlvbiBtaXhpbiB0byB0aGUgU2VydmljZSBtb2RlbC4gU2VlIHZhbGlkYXRpb24tbWl4aW4uanMuXG5taXhpblZhbGlkYXRpb24oIFNlcnZpY2UgKTtcblxuLy8gIyBBbGVydCBNb2RlbFxuLy8gQW4gYWxlcnQgaXMgc29tZXRoaW5nIHRoYXQgbWlnaHQgaW1wZWRlIGEgY3ljbGlzdCdzIHRvdXIuIFdoZW4gYSBjeWNsaXN0XG4vLyBzZWVzIGFuIGFsZXJ0IG9uIHRoZSBtYXAsIHRoZSBrbm93IHRvIHBsYW4gYXJvdW5kIGl0LlxuXG4vKmVzZm10LWlnbm9yZS1zdGFydCovXG5leHBvcnQgY29uc3QgYWxlcnRUeXBlcyA9IHtcbiAgJ3JvYWRfY2xvc3VyZSc6IHsgZGlzcGxheTogJ1JvYWQgQ2xvc3VyZScgfSxcbiAgJ2ZvcmVzdF9maXJlJzogeyBkaXNwbGF5OiAnRm9yZXN0IGZpcmUnIH0sXG4gICdmbG9vZGluZyc6IHsgZGlzcGxheTogJ0Zsb29kaW5nJyB9LFxuICAnZGV0b3VyJzogeyBkaXNwbGF5OiAnRGV0b3VyJyB9LFxuICAnb3RoZXInOiB7IGRpc3BsYXk6ICdPdGhlcicgfVxufTtcbi8qZXNmbXQtaWdub3JlLWVuZCovXG5cbmV4cG9ydCBjb25zdCBBbGVydCA9IFBvaW50LmV4dGVuZCgge1xuICBzcGVjaWZ5OiBmdW5jdGlvbiggbmFtZSwgbG9jYXRpb24gKSB7XG4gICAgUG9pbnQucHJvdG90eXBlLnNwZWNpZnkuY2FsbCggdGhpcywgJ2FsZXJ0JywgbmFtZSwgbG9jYXRpb24gKTtcbiAgfSxcblxuICBzY2hlbWE6IG1lcmdlU2NoZW1hcyggUG9pbnQucHJvdG90eXBlLnNjaGVtYSwge1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgZW51bToga2V5cyggYWxlcnRUeXBlcyApXG4gICAgICB9XG4gICAgfVxuICB9IClcbn0gKTtcblxubWl4aW5WYWxpZGF0aW9uKCBBbGVydCApO1xuXG4vLyAjIFBvaW50IENvbGxlY3Rpb25cbi8vIEEgaGV0ZXJvZ2VuZW91cyBjb2xsZWN0aW9uIG9mIHNlcnZpY2VzIGFuZCBhbGVydHMuIFBvdWNoREIgaXMgYWJsZSB0byBmZXRjaFxuLy8gdGhpcyBjb2xsZWN0aW9uIGJ5IGxvb2tpbmcgZm9yIGFsbCBrZXlzIHN0YXJ0aW5nIHdpdGggJ3BvaW50LycuXG4vL1xuLy8gVGhpcyBhbHNvIGhhcyB0aGUgZWZmZWN0IG9mIGZldGNoaW5nIGNvbW1lbnRzIGZvciBwb2ludHMuIFRPRE86IGhhbmRsZVxuLy8gYENvbW1lbnRgIGluIHRoZSBtb2RlbCBmdW5jdGlvbi5cbi8vXG4vLyBBIGNvbm5lY3RlZCBQb2ludENvbGxlY3Rpb24gbXVzdCBiZSBhYmxlIHRvIGdlbmVyYXRlIGNvbm5lY3RlZCBBbGVydHMgb3Jcbi8vIFNlcnZpY2VzIG9uIGRlbWFuZHMuIFRoZXJlZm9yZSwgaWYgUG9pbnRDb2xsZWN0aW9uIGlzIGNvbm5lY3RlZCwgY29ubmVjdFxuLy8gbW9kZWxzIGJlZm9yZSByZXR1cm5pbmcgdGhlbS5cbmV4cG9ydCBjb25zdCBQb2ludENvbGxlY3Rpb24gPSBDb3VjaENvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBtb2RlbHMsIG9wdGlvbnMgKSB7XG4gICAgQ291Y2hDb2xsZWN0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMucG91Y2ggPSB7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGFsbERvY3M6IGFzc2lnbihcbiAgICAgICAgICB7IGluY2x1ZGVfZG9jczogdHJ1ZSB9LFxuICAgICAgICAgIG9wdGlvbnMua2V5cyA/IHsga2V5czogb3B0aW9ucy5rZXlzIH0gOiBrZXlzQmV0d2VlbiggJ3BvaW50LycgKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHtjb25uZWN0LCBkYXRhYmFzZX0gPSB0aGlzO1xuICAgIHRoaXMuc2VydmljZSA9IGNvbm5lY3QgPyBjb25uZWN0KCBkYXRhYmFzZSwgU2VydmljZSApIDogU2VydmljZTtcbiAgICB0aGlzLmFsZXJ0ID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBBbGVydCApIDogQWxlcnQ7XG4gIH0sXG5cbiAgLy8gVGhpcyBoYW5kbGVzIHRoZSBgb3B0aW9ucy5rZXlzYCBlZGdlIGNhc2VzIGxpc3RlZCBpbiB0aGVcbiAgLy8gW1BvdWNoREIgYXBpXShodHRwczovL3BvdWNoZGIuY29tL2FwaS5odG1sI2JhdGNoX2ZldGNoKVxuICBwYXJzZTogZnVuY3Rpb24oIHJlc3BvbnNlLCBvcHRpb25zICkge1xuICAgIHJldHVybiByZXNwb25zZS5yb3dzLmZpbHRlcihcbiAgICAgIHJvdyA9PiAhKCByb3cuZGVsZXRlZCB8fCByb3cuZXJyb3IgKVxuICAgICkubWFwKFxuICAgICAgcm93ID0+IHJvdy5kb2NcbiAgICApO1xuICB9LFxuXG4gIG1vZGVsOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBjb25zdCBwYXJ0cyA9IHBvaW50SWQoIGF0dHJpYnV0ZXMuX2lkICk7XG4gICAgY29uc3QgbWFwID0ge1xuICAgICAgJ3NlcnZpY2UnOiBvcHRpb25zLmNvbGxlY3Rpb24uc2VydmljZSxcbiAgICAgICdhbGVydCc6IG9wdGlvbnMuY29sbGVjdGlvbi5hbGVydFxuICAgIH07XG4gICAgY29uc3QgY29uc3RydWN0b3IgPSBtYXBbIHBhcnRzLnR5cGUgXTtcbiAgICBpZiAoIGNvbnN0cnVjdG9yICkge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgY29uc3RydWN0b3IoIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKTtcblxuICAgICAgaWYgKCBvcHRpb25zLmRlaW5kZXggJiYgaW5zdGFuY2UuaGFzKCAnaW5kZXgnICkgKSB7XG4gICAgICAgIGluc3RhbmNlLmluZGV4ID0gaW5zdGFuY2UuZ2V0KCAnaW5kZXgnICk7XG4gICAgICAgIGluc3RhbmNlLnVuc2V0KCAnaW5kZXggJyApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93ICdBIHBvaW50IG11c3QgYmUgZWl0aGVyIGEgc2VydmljZSBvciBhbGVydCc7XG4gICAgfVxuICB9LFxuXG4gIC8vICMjIEZldGNoIENvdmVyIEltYWdlcyBmb3IgYWxsIFBvaW50c1xuICAvLyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYWxsIHBvaW50cyBpbiB0aGUgYXJyYXkgaGF2ZVxuICAvLyB0aGVpciBjb3ZlciBpbWFnZXMgYXZhaWxhYmxlLlxuICBnZXRDb3ZlcnM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbCggdGhpcy5tb2RlbHMubWFwKCBwb2ludCA9PiBwb2ludC5nZXRDb3ZlcigpICkgKTtcbiAgfSxcblxuICAvLyAjIyBHZXQgUmVkdXggUmVwcmVzZW50YXRpb25cbiAgLy8gUmV0dXJuIGEgbmVzdGVkIG9iamVjdC9hcmFyeSByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sbGVjdGlvbiBzdWl0YWJsZSBmb3JcbiAgLy8gdXNlIHdpdGggcmVkdXguXG4gIHN0b3JlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnJvbVBhaXJzKCB0aGlzLm1vZGVscy5tYXAoIHBvaW50ID0+IFsgcG9pbnQuaWQsIHBvaW50LnN0b3JlKCkgXSApICk7XG4gIH1cbn0gKTtcblxuLy8gIyBEaXNwbGF5IE5hbWUgZm9yIFR5cGVcbi8vIEdpdmVuIGEgdHlwZSBrZXkgZnJvbSBlaXRoZXIgdGhlIHNlcnZpY2Ugb3IgYWxlcnQgdHlwZSBlbnVtZXJhdGlvbnMsXG4vLyByZXR1cm4gdGhlIHR5cGUncyBkaXNwbGF5IHN0cmluZywgb3IgbnVsbCBpZiBpdCBkb2VzIG5vdCBleGlzdC5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwbGF5KCB0eXBlICkge1xuICBjb25zdCB2YWx1ZXMgPSBzZXJ2aWNlVHlwZXNbIHR5cGUgXSB8fCBhbGVydFR5cGVzWyB0eXBlIF07XG4gIGlmICggdmFsdWVzICkge1xuICAgIHJldHVybiB2YWx1ZXMuZGlzcGxheTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyAjIENvbW1lbnQgTW9kZWxcbi8vIEluZm9ybWF0aW9uIGFib3V0IGFsZXJ0cyBhbmQgc2VydmljZXMgZW5jb3VudGVyZWQgYnkgY3ljbGlzdHMgaXMgbGlrZWx5XG4vLyB0byBjaGFuZ2Ugd2l0aCB0aGUgc2Vhc29ucyBvciBvdGhlciByZWFzb25zLiBDeWNsaXN0cyBwbGFubmluZyB0aGUgbmV4dCBsZWdcbi8vIG9mIGEgdG91ciBzaG91bGQgYmUgYWJsZSB0byByZWFkIHRoZSBleHBlcmllbmNlcyBvZiBjeWNsaXN0cyBhaGVhZCBvZiB0aGVtLlxuLy9cbi8vIEEgY29tbWVudCBtdXN0IGhhdmUgYm90aCBhIHJhdGluZyBhbmQgdGhlIHRleHQgb2YgdGhlIGNvbW1lbnQuIENvbW1lbnRzIGFyZVxuLy8gbGltaXRlZCB0byAxNDAgY2hhcmFjdGVycyB0byBlbnN1cmUgdGhleSBkbyBub3QgZGV2b2x2ZSBpbnRvIGdlbmVyYWwgYWxlcnRcbi8vIG9yIHNlcnZpY2UgaW5mb3JtYXRpb24gdGhhdCBzaG91bGQgcmVhbGx5IGJlIGluIHRoZSBkZXNjcmlwdGlvbi4gV2UgcmVhbGx5XG4vLyB3YW50IHVzZXJzIG9mIHRoZSBCaWN5Y2xlIFRvdXJpbmcgQ29tcGFuaW9uIHRvIHByb3ZpZGUgY29tbWVudHMgdmVyaWZ5aW5nXG4vLyBpbmZvIGFib3V0IHBvaW50cywgb3IgbGV0dGluZyBvdGhlciBjeWNsaXN0cyBrbm93IGFib3V0IGNoYW5nZXMgaW4gdGhlXG4vLyBzZXJ2aWNlIG9yIGFsZXJ0LlxuXG4vLyAjIyBDb21tZW50IE1vZGVsIFVyaVxuLy8gQ29tbWVudHMgYXJlIHN0b3JlZCBpbiBDb3VjaERCIGluIHRoZSBzYW1lIGRhdGFiYXNlIGFzIHBvaW50cy4gVGhlIGNvbW1lbnRcbi8vIG1vZGVsIHVyaSBpcyBjb21wb3NlZCBvZiB0aHJlZSBwYXJ0czpcbi8vICAxLiBUaGUgZW50aXJlIGlkIG9mIHRoZSByZWxhdGVkIHBvaW50XG4vLyAgMi4gVGhlIHN0cmluZyAnY29tbWVudC8nXG4vLyAgMy4gQSB0aW1lIGJhc2VkIFVVSUQgdG8gdW5pcXVlbHkgaWRlbnRpZnkgY29tbWVudHNcbi8vXG4vLyBXZSBkb24ndCB1c2UgYGRvY3VyaWAgZm9yIHRoZSBjb21tZW50IG1vZGVsIHVyaXMgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRvXG4vLyBwYXJzZSB0aGVtLlxuXG5jb25zdCBDT01NRU5UX01BWF9MRU5HVEggPSAxNDA7XG5leHBvcnQgY29uc3QgQ29tbWVudCA9IENvdWNoTW9kZWwuZXh0ZW5kKCB7XG4gIGlkQXR0cmlidXRlOiAnX2lkJyxcblxuICAvLyAjIyBDb25zdHJ1Y3RvclxuICAvLyBHZW5lcmF0ZSBgX2lkYC4gYHBvaW50SWRgIG11c3QgYmUgc3BlY2lmaWVkIGluIG9wdGlvbnMuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAoICFhdHRyaWJ1dGVzLnV1aWQgKSB7XG4gICAgICBhdHRyaWJ1dGVzLnV1aWQgPSB1dWlkLnYxKCk7XG4gICAgfVxuICAgIGlmICggIWF0dHJpYnV0ZXMuX2lkICYmIG9wdGlvbnMucG9pbnRJZCApIHtcbiAgICAgIGF0dHJpYnV0ZXMuX2lkID0gb3B0aW9ucy5wb2ludElkICsgJy9jb21tZW50LycgKyBhdHRyaWJ1dGVzLnV1aWQ7XG4gICAgfVxuICAgIENvdWNoTW9kZWwuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICB9LFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB0ZXh0OiB7XG4gICAgICAgICd0eXBlJzogJ3N0cmluZycsXG4gICAgICAgICdtYXhMZW5ndGgnOiBDT01NRU5UX01BWF9MRU5HVEhcbiAgICAgIH0sXG4gICAgICByYXRpbmc6IHtcbiAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICBtaW5pbXVtOiAxLFxuICAgICAgICBtYXhpbXVtOiA1XG4gICAgICB9LFxuICAgICAgdXVpZDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICd0ZXh0JyxcbiAgICAgICdyYXRpbmcnLFxuICAgICAgJ3V1aWQnXG4gICAgXVxuICB9XG59LCB7XG4gIE1BWF9MRU5HVEg6IENPTU1FTlRfTUFYX0xFTkdUSFxufSApO1xuXG5taXhpblZhbGlkYXRpb24oIENvbW1lbnQgKTtcblxuLy8gIyBDb21tZW50IENvbGxlY3Rpb25cbi8vIEZldGNoIG9ubHkgY29tbWVudHMgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gcG9pbnQuXG5leHBvcnQgY29uc3QgQ29tbWVudENvbGxlY3Rpb24gPSBDb3VjaENvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBtb2RlbHMsIG9wdGlvbnMgKSB7XG4gICAgQ291Y2hDb2xsZWN0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICBjb25zdCBwb2ludElkID0gdGhpcy5wb2ludElkID0gb3B0aW9ucy5wb2ludElkO1xuXG4gICAgY29uc3QgY29ubmVjdCA9IHRoaXMuY29ubmVjdDtcbiAgICBjb25zdCBkYXRhYmFzZSA9IHRoaXMuZGF0YWJhc2U7XG4gICAgdGhpcy5jb21tZW50ID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBDb21tZW50ICkgOiBDb21tZW50O1xuXG4gICAgdGhpcy5wb3VjaCA9IHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYWxsRG9jczoge1xuICAgICAgICAgIC4uLmtleXNCZXR3ZWVuKCBwb2ludElkICsgJy9jb21tZW50JyApLFxuICAgICAgICAgIGluY2x1ZGVfZG9jczogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSxcblxuICBtb2RlbDogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG4gICAgY29uc3Qge2NvbW1lbnQsIHBvaW50SWR9ID0gb3B0aW9ucy5jb2xsZWN0aW9uO1xuICAgIHJldHVybiBuZXcgY29tbWVudCggYXR0cmlidXRlcywgeyBwb2ludElkLCAuLi5vcHRpb25zIH0gKTtcbiAgfVxufSApO1xuIl19