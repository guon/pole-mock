define([
    'pole',
    'var/suffix'
], function(pole, suffix) {
    'use strict';

    (function() {
        var scripts = document.getElementsByTagName('script'),
            mockScriptNode,
            configUrl,
            mainScriptSrc,
            mainScriptNode;

        var mainInit = function() {
            if (mainScriptSrc) {
                mainScriptNode = document.createElement('script');
                mainScriptNode.src = suffix(mainScriptSrc, 'js');
                mainScriptNode.type = 'text/javascript';
                if (mockScriptNode.nextSibling) {
                    mockScriptNode.parentNode.insertBefore(mainScriptNode, mockScriptNode.nextSibling);
                } else {
                    mockScriptNode.parentNode.appendChild(mainScriptNode);
                }
            }
        };

        if (scripts) {
            for (var i = 0, len = scripts.length; i < len; i++) {
                if (/pole\-mock\.js$/.test(scripts[i].src)) {
                    mockScriptNode = scripts[i];
                    configUrl = mockScriptNode.getAttribute('data-config');
                    mainScriptSrc = mockScriptNode.getAttribute('data-main');
                    break;
                }
            }
            if (pole.mockMode === true && configUrl) {
                pole.initMock(configUrl, mainInit);
            } else {
                mainInit();
            }
        }
    }());
});