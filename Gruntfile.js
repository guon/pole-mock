module.exports = function(grunt) {
    'use strict';

    // 处理源码，将requirejs的define声明移除
    function convert(content, filePath) {
        content = content
                .replace(/define\([^\{]*?\{/, '')
                .replace(/(?:[ ]*return\s+[^\}]+;?\s*)?\}\);[^\}\w]*$/, '');
        return content;
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            beforeconcat: ['Gruntfile.js', 'lib/**/*.js'],
            afterconcat: ['pole-mock.js']
        },

        clean: {
            dist: ['pole-mock.js']
        },

        concat: {
            dist: {
                options: {
                    separator: '\n\n',
                    stripBanners: true,
                    banner: '/*! <%= pkg.name %> v<%= pkg.version %> ~ (c) 2014 <%= pkg.title %>, <%= pkg.homepage %> */\n(function(window, undefined) {\n    \'use strict\';',
                    footer: '}(window));',
                    process: convert
                },
                src: [
                    'src/core.js',
                    'src/adapter/mustache.js',
                    'src/mock.js',
                    'src/parser.js',
                    'src/global.js'
                ],
                dest: 'pole-mock.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['jshint:beforeconcat']);
    grunt.registerTask('build', ['jshint:beforeconcat', 'clean', 'concat', 'jshint:afterconcat']);

};