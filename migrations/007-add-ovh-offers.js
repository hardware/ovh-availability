var pg    = require('pg');
var async = require('async');
var map   = require('../map.json');

process.env.DATABASE_URL = process.env.DATABASE_URL || "tcp://localhost:5432/ovh-availability"

exports.up = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {
        async.series([

            function( callback ) {
                client.query("ALTER TYPE servers_type ADD VALUE 'ovh'", function( err, result ) {
                    callback();
                });
            },

            function( callback ) {

                async.each(map.offers, function( offer, nextOffer ) {

                    client.query("INSERT INTO servers (type, name, reference) VALUES ($1, $2, $3)",
                        [offer.type, offer.name, offer.ref], function( err, result ) {
                        nextOffer();
                    });

                }, callback);

            }

        ], function( err, results ) {

            if( ! err ) next();

        });
    });

};

exports.down = function( next ) {

    next();

};
