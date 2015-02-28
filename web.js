// NewRelic Monitoring
if(process.env.ENV == 'production') require('newrelic');

var express      = require('express');
var http         = require('http');
var path         = require('path');
var ms           = require('ms');
var logger       = require('morgan');
var compression  = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var serveStatic  = require('serve-static');
var session      = require('express-session');
var validator    = require('express-validator');
var csrf         = require('csurf');

var routes = require('./routes');
var cron   = require('./routes/cron');
var api    = require('./routes/ovhApi');
var oauth  = require('./routes/oauth');

var app = express();

app.set('env', process.env.ENV || 'development');
app.set('port', process.env.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if(app.get('env') == 'development') {
    app.use(logger('dev'));
    var edt = require('express-debug');
    edt(app);
}

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser(process.env.COOKIES_SECRET));
app.use(session({ secret: process.env.SESSION_SECRET, key: 'SID', resave:true, saveUninitialized:true }));
app.use(csrf());

app.use(function( req, res, next ) {
    res.locals.token         = req.csrfToken();
    res.locals.recaptchaKey  = process.env.RECAPTCHA_PUBLIC_KEY;
    res.locals.pushbulletKey = process.env.PUSHBULLET_PUBLIC_KEY;
    res.locals.pushbulletUri = process.env.PUSHBULLET_REDIRECT_URI;
    next();
});

function setHeaders( res, path, stat ) {
  res.setHeader('Expires', new Date(Date.now() + ms('1y')).toUTCString());
}

app.use(serveStatic(path.join(__dirname, 'public'), { maxAge:ms('1y'), setHeaders:setHeaders }));

// Initialisation de l'API d'OVH
app.use(function( req, res, next ) {
    api.init(req, res, next, function() {
        next();
    });
});

/*
 *  ROUTES
 */

// INDEX
app.get('/', routes.index);
app.post('/', routes.run);
app.get('/request/reactivate/:token', routes.reactivate);

// OAUTH
app.get('/oauth/pushbullet', oauth.pushbullet);

// CRON
app.get('/cron/handleRequests/:secureKey', cron.handleRequests);

/*
 *  ERREUR 404
 */
app.use(function( req, res, next ) {
    var err = new Error('Page introuvable');
    err.status = 404;
    next( err );
});

/*
 *  TOUTES LES AUTRES ERREURS
 */

// Dev
if (app.get('env') === 'development') {

    app.use(function( err, req, res, next ) {

        var statusCode = ( err.status || 500 );

        res.status( statusCode );
        res.render('error', {
            title:'Erreur',
            error:err,
            message: err.message,
            statusCode:statusCode
        });

    });

}

// Prod
app.use(function( err, req, res, next ) {

    var statusCode = ( err.status || 500 );

    res.status( statusCode );
    res.render('error', {
        title:'Erreur',
        error:{},
        message: err.message,
        statusCode:statusCode
    });

});

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port %d', app.get('port'));
});
