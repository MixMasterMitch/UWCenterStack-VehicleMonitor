function isPlatform(platform) {
    return require('os').platform() === platform;
}

module.exports = function(grunt) {

    grunt.initConfig({
        nodewebkit: {
            options: {
                build_dir: 'webkitbuilds',

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
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-shell-spawn');

    // Default task(s).
    grunt.registerTask('build', ['sass', 'jshint', 'nodewebkit']);
    grunt.registerTask('run', ['sass', 'jshint', 'shell:nodeWebkitDev', 'watch']);
    grunt.registerTask('fake', ['sass', 'jshint', 'shell:nodeWebkitDevFake', 'watch']);

};
