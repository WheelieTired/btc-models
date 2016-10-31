import { mixinValidation } from './validation-mixin';

import { Model } from 'backbone';
import _, { keys, find } from 'lodash';

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
export const days = {
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
export const timezones = {
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

const daysKeys = keys( days );

// ## Expand Special Keys
// Given 'weekend' or 'weekday', this function will return a list of the
// relevant enum keys. If a regular key is provided, pass it through.
function expand( day ) {
  switch ( day ) {
  case 'weekend':
  case 'weekday':
    return _( days ).pickBy( value => value.type === day ).keys();
  default:
    return [ day ];
  }
}

// ## Get the Next Day in Sequence
// Given a day of the week, return the next day in sequence. Saturday wraps
// around to Sunday
export function nextDay( day ) {
  const next = days[ day ].next;
  if ( next ) {
    return next;
  } else {
    return null;
  }
}

// ## Day key for Today
// Return the enum key for today.
function today() {
  const idx = new Date().getDay();
  return daysKeys[ idx ];
}

// ## Dates Used as Times
// If you have a Date object where only the HH:MM information is relevant,
// `normalize` will reset the date component to Jan 1, 1970 and shave off
// any seconds and milliseconds. (Javascript dates are 2038 safe)
export function normalize( date ) {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return new Date( 1970, 0, 1, hours, minutes, 0, 0 ).toISOString();
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
const hours = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      day: {
        type: 'string',
        enum: keys( days )
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
        enum: keys( timezones )
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
const schedule = {
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
export const Schedule = Model.extend( {
  schema: schedule,

  constructor: function( attrs, options ) {
    Model.call( this, { schedule: attrs || {} }, options );
  },

  // ## Add Hours to Season
  // Add an entry to the hours array for a season, by default the 'default'
  // season. If a special day key is provided, expand it to an array of
  // day keys.
  addHoursIn: function( day, opens, closes, timezone, name = 'default' ) {
    const schedule = this.get( 'schedule' );
    const hours = expand( day ).map( day => {
      return {
        day,
        closes: normalize( closes ),
        opens: normalize( opens ),
        timezone: timezone
      };
    } );
    const season = schedule[ name ] || [];
    this.set( 'schedule', {
      ...schedule,
      [ name ]: [ ...season, ...hours ]
    } );
  },

  // ## Remove Hours from a Season
  // Delete an entry in the hours arary for a season, by default the 'default'
  // season. Entries are deleted by index in the hours array.
  delHoursIn: function( idx, name = 'default' ) {
    const schedule = this.get( 'schedule' );
    const season = schedule[ name ] || [];

    season.splice( idx, 1 );

    this.set( 'schedule', {
      ...schedule,
      [ name ]: season
    } );
  },

  // Get the closing-time ISO string for today.
  getClosingToday() {
    const season = this.get( 'schedule' ).default;
    const hours = find( season, { day: today() } );

    return hours ? hours.closes : null;
  },

  // Returns a boolean based on if any days have hours.
  hasAnyHoursAdded() {
    const season = this.get( 'schedule' ).default;

    if (season.length > 0) {
      return true;
    } else {
      return false;
    }
  }
} );

mixinValidation( Schedule );
