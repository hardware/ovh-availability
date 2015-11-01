var pg    = require('pg');
var async = require('async');

process.env.DATABASE_URL = process.env.DATABASE_URL || "tcp://localhost:5432/ovh-availability"

exports.up = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {
      client.query('ALTER TABLE requests ADD COLUMN pushbullet_email character varying(255)', function( err, result ) {
          next();
      });
    });

};

exports.down = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {
      client.query('ALTER TABLE requests DROP COLUMN pushbullet_email', function( err, result ) {
          next();
      });
    });

};
