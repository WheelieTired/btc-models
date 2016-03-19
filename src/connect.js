import { sync } from 'backbone-pouch';

// # Connect Function
// Given a PouchDB databse object and a backbone class, connect that class
// to the database with backbone-pouch. This function extends the backbone
// model or collection first, so we don't modify `klass`.
//
// In order for this to be useful, the backbone model or collection class must
// specify a [`pouch` object](https://github.com/jo/backbone-pouch).
export function connect( database, klass ) {
  return klass.extend( {
    connect: connect,
    database: database,
    sync: sync( { db: database } )
  } );
}
