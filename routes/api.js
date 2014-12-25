var async   = require('async');
var request = require('request');

/*
 *  Permet de récupérer les données de l'API d'OVH au format JSON
 */
exports.getJson = function( callback ) {

    request(process.env.OVH_API_URL, function( error, response, body ) {

        if( ! error && response.statusCode == 200 ) {

            var json = JSON.parse( body );
            callback( json );

        }

    });

};

/*
 *  Permet de vérifier si une offre est disponible
 */
exports.checkOffer = function( json, ref, next, callback ) {

    async.each(json.answer.availability, function( offer, nextOffer ) {

        if( offer.reference == ref ) {

            var availableZones = 0;

            async.each(offer.zones, function( zone, nextZone ) {

                if( zone.availability != 'unknown' && zone.availability != 'unavailable' )
                    availableZones++;

                nextZone();

            }, function( err ) {

                if( err ) { next( err ); return; }

                if( availableZones > 0 )
                    callback( true );
                else
                    callback( false );

            });

        }

        nextOffer();

    });

};
