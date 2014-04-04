define([
    'underscore',
    'adapter/mustache',
    'var/slice'
], function(_, MustacheEngine, slice) {
    'use strict';

    function UnderscoreEngine() {
        this.nextHandler = null;
    }

    UnderscoreEngine.prototype.engine = 'underscore';

    UnderscoreEngine.prototype.handleRequest = MustacheEngine.prototype.handleRequest;

    UnderscoreEngine.prototype.compile = function() {
        return this.handleRequest('compile', slice.call(arguments, 0), function(engine, content) {
            return _.template(content);
        });
    };

    UnderscoreEngine.prototype.render = function() {
        return this.handleRequest('render', slice.call(arguments, 0), function(engine, tpl, data) {
            return tpl(data);
        });
    };

    return UnderscoreEngine;
});