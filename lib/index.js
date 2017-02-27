'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pointModels = exports.Photo = exports.PointCollection = exports.Alert = exports.Service = exports.Point = exports.Reset = exports.Forgot = exports.Login = exports.UserRefCollection = exports.UserRef = exports.UserCollection = exports.User = exports.timezones = exports.nextDay = exports.days = exports.Schedule = exports.display = exports.alertTypes = exports.serviceTypes = exports.connectMut = exports.connect = undefined;

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
Object.defineProperty(exports, 'Forgot', {
  enumerable: true,
  get: function get() {
    return _user.Forgot;
  }
});
Object.defineProperty(exports, 'Reset', {
  enumerable: true,
  get: function get() {
    return _user.Reset;
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

var _photo = require('./model/photo');

Object.defineProperty(exports, 'Photo', {
  enumerable: true,
  get: function get() {
    return _photo.Photo;
  }
});
exports.connectPointModels = connectPointModels;


/*esfmt-ignore-start*/
var pointModels = exports.pointModels = [_point.Point, _point.Service, _point.Alert, _point.PointCollection];

/*esfmt-ignore-end*/

function connectPointModels(database) {
  (0, _connect.connectMut)(database, pointModels);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25uZWN0IiwiY29ubmVjdE11dCIsInNlcnZpY2VUeXBlcyIsImFsZXJ0VHlwZXMiLCJkaXNwbGF5IiwiU2NoZWR1bGUiLCJkYXlzIiwibmV4dERheSIsInRpbWV6b25lcyIsIlVzZXIiLCJVc2VyQ29sbGVjdGlvbiIsIlVzZXJSZWYiLCJVc2VyUmVmQ29sbGVjdGlvbiIsIkxvZ2luIiwiRm9yZ290IiwiUmVzZXQiLCJQb2ludCIsIlNlcnZpY2UiLCJBbGVydCIsIlBvaW50Q29sbGVjdGlvbiIsIlBob3RvIiwiY29ubmVjdFBvaW50TW9kZWxzIiwicG9pbnRNb2RlbHMiLCJkYXRhYmFzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQUFTQSxPOzs7Ozs7b0JBQVNDLFU7Ozs7Ozs7OztrQkFDVEMsWTs7Ozs7O2tCQUFjQyxVOzs7Ozs7a0JBQVlDLE87Ozs7Ozs7OztrQkFFMUJDLFE7Ozs7OztrQkFBVUMsSTs7Ozs7O2tCQUFNQyxPOzs7Ozs7a0JBQVNDLFM7Ozs7Ozs7OztpQkFFekJDLEk7Ozs7OztpQkFBTUMsYzs7Ozs7O2lCQUFnQkMsTzs7Ozs7O2lCQUFTQyxpQjs7Ozs7O2lCQUFtQkMsSzs7Ozs7O2lCQUFPQyxNOzs7Ozs7aUJBQVFDLEs7Ozs7OztrQkFDakVDLEs7Ozs7OztrQkFBT0MsTzs7Ozs7O2tCQUFTQyxLOzs7Ozs7a0JBQU9DLGU7Ozs7Ozs7OztrQkFFdkJDLEs7OztRQWVPQyxrQixHQUFBQSxrQjs7O0FBWGhCO0FBQ08sSUFBTUMsb0NBQWMsb0VBQXBCOztBQU9QOztBQUdPLFNBQVNELGtCQUFULENBQTZCRSxRQUE3QixFQUF3QztBQUM3QywyQkFBWUEsUUFBWixFQUFzQkQsV0FBdEI7QUFDRCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB7IGNvbm5lY3QsIGNvbm5lY3RNdXQgfSBmcm9tICcuL2Nvbm5lY3QnO1xuZXhwb3J0IHsgc2VydmljZVR5cGVzLCBhbGVydFR5cGVzLCBkaXNwbGF5IH0gZnJvbSAnLi9tb2RlbC9wb2ludCc7XG5cbmV4cG9ydCB7IFNjaGVkdWxlLCBkYXlzLCBuZXh0RGF5LCB0aW1lem9uZXMgfSBmcm9tICcuL21vZGVsL2hvdXJzJztcblxuZXhwb3J0IHsgVXNlciwgVXNlckNvbGxlY3Rpb24sIFVzZXJSZWYsIFVzZXJSZWZDb2xsZWN0aW9uLCBMb2dpbiwgRm9yZ290LCBSZXNldCB9IGZyb20gJy4vbW9kZWwvdXNlcic7XG5leHBvcnQgeyBQb2ludCwgU2VydmljZSwgQWxlcnQsIFBvaW50Q29sbGVjdGlvbiB9IGZyb20gJy4vbW9kZWwvcG9pbnQnO1xuXG5leHBvcnQgeyBQaG90byB9IGZyb20gJy4vbW9kZWwvcGhvdG8nO1xuXG5pbXBvcnQgeyBQb2ludCwgU2VydmljZSwgQWxlcnQsIFBvaW50Q29sbGVjdGlvbiB9IGZyb20gJy4vbW9kZWwvcG9pbnQnO1xuXG4vKmVzZm10LWlnbm9yZS1zdGFydCovXG5leHBvcnQgY29uc3QgcG9pbnRNb2RlbHMgPSBbXG4gIFBvaW50LFxuICBTZXJ2aWNlLFxuICBBbGVydCxcbiAgUG9pbnRDb2xsZWN0aW9uXG5dO1xuXG4vKmVzZm10LWlnbm9yZS1lbmQqL1xuXG5pbXBvcnQgeyBjb25uZWN0TXV0IH0gZnJvbSAnLi9jb25uZWN0JztcbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0UG9pbnRNb2RlbHMoIGRhdGFiYXNlICkge1xuICBjb25uZWN0TXV0KCBkYXRhYmFzZSwgcG9pbnRNb2RlbHMgKTtcbn1cbiJdfQ==