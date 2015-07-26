var S            = require('string');
var async        = require('async');
var ovh          = require('./ovhApi');
var mailer       = require('./mailer');
var pushbullet   = require('./pushbulletApi.js');
var newrelic     = require('./newrelicApi.js');
var requestModel = require('../models/requests');
var serverModel  = require('../models/servers');

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
                    inform( req, res, request, next );
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
                    newrelic.submitEvents( newRelicEvents, next );

                res.send('PROCESSING REQUESTS COMPLETED !');

            });

        });

    });
    });
    });

};

/*
 *  Vérification de l'évolution des offres OVH
 *  Route : /cron/checkOffers/:secureKey
 *  Methode : GET
 */
exports.checkOffers = function( req, res, next ) {
  
    checkSecureKey(req, res, req.params.secureKey, function() {
        ovh.getJson(next, function( json ) {
            serverModel.getAllRefs(next, function( appRefsList ) {
                
                var ovhRefsList = [];
                
                async.each(json.answer.availability, function( offer, nextOffer ) {
                
                    ovhRefsList.push( offer.reference );
                    nextOffer();
                
                }, function() {
                
                    async.each(appRefsList, function( ref, nextRef ) {
                    
                        if( ovhRefsList.indexOf( ref ) === -1 ) {
                          
                            mailer.send({
                                
                                to:process.env.ADMIN_EMAIL,
                                from:'no-reply@availability.ovh',
                                subject:"L'offre " + ref + " n'est plus disponible",
                                html:"Attention l'offre " + ref + " n'est plus proposée par OVH, merci de la supprimer de la base de données"
                                
                            }, next);
                            
                        }
                        
                        nextRef();
                    
                    }, function( err ) {
                        
                        res.json({ result:'processing offers completed', error:null });
                        
                    });
                
                });
            });
        });
    });

};

/*
 *  Permet d'informer l'utilisateur par mail et par Pushbullet de la disponibilité d'une offre d'OVH
 */
var inform = function( req, res, request, next ) {

    if(request.language == 'fr') {

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

    } else {

        switch( request.type ) {
            case 'sys':
                orderUrl = 'https://www.soyoustart.com/';
                break;
            case 'kimsufi':
                orderUrl = 'https://www.kimsufi.com/';
                break;
        }

    }

    var payload = {
        to:request.mail,
        from:'no-reply@availability.ovh',
        subject:'[ovh-availability] ' + req.__({phrase: 'MAIL_P0', locale:request.language}) + ' ( ' + request.name + ' )',
        html:"<p>" + req.__({phrase: 'MAIL_P1', locale:request.language}) + ",</p> \
              <p>" + req.__({phrase: 'The server %s is available', locale:request.language}, request.name) +".</p> \
              <p>" + req.__({phrase: 'MAIL_P2', locale:request.language}) + " :</p> \
              <a href='" + orderUrl + "'>" + req.__({phrase: 'MAIL_P3', locale:request.language}) + "</a> \
              <p>" + req.__({phrase: 'MAIL_P4', locale:request.language}) + " :</p> \
              <a href='" + process.env.APP_URL + "request/reactivate/" + request.id + "/" + request.token + "'>" + req.__({phrase: 'MAIL_P5', locale:request.language}) + "</a> \
              <p>OVH-Availability</p>"
    };

    // Envoi du mail de notification
    mailer.send( payload, next );

    // if( request.phone )
    // Envoi du sms de notification
    // ovh.sendSms( res, request.name, request.phone, next );

    if( request.pushbullet_token )
        // Envoi de la notification à Pushbullet
        pushbullet.sendNotification( req, request, orderUrl, next );

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
| cron --task checkOffers    |    daily   |
--------------------------------------------

Note :
 - pour la commande cron voir le fichier bin/cron
 - pour paramétrer le scheduler : heroku addons:open scheduler

*/
