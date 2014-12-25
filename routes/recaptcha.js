var request = require('request')

exports.verify = function( req, response, next, callback ) {

    var ip = req.headers['x-forwarded-for'] ||
             req.connection.remoteAddress   ||
             req.socket.remoteAddress       ||
             req.connection.socket.remoteAddress;

    var url = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.RECAPTCHA_PRIVATE_KEY + "&response=" + response + "&remoteip=" + ip

    request(url, function( error, response, body ) {

        if ( error || response.statusCode != 200 ) {

            next( error );
            return;

        } else {

            var result = JSON.parse( body );

            if( result.success )
                callback( true );
            else
                callback( false );

        }

    });

};
