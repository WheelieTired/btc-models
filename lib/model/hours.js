'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Schedule = exports.timezones = exports.days = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.nextDay = nextDay;
exports.normalize = normalize;

var _validationMixin = require('./validation-mixin');

var _backbone = require('backbone');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// # Logic for Seasons and Hours
// A service usually has posted hours for the week. The list of opening and
// closing times for each day of the week are considered 'Hours'. Different
// days of the week can have different opening and closing times. A single
// day can have multiple segments where the service is open (for example,
// restaurants may be closed between lunch and dinner). However, we don't
// yet sanitize occurences where these overlap.
//
// Services encountered by touring cyclists are likely to have seasonal hours.
// A 'Season' has a name, and a list of hours.
//
// The entire list of seasonal hours is the 'Schedule'. Each service has at
// least a schedule with a default season.

// ## Day Enumeration
// This enum has a `next` field which is provided as a utility for GUIs.
// The special weekend and weekday keys can be used by the `expand`
// function to obtain a list of the appropriate day keys.
//
// The keys of the enum are ordered to correspond with new Date().getDay().
// Use keys( days ) to use that index.

/*esfmt-ignore-start*/
var days = exports.days = {
  'sunday': { display: 'Sunday', type: 'weekend', next: 'monday' },
  'monday': { display: 'Monday', type: 'weekday', next: 'tuesday' },
  'tuesday': { display: 'Tuesday', type: 'weekday', next: 'wednesday' },
  'wednesday': { display: 'Wednesday', type: 'weekday', next: 'thursday' },
  'thursday': { display: 'Thursday', type: 'weekday', next: 'friday' },
  'friday': { display: 'Friday', type: 'weekday', next: 'saturday' },
  'saturday': { display: 'Saturday', type: 'weekend', next: 'sunday' },

  'weekend': { display: 'Weekend', type: 'compose', next: 'weekday' },
  'weekday': { display: 'Weekdays', type: 'compose', next: 'weekend' }
};
var timezones = exports.timezones = {
  'pst': { display: 'PST', longName: 'Pacific Standard Time', time: -8 },
  'pdt': { display: 'PDT', longName: 'Pacific Daylight Time', time: -7 },
  'mst': { display: 'MST', longName: 'Mountain Standard Time', time: -7 },
  'mdt': { display: 'MDT', longName: 'Mountain Daylight Time', time: -6 },
  'cst': { display: 'CST', longName: 'Central Standard Time', time: -6 },
  'cdt': { display: 'CDT', longName: 'Central Daylight Time', time: -5 },
  'est': { display: 'EST', longName: 'Eastern Standard Time', time: -5 },
  'edt': { display: 'EDT', longName: 'Eastern Daylight Time', time: -4 }
};
/*esfmt-ignore-end*/

var daysKeys = (0, _lodash.keys)(days);

// ## Expand Special Keys
// Given 'weekend' or 'weekday', this function will return a list of the
// relevant enum keys. If a regular key is provided, pass it through.
function expand(day) {
  switch (day) {
    case 'weekend':
    case 'weekday':
      return (0, _lodash2.default)(days).pickBy(function (value) {
        return value.type === day;
      }).keys();
    default:
      return [day];
  }
}

// ## Get the Next Day in Sequence
// Given a day of the week, return the next day in sequence. Saturday wraps
// around to Sunday
function nextDay(day) {
  var next = days[day].next;
  if (next) {
    return next;
  } else {
    return null;
  }
}

// ## Day key for Today
// Return the enum key for today.
function today() {
  var idx = new Date().getDay();
  return daysKeys[idx];
}

// ## Dates Used as Times
// If you have a Date object where only the HH:MM information is relevant,
// `normalize` will reset the date component to Jan 1, 1970 and shave off
// any seconds and milliseconds. (Javascript dates are 2038 safe)
function normalize(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();

  return new Date(1970, 0, 1, hours, minutes, 0, 0).toISOString();
}

// ## Hours Schema
// An hours array contains objects that specify opening and closing times
// for a day. The hours array can have multiple entries for the same day.
//
// The opening and closing times must be stored as ISO compliant date-time
// strings in Zulu time.
//
// ```
// [ {
//   "monday",
//   "opens": "1970-01-01T08:30:00.000Z",
//   "closes": "1970-01-01T17:30:00.000Z"
// } ]
// ```
var hours = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      day: {
        type: 'string',
        enum: (0, _lodash.keys)(days)
      },
      opens: {
        type: 'string',
        format: 'date-time'
      },
      closes: {
        type: 'string',
        format: 'date-time'
      },
      timezone: {
        type: 'string',
        enum: (0, _lodash.keys)(timezones)
      }
    }
  }
};

// ## Schedule Schema
// A schema object has season names for keys and hours arrays for values. The
// schema object has a 'default' season in case we don't know season-specific
// hours for a service.
//
// ```
// {
//   "default": ...,
//   "winter": ...
// }
// ```
var schedule = {
  type: 'object',
  additionalProperties: false,
  properties: {
    schedule: {
      type: 'object',
      patternProperties: {
        '.*': hours
      }
    }
  }
};

// # Schedule Model
// The schedule model provides an easy way to work with the schedule data
// structure. It is not intended to be connected to a database. It is meant
// only to manipulate the structure between deserialization and serialization
// of a redux store.
//
// Times for each day are stored as ISO-compliant strings normalized to ignore
// all sections besides HH:MM (they appear as 1970's dates).
var Schedule = exports.Schedule = _backbone.Model.extend({
  schema: schedule,

  constructor: function constructor(attrs, options) {
    _backbone.Model.call(this, { schedule: attrs || {} }, options);
  },

  // ## Add Hours to Season
  // Add an entry to the hours array for a season, by default the 'default'
  // season. If a special day key is provided, expand it to an array of
  // day keys.
  addHoursIn: function addHoursIn(day, opens, closes, timezone) {
    var name = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'default';

    var schedule = this.get('schedule');
    var hours = expand(day).map(function (day) {
      return {
        day: day,
        closes: normalize(closes),
        opens: normalize(opens),
        timezone: timezone
      };
    });
    var season = schedule[name] || [];
    this.set('schedule', _extends({}, schedule, _defineProperty({}, name, [].concat(_toConsumableArray(season), _toConsumableArray(hours)))));
  },

  // ## Remove Hours from a Season
  // Delete an entry in the hours arary for a season, by default the 'default'
  // season. Entries are deleted by index in the hours array.
  delHoursIn: function delHoursIn(idx) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';

    var schedule = this.get('schedule');
    var season = schedule[name] || [];

    season.splice(idx, 1);

    this.set('schedule', _extends({}, schedule, _defineProperty({}, name, season)));
  },

  // Get the closing-time ISO string for today.
  getClosingToday: function getClosingToday() {
    var season = this.get('schedule').default;
    var hours = (0, _lodash.find)(season, { day: today() });

    return hours ? hours.closes : null;
  },


  // Returns a boolean based on if any days have hours.
  hasAnyHoursAdded: function hasAnyHoursAdded() {
    var season = this.get('schedule').default;

    if (season.length > 0) {
      return true;
    } else {
      return false;
    }
  }
});

(0, _validationMixin.mixinValidation)(Schedule);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9ob3Vycy5qcyJdLCJuYW1lcyI6WyJuZXh0RGF5Iiwibm9ybWFsaXplIiwiZGF5cyIsImRpc3BsYXkiLCJ0eXBlIiwibmV4dCIsInRpbWV6b25lcyIsImxvbmdOYW1lIiwidGltZSIsImRheXNLZXlzIiwiZXhwYW5kIiwiZGF5IiwicGlja0J5IiwidmFsdWUiLCJrZXlzIiwidG9kYXkiLCJpZHgiLCJEYXRlIiwiZ2V0RGF5IiwiZGF0ZSIsImhvdXJzIiwiZ2V0SG91cnMiLCJtaW51dGVzIiwiZ2V0TWludXRlcyIsInRvSVNPU3RyaW5nIiwiaXRlbXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJlbnVtIiwib3BlbnMiLCJmb3JtYXQiLCJjbG9zZXMiLCJ0aW1lem9uZSIsInNjaGVkdWxlIiwicGF0dGVyblByb3BlcnRpZXMiLCJTY2hlZHVsZSIsImV4dGVuZCIsInNjaGVtYSIsImNvbnN0cnVjdG9yIiwiYXR0cnMiLCJvcHRpb25zIiwiY2FsbCIsImFkZEhvdXJzSW4iLCJuYW1lIiwiZ2V0IiwibWFwIiwic2Vhc29uIiwic2V0IiwiZGVsSG91cnNJbiIsInNwbGljZSIsImdldENsb3NpbmdUb2RheSIsImRlZmF1bHQiLCJoYXNBbnlIb3Vyc0FkZGVkIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7UUFzRWdCQSxPLEdBQUFBLE87UUFvQkFDLFMsR0FBQUEsUzs7QUExRmhCOztBQUVBOztBQUNBOzs7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDTyxJQUFNQyxzQkFBTztBQUNsQixZQUFVLEVBQUVDLFNBQVMsUUFBWCxFQUFxQkMsTUFBTSxTQUEzQixFQUFzQ0MsTUFBTSxRQUE1QyxFQURRO0FBRWxCLFlBQVUsRUFBRUYsU0FBUyxR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LEdBQUwsQ0FBVSxVQUFWLEVBQXVCTyxPQUF0QztBQUNBLFFBQU0vQixRQUFRLGtCQUFNMEIsTUFBTixFQUFjLEVBQUVuQyxLQUFLSSxPQUFQLEVBQWQsQ0FBZDs7QUFFQSxXQUFPSyxRQUFRQSxNQUFNVyxNQUFkLEdBQXVCLElBQTlCO0FBQ0QsR0FqRG1DOzs7QUFtRHBDO0FBQ0FxQixrQkFwRG9DLDhCQW9EakI7QUFDakIsUUFBTU4sU0FBUyxLQUFLRixHQUFMLENBQVUsVUFBVixFQUF1Qk8sT0FBdEM7O0FBRUEsUUFBSUwsT0FBT08sTUFBUCxHQUFnQixDQUFwQixFQUF1QjtBQUNyQixhQUFPLElBQVA7QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLEtBQVA7QUFDRDtBQUNGO0FBNURtQyxDQUFkLENBQWpCOztBQStEUCxzQ0FBaUJsQixRQUFqQiIsImZpbGUiOiJob3Vycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG1peGluVmFsaWRhdGlvbiB9IGZyb20gJy4vdmFsaWRhdGlvbi1taXhpbic7XG5cbmltcG9ydCB7IE1vZGVsIH0gZnJvbSAnYmFja2JvbmUnO1xuaW1wb3J0IF8sIHsga2V5cywgZmluZCB9IGZyb20gJ2xvZGFzaCc7XG5cbi8vICMgTG9naWMgZm9yIFNlYXNvbnMgYW5kIEhvdXJzXG4vLyBBIHNlcnZpY2UgdXN1YWxseSBoYXMgcG9zdGVkIGhvdXJzIGZvciB0aGUgd2Vlay4gVGhlIGxpc3Qgb2Ygb3BlbmluZyBhbmRcbi8vIGNsb3NpbmcgdGltZXMgZm9yIGVhY2ggZGF5IG9mIHRoZSB3ZWVrIGFyZSBjb25zaWRlcmVkICdIb3VycycuIERpZmZlcmVudFxuLy8gZGF5cyBvZiB0aGUgd2VlayBjYW4gaGF2ZSBkaWZmZXJlbnQgb3BlbmluZyBhbmQgY2xvc2luZyB0aW1lcy4gQSBzaW5nbGVcbi8vIGRheSBjYW4gaGF2ZSBtdWx0aXBsZSBzZWdtZW50cyB3aGVyZSB0aGUgc2VydmljZSBpcyBvcGVuIChmb3IgZXhhbXBsZSxcbi8vIHJlc3RhdXJhbnRzIG1heSBiZSBjbG9zZWQgYmV0d2VlbiBsdW5jaCBhbmQgZGlubmVyKS4gSG93ZXZlciwgd2UgZG9uJ3Rcbi8vIHlldCBzYW5pdGl6ZSBvY2N1cmVuY2VzIHdoZXJlIHRoZXNlIG92ZXJsYXAuXG4vL1xuLy8gU2VydmljZXMgZW5jb3VudGVyZWQgYnkgdG91cmluZyBjeWNsaXN0cyBhcmUgbGlrZWx5IHRvIGhhdmUgc2Vhc29uYWwgaG91cnMuXG4vLyBBICdTZWFzb24nIGhhcyBhIG5hbWUsIGFuZCBhIGxpc3Qgb2YgaG91cnMuXG4vL1xuLy8gVGhlIGVudGlyZSBsaXN0IG9mIHNlYXNvbmFsIGhvdXJzIGlzIHRoZSAnU2NoZWR1bGUnLiBFYWNoIHNlcnZpY2UgaGFzIGF0XG4vLyBsZWFzdCBhIHNjaGVkdWxlIHdpdGggYSBkZWZhdWx0IHNlYXNvbi5cblxuLy8gIyMgRGF5IEVudW1lcmF0aW9uXG4vLyBUaGlzIGVudW0gaGFzIGEgYG5leHRgIGZpZWxkIHdoaWNoIGlzIHByb3ZpZGVkIGFzIGEgdXRpbGl0eSBmb3IgR1VJcy5cbi8vIFRoZSBzcGVjaWFsIHdlZWtlbmQgYW5kIHdlZWtkYXkga2V5cyBjYW4gYmUgdXNlZCBieSB0aGUgYGV4cGFuZGBcbi8vIGZ1bmN0aW9uIHRvIG9idGFpbiBhIGxpc3Qgb2YgdGhlIGFwcHJvcHJpYXRlIGRheSBrZXlzLlxuLy9cbi8vIFRoZSBrZXlzIG9mIHRoZSBlbnVtIGFyZSBvcmRlcmVkIHRvIGNvcnJlc3BvbmQgd2l0aCBuZXcgRGF0ZSgpLmdldERheSgpLlxuLy8gVXNlIGtleXMoIGRheXMgKSB0byB1c2UgdGhhdCBpbmRleC5cblxuLyplc2ZtdC1pZ25vcmUtc3RhcnQqL1xuZXhwb3J0IGNvbnN0IGRheXMgPSB7XG4gICdzdW5kYXknOiB7IGRpc3BsYXk6ICdTdW5kYXknLCB0eXBlOiAnd2Vla2VuZCcsIG5leHQ6ICdtb25kYXknIH0sXG4gICdtb25kYXknOiB7IGRpc3BsYXk6ICdNb25kYXknLCB0eXBlOiAnd2Vla2RheScsIG5leHQ6ICd0dWVzZGF5JyB9LFxuICAndHVlc2RheSc6IHsgZGlzcGxheTogJ1R1ZXNkYXknLCB0eXBlOiAnd2Vla2RheScsIG5leHQ6ICd3ZWRuZXNkYXknIH0sXG4gICd3ZWRuZXNkYXknOiB7IGRpc3BsYXk6ICdXZWRuZXNkYXknLCB0eXBlOiAnd2Vla2RheScsIG5leHQ6ICd0aHVyc2RheScgfSxcbiAgJ3RodXJzZGF5JzogeyBkaXNwbGF5OiAnVGh1cnNkYXknLCB0eXBlOiAnd2Vla2RheScsIG5leHQ6ICdmcmlkYXknIH0sXG4gICdmcmlkYXknOiB7IGRpc3BsYXk6ICdGcmlkYXknLCB0eXBlOiAnd2Vla2RheScsIG5leHQ6ICdzYXR1cmRheScgfSxcbiAgJ3NhdHVyZGF5JzogeyBkaXNwbGF5OiAnU2F0dXJkYXknLCB0eXBlOiAnd2Vla2VuZCcsIG5leHQ6ICdzdW5kYXknIH0sXG5cbiAgJ3dlZWtlbmQnOiB7IGRpc3BsYXk6ICdXZWVrZW5kJywgdHlwZTogJ2NvbXBvc2UnLCBuZXh0OiAnd2Vla2RheScgfSxcbiAgJ3dlZWtkYXknOiB7IGRpc3BsYXk6ICdXZWVrZGF5cycsIHR5cGU6ICdjb21wb3NlJywgbmV4dDogJ3dlZWtlbmQnIH1cbn07XG5leHBvcnQgY29uc3QgdGltZXpvbmVzID0ge1xuICAncHN0JzogeyBkaXNwbGF5OiAnUFNUJywgbG9uZ05hbWU6ICdQYWNpZmljIFN0YW5kYXJkIFRpbWUnLCB0aW1lOiAtOCB9LFxuICAncGR0JzogeyBkaXNwbGF5OiAnUERUJywgbG9uZ05hbWU6ICdQYWNpZmljIERheWxpZ2h0IFRpbWUnLCB0aW1lOiAtNyB9LFxuICAnbXN0JzogeyBkaXNwbGF5OiAnTVNUJywgbG9uZ05hbWU6ICdNb3VudGFpbiBTdGFuZGFyZCBUaW1lJywgdGltZTogLTcgfSxcbiAgJ21kdCc6IHsgZGlzcGxheTogJ01EVCcsIGxvbmdOYW1lOiAnTW91bnRhaW4gRGF5bGlnaHQgVGltZScsIHRpbWU6IC02IH0sXG4gICdjc3QnOiB7IGRpc3BsYXk6ICdDU1QnLCBsb25nTmFtZTogJ0NlbnRyYWwgU3RhbmRhcmQgVGltZScsIHRpbWU6IC02IH0sXG4gICdjZHQnOiB7IGRpc3BsYXk6ICdDRFQnLCBsb25nTmFtZTogJ0NlbnRyYWwgRGF5bGlnaHQgVGltZScsIHRpbWU6IC01IH0sXG4gICdlc3QnOiB7IGRpc3BsYXk6ICdFU1QnLCBsb25nTmFtZTogJ0Vhc3Rlcm4gU3RhbmRhcmQgVGltZScsIHRpbWU6IC01IH0sXG4gICdlZHQnOiB7IGRpc3BsYXk6ICdFRFQnLCBsb25nTmFtZTogJ0Vhc3Rlcm4gRGF5bGlnaHQgVGltZScsIHRpbWU6IC00IH1cbn07XG4vKmVzZm10LWlnbm9yZS1lbmQqL1xuXG5jb25zdCBkYXlzS2V5cyA9IGtleXMoIGRheXMgKTtcblxuLy8gIyMgRXhwYW5kIFNwZWNpYWwgS2V5c1xuLy8gR2l2ZW4gJ3dlZWtlbmQnIG9yICd3ZWVrZGF5JywgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiBhIGxpc3Qgb2YgdGhlXG4vLyByZWxldmFudCBlbnVtIGtleXMuIElmIGEgcmVndWxhciBrZXkgaXMgcHJvdmlkZWQsIHBhc3MgaXQgdGhyb3VnaC5cbmZ1bmN0aW9uIGV4cGFuZCggZGF5ICkge1xuICBzd2l0Y2ggKCBkYXkgKSB7XG4gIGNhc2UgJ3dlZWtlbmQnOlxuICBjYXNlICd3ZWVrZGF5JzpcbiAgICByZXR1cm4gXyggZGF5cyApLnBpY2tCeSggdmFsdWUgPT4gdmFsdWUudHlwZSA9PT0gZGF5ICkua2V5cygpO1xuICBkZWZhdWx0OlxuICAgIHJldHVybiBbIGRheSBdO1xuICB9XG59XG5cbi8vICMjIEdldCB0aGUgTmV4dCBEYXkgaW4gU2VxdWVuY2Vcbi8vIEdpdmVuIGEgZGF5IG9mIHRoZSB3ZWVrLCByZXR1cm4gdGhlIG5leHQgZGF5IGluIHNlcXVlbmNlLiBTYXR1cmRheSB3cmFwc1xuLy8gYXJvdW5kIHRvIFN1bmRheVxuZXhwb3J0IGZ1bmN0aW9uIG5leHREYXkoIGRheSApIHtcbiAgY29uc3QgbmV4dCA9IGRheXNbIGRheSBdLm5leHQ7XG4gIGlmICggbmV4dCApIHtcbiAgICByZXR1cm4gbmV4dDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyAjIyBEYXkga2V5IGZvciBUb2RheVxuLy8gUmV0dXJuIHRoZSBlbnVtIGtleSBmb3IgdG9kYXkuXG5mdW5jdGlvbiB0b2RheSgpIHtcbiAgY29uc3QgaWR4ID0gbmV3IERhdGUoKS5nZXREYXkoKTtcbiAgcmV0dXJuIGRheXNLZXlzWyBpZHggXTtcbn1cblxuLy8gIyMgRGF0ZXMgVXNlZCBhcyBUaW1lc1xuLy8gSWYgeW91IGhhdmUgYSBEYXRlIG9iamVjdCB3aGVyZSBvbmx5IHRoZSBISDpNTSBpbmZvcm1hdGlvbiBpcyByZWxldmFudCxcbi8vIGBub3JtYWxpemVgIHdpbGwgcmVzZXQgdGhlIGRhdGUgY29tcG9uZW50IHRvIEphbiAxLCAxOTcwIGFuZCBzaGF2ZSBvZmZcbi8vIGFueSBzZWNvbmRzIGFuZCBtaWxsaXNlY29uZHMuIChKYXZhc2NyaXB0IGRhdGVzIGFyZSAyMDM4IHNhZmUpXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKCBkYXRlICkge1xuICBjb25zdCBob3VycyA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgY29uc3QgbWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpO1xuXG4gIHJldHVybiBuZXcgRGF0ZSggMTk3MCwgMCwgMSwgaG91cnMsIG1pbnV0ZXMsIDAsIDAgKS50b0lTT1N0cmluZygpO1xufVxuXG4vLyAjIyBIb3VycyBTY2hlbWFcbi8vIEFuIGhvdXJzIGFycmF5IGNvbnRhaW5zIG9iamVjdHMgdGhhdCBzcGVjaWZ5IG9wZW5pbmcgYW5kIGNsb3NpbmcgdGltZXNcbi8vIGZvciBhIGRheS4gVGhlIGhvdXJzIGFycmF5IGNhbiBoYXZlIG11bHRpcGxlIGVudHJpZXMgZm9yIHRoZSBzYW1lIGRheS5cbi8vXG4vLyBUaGUgb3BlbmluZyBhbmQgY2xvc2luZyB0aW1lcyBtdXN0IGJlIHN0b3JlZCBhcyBJU08gY29tcGxpYW50IGRhdGUtdGltZVxuLy8gc3RyaW5ncyBpbiBadWx1IHRpbWUuXG4vL1xuLy8gYGBgXG4vLyBbIHtcbi8vICAgXCJtb25kYXlcIixcbi8vICAgXCJvcGVuc1wiOiBcIjE5NzAtMDEtMDFUMDg6MzA6MDAuMDAwWlwiLFxuLy8gICBcImNsb3Nlc1wiOiBcIjE5NzAtMDEtMDFUMTc6MzA6MDAuMDAwWlwiXG4vLyB9IF1cbi8vIGBgYFxuY29uc3QgaG91cnMgPSB7XG4gIHR5cGU6ICdhcnJheScsXG4gIGl0ZW1zOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGRheToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bToga2V5cyggZGF5cyApXG4gICAgICB9LFxuICAgICAgb3BlbnM6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgIH0sXG4gICAgICBjbG9zZXM6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGZvcm1hdDogJ2RhdGUtdGltZSdcbiAgICAgIH0sXG4gICAgICB0aW1lem9uZToge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bToga2V5cyggdGltZXpvbmVzIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8vICMjIFNjaGVkdWxlIFNjaGVtYVxuLy8gQSBzY2hlbWEgb2JqZWN0IGhhcyBzZWFzb24gbmFtZXMgZm9yIGtleXMgYW5kIGhvdXJzIGFycmF5cyBmb3IgdmFsdWVzLiBUaGVcbi8vIHNjaGVtYSBvYmplY3QgaGFzIGEgJ2RlZmF1bHQnIHNlYXNvbiBpbiBjYXNlIHdlIGRvbid0IGtub3cgc2Vhc29uLXNwZWNpZmljXG4vLyBob3VycyBmb3IgYSBzZXJ2aWNlLlxuLy9cbi8vIGBgYFxuLy8ge1xuLy8gICBcImRlZmF1bHRcIjogLi4uLFxuLy8gICBcIndpbnRlclwiOiAuLi5cbi8vIH1cbi8vIGBgYFxuY29uc3Qgc2NoZWR1bGUgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBzY2hlZHVsZToge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwYXR0ZXJuUHJvcGVydGllczoge1xuICAgICAgICAnLionOiBob3Vyc1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLy8gIyBTY2hlZHVsZSBNb2RlbFxuLy8gVGhlIHNjaGVkdWxlIG1vZGVsIHByb3ZpZGVzIGFuIGVhc3kgd2F5IHRvIHdvcmsgd2l0aCB0aGUgc2NoZWR1bGUgZGF0YVxuLy8gc3RydWN0dXJlLiBJdCBpcyBub3QgaW50ZW5kZWQgdG8gYmUgY29ubmVjdGVkIHRvIGEgZGF0YWJhc2UuIEl0IGlzIG1lYW50XG4vLyBvbmx5IHRvIG1hbmlwdWxhdGUgdGhlIHN0cnVjdHVyZSBiZXR3ZWVuIGRlc2VyaWFsaXphdGlvbiBhbmQgc2VyaWFsaXphdGlvblxuLy8gb2YgYSByZWR1eCBzdG9yZS5cbi8vXG4vLyBUaW1lcyBmb3IgZWFjaCBkYXkgYXJlIHN0b3JlZCBhcyBJU08tY29tcGxpYW50IHN0cmluZ3Mgbm9ybWFsaXplZCB0byBpZ25vcmVcbi8vIGFsbCBzZWN0aW9ucyBiZXNpZGVzIEhIOk1NICh0aGV5IGFwcGVhciBhcyAxOTcwJ3MgZGF0ZXMpLlxuZXhwb3J0IGNvbnN0IFNjaGVkdWxlID0gTW9kZWwuZXh0ZW5kKCB7XG4gIHNjaGVtYTogc2NoZWR1bGUsXG5cbiAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCBhdHRycywgb3B0aW9ucyApIHtcbiAgICBNb2RlbC5jYWxsKCB0aGlzLCB7IHNjaGVkdWxlOiBhdHRycyB8fCB7fSB9LCBvcHRpb25zICk7XG4gIH0sXG5cbiAgLy8gIyMgQWRkIEhvdXJzIHRvIFNlYXNvblxuICAvLyBBZGQgYW4gZW50cnkgdG8gdGhlIGhvdXJzIGFycmF5IGZvciBhIHNlYXNvbiwgYnkgZGVmYXVsdCB0aGUgJ2RlZmF1bHQnXG4gIC8vIHNlYXNvbi4gSWYgYSBzcGVjaWFsIGRheSBrZXkgaXMgcHJvdmlkZWQsIGV4cGFuZCBpdCB0byBhbiBhcnJheSBvZlxuICAvLyBkYXkga2V5cy5cbiAgYWRkSG91cnNJbjogZnVuY3Rpb24oIGRheSwgb3BlbnMsIGNsb3NlcywgdGltZXpvbmUsIG5hbWUgPSAnZGVmYXVsdCcgKSB7XG4gICAgY29uc3Qgc2NoZWR1bGUgPSB0aGlzLmdldCggJ3NjaGVkdWxlJyApO1xuICAgIGNvbnN0IGhvdXJzID0gZXhwYW5kKCBkYXkgKS5tYXAoIGRheSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXksXG4gICAgICAgIGNsb3Nlczogbm9ybWFsaXplKCBjbG9zZXMgKSxcbiAgICAgICAgb3BlbnM6IG5vcm1hbGl6ZSggb3BlbnMgKSxcbiAgICAgICAgdGltZXpvbmU6IHRpbWV6b25lXG4gICAgICB9O1xuICAgIH0gKTtcbiAgICBjb25zdCBzZWFzb24gPSBzY2hlZHVsZVsgbmFtZSBdIHx8IFtdO1xuICAgIHRoaXMuc2V0KCAnc2NoZWR1bGUnLCB7XG4gICAgICAuLi5zY2hlZHVsZSxcbiAgICAgIFsgbmFtZSBdOiBbIC4uLnNlYXNvbiwgLi4uaG91cnMgXVxuICAgIH0gKTtcbiAgfSxcblxuICAvLyAjIyBSZW1vdmUgSG91cnMgZnJvbSBhIFNlYXNvblxuICAvLyBEZWxldGUgYW4gZW50cnkgaW4gdGhlIGhvdXJzIGFyYXJ5IGZvciBhIHNlYXNvbiwgYnkgZGVmYXVsdCB0aGUgJ2RlZmF1bHQnXG4gIC8vIHNlYXNvbi4gRW50cmllcyBhcmUgZGVsZXRlZCBieSBpbmRleCBpbiB0aGUgaG91cnMgYXJyYXkuXG4gIGRlbEhvdXJzSW46IGZ1bmN0aW9uKCBpZHgsIG5hbWUgPSAnZGVmYXVsdCcgKSB7XG4gICAgY29uc3Qgc2NoZWR1bGUgPSB0aGlzLmdldCggJ3NjaGVkdWxlJyApO1xuICAgIGNvbnN0IHNlYXNvbiA9IHNjaGVkdWxlWyBuYW1lIF0gfHwgW107XG5cbiAgICBzZWFzb24uc3BsaWNlKCBpZHgsIDEgKTtcblxuICAgIHRoaXMuc2V0KCAnc2NoZWR1bGUnLCB7XG4gICAgICAuLi5zY2hlZHVsZSxcbiAgICAgIFsgbmFtZSBdOiBzZWFzb25cbiAgICB9ICk7XG4gIH0sXG5cbiAgLy8gR2V0IHRoZSBjbG9zaW5nLXRpbWUgSVNPIHN0cmluZyBmb3IgdG9kYXkuXG4gIGdldENsb3NpbmdUb2RheSgpIHtcbiAgICBjb25zdCBzZWFzb24gPSB0aGlzLmdldCggJ3NjaGVkdWxlJyApLmRlZmF1bHQ7XG4gICAgY29uc3QgaG91cnMgPSBmaW5kKCBzZWFzb24sIHsgZGF5OiB0b2RheSgpIH0gKTtcblxuICAgIHJldHVybiBob3VycyA/IGhvdXJzLmNsb3NlcyA6IG51bGw7XG4gIH0sXG5cbiAgLy8gUmV0dXJucyBhIGJvb2xlYW4gYmFzZWQgb24gaWYgYW55IGRheXMgaGF2ZSBob3Vycy5cbiAgaGFzQW55SG91cnNBZGRlZCgpIHtcbiAgICBjb25zdCBzZWFzb24gPSB0aGlzLmdldCggJ3NjaGVkdWxlJyApLmRlZmF1bHQ7XG5cbiAgICBpZiAoc2Vhc29uLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59ICk7XG5cbm1peGluVmFsaWRhdGlvbiggU2NoZWR1bGUgKTtcbiJdfQ==