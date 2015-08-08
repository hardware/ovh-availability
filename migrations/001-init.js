var pg    = require('pg');
var async = require('async');

process.env.DATABASE_URL = process.env.DATABASE_URL || "tcp://localhost:5432/ovh-availability"

exports.up = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {

        async.series([

            // Création de l'énumération "SERVERS_TYPE"
            function( callback ) {
                client.query("CREATE TYPE public.servers_type AS ENUM ('sys','kimsufi')", function( err, result ) {
                    callback();
                });
            },

            // Création de l'énumération "REQUEST_STATE"
            function( callback ) {
                client.query("CREATE TYPE public.request_state AS ENUM ('pending','done')", function( err, result ) {
                    callback();
                });
            },

            // Création de la table "SERVERS"
            function( callback ) {

                client.query("                                     \
                    CREATE TABLE public.servers(                   \
                        id serial NOT NULL,                        \
                        type public.servers_type NOT NULL,         \
                        name character varying(100) NOT NULL,      \
                        reference character varying(10) NOT NULL,  \
                        CONSTRAINT id_servers_pm PRIMARY KEY (id), \
                        CONSTRAINT unique_ref UNIQUE (reference)   \
                )", function( err, result ) {

                    callback();

                });

            },

            // Création de la table "REQUESTS"
            function( callback ) {

                client.query("                                                 \
                    CREATE TABLE public.requests(                              \
                        id serial NOT NULL,                                    \
                        reference character varying(10) NOT NULL,              \
                        mail character varying(100) NOT NULL,                  \
                        date timestamp with time zone NOT NULL DEFAULT NOW(),  \
                        state public.request_state NOT NULL DEFAULT 'pending', \
                        CONSTRAINT id_requests_pm PRIMARY KEY (id)             \
                )", function( err, result ) {

                    callback();

                });

            }

        ], function( err, results ) {

            if( ! err ) next();

        });

    });

};

exports.down = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {

        async.series([

            function( callback ) {
                client.query("DROP TABLE servers CASCADE", function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query("DROP TABLE requests CASCADE", function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query("DROP TYPE servers_type", function( err, result ) {
                    callback();
                });
            },

            function( callback ) {
                client.query("DROP TYPE request_state", function( err, result ) {
                    callback();
                });
            }

        ], function( err, results ) {

            if( ! err ) next();

        });

    });

};
