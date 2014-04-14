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
                command: [
                  'export TEST_CAN_EMITTER=""',
                  'export NODE_ENV=development',
                  '$UWCENTERSTACK_VEHICLE_MONITOR_NW $UWCENTERSTACK_VEHICLE_MONITOR_HOME'
                ].join(' && ')
            },
            nodeWebkitDevFake: {
                command: [
                  'export TEST_CAN_EMITTER=true',
                  'export NODE_ENV=development',
                  '$UWCENTERSTACK_VEHICLE_MONITOR_NW $UWCENTERSTACK_VEHICLE_MONITOR_HOME'
                ].join(' && ')
            },
            ls: {
                command: 'ls'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-shell-spawn');

    // Default task(s).
    grunt.registerTask('update', 'Updates every module and rebuilds for node-webkit', function() {
        _.each(grunt.file.expand('node_modules/*'), function(directory) {
            console.log(directory);
            grunt.file.setBase(directory);
            grunt.task.run('shell:ls');
            grunt.file.setBase('..', '..');//nw-gyp rebuild --target=0.8.5
        });
    });
    grunt.registerTask('build', ['sass', 'jshint', 'nodewebkit']);
    grunt.registerTask('run', ['sass', 'jshint', 'shell:nodeWebkitDev', 'watch']);
    grunt.registerTask('fake', ['sass', 'jshint', 'shell:nodeWebkitDevFake', 'watch']);

};
