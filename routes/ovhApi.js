var async   = require('async');
var request = require('request');

var ovh = require('ovh')({

    appKey:process.env.OVH_APP_KEY,
    appSecret:process.env.OVH_APP_SEC,
    consumerKey:process.env.OVH_CON_KEY

});

/* Récupère le nom du service de SMS et le stock localement */
exports.init = function( req, res, next, callback ) {

    ovh.request('GET', '/sms/', function( err, serviceName ) {

        if( err ) {

            next( "OVH API Error : " + err );
            return;

        }

        res.locals.sms = {
            serviceName:serviceName
        }

        callback();

    });

};

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

exports.sendSms = function( res, offer, phone, next ) {

    ovh.request('POST', '/sms/' + res.locals.sms.serviceName + '/jobs/', {

        message:"L'offre " + offer + " est disponible, vous pouvez commander dès maintenant.",
        senderForResponse:true,
        noStopClause:true,
        receivers:[phone]

    }, function( err, result ) {

        if( err ) {

            next( "SMS send error : " + err );
            return;
        }

    });

};
