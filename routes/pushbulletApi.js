var request = require('request');

/*
 *  Récupère un token d'authentification de type Bearer
 */
exports.auth = function( code, next, callback ) {

    request({

        uri:'https://api.pushbullet.com/oauth2/token',
        method:'POST',
        form:{
            grant_type:'authorization_code',
            client_id:process.env.PUSHBULLET_PUBLIC_KEY,
            client_secret:process.env.PUSHBULLET_SECRET_KEY,
            code:code
        }

    }, function( err, response, body ) {

        if( err || response.statusCode != 200 ) {
            next( new Error("PUSHBULLET API - OAUTH Request failed : " + body.error.message) );
            return;
        }

        var json = JSON.parse( body );
        callback( json.access_token );

    });

};

/*
 *  Récupère l'adresse mail de l'utilisateur
 */
exports.getUserIdentity = function( token, next, callback ) {

    callApi('https://api.pushbullet.com/v2/users/me', 'GET', token, null, next, callback);

};

/*
 *  Envoi une notification à Pushbullet
 */
exports.sendNotification = function( token, offer, orderUrl ) {

    request({

        uri:'https://api.pushbullet.com/v2/pushes',
        method:'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        json:true,
        body:{
            type:'link',
            title:"Offre disponible",
            body:"L'offre " + offer + " est disponible, vous pouvez commander dès maintenant.",
            url:orderUrl
        }

    }, function( err, response, body ) {

        if( err || response.statusCode != 200 ) {
            console.log("PUSHBULLET API - Request failed : " + body.error.message );
        }

    });

};

/*
 *  Envoi une requête POST vers l'API de Pushbullet
 *
 *  Ajoute dans chaque requête un header nommé 'Authorization'
 *  de type Bearer contenant le <token> d'authentification
 */
var callApi = function( url, method, token, params, next, callback ) {

    request({

        uri:url,
        method:method,
        headers: { 'Authorization': 'Bearer ' + token },
        form: ( params ) ? params : {}

    }, function( err, response, body ) {

        if( err || response.statusCode != 200 ) {
            next( new Error("PUSHBULLET API - Request failed : " + body.error.message) );
            return;
        }

        var json = JSON.parse( body );
        callback( json );

    });

};
