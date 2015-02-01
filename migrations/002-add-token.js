var pg    = require('pg');
var async = require('async');

process.env.DATABASE_URL = process.env.DATABASE_URL || "tcp://localhost:5432/ovh-availability"

exports.up = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {
        async.series([

            function( callback ) {
                client.query('ALTER TABLE requests ADD COLUMN token character varying(255)', function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query('ALTER TABLE requests ALTER COLUMN token SET NOT NULL', function( err, result ) {
                    callback();
                });
            }

        ], function( err, results ) {

            if( ! err ) next();

        });
    });

};

exports.down = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {

        client.query('ALTER TABLE requests DROP COLUMN token', function( err, result ) {
            next();
        });

    });

};
