define(['dot'], function(doT) {
    'use strict';

    function DoTEngine() {
        this.nextHandler = null;
    }

    DoTEngine.prototype.engine = 'dot';

    DoTEngine.prototype.compile = function(engine, content) {
        if (engine == 'dot') {
            return doT.template(content);
        } else {
            return this.nextHandler ? this.nextHandler.compile(engine, content) : false;
        }
    };

    DoTEngine.prototype.render = function(engine, tpl, data) {
        if (engine == this.engine) {
            return tpl(data);
        } else {
            return this.nextHandler ? this.nextHandler.render(engine, tpl, data) : false;
        }
    };

    return DoTEngine;
});