'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;
exports.connectMut = connectMut;

var _backbonePouch = require('backbone-pouch');

var _lodash = require('lodash');

// # Connect Function
// Given a PouchDB databse object and a backbone class, connect that class
// to the database with backbone-pouch. This function extends the backbone
// model or collection first, so we don't modify `klass`.
//
// In order for this to be useful, the backbone model or collection class must
// specify a [`pouch` object](https://github.com/jo/backbone-pouch).
function connect(database, klass) {
  return klass.extend({
    connect: connect,
    database: database,
    sync: (0, _backbonePouch.sync)({ db: database })
  });
}

function connectMut(database, klasses) {
  klasses.forEach(function (klass) {
    return (0, _lodash.merge)(klass.prototype, {
      connect: connect,
      database: database,
      sync: (0, _backbonePouch.sync)({ db: database })
    });
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25uZWN0LmpzIl0sIm5hbWVzIjpbImNvbm5lY3QiLCJjb25uZWN0TXV0IiwiZGF0YWJhc2UiLCJrbGFzcyIsImV4dGVuZCIsInN5bmMiLCJkYiIsImtsYXNzZXMiLCJmb3JFYWNoIiwicHJvdG90eXBlIl0sIm1hcHBpbmdzIjoiOzs7OztRQVVnQkEsTyxHQUFBQSxPO1FBUUFDLFUsR0FBQUEsVTs7QUFsQmhCOztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sU0FBU0QsT0FBVCxDQUFrQkUsUUFBbEIsRUFBNEJDLEtBQTVCLEVBQW9DO0FBQ3pDLFNBQU9BLE1BQU1DLE1BQU4sQ0FBYztBQUNuQkosb0JBRG1CO0FBRW5CRSxzQkFGbUI7QUFHbkJHLFVBQU0seUJBQU0sRUFBRUMsSUFBSUosUUFBTixFQUFOO0FBSGEsR0FBZCxDQUFQO0FBS0Q7O0FBRU0sU0FBU0QsVUFBVCxDQUFxQkMsUUFBckIsRUFBK0JLLE9BQS9CLEVBQXlDO0FBQzlDQSxVQUFRQyxPQUFSLENBQWlCO0FBQUEsV0FBUyxtQkFBT0wsTUFBTU0sU0FBYixFQUF3QjtBQUNoRFQsc0JBRGdEO0FBRWhERSx3QkFGZ0Q7QUFHaERHLFlBQU0seUJBQU0sRUFBRUMsSUFBSUosUUFBTixFQUFOO0FBSDBDLEtBQXhCLENBQVQ7QUFBQSxHQUFqQjtBQUtEIiwiZmlsZSI6ImNvbm5lY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzeW5jIH0gZnJvbSAnYmFja2JvbmUtcG91Y2gnO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICdsb2Rhc2gnO1xuXG4vLyAjIENvbm5lY3QgRnVuY3Rpb25cbi8vIEdpdmVuIGEgUG91Y2hEQiBkYXRhYnNlIG9iamVjdCBhbmQgYSBiYWNrYm9uZSBjbGFzcywgY29ubmVjdCB0aGF0IGNsYXNzXG4vLyB0byB0aGUgZGF0YWJhc2Ugd2l0aCBiYWNrYm9uZS1wb3VjaC4gVGhpcyBmdW5jdGlvbiBleHRlbmRzIHRoZSBiYWNrYm9uZVxuLy8gbW9kZWwgb3IgY29sbGVjdGlvbiBmaXJzdCwgc28gd2UgZG9uJ3QgbW9kaWZ5IGBrbGFzc2AuXG4vL1xuLy8gSW4gb3JkZXIgZm9yIHRoaXMgdG8gYmUgdXNlZnVsLCB0aGUgYmFja2JvbmUgbW9kZWwgb3IgY29sbGVjdGlvbiBjbGFzcyBtdXN0XG4vLyBzcGVjaWZ5IGEgW2Bwb3VjaGAgb2JqZWN0XShodHRwczovL2dpdGh1Yi5jb20vam8vYmFja2JvbmUtcG91Y2gpLlxuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3QoIGRhdGFiYXNlLCBrbGFzcyApIHtcbiAgcmV0dXJuIGtsYXNzLmV4dGVuZCgge1xuICAgIGNvbm5lY3QsXG4gICAgZGF0YWJhc2UsXG4gICAgc3luYzogc3luYyggeyBkYjogZGF0YWJhc2UgfSApXG4gIH0gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3RNdXQoIGRhdGFiYXNlLCBrbGFzc2VzICkge1xuICBrbGFzc2VzLmZvckVhY2goIGtsYXNzID0+IG1lcmdlKCBrbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25uZWN0LFxuICAgIGRhdGFiYXNlLFxuICAgIHN5bmM6IHN5bmMoIHsgZGI6IGRhdGFiYXNlIH0gKVxuICB9ICkgKTtcbn1cbiJdfQ==