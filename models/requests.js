var pg    = require('pg');
var error = require('../routes/errorHandler');

/*
 *  Ajout d'une nouvelle demande dans la base de données
 */
exports.add = function( data, next, callback ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {

        client.query('INSERT INTO public.requests( reference, mail, date, state ) \
                      VALUES( $1, $2, DEFAULT, DEFAULT)',

            [ data.reference, data.mail ], function( err, result ) {

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
        client.query("SELECT r.id, r.reference, r.mail, s.type, s.name \
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
 *  Mise à jour de l'état de la demande ( pending -> done )
 */
exports.updateState = function( requestId, next ) {

    pg.connect(process.env.DATABASE_URL, function( err, client, done ) {
        client.query('UPDATE public.requests SET state = $1 WHERE id = $2', [ 'done', requestId ], function( err, result ) {

            if( error.handler( err, client, done, next ) ) return;
            done();

        });
    });

};
