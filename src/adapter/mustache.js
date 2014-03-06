define([
    'mustache',
    'var/slice'
], function(Mustache, slice) {
    'use strict';

    function MustacheEngine() {
        this.nextHandler = null;
    }

    MustacheEngine.prototype.engine = 'mustache';

    MustacheEngine.prototype.handleRequest = function(method, args, fn) {
        if (args[0] === this.engine) {
            return fn.apply(this, args);
        } else {
            return this.nextHandler ? this.nextHandler[method].apply(this.nextHandler, args) : false;
        }
    };

    MustacheEngine.prototype.compile = function() {
        return this.handleRequest('compile', slice.call(arguments, 0), function(engine, content) {
            Mustache.parse(content);
            return content;
        });
    };

    MustacheEngine.prototype.render = function() {
        return this.handleRequest('render', slice.call(arguments, 0), function(engine, tpl, data) {
            return Mustache.render(tpl, data);
        });
    };

    return MustacheEngine;
});