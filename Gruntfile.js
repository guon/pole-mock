module.exports = function(grunt) {
    'use strict';

    var distFiles = ['pole-mock.js', 'pole-core.js'];

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            beforeconcat: ['Gruntfile.js', 'src/**/*.js'],
            afterconcat: distFiles
        },

        qunit: {
            tests: {
                options: {
                    urls: [
                        'http://localhost:8018/test/test_hashmap.html',
                        'http://localhost:8018/test/test_ajax.html',
                        'http://localhost:8018/test/test_pole.html',
                        'http://localhost:8018/test/test_parser.html',
                        'http://localhost:8018/test/test_mock.html'
                    ]
                }
            }
        },

        connect: {
            server: {
                options: {
                    port: 8018,
                    base: './'
                }
            }
        },

        clean: {
            dist: distFiles
        },

        concat: {
            options: {
                separator: '',
                stripBanners: true,
                banner: '/*! <%= pkg.name %> v<%= pkg.version %> ~ (c) 2014<%= (grunt.template.today("yyyy") != 2014 ? "-" + grunt.template.today("yyyy") : "" ) %> Pole Team, <%= pkg.homepage %> */\n(function(window, undefined) {\n    \'use strict\';\n',
                footer: '}(window));',
                process: convert
            },
            mock: {
                src: [
                    'src/var/document.js',
                    'src/var/slice.js',
                    'src/var/noop.js',
                    'src/var/format-string.js',
                    'src/var/suffix.js',
                    'src/core.js',
                    'src/hashmap.js',
                    'src/adapter/mustache.js',
                    'src/adapter/dot.js',
                    'src/template-renderer.js',
                    'src/ajax.js',
                    'src/tag-parser.js',
                    'src/mock.js',
                    'src/global.js'
                ],
                dest: 'pole-mock.js'
            },
            core: {
                src: [
                    'src/var/document.js',
                    'src/var/slice.js',
                    'src/var/format-string.js',
                    'src/core.js',
                    'src/hashmap.js',
                    'src/adapter/mustache.js',
                    'src/adapter/dot.js',
                    'src/template-renderer.js',
                    'src/global.js'
                ],
                dest: 'pole-core.js'
            }
        },

        watch: {
            src: {
                files: ['src/**/*.js'],
                tasks: ['jshint:beforeconcat']
            }
        }
    });

    grunt.registerTask('default', ['jshint:beforeconcat']);
    grunt.registerTask('test', ['jshint:beforeconcat', 'connect', 'qunit']);
    grunt.registerTask('build', ['jshint:beforeconcat', 'connect', 'qunit', 'clean', 'concat', 'jshint:afterconcat']);

    // 处理源码，将requirejs的define声明移除
    function convert(content, filePath) {
        content = content
            .replace(/define\([^\{]*?\{/, '')
            .replace(/(?:return\s+[^\}]+;?\s*)?\}\);[^\}\w]*$/, '')
            .replace(/^\s*(?:'use\sstrict'|"use\sstrict")\s*;/, '')
            .replace(/@VERSION/g, grunt.config("pkg.version"));
        return content;
    }
};