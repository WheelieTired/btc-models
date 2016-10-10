'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PromiseCollection = exports.PromiseModel = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _backbone = require('backbone');

var _lodash = require('lodash');

var Promise = require('polyfill-promise');

// # Backbone Promises
// This file provides Model and Collection base classes that override
// backbone's callback api with a promise based api. We override save, destroy,
// and fetch. But we cannot override Collection.create. That method does not
// accept success and error callbacks anyways.

// ## Bakcbone Callback Factory
// This function takes either Promise.resolve or Promise.reject, and returns
// a new function that will call Promise.resolve or Promise.reject with the
// appropriate resolved object. The resolved object either has a
// collection key or a model key depending on the returned entity type.
var callback = function callback(finalize) {
  return function (entity, response, options) {
    if (entity instanceof _backbone.Collection) {
      finalize({ collection: entity, response: response, options: options });
    } else {
      finalize({ model: entity, response: response, options: options });
    }
  };
};

// ## Promise Factory
// This function returns a promise that adapts backbone's success and error
// callbacks to Promise's reject and resolve methods. However, if the client
// passes in success and error callbacks themselves, they expect to use
// the default callback api.
var promise = function promise(context, method, options, args) {
  var base = context instanceof _backbone.Collection ? _backbone.Collection : _backbone.Model;
  var func = base.prototype[method];
  if (options.success || options.error) {
    return func.apply(context, args);
  } else {
    return new Promise(function (resolve, reject) {
      (0, _lodash.assign)(options, {
        success: callback(resolve),
        error: callback(reject)
      });
      func.apply(context, args);
    });
  }
};

// # Promise Model
// Overrides Model's save, destroy, and fetch functions with versions that
// return promises.
var PromiseModel = exports.PromiseModel = _backbone.Model.extend({
  save: function save(key, val, options) {
    var opts = void 0,
        args = void 0;
    if (key == null || (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
      opts = val || {};
      args = [key, opts];
    } else {
      opts = options || {};
      args = [key, val, opts];
    }

    return promise(this, 'save', opts, args);
  },

  destroy: function destroy() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return promise(this, 'destroy', options, [options]);
  },

  fetch: function fetch() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return promise(this, 'fetch', options, [options]);
  }
});

// # PromiseCollection
// Overrides Collection's fetch function with a version that returns a promise.
var PromiseCollection = exports.PromiseCollection = _backbone.Collection.extend({
  fetch: function fetch() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return promise(this, 'fetch', options, [options]);
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9wcm9taXNlLmpzIl0sIm5hbWVzIjpbIlByb21pc2UiLCJyZXF1aXJlIiwiY2FsbGJhY2siLCJlbnRpdHkiLCJyZXNwb25zZSIsIm9wdGlvbnMiLCJmaW5hbGl6ZSIsImNvbGxlY3Rpb24iLCJtb2RlbCIsInByb21pc2UiLCJjb250ZXh0IiwibWV0aG9kIiwiYXJncyIsImJhc2UiLCJmdW5jIiwicHJvdG90eXBlIiwic3VjY2VzcyIsImVycm9yIiwiYXBwbHkiLCJyZXNvbHZlIiwicmVqZWN0IiwiUHJvbWlzZU1vZGVsIiwiZXh0ZW5kIiwic2F2ZSIsImtleSIsInZhbCIsIm9wdHMiLCJkZXN0cm95IiwiZmV0Y2giLCJQcm9taXNlQ29sbGVjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBRUEsSUFBSUEsVUFBVUMsUUFBUSxrQkFBUixDQUFkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLFdBQVcsU0FBWEEsUUFBVztBQUFBLFNBQVksVUFBRUMsTUFBRixFQUFVQyxRQUFWLEVBQW9CQyxPQUFwQixFQUFpQztBQUM1RCxRQUFLRixzQ0FBTCxFQUFvQztBQUNsQ0csZUFBVSxFQUFFQyxZQUFZSixNQUFkLEVBQXNCQyxrQkFBdEIsRUFBZ0NDLGdCQUFoQyxFQUFWO0FBQ0QsS0FGRCxNQUVPO0FBQ0xDLGVBQVUsRUFBRUUsT0FBT0wsTUFBVCxFQUFpQkMsa0JBQWpCLEVBQTJCQyxnQkFBM0IsRUFBVjtBQUNEO0FBQ0YsR0FOZ0I7QUFBQSxDQUFqQjs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUksVUFBVSxTQUFWQSxPQUFVLENBQUVDLE9BQUYsRUFBV0MsTUFBWCxFQUFtQk4sT0FBbkIsRUFBNEJPLElBQTVCLEVBQXNDO0FBQ3BELE1BQU1DLE9BQU9ILGdGQUFiO0FBQ0EsTUFBTUksT0FBT0QsS0FBS0UsU0FBTCxDQUFnQkosTUFBaEIsQ0FBYjtBQUNBLE1BQUtOLFFBQVFXLE9BQVIsSUFBbUJYLFFBQVFZLEtBQWhDLEVBQXdDO0FBQ3RDLFdBQU9ILEtBQUtJLEtBQUwsQ0FBWVIsT0FBWixFQUFxQkUsSUFBckIsQ0FBUDtBQUNELEdBRkQsTUFFTztBQUNMLFdBQU8sSUFBSVosT0FBSixDQUFhLFVBQUVtQixPQUFGLEVBQVdDLE1BQVgsRUFBdUI7QUFDekMsMEJBQVFmLE9BQVIsRUFBaUI7QUFDZlcsaUJBQVNkLFNBQVVpQixPQUFWLENBRE07QUFFZkYsZUFBT2YsU0FBVWtCLE1BQVY7QUFGUSxPQUFqQjtBQUlBTixXQUFLSSxLQUFMLENBQVlSLE9BQVosRUFBcUJFLElBQXJCO0FBQ0QsS0FOTSxDQUFQO0FBT0Q7QUFDRixDQWREOztBQWdCQTtBQUNBO0FBQ0E7QUFDTyxJQUFNUyxzQ0FBZSxnQkFBTUMsTUFBTixDQUFjO0FBQ3hDQyxRQUFNLGNBQVVDLEdBQVYsRUFBZUMsR0FBZixFQUFvQnBCLE9BQXBCLEVBQThCO0FBQ2xDLFFBQUlxQixhQUFKO0FBQUEsUUFBVWQsYUFBVjtBQUNBLFFBQUtZLE9BQU8sSUFBUCxJQUFlLFFBQU9BLEdBQVAseUNBQU9BLEdBQVAsT0FBZSxRQUFuQyxFQUE4QztBQUM1Q0UsYUFBT0QsT0FBTyxFQUFkO0FBQ0FiLGFBQU8sQ0FBRVksR0FBRixFQUFPRSxJQUFQLENBQVA7QUFDRCxLQUhELE1BR087QUFDTEEsYUFBT3JCLFdBQVcsRUFBbEI7QUFDQU8sYUFBTyxDQUFFWSxHQUFGLEVBQU9DLEdBQVAsRUFBWUMsSUFBWixDQUFQO0FBQ0Q7O0FBRUQsV0FBT2pCLFFBQVMsSUFBVCxFQUFlLE1BQWYsRUFBdUJpQixJQUF2QixFQUE2QmQsSUFBN0IsQ0FBUDtBQUNELEdBWnVDOztBQWN4Q2UsV0FBUyxtQkFBeUI7QUFBQSxRQUFmdEIsT0FBZSx1RUFBTCxFQUFLOztBQUNoQyxXQUFPSSxRQUFTLElBQVQsRUFBZSxTQUFmLEVBQTBCSixPQUExQixFQUFtQyxDQUFFQSxPQUFGLENBQW5DLENBQVA7QUFDRCxHQWhCdUM7O0FBa0J4Q3VCLFNBQU8saUJBQXlCO0FBQUEsUUFBZnZCLE9BQWUsdUVBQUwsRUFBSzs7QUFDOUIsV0FBT0ksUUFBUyxJQUFULEVBQWUsT0FBZixFQUF3QkosT0FBeEIsRUFBaUMsQ0FBRUEsT0FBRixDQUFqQyxDQUFQO0FBQ0Q7QUFwQnVDLENBQWQsQ0FBckI7O0FBdUJQO0FBQ0E7QUFDTyxJQUFNd0IsZ0RBQW9CLHFCQUFXUCxNQUFYLENBQW1CO0FBQ2xETSxTQUFPLGlCQUF5QjtBQUFBLFFBQWZ2QixPQUFlLHVFQUFMLEVBQUs7O0FBQzlCLFdBQU9JLFFBQVMsSUFBVCxFQUFlLE9BQWYsRUFBd0JKLE9BQXhCLEVBQWlDLENBQUVBLE9BQUYsQ0FBakMsQ0FBUDtBQUNEO0FBSGlELENBQW5CLENBQTFCIiwiZmlsZSI6InByb21pc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2RlbCwgQ29sbGVjdGlvbiB9IGZyb20gJ2JhY2tib25lJztcbmltcG9ydCB7IGFzc2lnbiB9IGZyb20gJ2xvZGFzaCc7XG5cbnZhciBQcm9taXNlID0gcmVxdWlyZSgncG9seWZpbGwtcHJvbWlzZScpO1xuXG4vLyAjIEJhY2tib25lIFByb21pc2VzXG4vLyBUaGlzIGZpbGUgcHJvdmlkZXMgTW9kZWwgYW5kIENvbGxlY3Rpb24gYmFzZSBjbGFzc2VzIHRoYXQgb3ZlcnJpZGVcbi8vIGJhY2tib25lJ3MgY2FsbGJhY2sgYXBpIHdpdGggYSBwcm9taXNlIGJhc2VkIGFwaS4gV2Ugb3ZlcnJpZGUgc2F2ZSwgZGVzdHJveSxcbi8vIGFuZCBmZXRjaC4gQnV0IHdlIGNhbm5vdCBvdmVycmlkZSBDb2xsZWN0aW9uLmNyZWF0ZS4gVGhhdCBtZXRob2QgZG9lcyBub3Rcbi8vIGFjY2VwdCBzdWNjZXNzIGFuZCBlcnJvciBjYWxsYmFja3MgYW55d2F5cy5cblxuLy8gIyMgQmFrY2JvbmUgQ2FsbGJhY2sgRmFjdG9yeVxuLy8gVGhpcyBmdW5jdGlvbiB0YWtlcyBlaXRoZXIgUHJvbWlzZS5yZXNvbHZlIG9yIFByb21pc2UucmVqZWN0LCBhbmQgcmV0dXJuc1xuLy8gYSBuZXcgZnVuY3Rpb24gdGhhdCB3aWxsIGNhbGwgUHJvbWlzZS5yZXNvbHZlIG9yIFByb21pc2UucmVqZWN0IHdpdGggdGhlXG4vLyBhcHByb3ByaWF0ZSByZXNvbHZlZCBvYmplY3QuIFRoZSByZXNvbHZlZCBvYmplY3QgZWl0aGVyIGhhcyBhXG4vLyBjb2xsZWN0aW9uIGtleSBvciBhIG1vZGVsIGtleSBkZXBlbmRpbmcgb24gdGhlIHJldHVybmVkIGVudGl0eSB0eXBlLlxuY29uc3QgY2FsbGJhY2sgPSBmaW5hbGl6ZSA9PiAoIGVudGl0eSwgcmVzcG9uc2UsIG9wdGlvbnMgKSA9PiB7XG4gIGlmICggZW50aXR5IGluc3RhbmNlb2YgQ29sbGVjdGlvbiApIHtcbiAgICBmaW5hbGl6ZSggeyBjb2xsZWN0aW9uOiBlbnRpdHksIHJlc3BvbnNlLCBvcHRpb25zIH0gKTtcbiAgfSBlbHNlIHtcbiAgICBmaW5hbGl6ZSggeyBtb2RlbDogZW50aXR5LCByZXNwb25zZSwgb3B0aW9ucyB9ICk7XG4gIH1cbn07XG5cbi8vICMjIFByb21pc2UgRmFjdG9yeVxuLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGFkYXB0cyBiYWNrYm9uZSdzIHN1Y2Nlc3MgYW5kIGVycm9yXG4vLyBjYWxsYmFja3MgdG8gUHJvbWlzZSdzIHJlamVjdCBhbmQgcmVzb2x2ZSBtZXRob2RzLiBIb3dldmVyLCBpZiB0aGUgY2xpZW50XG4vLyBwYXNzZXMgaW4gc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzIHRoZW1zZWx2ZXMsIHRoZXkgZXhwZWN0IHRvIHVzZVxuLy8gdGhlIGRlZmF1bHQgY2FsbGJhY2sgYXBpLlxuY29uc3QgcHJvbWlzZSA9ICggY29udGV4dCwgbWV0aG9kLCBvcHRpb25zLCBhcmdzICkgPT4ge1xuICBjb25zdCBiYXNlID0gY29udGV4dCBpbnN0YW5jZW9mIENvbGxlY3Rpb24gPyBDb2xsZWN0aW9uIDogTW9kZWw7XG4gIGNvbnN0IGZ1bmMgPSBiYXNlLnByb3RvdHlwZVsgbWV0aG9kIF07XG4gIGlmICggb3B0aW9ucy5zdWNjZXNzIHx8IG9wdGlvbnMuZXJyb3IgKSB7XG4gICAgcmV0dXJuIGZ1bmMuYXBwbHkoIGNvbnRleHQsIGFyZ3MgKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgICAgYXNzaWduKCBvcHRpb25zLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrKCByZXNvbHZlICksXG4gICAgICAgIGVycm9yOiBjYWxsYmFjayggcmVqZWN0IClcbiAgICAgIH0gKTtcbiAgICAgIGZ1bmMuYXBwbHkoIGNvbnRleHQsIGFyZ3MgKTtcbiAgICB9ICk7XG4gIH1cbn07XG5cbi8vICMgUHJvbWlzZSBNb2RlbFxuLy8gT3ZlcnJpZGVzIE1vZGVsJ3Mgc2F2ZSwgZGVzdHJveSwgYW5kIGZldGNoIGZ1bmN0aW9ucyB3aXRoIHZlcnNpb25zIHRoYXRcbi8vIHJldHVybiBwcm9taXNlcy5cbmV4cG9ydCBjb25zdCBQcm9taXNlTW9kZWwgPSBNb2RlbC5leHRlbmQoIHtcbiAgc2F2ZTogZnVuY3Rpb24oIGtleSwgdmFsLCBvcHRpb25zICkge1xuICAgIGxldCBvcHRzLCBhcmdzO1xuICAgIGlmICgga2V5ID09IG51bGwgfHwgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcgKSB7XG4gICAgICBvcHRzID0gdmFsIHx8IHt9O1xuICAgICAgYXJncyA9IFsga2V5LCBvcHRzIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgYXJncyA9IFsga2V5LCB2YWwsIG9wdHMgXTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZSggdGhpcywgJ3NhdmUnLCBvcHRzLCBhcmdzICk7XG4gIH0sXG5cbiAgZGVzdHJveTogZnVuY3Rpb24oIG9wdGlvbnMgPSB7fSApIHtcbiAgICByZXR1cm4gcHJvbWlzZSggdGhpcywgJ2Rlc3Ryb3knLCBvcHRpb25zLCBbIG9wdGlvbnMgXSApO1xuICB9LFxuXG4gIGZldGNoOiBmdW5jdGlvbiggb3B0aW9ucyA9IHt9ICkge1xuICAgIHJldHVybiBwcm9taXNlKCB0aGlzLCAnZmV0Y2gnLCBvcHRpb25zLCBbIG9wdGlvbnMgXSApO1xuICB9XG59ICk7XG5cbi8vICMgUHJvbWlzZUNvbGxlY3Rpb25cbi8vIE92ZXJyaWRlcyBDb2xsZWN0aW9uJ3MgZmV0Y2ggZnVuY3Rpb24gd2l0aCBhIHZlcnNpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZS5cbmV4cG9ydCBjb25zdCBQcm9taXNlQ29sbGVjdGlvbiA9IENvbGxlY3Rpb24uZXh0ZW5kKCB7XG4gIGZldGNoOiBmdW5jdGlvbiggb3B0aW9ucyA9IHt9ICkge1xuICAgIHJldHVybiBwcm9taXNlKCB0aGlzLCAnZmV0Y2gnLCBvcHRpb25zLCBbIG9wdGlvbnMgXSApO1xuICB9XG59ICk7XG4iXX0=