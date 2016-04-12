module.exports = function(grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            watch: {
                src: 'lib/DashjsWrapper.js',
                dest: 'dist/dashjs-wrapper.debug.js',
                options:  {
                    browserifyOptions: {
                        standalone: 'DashjsWrapper',
                        debug: true
                    },
                    watch: true,
                    keepAlive: true
                }
            },
            debug: {
                src: 'lib/DashjsWrapper.js',
                dest: 'dist/dashjs-wrapper.debug.js',
                options:  {
                    browserifyOptions: {
                        standalone: 'DashjsWrapper',
                        debug: true
                    },
                    watch: false,
                    keepAlive: false
                }
            },
            dist: {
                src: 'lib/DashjsWrapper.js',
                dest: 'dist/dashjs-wrapper.js',
                options:  {
                    browserifyOptions: {
                        standalone: 'DashjsWrapper',
                        debug: false,
                    },
                    watch: false,
                    keepAlive: false,
                }
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: {
                    drop_console: true
                },
                beautify: false
            },
            dist: {
                files: {
                    'dist/dashjs-wrapper.min.js': 'dist/dashjs-wrapper.js'
                }
            }
        }
    });

    grunt.registerTask('debug-watch', ['browserify:watch']);
    grunt.registerTask('build', 'build dist script', ['browserify:debug', 'browserify:dist', 'uglify:dist']);
}
