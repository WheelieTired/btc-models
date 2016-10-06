'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.models = exports.CommentCollection = exports.Comment = exports.PointCollection = exports.Alert = exports.Service = exports.Point = exports.Login = exports.UserRefCollection = exports.UserRef = exports.UserCollection = exports.User = exports.timezones = exports.nextDay = exports.days = exports.Schedule = exports.display = exports.alertTypes = exports.serviceTypes = exports.connectMut = exports.connect = undefined;

var _connect = require('./connect');

Object.defineProperty(exports, 'connect', {
  enumerable: true,
  get: function get() {
    return _connect.connect;
  }
});
Object.defineProperty(exports, 'connectMut', {
  enumerable: true,
  get: function get() {
    return _connect.connectMut;
  }
});

var _point = require('./model/point');

Object.defineProperty(exports, 'serviceTypes', {
  enumerable: true,
  get: function get() {
    return _point.serviceTypes;
  }
});
Object.defineProperty(exports, 'alertTypes', {
  enumerable: true,
  get: function get() {
    return _point.alertTypes;
  }
});
Object.defineProperty(exports, 'display', {
  enumerable: true,
  get: function get() {
    return _point.display;
  }
});

var _hours = require('./model/hours');

Object.defineProperty(exports, 'Schedule', {
  enumerable: true,
  get: function get() {
    return _hours.Schedule;
  }
});
Object.defineProperty(exports, 'days', {
  enumerable: true,
  get: function get() {
    return _hours.days;
  }
});
Object.defineProperty(exports, 'nextDay', {
  enumerable: true,
  get: function get() {
    return _hours.nextDay;
  }
});
Object.defineProperty(exports, 'timezones', {
  enumerable: true,
  get: function get() {
    return _hours.timezones;
  }
});

var _user = require('./model/user');

Object.defineProperty(exports, 'User', {
  enumerable: true,
  get: function get() {
    return _user.User;
  }
});
Object.defineProperty(exports, 'UserCollection', {
  enumerable: true,
  get: function get() {
    return _user.UserCollection;
  }
});
Object.defineProperty(exports, 'UserRef', {
  enumerable: true,
  get: function get() {
    return _user.UserRef;
  }
});
Object.defineProperty(exports, 'UserRefCollection', {
  enumerable: true,
  get: function get() {
    return _user.UserRefCollection;
  }
});
Object.defineProperty(exports, 'Login', {
  enumerable: true,
  get: function get() {
    return _user.Login;
  }
});
Object.defineProperty(exports, 'Point', {
  enumerable: true,
  get: function get() {
    return _point.Point;
  }
});
Object.defineProperty(exports, 'Service', {
  enumerable: true,
  get: function get() {
    return _point.Service;
  }
});
Object.defineProperty(exports, 'Alert', {
  enumerable: true,
  get: function get() {
    return _point.Alert;
  }
});
Object.defineProperty(exports, 'PointCollection', {
  enumerable: true,
  get: function get() {
    return _point.PointCollection;
  }
});
Object.defineProperty(exports, 'Comment', {
  enumerable: true,
  get: function get() {
    return _point.Comment;
  }
});
Object.defineProperty(exports, 'CommentCollection', {
  enumerable: true,
  get: function get() {
    return _point.CommentCollection;
  }
});
exports.default = connectModels;


/*esfmt-ignore-start*/
var models = exports.models = [_point.Point, _point.Service, _point.Alert, _point.PointCollection, _point.Comment, _point.CommentCollection];
/*esfmt-ignore-end*/

function connectModels(database) {
  (0, _connect.connectMut)(database, models);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25uZWN0IiwiY29ubmVjdE11dCIsInNlcnZpY2VUeXBlcyIsImFsZXJ0VHlwZXMiLCJkaXNwbGF5IiwiU2NoZWR1bGUiLCJkYXlzIiwibmV4dERheSIsInRpbWV6b25lcyIsIlVzZXIiLCJVc2VyQ29sbGVjdGlvbiIsIlVzZXJSZWYiLCJVc2VyUmVmQ29sbGVjdGlvbiIsIkxvZ2luIiwiUG9pbnQiLCJTZXJ2aWNlIiwiQWxlcnQiLCJQb2ludENvbGxlY3Rpb24iLCJDb21tZW50IiwiQ29tbWVudENvbGxlY3Rpb24iLCJjb25uZWN0TW9kZWxzIiwibW9kZWxzIiwiZGF0YWJhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFBU0EsTzs7Ozs7O29CQUFTQyxVOzs7Ozs7Ozs7a0JBQ1RDLFk7Ozs7OztrQkFBY0MsVTs7Ozs7O2tCQUFZQyxPOzs7Ozs7Ozs7a0JBRTFCQyxROzs7Ozs7a0JBQVVDLEk7Ozs7OztrQkFBTUMsTzs7Ozs7O2tCQUFTQyxTOzs7Ozs7Ozs7aUJBRXpCQyxJOzs7Ozs7aUJBQU1DLGM7Ozs7OztpQkFBZ0JDLE87Ozs7OztpQkFBU0MsaUI7Ozs7OztpQkFBbUJDLEs7Ozs7OztrQkFDbERDLEs7Ozs7OztrQkFBT0MsTzs7Ozs7O2tCQUFTQyxLOzs7Ozs7a0JBQU9DLGU7Ozs7OztrQkFBaUJDLE87Ozs7OztrQkFBU0MsaUI7OztrQkFnQmxDQyxhOzs7QUFaeEI7QUFDTyxJQUFNQywwQkFBUyw4R0FBZjtBQVFQOztBQUdlLFNBQVNELGFBQVQsQ0FBd0JFLFFBQXhCLEVBQW1DO0FBQ2hELDJCQUFZQSxRQUFaLEVBQXNCRCxNQUF0QjtBQUNEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgY29ubmVjdCwgY29ubmVjdE11dCB9IGZyb20gJy4vY29ubmVjdCc7XG5leHBvcnQgeyBzZXJ2aWNlVHlwZXMsIGFsZXJ0VHlwZXMsIGRpc3BsYXkgfSBmcm9tICcuL21vZGVsL3BvaW50JztcblxuZXhwb3J0IHsgU2NoZWR1bGUsIGRheXMsIG5leHREYXksIHRpbWV6b25lcyB9IGZyb20gJy4vbW9kZWwvaG91cnMnO1xuXG5leHBvcnQgeyBVc2VyLCBVc2VyQ29sbGVjdGlvbiwgVXNlclJlZiwgVXNlclJlZkNvbGxlY3Rpb24sIExvZ2luIH0gZnJvbSAnLi9tb2RlbC91c2VyJztcbmV4cG9ydCB7IFBvaW50LCBTZXJ2aWNlLCBBbGVydCwgUG9pbnRDb2xsZWN0aW9uLCBDb21tZW50LCBDb21tZW50Q29sbGVjdGlvbiB9IGZyb20gJy4vbW9kZWwvcG9pbnQnO1xuXG5pbXBvcnQgeyBQb2ludCwgU2VydmljZSwgQWxlcnQsIFBvaW50Q29sbGVjdGlvbiwgQ29tbWVudCwgQ29tbWVudENvbGxlY3Rpb24gfSBmcm9tICcuL21vZGVsL3BvaW50JztcblxuLyplc2ZtdC1pZ25vcmUtc3RhcnQqL1xuZXhwb3J0IGNvbnN0IG1vZGVscyA9IFtcbiAgUG9pbnQsXG4gIFNlcnZpY2UsXG4gIEFsZXJ0LFxuICBQb2ludENvbGxlY3Rpb24sXG4gIENvbW1lbnQsXG4gIENvbW1lbnRDb2xsZWN0aW9uXG5dO1xuLyplc2ZtdC1pZ25vcmUtZW5kKi9cblxuaW1wb3J0IHsgY29ubmVjdE11dCB9IGZyb20gJy4vY29ubmVjdCc7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25uZWN0TW9kZWxzKCBkYXRhYmFzZSApIHtcbiAgY29ubmVjdE11dCggZGF0YWJhc2UsIG1vZGVscyApO1xufVxuIl19