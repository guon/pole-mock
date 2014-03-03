define(['mustache'], function(Mustache) {
    'use strict';

    function MustacheEngine() {
        this.nextHandler = null;
    }

    MustacheEngine.prototype = {
        constructor: MustacheEngine,

        compile: function(engine, content) {
            if (engine == 'mustache') {
                Mustache.parse(content);
                return content;
            } else {
                return this.nextHandler ? this.nextHandler.compile(engine, content) : false;
            }
        }
    };

    return MustacheEngine;
});