var async   = require('async');
var request = require('request');

var ovh = require('ovh')({

    appKey:process.env.OVH_APP_KEY,
    appSecret:process.env.OVH_APP_SEC,
    consumerKey:process.env.OVH_CON_KEY

});

/*
 *  Récupère le nom du service de SMS et le stock localement
 */
exports.init = function( req, res, next, callback ) {

    ovh.request('GET', '/sms/', function( err, serviceName ) {

        if( err ) {
            next( new Error("OVH API Error : " + err) );
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
exports.getJson = function( next, callback ) {

    request(process.env.OVH_API_URL, function( err, response, body ) {

        if( err || response.statusCode != 200 ) {
            next( new Error("OVH API - Request failed") );
            return;
        }

        var json = JSON.parse( body );
        callback( json );

    });

};

/*
 *  Permet de vérifier si une offre est disponible
 */
exports.checkOffer = function( json, ref, groupZone, next, callback ) {

    async.each(json.answer.availability, function( offer, nextOffer ) {

        if( offer.reference == ref ) {

            var availableZones = 0;

            async.each(offer.zones, function( zone, nextZone ) {

                if( zone.availability != 'unknown' && zone.availability != 'unavailable' )

                    switch( groupZone ) {
                        case 'europe':
                            if( zone.zone == 'gra' || zone.zone == 'sbg' || zone.zone == 'rbx' )
                                availableZones++;
                            break;
                        case 'canada':
                            if( zone.zone == 'bhs' )
                                availableZones++;
                            break;
                        // Tous les datacenters
                        default:
                            availableZones++;
                            break;
                    }

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
            next( new Error("SMS sending error : " + err) );
            return;
        }

        // Si des numéros sont invalides même après validation de l'app, on log
        // Raison possible : numéro non pris en charge par l'api d'OVH
        if( result.invalidReceivers.length > 0 ) console.log("Invalid receivers : " + result.invalidReceivers);

    });

};
