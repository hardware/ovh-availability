var async    = require('async');
var sendgrid = require('sendgrid')(
    process.env.SENDGRID_USERNAME,
    process.env.SENDGRID_PASSWORD
);

exports.send = function( email, next ) {

    async.waterfall([
        function( callback ) {

            var fullBody = '';

            var prefix = getPrefix();
            var suffix = getSuffix();
            var body   = email.html;

            fullBody += prefix;
            fullBody += body;
            fullBody += suffix;

            callback( null, fullBody );
        },
        function( fullBody, callback ) {

            email.html = fullBody;

            callback( null, email );
        }
    ],

    function( err, email ) {

        if( err ) {

            next( err );
            return;

        } else {

            sendgrid.send(email, function( err, json ) {

                if( err )
                    next(new Error("Une erreur est survenue pendant l'exécution du module de mail [ " + err + " ]"));

            });

        }

    });

};

var getPrefix = function() {

    var html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> \
                <html xmlns="http://www.w3.org/1999/xhtml"> \
                <head> \
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> \
                </head> \
                <body style="width: 100% !important; -webkit-text-size-adjust: none; margin: 0; padding: 0;"> \
                <center> \
                <table id="backgroundTable" style="border-spacing: 0; border-collapse: collapse;  height: 100% !important; width: 100% !important; color: #4c4c4c; font-size: 15px; line-height: 150%; background: #ffffff; margin: 0; padding: 0; border: 0;"> \
                <tr style="vertical-align: top; padding: 0;"> \
                <td style="vertical-align: top; padding: 0;" align="center" valign="top"> \
                <table id="templateContainer" style="border-spacing: 0; border-collapse: collapse;  height: 100%; width: 600px; color: #4c4c4c; font-size: 15px; line-height: 150%; background: #ffffff; margin: 40px 0; padding: 0; border: 0;"> \
                <tr style="vertical-align: top; padding: 0;"> \
                <td class="templateContainerPadding" style="vertical-align: top; padding: 0 40px;" align="center" valign="top"> \
                <table style="border-spacing: 0; border-collapse: collapse;  height: 100%; width: 100%; background: #ffffff; margin: 0; padding: 0; border: 0;"> \
                <tr style="vertical-align: top; padding: 0; "> \
                <td style="vertical-align: top; text-align: left; padding: 0; " align="left" valign="top">';

    return html;
};

var getSuffix = function( callback ) {

    var html = '</td></tr></table></td></tr></table></td></tr></table></center></body></html> \
    <style type="text/css"> \
    body { \
    width: 100% !important; \
    -webkit-text-size-adjust: none; \
    margin: 0; padding: 0; \
    } \
    img { \
    border: 0; outline: none; text-decoration: none; \
    } \
    #backgroundTable { \
    height: 100% !important; margin: 0; padding: 0; width: 100% !important; \
    } \
    #backgroundTable { \
    color: #4c4c4c; background-color: #ffffff; font-family: proxima-nova, "helvetica neue", helvetica, arial, geneva, sans-serif; font-size: 15px; line-height: 150%; \
    } \
    @media (max-width: 650px) { \
      #templateContainer { \
        width: 100% !important; \
      } \
      #templateContainer .templateContainerPadding { \
        padding: 0 5% !important; \
      } \
    } \
    </style>';

    return html;

};
