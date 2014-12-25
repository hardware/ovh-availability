var express      = require('express');
var http         = require('http');
var path         = require('path');
var logger       = require('morgan');
var compression  = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var validator    = require('express-validator');
var csrf         = require('csurf');
var errorHandler = require('errorhandler');

var routes     = require('./routes');
var cron       = require('./routes/cron');

var app = express();

// URL de la base de donnée ( prod / dev )
process.env.DATABASE_URL = process.env.DATABASE_URL || 'tcp://localhost:5432/ovh-availability';

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
    res.locals.token        = req.csrfToken();
    res.locals.recaptchaKey = process.env.RECAPTCHA_PUBLIC_KEY;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));


/*
 *  ROUTES
 */


// INDEX
app.get('/', routes.index);
app.post('/', routes.run);

// CRON
app.get('/cron/handleRequests/:secureKey', cron.handleRequests);

if(app.get('env') == 'development') {
    app.use(errorHandler());
}

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
app.use(function( err, req, res, next ) {
    res.render('error', { title:'Erreur', error:err });
});

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port %d', app.get('port'));
});
