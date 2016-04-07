module.exports = function(grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            debug: {
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

    grunt.registerTask('debug_watch', ['browserify:debug']);
    grunt.registerTask('build', 'build dist script', ['browserify:dist', 'uglify:dist']);
}
