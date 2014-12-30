var async        = require('async');
var request      = require('request');
var api          = require('./ovhApi');
var mailer       = require('./mailer');
var requestModel = require('../models/requests');

/*
 *  Traitement de l'ensemble des demandes en attente
 *  Route : /cron/handleRequests/:secureKey
 *  Methode : GET
 */
exports.handleRequests = function( req, res, next ) {

    checkSecureKey(req, res, req.params.secureKey, function() {
        requestModel.getPendingRequests(next, function( pendingRequests ) {
            api.getJson(function( json ) {

                async.each(pendingRequests, function( request, nextRequest ) {
                    api.checkOffer(json, request.reference, next, function( available ) {

                        if( available )
                            inform( res, request, next );

                        nextRequest();

                    });

                }, function( err ) {

                    if( err ) { next( err ); return; }

                    res.send('PROCESSING REQUESTS COMPLETED !');

                });

            });
        });
    });

};

/*
 *  Permet d'informer l'utilisateur par mail et par SMS de la disponibilité d'une offre d'OVH
 */
var inform = function( res, request, next ) {

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
        from:'nepasrepondre@availability.ovh',
        subject:'[ovh-availability] Votre serveur est disponible ( ' + request.name + ' )',
        html:"<p>Bonjour,</p> \
              <p>Le serveur " + request.name + " est disponible.</p> \
              <p>Pour le réserver, cliquez sur le lien ci-dessous :</p> \
              <a href='" + orderUrl + "'>Commander</a> \
              <p>Si vous avez raté l'offre, vous pouvez toujours réactiver votre demande en cliquant sur ce lien :</p> \
              <a href='" + process.env.APP_URL + "request/reactivate/" + request.token + "'>Réactiver ma demande</a> \
              <p>A très bientôt sur ovh-availability</p>"
    };

    // Envoi du mail de notification
    mailer.send( payload, next );

    if( request.phone )
        // Envoi du sms de notification
        api.sendSms( res, request.name, request.phone, next );

    // Mise à jour de l'état de la demande ( pending -> done )
    requestModel.updateState( 'done', request.id, next );

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
