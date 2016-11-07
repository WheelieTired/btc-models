'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentModels = exports.pointModels = exports.CommentCollection = exports.Comment = exports.PointCollection = exports.Alert = exports.Service = exports.Point = exports.Reset = exports.Forgot = exports.Login = exports.UserRefCollection = exports.UserRef = exports.UserCollection = exports.User = exports.timezones = exports.nextDay = exports.days = exports.Schedule = exports.display = exports.alertTypes = exports.serviceTypes = exports.connectMut = exports.connect = undefined;

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

var _comment = require('./model/comment');

Object.defineProperty(exports, 'Comment', {
  enumerable: true,
  get: function get() {
    return _comment.Comment;
  }
});
Object.defineProperty(exports, 'CommentCollection', {
  enumerable: true,
  get: function get() {
    return _comment.CommentCollection;
  }
});
exports.connectPointModels = connectPointModels;
exports.connectCommentModels = connectCommentModels;


/*esfmt-ignore-start*/
var pointModels = exports.pointModels = [_point.Point, _point.Service, _point.Alert, _point.PointCollection];

var commentModels = exports.commentModels = [_comment.Comment, _comment.CommentCollection];
/*esfmt-ignore-end*/

function connectPointModels(database) {
  (0, _connect.connectMut)(database, pointModels);
}

function connectCommentModels(database) {
  (0, _connect.connectMut)(database, commentModels);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjb25uZWN0IiwiY29ubmVjdE11dCIsInNlcnZpY2VUeXBlcyIsImFsZXJ0VHlwZXMiLCJkaXNwbGF5IiwiU2NoZWR1bGUiLCJkYXlzIiwibmV4dERheSIsInRpbWV6b25lcyIsIlVzZXIiLCJVc2VyQ29sbGVjdGlvbiIsIlVzZXJSZWYiLCJVc2VyUmVmQ29sbGVjdGlvbiIsIkxvZ2luIiwiRm9yZ290IiwiUmVzZXQiLCJQb2ludCIsIlNlcnZpY2UiLCJBbGVydCIsIlBvaW50Q29sbGVjdGlvbiIsIkNvbW1lbnQiLCJDb21tZW50Q29sbGVjdGlvbiIsImNvbm5lY3RQb2ludE1vZGVscyIsImNvbm5lY3RDb21tZW50TW9kZWxzIiwicG9pbnRNb2RlbHMiLCJjb21tZW50TW9kZWxzIiwiZGF0YWJhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFBU0EsTzs7Ozs7O29CQUFTQyxVOzs7Ozs7Ozs7a0JBQ1RDLFk7Ozs7OztrQkFBY0MsVTs7Ozs7O2tCQUFZQyxPOzs7Ozs7Ozs7a0JBRTFCQyxROzs7Ozs7a0JBQVVDLEk7Ozs7OztrQkFBTUMsTzs7Ozs7O2tCQUFTQyxTOzs7Ozs7Ozs7aUJBRXpCQyxJOzs7Ozs7aUJBQU1DLGM7Ozs7OztpQkFBZ0JDLE87Ozs7OztpQkFBU0MsaUI7Ozs7OztpQkFBbUJDLEs7Ozs7OztpQkFBT0MsTTs7Ozs7O2lCQUFRQyxLOzs7Ozs7a0JBQ2pFQyxLOzs7Ozs7a0JBQU9DLE87Ozs7OztrQkFBU0MsSzs7Ozs7O2tCQUFPQyxlOzs7Ozs7Ozs7b0JBQ3ZCQyxPOzs7Ozs7b0JBQVNDLGlCOzs7UUFvQkZDLGtCLEdBQUFBLGtCO1FBSUFDLG9CLEdBQUFBLG9COzs7QUFuQmhCO0FBQ08sSUFBTUMsb0NBQWMsb0VBQXBCOztBQU9BLElBQU1DLHdDQUFnQiw4Q0FBdEI7QUFJUDs7QUFHTyxTQUFTSCxrQkFBVCxDQUE2QkksUUFBN0IsRUFBd0M7QUFDN0MsMkJBQVlBLFFBQVosRUFBc0JGLFdBQXRCO0FBQ0Q7O0FBRU0sU0FBU0Qsb0JBQVQsQ0FBK0JHLFFBQS9CLEVBQTBDO0FBQy9DLDJCQUFZQSxRQUFaLEVBQXNCRCxhQUF0QjtBQUNEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgY29ubmVjdCwgY29ubmVjdE11dCB9IGZyb20gJy4vY29ubmVjdCc7XG5leHBvcnQgeyBzZXJ2aWNlVHlwZXMsIGFsZXJ0VHlwZXMsIGRpc3BsYXkgfSBmcm9tICcuL21vZGVsL3BvaW50JztcblxuZXhwb3J0IHsgU2NoZWR1bGUsIGRheXMsIG5leHREYXksIHRpbWV6b25lcyB9IGZyb20gJy4vbW9kZWwvaG91cnMnO1xuXG5leHBvcnQgeyBVc2VyLCBVc2VyQ29sbGVjdGlvbiwgVXNlclJlZiwgVXNlclJlZkNvbGxlY3Rpb24sIExvZ2luLCBGb3Jnb3QsIFJlc2V0IH0gZnJvbSAnLi9tb2RlbC91c2VyJztcbmV4cG9ydCB7IFBvaW50LCBTZXJ2aWNlLCBBbGVydCwgUG9pbnRDb2xsZWN0aW9uIH0gZnJvbSAnLi9tb2RlbC9wb2ludCc7XG5leHBvcnQgeyBDb21tZW50LCBDb21tZW50Q29sbGVjdGlvbiB9IGZyb20gJy4vbW9kZWwvY29tbWVudCc7XG5cbmltcG9ydCB7IFBvaW50LCBTZXJ2aWNlLCBBbGVydCwgUG9pbnRDb2xsZWN0aW9uIH0gZnJvbSAnLi9tb2RlbC9wb2ludCc7XG5pbXBvcnQgeyBDb21tZW50LCBDb21tZW50Q29sbGVjdGlvbiB9IGZyb20gJy4vbW9kZWwvY29tbWVudCc7XG5cbi8qZXNmbXQtaWdub3JlLXN0YXJ0Ki9cbmV4cG9ydCBjb25zdCBwb2ludE1vZGVscyA9IFtcbiAgUG9pbnQsXG4gIFNlcnZpY2UsXG4gIEFsZXJ0LFxuICBQb2ludENvbGxlY3Rpb25cbl07XG5cbmV4cG9ydCBjb25zdCBjb21tZW50TW9kZWxzID0gW1xuICBDb21tZW50LFxuICBDb21tZW50Q29sbGVjdGlvblxuXTtcbi8qZXNmbXQtaWdub3JlLWVuZCovXG5cbmltcG9ydCB7IGNvbm5lY3RNdXQgfSBmcm9tICcuL2Nvbm5lY3QnO1xuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3RQb2ludE1vZGVscyggZGF0YWJhc2UgKSB7XG4gIGNvbm5lY3RNdXQoIGRhdGFiYXNlLCBwb2ludE1vZGVscyApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdENvbW1lbnRNb2RlbHMoIGRhdGFiYXNlICkge1xuICBjb25uZWN0TXV0KCBkYXRhYmFzZSwgY29tbWVudE1vZGVscyApO1xufVxuIl19