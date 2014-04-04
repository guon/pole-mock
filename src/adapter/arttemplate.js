define([
    'artTemplate',
    'adapter/mustache',
    'var/slice'
], function(artTemplate, MustacheEngine, slice) {
    'use strict';

    function ArtTemplateEngine() {
        this.nextHandler = null;
    }

    ArtTemplateEngine.prototype.engine = 'arttemplate';

    ArtTemplateEngine.prototype.handleRequest = MustacheEngine.prototype.handleRequest;

    ArtTemplateEngine.prototype.compile = function() {
        return this.handleRequest('compile', slice.call(arguments, 0), function(engine, content) {
            return artTemplate.compile(content);
        });
    };

    ArtTemplateEngine.prototype.render = function() {
        return this.handleRequest('render', slice.call(arguments, 0), function(engine, tpl, data) {
            return tpl(data);
        });
    };

    return ArtTemplateEngine;
});