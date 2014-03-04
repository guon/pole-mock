define([
    'adapter/mustache',
    'adapter/dot'
], function(MustacheEngine, DoTEngine) {

    var templateRenderer = {
        engines: {
            mustache: new MustacheEngine(),
            doT: new DoTEngine()
        },
        create: function(engine, content) {
            if (engine) {
                return this.engines.mustache.compile(engine.toLowerCase(), content);
            }
            return false;
        },
        render: function(engine, renderer, data) {
            if (engine) {
                return this.engines.mustache.render(engine.toLowerCase(), renderer, data);
            }
            return false;
        }
    };

    templateRenderer.engines.mustache.nextHandler = templateRenderer.engines.doT;

    return templateRenderer;
});