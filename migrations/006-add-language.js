var pg    = require('pg');
var async = require('async');

process.env.DATABASE_URL = process.env.DATABASE_URL || "tcp://localhost:5432/ovh-availability"

exports.up = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {
        async.series([

            function( callback ) {
                client.query("CREATE TYPE public.languages AS ENUM ('fr','en')", function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query('ALTER TABLE requests ADD COLUMN language public.languages', function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query("UPDATE requests SET language = 'fr'", function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query('ALTER TABLE requests ALTER COLUMN language SET NOT NULL', function( err, result ) {
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
                client.query('ALTER TABLE requests DROP COLUMN language', function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query("DROP TYPE languages", function( err, result ) {
                    callback();
                });
            }

        ], function( err, results ) {

            if( ! err ) next();

        });

    });

};
