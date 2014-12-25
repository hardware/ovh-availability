var pg    = require('pg');
var async = require('async');

process.env.DATABASE_URL = process.env.DATABASE_URL || "tcp://localhost:5432/ovh-availability"

exports.up = function( next ) {

    pg.connect(process.env.DATABASE_URL, function( dbErr, client, done ) {

        async.series([

            // Création de l'énumération "SERVERS_TYPE"
            function( callback ) {

                var q = client.query("CREATE TYPE public.servers_type AS ENUM ('sys','kimsufi')");

                q.on('end', function() {
                    callback();
                });

            },

            // Création de l'énumération "REQUEST_STATE"
            function( callback ) {

                var q = client.query("CREATE TYPE public.request_state AS ENUM ('pending','done')");

                q.on('end', function() {
                    callback();
                });

            },

            // Création de la table "SERVERS"
            function( callback ) {

                var q = client.query("                             \
                    CREATE TABLE public.servers(                   \
                        id serial NOT NULL,                        \
                        type public.servers_type NOT NULL,         \
                        name character varying(100) NOT NULL,      \
                        reference character varying(10) NOT NULL,  \
                        CONSTRAINT id_servers_pm PRIMARY KEY (id), \
                        CONSTRAINT unique_ref UNIQUE (reference)   \
                )");

                q.on('end', function() {
                    callback();
                });

            },

            // Création de la table "REQUESTS"
            function( callback ) {

                var q = client.query("                                         \
                    CREATE TABLE public.requests(                              \
                        id serial NOT NULL,                                    \
                        reference character varying(10) NOT NULL,              \
                        mail character varying(100) NOT NULL,                  \
                        date timestamp with time zone NOT NULL DEFAULT NOW(),  \
                        state public.request_state NOT NULL DEFAULT 'pending', \
                        CONSTRAINT id_requests_pm PRIMARY KEY (id)             \
                )");

                q.on('end', function() {
                    callback();
                });

            },

            // Création de la relation entre la table 'servers' et 'requests'
            function( callback ) {

                var q = client.query("ALTER TABLE public.requests ADD CONSTRAINT ref_servers_fk FOREIGN KEY (reference) \
                                      REFERENCES public.servers (reference) MATCH FULL \
                                      ON DELETE NO ACTION ON UPDATE NO ACTION;");

                q.on('end', function() {
                    callback();
                });

            },

            // Ajout des serveurs d'OVH dans la table 'servers'
            function( callback ) {

                async.parallel([

                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SAT-1', '143sys4')", function( err, result ) {
                            callback();
                        });
                    },

                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SAT-1', '143sys4')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SSD-1', '143sys13')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SAT-2', '143sys1')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SSD-2', '143sys10')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SAT-3', '143sys2')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SSD-3', '143sys11')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SAT-4', '143sys3')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'E3-SSD-4', '143sys12')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'SYS-IP-1', '142sys4')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'SYS-IP-2', '142sys5')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'SYS-IP-4', '142sys8')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'SYS-IP-5', '142sys6')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'SYS-IP-5S', '142sys10')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'SYS-IP-6', '142sys7')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'SYS-IP-6S', '142sys9')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'BK-8T', '141bk1')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'BK-24T', '141bk2')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'GAME-1', '141game1')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'GAME-2', '141game2')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('sys', 'GAME-3', '141game3')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-1', '150sk10')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-2a', '150sk20')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-2b', '150sk21')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-2c', '150sk22')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-3', '150sk30')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-4', '150sk40')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-5', '150sk50')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-6', '150sk60')", function( err, result ) {
                            callback();
                        });
                    }
                ], function( err, results ) {

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

                var q = client.query("DROP TABLE servers CASCADE");

                q.on('end', function() {
                    callback();
                });

            },

            function( callback ) {

                var q = client.query("DROP TABLE requests CASCADE");

                q.on('end', function() {
                    callback();
                });

            },

            function( callback ) {

                var q = client.query("DROP TYPE servers_type");

                q.on('end', function() {
                    callback();
                });

            },

            function( callback ) {

                var q = client.query("DROP TYPE request_state");

                q.on('end', function() {
                    callback();
                });

            }

        ], function( err, results ) {

            if( ! err ) next();

        });

    });

};
