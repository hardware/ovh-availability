exports.settings = function( req, res, options, callback ) {

    if (typeof req.session.pushbullet === 'undefined')
        req.session.pushbullet = {};

    var settings = {
        path:req.path,
        title:"Kimsufi/SoYouStart availability checker"
    };

    callback( settings );

};
