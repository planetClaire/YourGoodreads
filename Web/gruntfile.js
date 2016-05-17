module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt); // load all tasks

    var jsFoundation = [

      'bower_components/foundation-sites/js/foundation.core.js',
      //'bower_components/foundation-sites/js/foundation.util.timerAndImageLoader.js',
      'bower_components/foundation-sites/js/foundation.util.keyboard.js',
      'bower_components/foundation-sites/js/foundation.util.mediaQuery.js',
      'bower_components/foundation-sites/js/foundation.util.motion.js',
      'bower_components/foundation-sites/js/foundation.util.triggers.js',
      'bower_components/foundation-sites/js/foundation.util.box.js',
      'bower_components/foundation-sites/js/foundation.util.touch.js',
      'bower_components/foundation-sites/js/foundation.reveal.js',
      'bower_components/foundation-sites/js/foundation.tooltip.js',
      //'bower_components/foundation-sites/js/foundation.abide.js',
      //'bower_components/foundation-sites/js/foundation.accordion.js',
      //'bower_components/foundation-sites/js/foundation.accordionMenu.js',
      //'bower_components/foundation-sites/js/foundation.drilldown.js',
      //'bower_components/foundation-sites/js/foundation.dropdown.js',
      //'bower_components/foundation-sites/js/foundation.dropdownMenu.js',
      //'bower_components/foundation-sites/js/foundation.equalizer.js',
      //'bower_components/foundation-sites/js/foundation.interchange.js',
      //'bower_components/foundation-sites/js/foundation.magellan.js',
      //'bower_components/foundation-sites/js/foundation.offcanvas.js',
      //'bower_components/foundation-sites/js/foundation.orbit.js',
      //'bower_components/foundation-sites/js/foundation.responsiveMenu.js',
      //'bower_components/foundation-sites/js/foundation.responsiveToggle.js',
      //'bower_components/foundation-sites/js/foundation.slider.js',
      //'bower_components/foundation-sites/js/foundation.sticky.js',
      //'bower_components/foundation-sites/js/foundation.tabs.js',
      //'bower_components/foundation-sites/js/foundation.toggler.js',
      //'bower_components/foundation-sites/js/foundation.util.nest.js',

    ];

    var jsApp = [
      'scripts/app.js',
      'scripts/_*.js'
    ];

    var jsAll = [
        [jsFoundation],
        [jsApp]
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            options: {
                sourceMap: true,
                outputStyle: 'compressed',
                includePaths: ['bower_components/foundation-sites/scss', 'node_modules/motion-ui/src']
            },
            dist: {
                files: {
                    'styles/styles.css': 'scss/styles.scss'
                }
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [jsAll],
                dest: 'scripts/concat/scripts.js'
            }
        },

        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: {
                    'scripts/babel/scripts.js': 'scripts/concat/scripts.js'
                }
            }
        },

        uglify: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'scripts/scripts.min.js': 'scripts/babel/scripts.js'
                }
            }
        },

        watch: {
            grunt: {
                files: ['gruntfile.js'],
                tasks: ['build']
            },
            sass: {
                files: 'scss/*.scss',
                tasks: ['sass']
            },
            js: {
                files: [
                    jsAll
                ],
                tasks: ['concat', 'babel', 'uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('build', ['concat', 'babel', 'uglify', 'sass']);
    grunt.registerTask('default', ['build', 'watch']);
};