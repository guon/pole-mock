define([
        'adapter/mustache',
        'adapter/dot'
], function(MustacheEngine, DoTEngine) {

    var templateEngines = {
        mustache: new MustacheEngine(),
        doT: new DoTEngine()
    };

    templateEngines.mustache.nextHandler = templateEngines.doT;

    function createTemplateRenderer(engine, content) {
        if (engine) {
            return templateEngines.mustache.compile(engine.toLowerCase(), content);
        }
        return false;
    }

    return createTemplateRenderer;
});