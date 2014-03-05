define([
    'dot',
    'adapter/mustache',
    'var/slice'
], function(doT, MustacheEngine, slice) {
    'use strict';

    function DoTEngine() {
        this.nextHandler = null;
    }

    DoTEngine.prototype.engine = 'dot';

    DoTEngine.prototype.handleRequest = MustacheEngine.prototype.handleRequest;

    DoTEngine.prototype.compile = function() {
        return this.handleRequest('compile', slice.call(arguments, 0), function(engine, content) {
            return doT.template(content);
        });
    };

    DoTEngine.prototype.render = function() {
        return this.handleRequest('render', slice.call(arguments, 0), function(engine, tpl, data) {
            return tpl(data);
        });
    };

    return DoTEngine;
});