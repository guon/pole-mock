define([
        'core',
        'ajax',
        'var/document'
], function(pole, ajaxSend, document) {
    'use strict';

    pole.initMock = function(configSrc, callbackFn) {
        /*
         * pole-mock-config格式：
         *  {
         *      "templateEngine": "mustache", // 默认模板引擎为"mustache"
         *      "actions": {
         *          "xxx": "mock data url" // 本地mock数据url，键值对格式
         *      },
         *      "templates": {
         *          "xxx": "template url" // 本地模板url，键值对格式
         *      }
         *  }
         */
        ajaxSend(configSrc + /\.json$/.test(configSrc) ? '' : '.json', function(response) {
            var actions = response.actions,
                templates = response.templates,
                key;
            /*if (actions) {
                for (key in response.)
            }*/

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