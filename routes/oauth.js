var request    = require('request');
var data       = require('./data');
var pushbullet = require('./pushbulletApi.js');

/*
 *  INDEX
 *  Route : /oauth/pushbullet
 *  Methode : GET
 */
exports.pushbullet = function( req, res, next ) {

    data.settings(req, res, { shouldBeLogged:false, mayBeLogged:true }, function( settings ) {

        if( req.query.error ) {
            next( new Error("Pushbullet OAUTH Error : " + req.query.error) );
            return;
        }

        if( ! req.query.code ) {
            next( new Error("Missing OAUTH code.") );
            return;
        }

        pushbullet.auth(req.query.code, next, function( token ) {
            pushbullet.getUserIdentity(token, next, function( user ) {

                req.session.pushbullet = {
                    email:user.email,
                    token:token
                }

                res.redirect('/');

            });
        });

    });

};
