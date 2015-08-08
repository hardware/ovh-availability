var request = require('request');

/*
 *  Permet d'envoyer de nouveaux évènements à l'API de NewRelic
 */
exports.submitEvents = function( events, next ) {

    request({

        uri:'https://insights-collector.newrelic.com/v1/accounts/' + process.env.NEW_RELIC_ACCOUNT + '/events',
        method:'POST',
        headers: {
            'X-Insert-Key': process.env.NEW_RELIC_API_KEY,
            'Content-Type': 'application/json'
        },
        json:true,
        body:events

    }, function( err, response, body ) {

        if( err || response.statusCode != 200 ) {
            console.log("NEWRELIC API - Submitting events failed");
            return;
        }

    });

};
