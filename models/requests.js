var pg    = require('pg');
var error = require('../routes/errorHandler');

/*
 *  Ajout d'une nouvelle demande dans la base de données
 */
exports.add = function( data, next, callback ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {

        client.query('INSERT INTO public.requests( reference, mail, date, state, token ) \
                      VALUES( $1, $2, DEFAULT, DEFAULT, $3 )',

            [ data.reference, data.mail, data.token ], function( err, result ) {

            if( error.handler( err, client, done, next ) ) return;
            done();

            if( result.rowCount == 1 )
                callback( true );
            else
                callback( false );

        });
    });

};

/*
 *  Permet de récupérer l'ensemble des demandes en attentes ( pending )
 */
exports.getPendingRequests = function( next, callback ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {
        client.query("SELECT r.id, r.reference, r.mail, r.token, s.type, s.name \
                      FROM public.requests r \
                      LEFT JOIN public.servers s ON s.reference = r.reference \
                      WHERE r.state = $1",
            [ 'pending' ], function( err, result ) {

            if( error.handler( err, client, done, next ) ) return;
            done();

            callback( result.rows );

        });
    });

};

/*
 *  Permet de récupérer une demande spécifique à partir de son token
 */
exports.getRequestByToken = function( token, next, callback ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {
        client.query("SELECT * FROM public.requests WHERE token = $1 LIMIT 1", [ token ], function( err, result ) {

            if( error.handler( err, client, done, next ) ) return;
            done();

            if( result.rowCount == 1 )
                callback( result.rows[0] );
            else
                callback( false );

        });
    });

};

/*
 *  Mise à jour de l'état de la demande ( pending <-> done )
 */
exports.updateState = function( requestState, requestId, next ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {
        client.query('UPDATE public.requests SET state = $1 WHERE id = $2', [ requestState, requestId ], function( err, result ) {

            if( error.handler( err, client, done, next ) ) return;
            done();

        });
    });

};

/*
 *  Mise à jour du token de la demande
 */
exports.updateToken = function( token, requestId, next ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {
        client.query('UPDATE public.requests SET token = $1 WHERE id = $2', [ token, requestId ], function( err, result ) {

            if( error.handler( err, client, done, next ) ) return;
            done();

        });
    });

};
