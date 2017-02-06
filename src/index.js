export { connect, connectMut } from './connect';
export { serviceTypes, alertTypes, display } from './model/point';

export { Schedule, days, nextDay, timezones } from './model/hours';

export { User, UserCollection, UserRef, UserRefCollection, Login, Forgot, Reset } from './model/user';
export { Point, Service, Alert, PointCollection } from './model/point';

import { Point, Service, Alert, PointCollection } from './model/point';

/*esfmt-ignore-start*/
export const pointModels = [
  Point,
  Service,
  Alert,
  PointCollection
];

/*esfmt-ignore-end*/

import { connectMut } from './connect';
export function connectPointModels( database ) {
  connectMut( database, pointModels );
}
