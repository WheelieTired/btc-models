'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CommentCollection = exports.Comment = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* btc-app-server -- Server for the Bicycle Touring Companion
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

var _validationMixin = require('./validation-mixin');

var _base = require('./base');

var _point = require('./point');

var _docuri = require('docuri');

var _docuri2 = _interopRequireDefault(_docuri);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var commentId = _docuri2.default.route('point/:type/:name/:geohash/comment/:uuid');

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
      var pointIdComponents = (0, _point.pointId)(options.pointId);
      attributes._id = commentId({
        type: pointIdComponents.type,
        name: pointIdComponents.name,
        geohash: pointIdComponents.geohash,
        uuid: attributes.uuid
      });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9jb21tZW50LmpzIl0sIm5hbWVzIjpbImNvbW1lbnRJZCIsInJvdXRlIiwiQ09NTUVOVF9NQVhfTEVOR1RIIiwiQ29tbWVudCIsImV4dGVuZCIsImlkQXR0cmlidXRlIiwiY29uc3RydWN0b3IiLCJhdHRyaWJ1dGVzIiwib3B0aW9ucyIsInV1aWQiLCJ2MSIsIl9pZCIsInBvaW50SWQiLCJwb2ludElkQ29tcG9uZW50cyIsInR5cGUiLCJuYW1lIiwiZ2VvaGFzaCIsImFwcGx5IiwiYXJndW1lbnRzIiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJwcm9wZXJ0aWVzIiwidGV4dCIsInJhdGluZyIsIm1pbmltdW0iLCJtYXhpbXVtIiwicmVxdWlyZWQiLCJNQVhfTEVOR1RIIiwiQ29tbWVudENvbGxlY3Rpb24iLCJpbml0aWFsaXplIiwibW9kZWxzIiwicHJvdG90eXBlIiwiY29ubmVjdCIsImRhdGFiYXNlIiwiY29tbWVudCIsInBvdWNoIiwiYWxsRG9jcyIsImluY2x1ZGVfZG9jcyIsIm1vZGVsIiwiY29sbGVjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztrUUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLFlBQVksaUJBQU9DLEtBQVAsQ0FBYywwQ0FBZCxDQUFsQjs7QUFFQSxJQUFNQyxxQkFBcUIsR0FBM0I7QUFDTyxJQUFNQyw0QkFBVSxpQkFBV0MsTUFBWCxDQUFtQjtBQUN4Q0MsZUFBYSxLQUQyQjs7QUFHeEM7QUFDQTtBQUNBQyxlQUFhLHFCQUFVQyxVQUFWLEVBQXNCQyxPQUF0QixFQUFnQztBQUMzQ0EsY0FBVUEsV0FBVyxFQUFyQjtBQUNBLFFBQUssQ0FBQ0QsV0FBV0UsSUFBakIsRUFBd0I7QUFDdEJGLGlCQUFXRSxJQUFYLEdBQWtCLG1CQUFLQyxFQUFMLEVBQWxCO0FBQ0Q7QUFDRCxRQUFLLENBQUNILFdBQVdJLEdBQVosSUFBbUJILFFBQVFJLE9BQWhDLEVBQTBDO0FBQ3pDLFVBQU1DLG9CQUFvQixvQkFBUUwsUUFBUUksT0FBaEIsQ0FBMUI7QUFDQ0wsaUJBQVdJLEdBQVgsR0FBaUJYLFVBQVc7QUFDeEJjLGNBQU1ELGtCQUFrQkMsSUFEQTtBQUV4QkMsY0FBTUYsa0JBQWtCRSxJQUZBO0FBR3hCQyxpQkFBU0gsa0JBQWtCRyxPQUhIO0FBSXhCUCxjQUFNRixXQUFXRTtBQUpPLE9BQVgsQ0FBakI7QUFNRDtBQUNELHFCQUFXUSxLQUFYLENBQWtCLElBQWxCLEVBQXdCQyxTQUF4QjtBQUNELEdBcEJ1Qzs7QUFzQnhDQyxVQUFRO0FBQ05MLFVBQU0sUUFEQTtBQUVOTSwwQkFBc0IsS0FGaEI7QUFHTkMsZ0JBQVk7QUFDVkMsWUFBTTtBQUNKLGdCQUFRLFFBREo7QUFFSixxQkFBYXBCO0FBRlQsT0FESTtBQUtWcUIsY0FBUTtBQUNOVCxjQUFNLFNBREE7QUFFTlUsaUJBQVMsQ0FGSDtBQUdOQyxpQkFBUztBQUhILE9BTEU7QUFVVmhCLFlBQU07QUFDSkssY0FBTTtBQURGO0FBVkksS0FITjtBQWlCTlksY0FBVSxDQUNSLE1BRFEsRUFFUixRQUZRLEVBR1IsTUFIUTtBQWpCSjtBQXRCZ0MsQ0FBbkIsRUE2Q3BCO0FBQ0RDLGNBQVl6QjtBQURYLENBN0NvQixDQUFoQjs7QUFpRFAsc0NBQWlCQyxPQUFqQjs7QUFFQTtBQUNBO0FBQ08sSUFBTXlCLGdEQUFvQixzQkFBZ0J4QixNQUFoQixDQUF3QjtBQUN2RHlCLGNBQVksb0JBQVVDLE1BQVYsRUFBa0J0QixPQUFsQixFQUE0QjtBQUN0QywwQkFBZ0J1QixTQUFoQixDQUEwQkYsVUFBMUIsQ0FBcUNaLEtBQXJDLENBQTRDLElBQTVDLEVBQWtEQyxTQUFsRDtBQUNBLFFBQU1OLFVBQVUsS0FBS0EsT0FBTCxHQUFlSixRQUFRSSxPQUF2Qzs7QUFFQSxRQUFNb0IsVUFBVSxLQUFLQSxPQUFyQjtBQUNBLFFBQU1DLFdBQVcsS0FBS0EsUUFBdEI7QUFDQSxTQUFLQyxPQUFMLEdBQWVGLFVBQVVBLFFBQVNDLFFBQVQsRUFBbUI5QixPQUFuQixDQUFWLEdBQXlDQSxPQUF4RDs7QUFFQSxTQUFLZ0MsS0FBTCxHQUFhO0FBQ1gzQixlQUFTO0FBQ1A0Qiw4QkFDSyx1QkFBYXhCLFVBQVUsVUFBdkIsQ0FETDtBQUVFeUIsd0JBQWM7QUFGaEI7QUFETztBQURFLEtBQWI7QUFRRCxHQWpCc0Q7O0FBbUJ2REMsU0FBTyxlQUFVL0IsVUFBVixFQUFzQkMsT0FBdEIsRUFBZ0M7QUFBQSw4QkFDVkEsUUFBUStCLFVBREU7QUFBQSxRQUM5QkwsT0FEOEIsdUJBQzlCQSxPQUQ4QjtBQUFBLFFBQ3JCdEIsT0FEcUIsdUJBQ3JCQSxPQURxQjs7QUFFckMsV0FBTyxJQUFJc0IsT0FBSixDQUFhM0IsVUFBYixhQUEyQkssZ0JBQTNCLElBQXVDSixPQUF2QyxFQUFQO0FBQ0Q7QUF0QnNELENBQXhCLENBQTFCIiwiZmlsZSI6ImNvbW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBidGMtYXBwLXNlcnZlciAtLSBTZXJ2ZXIgZm9yIHRoZSBCaWN5Y2xlIFRvdXJpbmcgQ29tcGFuaW9uXG4gKiBDb3B5cmlnaHQgwqkgMjAxNiBBZHZlbnR1cmUgQ3ljbGluZyBBc3NvY2lhdGlvblxuICpcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGJ0Yy1hcHAtc2VydmVyLlxuICpcbiAqIGJ0Yy1hcHAtc2VydmVyIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgQWZmZXJvIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogYnRjLWFwcC1zZXJ2ZXIgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBBZmZlcm8gR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRm9vYmFyLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCB7IG1peGluVmFsaWRhdGlvbiB9IGZyb20gJy4vdmFsaWRhdGlvbi1taXhpbic7XG5pbXBvcnQgeyBDb3VjaE1vZGVsLCBDb3VjaENvbGxlY3Rpb24sIGtleXNCZXR3ZWVuIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCB7IHBvaW50SWQgfSBmcm9tICcuL3BvaW50JztcblxuaW1wb3J0IGRvY3VyaSBmcm9tICdkb2N1cmknO1xuaW1wb3J0IHV1aWQgZnJvbSAnbm9kZS11dWlkJztcblxuLy8gIyBDb21tZW50IE1vZGVsXG4vLyBJbmZvcm1hdGlvbiBhYm91dCBhbGVydHMgYW5kIHNlcnZpY2VzIGVuY291bnRlcmVkIGJ5IGN5Y2xpc3RzIGlzIGxpa2VseVxuLy8gdG8gY2hhbmdlIHdpdGggdGhlIHNlYXNvbnMgb3Igb3RoZXIgcmVhc29ucy4gQ3ljbGlzdHMgcGxhbm5pbmcgdGhlIG5leHQgbGVnXG4vLyBvZiBhIHRvdXIgc2hvdWxkIGJlIGFibGUgdG8gcmVhZCB0aGUgZXhwZXJpZW5jZXMgb2YgY3ljbGlzdHMgYWhlYWQgb2YgdGhlbS5cbi8vXG4vLyBBIGNvbW1lbnQgbXVzdCBoYXZlIGJvdGggYSByYXRpbmcgYW5kIHRoZSB0ZXh0IG9mIHRoZSBjb21tZW50LiBDb21tZW50cyBhcmVcbi8vIGxpbWl0ZWQgdG8gMTQwIGNoYXJhY3RlcnMgdG8gZW5zdXJlIHRoZXkgZG8gbm90IGRldm9sdmUgaW50byBnZW5lcmFsIGFsZXJ0XG4vLyBvciBzZXJ2aWNlIGluZm9ybWF0aW9uIHRoYXQgc2hvdWxkIHJlYWxseSBiZSBpbiB0aGUgZGVzY3JpcHRpb24uIFdlIHJlYWxseVxuLy8gd2FudCB1c2VycyBvZiB0aGUgQmljeWNsZSBUb3VyaW5nIENvbXBhbmlvbiB0byBwcm92aWRlIGNvbW1lbnRzIHZlcmlmeWluZ1xuLy8gaW5mbyBhYm91dCBwb2ludHMsIG9yIGxldHRpbmcgb3RoZXIgY3ljbGlzdHMga25vdyBhYm91dCBjaGFuZ2VzIGluIHRoZVxuLy8gc2VydmljZSBvciBhbGVydC5cblxuLy8gIyMgQ29tbWVudCBNb2RlbCBVcmlcbi8vIENvbW1lbnRzIGFyZSBzdG9yZWQgaW4gQ291Y2hEQiBpbiB0aGUgc2FtZSBkYXRhYmFzZSBhcyBwb2ludHMuIFRoZSBjb21tZW50XG4vLyBtb2RlbCB1cmkgaXMgY29tcG9zZWQgb2YgdGhyZWUgcGFydHM6XG4vLyAgMS4gVGhlIGVudGlyZSBpZCBvZiB0aGUgcmVsYXRlZCBwb2ludFxuLy8gIDIuIFRoZSBzdHJpbmcgJ2NvbW1lbnQvJ1xuLy8gIDMuIEEgdGltZSBiYXNlZCBVVUlEIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IGNvbW1lbnRzXG5jb25zdCBjb21tZW50SWQgPSBkb2N1cmkucm91dGUoICdwb2ludC86dHlwZS86bmFtZS86Z2VvaGFzaC9jb21tZW50Lzp1dWlkJyApO1xuXG5jb25zdCBDT01NRU5UX01BWF9MRU5HVEggPSAxNDA7XG5leHBvcnQgY29uc3QgQ29tbWVudCA9IENvdWNoTW9kZWwuZXh0ZW5kKCB7XG4gIGlkQXR0cmlidXRlOiAnX2lkJyxcblxuICAvLyAjIyBDb25zdHJ1Y3RvclxuICAvLyBHZW5lcmF0ZSBgX2lkYC4gYHBvaW50SWRgIG11c3QgYmUgc3BlY2lmaWVkIGluIG9wdGlvbnMuXG4gIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiggYXR0cmlidXRlcywgb3B0aW9ucyApIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAoICFhdHRyaWJ1dGVzLnV1aWQgKSB7XG4gICAgICBhdHRyaWJ1dGVzLnV1aWQgPSB1dWlkLnYxKCk7XG4gICAgfVxuICAgIGlmICggIWF0dHJpYnV0ZXMuX2lkICYmIG9wdGlvbnMucG9pbnRJZCApIHtcbiAgICBcdGNvbnN0IHBvaW50SWRDb21wb25lbnRzID0gcG9pbnRJZChvcHRpb25zLnBvaW50SWQpO1xuICAgICAgYXR0cmlidXRlcy5faWQgPSBjb21tZW50SWQoIHtcbiAgICAgICAgICB0eXBlOiBwb2ludElkQ29tcG9uZW50cy50eXBlLFxuICAgICAgICAgIG5hbWU6IHBvaW50SWRDb21wb25lbnRzLm5hbWUsXG4gICAgICAgICAgZ2VvaGFzaDogcG9pbnRJZENvbXBvbmVudHMuZ2VvaGFzaCxcbiAgICAgICAgICB1dWlkOiBhdHRyaWJ1dGVzLnV1aWRcbiAgICAgICB9ICk7XG4gICAgfVxuICAgIENvdWNoTW9kZWwuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICB9LFxuXG4gIHNjaGVtYToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICB0ZXh0OiB7XG4gICAgICAgICd0eXBlJzogJ3N0cmluZycsXG4gICAgICAgICdtYXhMZW5ndGgnOiBDT01NRU5UX01BWF9MRU5HVEhcbiAgICAgIH0sXG4gICAgICByYXRpbmc6IHtcbiAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICBtaW5pbXVtOiAxLFxuICAgICAgICBtYXhpbXVtOiA1XG4gICAgICB9LFxuICAgICAgdXVpZDoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVxdWlyZWQ6IFtcbiAgICAgICd0ZXh0JyxcbiAgICAgICdyYXRpbmcnLFxuICAgICAgJ3V1aWQnXG4gICAgXVxuICB9XG59LCB7XG4gIE1BWF9MRU5HVEg6IENPTU1FTlRfTUFYX0xFTkdUSFxufSApO1xuXG5taXhpblZhbGlkYXRpb24oIENvbW1lbnQgKTtcblxuLy8gIyBDb21tZW50IENvbGxlY3Rpb25cbi8vIEZldGNoIG9ubHkgY29tbWVudHMgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gcG9pbnQuXG5leHBvcnQgY29uc3QgQ29tbWVudENvbGxlY3Rpb24gPSBDb3VjaENvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKCBtb2RlbHMsIG9wdGlvbnMgKSB7XG4gICAgQ291Y2hDb2xsZWN0aW9uLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICBjb25zdCBwb2ludElkID0gdGhpcy5wb2ludElkID0gb3B0aW9ucy5wb2ludElkO1xuXG4gICAgY29uc3QgY29ubmVjdCA9IHRoaXMuY29ubmVjdDtcbiAgICBjb25zdCBkYXRhYmFzZSA9IHRoaXMuZGF0YWJhc2U7XG4gICAgdGhpcy5jb21tZW50ID0gY29ubmVjdCA/IGNvbm5lY3QoIGRhdGFiYXNlLCBDb21tZW50ICkgOiBDb21tZW50O1xuXG4gICAgdGhpcy5wb3VjaCA9IHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgYWxsRG9jczoge1xuICAgICAgICAgIC4uLmtleXNCZXR3ZWVuKCBwb2ludElkICsgJy9jb21tZW50JyApLFxuICAgICAgICAgIGluY2x1ZGVfZG9jczogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSxcblxuICBtb2RlbDogZnVuY3Rpb24oIGF0dHJpYnV0ZXMsIG9wdGlvbnMgKSB7XG4gICAgY29uc3Qge2NvbW1lbnQsIHBvaW50SWR9ID0gb3B0aW9ucy5jb2xsZWN0aW9uO1xuICAgIHJldHVybiBuZXcgY29tbWVudCggYXR0cmlidXRlcywgeyBwb2ludElkLCAuLi5vcHRpb25zIH0gKTtcbiAgfVxufSApO1xuIl19