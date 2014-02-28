module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            beforeconcat: ['Gruntfile.js', 'src/**/*.js'],
            afterconcat: ['pole-mock.js']
        },

        qunit: {
            alltests: ['test/*.html']
        },

        clean: {
            dist: ['pole-mock.js']
        },

        concat: {
            dist: {
                options: {
                    separator: '',
                    stripBanners: true,
                    banner: '/*! <%= pkg.name %> v<%= pkg.version %> ~ (c) 2014<%= (grunt.template.today("yyyy") != 2014 ? "-" + grunt.template.today("yyyy") : "" ) %> Max Zhang, <%= pkg.homepage %> */\n(function(window, undefined) {\n    \'use strict\';\n',
                    footer: '}(window));',
                    process: convert
                },
                src: [
                    'src/var/document.js',
                    'src/var/slice.js',
                    'src/var/format-string.js',
                    'src/core.js',
                    'src/hashmap.js',
                    'src/adapter/mustache.js',
                    'src/adapter/dot.js',
                    'src/template-renderer.js',
                    'src/ajax.js',
                    'src/mock.js',
                    'src/parser.js',
                    'src/global.js'
                ],
                dest: 'pole-mock.js'
            }
        },

        watch: {
            src: {
                files: ['src/**/*.js'],
                tasks: ['jshint:beforeconcat']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint:beforeconcat']);
    grunt.registerTask('test', ['jshint:beforeconcat', 'qunit']);
    grunt.registerTask('build', ['jshint:beforeconcat', 'qunit', 'clean', 'concat', 'jshint:afterconcat']);

    // 处理源码，将requirejs的define声明移除
    function convert(content, filePath) {
        content = content
            .replace(/define\([^\{]*?\{[\f\r\t\v]*/, '')
            .replace(/(?:[ \f\r\t\v]*return\s+[^\}]+;?\s*)?\}\);[^\}\w]*$/, '')
            .replace(/^\s*(?:'use\sstrict'|"use\sstrict")\s*;/, '')
            .replace(/@VERSION/g, grunt.config("pkg.version"));
        return content;
    }
};