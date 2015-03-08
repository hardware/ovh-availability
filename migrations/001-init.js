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
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-2', '150sk20')", function( err, result ) {
                            callback();
                        });
                    },
                    function( callback ) {
                        client.query("INSERT INTO servers (type, name, reference) VALUES ('kimsufi', 'KS-2 SSD', '150sk22')", function( err, result ) {
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
