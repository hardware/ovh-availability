var async        = require('async');
var request      = require('request');
var mailer       = require('./mailer');
var requestModel = require('../models/requests');

/*
 *  Traitement de l'ensemble des demandes en attentes
 *  Route : /cron/handleRequests/:secureKey
 *  Methode : GET
 */
exports.handleRequests = function( req, res, next ) {

    checkSecureKey(req, res, req.params.secureKey, function() {
        requestModel.getPendingRequests(next, function( pendingRequests ) {
            request(process.env.OVH_API_URL, function( error, response, body ) {

                if( ! error && response.statusCode == 200 ) {

                    var data = JSON.parse( body );

                    async.each(pendingRequests, function( request, nextRequest ) {
                        async.each(data.answer.availability, function( offer, nextOffer ) {

                            if( offer.reference == request.reference ) {

                                var availableZones = 0

                                async.each(offer.zones, function( zone, nextZone ) {

                                    if( zone.availability != 'unknown' && zone.availability != 'unavailable' )
                                        availableZones++;

                                    nextZone();

                                }, function( err ) {

                                    if( err ) { next( err ); return; }

                                    if( availableZones > 0 )
                                        inform( request, next );

                                });

                            }

                            nextOffer();

                        }, function( err ) {

                            if( err ) { next( err ); return; }

                            nextRequest();

                        });

                    }, function( err ) {

                        if( err ) { next( err ); return; }

                        res.send('PROCESSING REQUESTS COMPLETED !');

                    });

                }

            });
        });
    });

};

/*
 *  Permet d'informer l'utilisateur par mail de la disponibilité d'un offre d'OVH
 */
var inform = function( request, next ) {

    var orderUrl = ''

    switch( request.type ) {
        case 'sys':
            orderUrl = 'https://eu.soyoustart.com/fr/commande/soYouStart.xml?reference=' + request.reference
            break;
        case 'kimsufi':
            orderUrl = 'https://www.kimsufi.com/fr/commande/kimsufi.xml?reference=' + request.reference
            break;
    }

    var payload = {
        to:request.mail,
        from:'nepasrepondre@ovh-availability',
        subject:'[ovh-availability] Votre serveur est disponible ( ' + request.name + ' )',
        html:"<p>Bonjour,</p> \
              <p>Le serveur " + request.name + " est disponible.</p> \
              <p>Pour le réserver, cliquez sur le lien ci-dessous :</p> \
              <a href='" + orderUrl + "'>Commander</a> \
              <p>Si vous avez raté l'offre, vous pouvez toujours refaire une demande via :</p> \
              <a href='" + process.env.APP_URL + "'>" + process.env.APP_URL + "</a> \
              <p>A très bientôt sur ovh-availability</p>"
    };

    mailer.send( payload, next );

    // Mise à jour de l'état de la demande ( pending -> done )
    requestModel.updateState( request.id, next );

}

/*
 *  Vérification de la clé sécurisée
 */
var checkSecureKey = function( req, res, secureKey, callback ) {

    if( secureKey === process.env.CRON_KEY )
        callback();
    else
        res.send('invalid secure key ! :(');

}

/*
     ####### Heroku scheduler #######

           COMMAND             FREQUENCY
--------------------------------------------
| cron --task handleRequests | every 10min |
--------------------------------------------

Note :
 - pour la commande cron voir le fichier bin/cron
 - pour paramétrer le scheduler : heroku addons:open scheduler

*/
