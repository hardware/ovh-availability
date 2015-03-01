var S            = require('string');
var async        = require('async');
var request      = require('request');
var ovh          = require('./ovhApi');
var mailer       = require('./mailer');
var pushbullet   = require('./pushbulletApi.js');
var newrelic     = require('./newrelicApi.js');
var requestModel = require('../models/requests');

/*
 *  Traitement de l'ensemble des demandes en attente
 *  Route : /cron/handleRequests/:secureKey
 *  Methode : GET
 */
exports.handleRequests = function( req, res, next ) {

    checkSecureKey(req, res, req.params.secureKey, function() {

    var mailNotificationCounter = 0;
    var pushNotificationCounter = 0;

    requestModel.getPendingRequests(next, function( pendingRequests ) {
    ovh.getJson(next, function( json ) {

        var availableOffers = [];

        async.each(pendingRequests, function( request, nextRequest ) {
            ovh.checkOffer(json, request.reference, request.zone, next, function( available ) {

                if( available ) {

                    switch( request.zone ) {
                        case 'canada':
                            zone = "Canada";
                            break;
                        default:
                            zone = "Europe";
                    }

                    var offer = {
                        hash:hash( request.name + zone ),
                        offer:request.name,
                        zone:zone
                    };

                    availableOffers.push( offer );
                    inform( res, request, next );
                    mailNotificationCounter++;

                    if( request.pushbullet_token )
                        pushNotificationCounter++;

                }

                nextRequest();

            });

        }, function( err ) {

            var arr = {};

            for( var i = 0; i < availableOffers.length; i++ )
                arr[availableOffers[i].hash] = availableOffers[i];

            availableOffers = [];

            for( var key in arr )
                availableOffers.push( arr[key] );

            var newRelicEvents = [];

            async.each(availableOffers, function( availableOffer, nextOffer ) {

                var eventAvailableOffersObject = {
                    "eventType":"availableOffers",
                    "offer":availableOffer.offer,
                    "zone":availableOffer.zone
                };

                newRelicEvents.push( eventAvailableOffersObject );
                nextOffer();

            }, function( err ) {

                if( mailNotificationCounter > 0 ) {

                    var eventMailNotificationObject = {
                        "eventType":"mailNotifications",
                        "mailCounter":mailNotificationCounter,
                    };

                    newRelicEvents.push( eventMailNotificationObject );

                }

                if( pushNotificationCounter > 0 ) {

                    var eventPushNotificationObject = {
                        "eventType":"pushNotifications",
                        "pushCounter":pushNotificationCounter,
                    };

                    newRelicEvents.push( eventPushNotificationObject );

                }

                if( newRelicEvents.length > 0 )
                    // Envoi des évènement à l'API de NewRelic Insights
                    newrelic.submitEvents( newRelicEvents );

                res.send('PROCESSING REQUESTS COMPLETED !');

            });

        });

    });
    });
    });

};

/*
 *  Permet d'informer l'utilisateur par mail et par Pushbullet de la disponibilité d'une offre d'OVH
 */
var inform = function( res, request, next ) {

    var orderUrl = ''

    switch( request.type ) {
        case 'sys':
            if( S( request.reference ).contains('game') )
                orderUrl = 'https://eu.soyoustart.com/fr/cgi-bin/newOrder/order.cgi?hard=' + request.reference
            else
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

    // if( request.phone )
    // Envoi du sms de notification
    // ovh.sendSms( res, request.name, request.phone, next );

    if( request.pushbullet_token )
        // Envoi de la notification à Pushbullet
        pushbullet.sendNotification( request.pushbullet_token, request.name, orderUrl );

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

var makeCRCTable = function() {

    var c;
    var crcTable = [];

    for (var n = 0; n < 256; n++) {

        c = n;

        for (var k = 0; k < 8; k++)
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));

        crcTable[n] = c;

    }

    return crcTable;

}

var crcTable = makeCRCTable();

var hash = function( str ) {

    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++)
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];

    return (crc ^ (-1)) >>> 0;

}

/*
     ####### Heroku scheduler #######

           COMMAND             FREQUENCY
--------------------------------------------
| cron --task handleRequests | every 1min |
--------------------------------------------

Note :
 - pour la commande cron voir le fichier bin/cron
 - pour paramétrer le scheduler : heroku addons:open scheduler

*/
