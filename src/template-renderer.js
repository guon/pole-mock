define([
    'adapter/mustache',
    'adapter/arttemplate',
    'adapter/underscore',
    'var/slice'
], function(MustacheEngine, ArtTemplateEngine, UnderscoreEngine, slice) {

    var templateRenderer = {
        engines: {
            mustache: new MustacheEngine(),
            artTemplate: new ArtTemplateEngine(),
            underscore: new UnderscoreEngine()
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

    templateRenderer.engines.mustache.nextHandler = templateRenderer.engines.artTemplate;
    templateRenderer.engines.artTemplate.nextHandler = templateRenderer.engines.underscore;

    return templateRenderer;
});