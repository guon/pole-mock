define(['dot'], function(doT) {
    'use strict';

    function DoTEngine() {
        this.nextHandler = null;
    }

    DoTEngine.prototype = {
        constructor: DoTEngine,

        compile: function(engine, content) {
            if (engine == 'dot') {
                return doT.template(content);
            } else {
                return this.nextHandler ? this.nextHandler.compile(engine, content) : false;
            }
        }
    };

    return DoTEngine;
});