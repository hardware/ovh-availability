var pg    = require('pg');
var async = require('async');

process.env.DATABASE_URL = process.env.DATABASE_URL || "tcp://localhost:5432/ovh-availability"

exports.up = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {
        async.series([

            function( callback ) {
                client.query("CREATE TYPE public.zones AS ENUM ('europe','canada','all')", function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query('ALTER TABLE requests ADD COLUMN zone public.zones', function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query("UPDATE requests SET zone = 'all'", function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query('ALTER TABLE requests ALTER COLUMN zone SET NOT NULL', function( err, result ) {
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

        async.series([

            function( callback ) {
                client.query('ALTER TABLE requests DROP COLUMN zone', function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query("DROP TYPE zones", function( err, result ) {
                    callback();
                });
            }

        ], function( err, results ) {

            if( ! err ) next();

        });

    });

};
