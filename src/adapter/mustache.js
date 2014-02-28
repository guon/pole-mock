define(['Mustache'], function(Mustache) {
    'use strict';

    function MustacheEngine() {
        this.nextHandler = null;
    }

    MustacheEngine.prototype = {
        constructor: MustacheEngine,

        compile: function(engine, content) {
            if (engine == 'mustache') {
                return Mustache.parse(content);
            } else {
                return this.nextHandler ? this.nextHandler.compile(engine, content) : false;
            }
        }
    };

    return MustacheEngine;
});