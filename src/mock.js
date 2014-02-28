define([
        'core',
        'ajax',
        'var/document'
], function(pole, ajaxSend, document) {
    'use strict';

    pole.initMock = function(configSrc, callbackFn) {
        ajaxSend(configSrc + /\.json$/.test(configSrc) ? '' : '.json' , function (response) {

        });
    };

    (function() {
        var scripts = document.getElementsByTagName('script'),
            mockScriptNode,
            configSrc,
            mainScriptSrc;

        if (scripts) {
            for (var i = 0, len = scripts.length; i < len; i++) {
                if (/pole\-mock\.js$/.test(scripts[i].src)) {
                    mockScriptNode = scripts[i];
                    configSrc = mockScriptNode.getAttribute('data-config');
                    mainScriptSrc = mockScriptNode.getAttribute('data-main');
                    break;
                }
            }
            if (configSrc) {
                pole.initMock(configSrc, function() {
                    if (mainScriptSrc) {

                    }
                });
            }
        }
    }());

});