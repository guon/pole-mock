define([
        'core',
        'ajax',
        'var/document',
        'var/suffix'
], function(pole, ajax, document, suffix) {
    'use strict';

    pole.initMock = function(configUrl, callbackFn) {
        var templateStatus = 0, // 模板文件加载状态
            templateLength = 0,
            templateReadyTimer;

        function templateReady() {
            clearTimeout(templateReadyTimer);
            if (templateStatus === -1) {
                return;
            } else if (templateStatus < templateLength) {
                templateReadyTimer = setTimeout(templateReady, 50);
                return;
            }
            renderTemplate();
        }

        function requestTemplate(name, options) {
            var url, engine;
            if (typeof options === 'string') {
                url = options;
            } else {
                url = options.url;
                engine = options.engine;
            }
            url = suffix(url, 'tpl');
            ajax.send('GET', url, null, function(response) {
                if (templateStatus !== -1) {
                    pole.putTemplates(name, {
                        content: response,
                        engine: engine
                    });
                    templateStatus++;
                }
            }, function() {
                templateStatus = -1;
                throw '加载模板文件失败：' + url;
            }, {
                'Content-Type': 'text/plain'
            });
        }

        function renderTemplate() {


            if (callbackFn) {
                callbackFn();
            }
        }

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
        configUrl = suffix(configUrl, 'json');
        ajax.getJSON('GET', configUrl, null, function(response) {
            var engine = response.templateEngine,
                actions = response.actions,
                templates = response.templates,
                key;

            if (engine) {
                pole.defaultTemplateEngine = engine;
            }
            if (actions) {
                for (key in actions) {
                    pole.putActions(key, suffix(actions[key], 'json'));
                }
            }
            if (templates) {
                for (key in templates) {
                    ++templateLength;
                }
                for (key in templates) {
                    requestTemplate(key, templates[key]);
                }
                templateReady();
            }
        }, function() {
            throw '加载mock配置文件失败：' + configUrl;
        });
    };

    (function() {
        var scripts = document.getElementsByTagName('script'),
            mockScriptNode,
            configUrl,
            mainScriptSrc,
            mainScriptNode;

        if (scripts) {
            for (var i = 0, len = scripts.length; i < len; i++) {
                if (/pole\-mock\.js$/.test(scripts[i].src)) {
                    mockScriptNode = scripts[i];
                    configUrl = mockScriptNode.getAttribute('data-config');
                    mainScriptSrc = mockScriptNode.getAttribute('data-main');
                    break;
                }
            }
            if (configUrl) {
                pole.initMock(configUrl, function() {
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
                });
            }
        }
    }());

});