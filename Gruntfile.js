'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodeunit: {
            files: ['test/**/*_test.js']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        browserify: {
            build: {
                src: ['build/<%= pkg.name %>.js'],
                dest: 'build/<%= pkg.name %>.browser.js',
                options: {
                    alias: ['build/<%= pkg.name %>.js:<%= pkg.name %>']
                }

            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            buildnode: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            },
            buildbrowser: {
                src: 'build/<%= pkg.name %>.browser.js',
                dest: 'build/<%= pkg.name %>.browser.min.js'
            }
        },
        copy: {
            dist: {
                files: [
                    {expand: true, cwd: 'build/', src: ['*.min.js'], dest: 'dist/'},
                    {expand: true, cwd: 'build/', src: ['*browser*'], dest: 'example/'}
                ]
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'nodeunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'nodeunit']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');


    // Default task.
    grunt.registerTask('default', ['jshint', 'nodeunit', 'concat', 'browserify', 'uglify', 'copy']);

};