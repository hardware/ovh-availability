var pg    = require('pg');
var async = require('async');
var error = require('../routes/errorHandler');

/*
 *  Permet de récupérer l'ensemble des offres d'OVH par gamme ( ovh/sys/kimsufi )
 */
exports.getServers = function( type, next, callback ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {
        client.query("SELECT * FROM public.servers WHERE type = $1", [ type ], function( err, result ) {

            if( error.handler( err, client, done, next ) ) return;
            done();

            callback( result.rows );

        });
    });

};

/*
 *  Permet de récupérer l'ensemble des références des serveurs d'OVH
 */
exports.getAllRefs = function( next, callback ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {
        client.query("SELECT reference FROM public.servers", function( err, result ) {

            if( error.handler( err, client, done, next ) ) return;
            done();

            var refsList = [];

            async.each(result.rows, function( row, nextRow ) {

                refsList.push( row.reference );
                nextRow();

            }, function( err ) {

                if( err ) {
                    next( err );
                    return;
                }

                callback( refsList );

            });

        });
    });

};

