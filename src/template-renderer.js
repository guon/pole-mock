define([
    'adapter/mustache',
    'adapter/dot',
    'var/slice'
], function(MustacheEngine, DoTEngine, slice) {

    var templateRenderer = {
        engines: {
            mustache: new MustacheEngine(),
            doT: new DoTEngine()
        },

        handle: function(method, args) {
            var handler = this.engines.mustache;
            if (args && args[0]) {
                args[0] = args[0].toLowerCase();
                return handler[method].apply(handler, args);
            }
            return false;
        },

        create: function(engine, content) {
            return this.handle('compile', slice.call(arguments, 0));
        },

        render: function(engine, renderer, data) {
            return this.handle('render', slice.call(arguments, 0));
        }
    };

    templateRenderer.engines.mustache.nextHandler = templateRenderer.engines.doT;

    return templateRenderer;
});