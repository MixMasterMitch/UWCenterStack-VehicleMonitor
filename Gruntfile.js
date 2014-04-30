var exec = require('child_process').exec;
var sys = require('sys');    
var _ = require('underscore');

function puts(error, stdout, stderr) { sys.puts(stdout) }

function isPlatform(platform) {
    return require('os').platform() === platform;
}

module.exports = function(grunt) {

    grunt.initConfig({
        nodewebkit: {
            options: {
                build_dir: '../webkitbuilds',

                version: '0.8.5',

                // Select opperating
                mac: isPlatform('darwin'),
                win: isPlatform('win64'),
                linux32: false,
                linux64: isPlatform('linux')
            },
            src: ['./**/*'] // Include everything
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'css/main.css': 'sass/main.scss'
                }
            }
        },
        jshint: {
            files: ['scripts/**/*.js'],
            options: {
                ignores: ['scripts/external/**/*.js'],
                '-W030': true
            }
        },
        watch: {
            options: {
                livereload: true
            },
            js: {
                files: ['scripts/**/*.js'],
                tasks: ['jshint']
            },
            sass: {
                files: ['sass/**/*.scss'],
                tasks: ['sass']
            }
        },
        shell: {
            options: {
                stdout: true,
                stderr: true,
                failOnError: true,
                async: true
            },
            nodeWebkitDev: {
                command: isPlatform('darwin') ?
                             ['NODE_ENV=' + (grunt.option('nodeEnv') || 'development'),
                              'FAKE_CAN=' + (grunt.option('fakeCan') || 'true'),
                              'open -n -a node-webkit ""'].join(' ') :
                         isPlatform('linux') ?
                             ['export NODE_ENV=' + (grunt.option('nodeEnv') || 'development'),
                              'export FAKE_CAN=' + (grunt.option('fakeCan') || 'false'),
                              './nw/nw .'].join(' && ') :
                         isPlatform('win64') || isPlatform('win32') ?
                             ['set NODE_ENV=' + (grunt.option('nodeEnv') || 'development'),
                              'set FAKE_CAN=' + (grunt.option('fakeCan') || 'true'),
                              'nodewebkit'].join('&&') : ''
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-shell-spawn');

    // Default task(s).
    grunt.registerTask('build', ['sass', 'jshint', 'nodewebkit']);
    grunt.registerTask('run', ['sass', 'jshint', 'shell:nodeWebkitDev', 'watch']);

};
