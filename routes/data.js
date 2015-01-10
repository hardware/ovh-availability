exports.settings = function( req, res, options, callback ) {

    var isLogged = ( req.session.user ) ? true : false;

    // Contrôle de la session dans les zones restreintes
    if( !! options.shouldBeLogged && ! isLogged ) {
        res.redirect('/user/login?url=' + req.url);
        return;
    }

    if( ! options.shouldBeLogged && isLogged ) {

        if( ! options.mayBeLogged ) {
            res.redirect('/account');
            return;
        }

    }

    if (typeof req.session.pushbullet === 'undefined')
        req.session.pushbullet = {};

    var settings = {
        path:req.path,
        title:"OVH Disponibilité",
        isLogged:isLogged
    };

    if( isLogged ) {

        var isAdmin = ( req.session.user.type === 'admin' ) ? true : false;

        settings.user    = req.session.user;
        settings.isAdmin = isAdmin;

        // Contrôle de la session dans les zones restreintes
        if( !! options.shouldBeAdmin && ! isAdmin ) {
            res.redirect('/account');
            return;
        }

    }

    callback( settings );

};
