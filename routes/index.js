var async        = require('async');
var crypto       = require('crypto');
var data         = require('./data');
var api          = require('./api');
var recaptcha    = require('./recaptcha');
var serversModel = require('../models/servers');
var requestModel = require('../models/requests');

/*
 *  INDEX
 *  Route : /
 *  Methode : GET
 */
exports.index = function( req, res, next ) {

    data.settings(req, res, { shouldBeLogged:false, mayBeLogged:true }, function( settings ) {

        serversModel.getServers('sys', next, function( sysServersList ) {
            serversModel.getServers('kimsufi', next, function( kimServersList ) {

                settings.formErrors     = {};
                settings.sysServersList = sysServersList;
                settings.kimServersList = kimServersList;

                res.render('index', settings);

            });
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

        // Récupération des ressources
        serversModel.getServers('sys', next, function( sysServersList ) {
        serversModel.getServers('kimsufi', next, function( kimServersList ) {
        serversModel.getAllRefs(next, function( refsList ) {

            // Validation des valeurs contenues dans req.body
            req.checkBody('mail', 'La valeur de ce champ est invalide.').isEmail().len(5, 100);
            req.checkBody('mail', 'Ce champ est requis.').notEmpty();
            req.checkBody('server', 'La valeur de ce champ est invalide.').isIn( refsList );
            req.checkBody('server', 'Ce champ est requis.').notEmpty();

            var errors = req.validationErrors( true );

            async.waterfall([

                // Vérification du formulaire
                function( callback ) {

                    if( errors )
                        callback("Une erreur est survenue lors de la validation du formulaire, veuillez vérifier les données saisies.");
                    else
                        callback();

                },

                // Vérification du captcha
                function( callback ) {

                    recaptcha.verify(req, req.body["g-recaptcha-response"], next, function( result ) {

                        if( ! result )
                            callback("Veuillez cocher la case située à la fin du formulaire afin de prouver que vous êtes bien humain.");
                        else
                            callback();

                    });

                },

                // Vérification de la disponibilité de l'offre
                function( callback ) {

                    api.getJson(function( json ) {
                        api.checkOffer(json, req.body.server, next, function( available ) {

                            if( available )
                                callback("Cette offre est déjà disponible, vous pouvez réserver votre serveur dès à présent.");
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
                            token:buffer.toString('hex')
                        };

                        requestModel.add(data, next, function( result ) {

                            if( result ) {

                                callback();

                            } else {

                                callback("Une erreur est survenue lors de l'enregistrement de votre demande dans la base de données.");

                            }

                        });
                    });

                }

            ], function( err, result ) {

                if( err ) {

                    settings.formError   = true;
                    settings.formMessage = err;

                } else {

                    settings.formSuccess = true;
                    settings.formMessage = 'Votre demande a bien été prise en compte.';

                }

                settings.formErrors     = ( errors ) ? errors : {};
                settings.sysServersList = sysServersList;
                settings.kimServersList = kimServersList;

                res.render('index', settings);

            });

        });
        });
        });

    });

};

/*
 *  INDEX
 *  Route : /request/reactivate/:token
 *  Methode : GET
 */
exports.reactivate = function( req, res, next ) {

    data.settings(req, res, { shouldBeLogged:false, mayBeLogged:true }, function( settings ) {
        requestModel.getRequestByToken(req.params.token, next, function( request ) {

            async.waterfall([

                // Vérification du token
                function( callback ) {

                    if( ! request )
                        callback("Impossible d'effectuer cette action, token invalide.");
                    else
                        callback();

                },

                // Vérification de l'état de la demande
                function( callback ) {

                    if( request.state == 'pending' )
                        callback("Impossible d'effectuer cette action, votre demande est toujours active.");
                    else
                        callback();

                },

                // Mise à jour de la demande
                function( callback ) {

                    crypto.randomBytes(24, function( ex, buffer ) {

                        var token = buffer.toString('hex');

                        requestModel.updateState('pending', request.id, next);
                        requestModel.updateToken(token, request.id, next);

                        callback();

                    });

                }

            ], function( err, result ) {

                if( err ) {

                    settings.formError   = true;
                    settings.formMessage = err;

                } else {

                    settings.formSuccess = true;
                    settings.formMessage = 'Votre demande a bien été réactivée.';

                }

                res.render('reactivate', settings);

            });

        });
    });
};
