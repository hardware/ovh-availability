var async        = require('async');
var crypto       = require('crypto');
var countries    = require('country-data').countries;
var phone        = require('phone');
var data         = require('./data');
var ovh          = require('./ovhApi');
var recaptcha    = require('./recaptcha');
var newrelic     = require('./newrelicApi');
var serversModel = require('../models/servers');
var requestModel = require('../models/requests');

/*
 *  INDEX
 *  Route : /
 *  Methode : GET
 */
exports.index = function( req, res, next ) {

    data.settings(req, res, { shouldBeLogged:false, mayBeLogged:true }, function( settings ) {
        loadResources({ refs:false }, next, function( ressources ) {

            settings.formErrors     = {};
            settings.sysServersList = ressources.sysServersList;
            settings.kimServersList = ressources.kimServersList;
            settings.stats          = ressources.stats;
            settings.countries      = countries.all;
            settings.pushbullet     = ( req.session.pushbullet.token ) ? true : false;
            settings.values         = {
                mail: ( settings.pushbullet ) ? req.session.pushbullet.email : null
            };

            res.render('index', settings);

        });
    });

};

/*
 *  INDEX
 *  Route : /
 *  Methode : POST
 */
exports.run = function( req, res, next ) {

    data.settings(req, res, { shouldBeLogged:false, mayBeLogged:true }, function( settings ) {
        loadResources({ refs:true }, next, function( ressources ) {

            var invalid  = res.__('RUN_InvalidField');
            var required = res.__('RUN_RequiredField');

            // Validation des valeurs contenues dans req.body
            req.checkBody('mail', invalid).isEmail().len(5, 100);
            req.checkBody('mail', required).notEmpty();
            req.checkBody('zone', invalid).isIn(['europe', 'canada', 'all']);
            req.checkBody('zone', required).notEmpty();
            req.checkBody('server', invalid).isIn( ressources.refsList );
            req.checkBody('server', required).notEmpty();

            if( req.body.phone )
                req.checkBody('country', required).notEmpty();

            if( req.body.country )
                req.checkBody('phone', required).notEmpty();

            var errors = req.validationErrors( true );

            async.waterfall([

                // Vérification du formulaire
                function( callback ) {

                    if( errors )
                        callback( res.__('RUN_InvalidPostData') );
                    else
                        callback();

                },

                // Validation du numéro de téléphone
                function( callback ) {

                    if( req.body.phone ) {

                        var phoneNumber = phone( req.body.phone, req.body.country )[0];

                        if( ! phoneNumber ) {

                            callback( res.__('RUN_InvalidPhoneNumber') );

                        } else {

                            // Numéro de téléphone mobile au format international
                            // Norme : UIT-T E.164 (11/2010)
                            // Préfixe international + indicatif pays + numéro national significatif
                            // Exemple (france) : 003361601XXXX
                            req.session.phone = "00" + String( phoneNumber ).substring(1);
                            callback();

                        }

                    } else {

                        callback();

                    }

                },

                // Vérification du captcha
                function( callback ) {

                    recaptcha.verify(req, req.body["g-recaptcha-response"], next, function( result ) {

                        if( ! result )
                            callback( res.__('RUN_Captcha') );
                        else
                            callback();

                    });

                },

                // Vérification de l'unicité de la demande
                function( callback ) {

                    requestModel.unique({ ref:(req.body.server).toLowerCase(), mail:(req.body.mail).toLowerCase() }, next, function( unique ) {

                        if( ! unique )
                            callback( res.__('RUN_WaitNotification') );
                        else
                            callback();

                    });

                },

                // Vérification de la disponibilité de l'offre
                function( callback ) {

                    ovh.getJson(next, function( json ) {
                        ovh.checkOffer(json, req.body.server, req.body.zone, next, function( available ) {

                            if( available )
                                callback( res.__('RUN_AlreadyAvailable') );
                            else
                                callback();

                        });
                    });

                },

                // Ajout de la demande au sein de la base de données
                function( callback ) {

                    crypto.randomBytes(24, function( ex, buffer ) {

                        var data = {
                            reference:req.body.server,
                            mail:req.body.mail,
                            token:buffer.toString('hex'),
                            phone: ( req.session.phone ) ? req.session.phone : null,
                            pushbulletToken: ( req.session.pushbullet.token ) ? req.session.pushbullet.token : null,
                            zone:req.body.zone,
                            language:req.getLocale()
                        };

                        requestModel.add(data, next, function( result ) {

                            if( req.session.phone ) delete req.session.phone;

                            if( result ) {

                                callback();

                            } else {

                                next( new Error(res.__('RUN_DbError')) );
                                return;

                            }

                        });
                    });

                }

            ], function( err, result ) {

                if( err ) {

                    settings.formError   = true;
                    settings.formMessage = err;

                } else {

                    var events = [];
                    var eventObject = {
                        "eventType":"availabilityRequest",
                        "reference":req.body.server,
                        "zone":req.body.zone
                    };

                    events.push( eventObject );
                    newrelic.submitEvents( events, next );

                    settings.formSuccess = true;
                    settings.formMessage = res.__('RUN_Success');

                }

                settings.formErrors     = ( errors ) ? errors : {};
                settings.sysServersList = ressources.sysServersList;
                settings.kimServersList = ressources.kimServersList;
                settings.stats          = ressources.stats;
                settings.countries      = countries.all;
                settings.pushbullet     = ( req.session.pushbullet.token ) ? true : false;
                settings.values         = req.body;

                res.render('index', settings);

            });

        });

    });

};

/*
 *  INDEX
 *  Route : /request/reactivate/:id/:token
 *  Methode : GET
 */
exports.reactivate = function( req, res, next ) {

    data.settings(req, res, { shouldBeLogged:false, mayBeLogged:true }, function( settings ) {
        requestModel.getRequestByToken(req.params.id, req.params.token, next, function( request ) {

            async.waterfall([

                // Vérification du token
                function( callback ) {

                    if( ! request )
                        callback( res.__('REACTIVATE_InvalidToken') );
                    else
                        callback();

                },

                // Vérification de l'état de la demande
                function( callback ) {

                    if( request.state == 'pending' )
                        callback( res.__('REACTIVATE_RequestStillActive') );
                    else
                        callback();

                },

                // Mise à jour de la demande
                function( callback ) {

                    requestModel.updateState('pending', request.id, next);
                    callback();

                }

            ], function( err, result ) {

                if( err ) {

                    next( new Error( err ) );
                    return;

                } else {

                    var events = [];
                    var eventObject = {
                        "eventType":"reactivateRequest",
                        "count":1
                    };

                    events.push( eventObject );
                    newrelic.submitEvents( events, next );

                    settings.formSuccess = true;
                    settings.formMessage = res.__('REACTIVATE_Reactivated');
                    settings.request     = request;

                }

                res.render('reactivate', settings);

            });

        });
    });
};

/*
 *  Route : /en
 *  Methode : GET
 */
exports.en = function( req, res, next ) {

    res.cookie('language', 'en', { maxAge: 900000, httpOnly: true });
    res.redirect('/');

};

/*
 *  Route : /fr
 *  Methode : GET
 */
exports.fr = function( req, res, next ) {

    res.cookie('language', 'fr', { maxAge: 900000, httpOnly: true });
    res.redirect('/');

};


/*
 *  Charge toutes les ressources de manière asynchrone
 */
var loadResources = function( options, next, callback ) {

    async.parallel({

        // Liste des serveurs Kimsufi
        sysServersList: function( callback ) {
            serversModel.getServers('sys', next, function( sysServersList ) {
                callback(null, sysServersList);
            });
        },

        // Liste des serveurs SoYouStart
        kimServersList: function( callback ) {
            serversModel.getServers('kimsufi', next, function( kimServersList ) {
                callback(null, kimServersList);
            });
        },

        // Liste des références OVH
        refsList: function( callback ) {

            if( options.refs ) {

                serversModel.getAllRefs(next, function( refsList ) {
                    callback(null, refsList);
                });

            } else {

                callback();

            }

        },

        // Statistiques
        stats: function( callback ) {
            requestModel.getStatistics(next, function( stats ) {
                callback(null, stats);
            });
        }

    }, function( err, resources ) {

        if( err ) {

            next( new Error( err ) );
            return;

        }

        callback( resources );

    });

};
