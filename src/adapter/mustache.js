define(['mustache'], function(Mustache) {
    'use strict';

    function MustacheEngine() {
        this.nextHandler = null;
    }

    MustacheEngine.prototype.engine = 'mustache';

    MustacheEngine.prototype.compile = function(engine, content) {
        if (engine == this.engine) {
            Mustache.parse(content);
            return content;
        } else {
            return this.nextHandler ? this.nextHandler.compile(engine, content) : false;
        }
    };

    MustacheEngine.prototype.render = function(engine, tpl, data) {
        if (engine == this.engine) {
            return Mustache.render(tpl, data);
        } else {
            return this.nextHandler ? this.nextHandler.render(engine, tpl, data) : false;
        }
    };

    return MustacheEngine;
});