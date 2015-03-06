module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      lint: ['web.js', 'Gruntfile.js', 'routes/*.js', 'models/*.js', 'migrations/*.js']
    },

    bower: {
      options: {
        targetDir:'public/bower'
      },
      install: {}
    },

    shell: {
      migrate: {
        command: './node_modules/migrate/bin/migrate up'
      }
    },

    uglify: {
      options: {
        banner:'/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
        separator:';'
      },
      compile: {
        files: {
          'public/js/dest/scripts.min.js':[
            'public/bower/jquery/dist/jquery.min.js',
            'public/bower/pace/pace.min.js',
            'public/bower/mailcheck/src/mailcheck.min.js',
            'public/bower/bootstrap/dist/js/bootstrap.min.js',
            'public/js/*.js'
          ]
        }
      }
    },

    cssmin: {
      compile: {
        files: {
          'public/css/dest/styles.min.css':[
            'public/bower/bootstrap/dist/css/bootstrap.min.css',
            'public/bower/pace/themes/blue/pace-theme-flash.css',
            'public/font/tello/css/fontello.css',
            'public/css/*.css'
          ]
        }
      }
    },

    watch: {
      lint: {
        files:['web.js', 'Gruntfile.js', 'routes/*.js', 'models/*.js', 'migrations/*.js'],
        tasks:['jshint:lint']
      },
      scripts: {
        files:['public/js/*.js'],
        tasks:['uglify:compile']
      },
      styles: {
        files:['public/css/*.css'],
        tasks:['cssmin:compile']
      }
    }

  });

  // Tâche par défaut ( compilation automatique )
  grunt.registerTask('default', ['watch']);

  grunt.registerTask('run', [
    'jshint:lint',
    'bower:install',
    'shell:migrate',
    'uglify:compile',
    'cssmin:compile'
  ]);

  // Tâche lancée lors du déploiement en prod
  grunt.registerTask('heroku:production', [
    'jshint:lint',
    'bower:install',
    'uglify:compile',
    'cssmin:compile'
  ]);

};
