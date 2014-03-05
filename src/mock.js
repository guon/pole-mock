define([
    'core',
    'ajax',
    'tag-parser',
    'var/document',
    'var/suffix'
], function(pole, ajax, tagParser, document, suffix) {
    'use strict';

    pole.initMock = function(configUrl, callbackFn) {
        var templateStatus = 0, // 模板文件加载状态
            templateLength = 0,
            templateReadyTimer;

        var templateReady = function(fn) {
            clearTimeout(templateReadyTimer);
            if (templateStatus === -1) {
                return;
            } else if (templateStatus < templateLength) {
                templateReadyTimer = setTimeout(function() { templateReady(fn); }, 50);
                return;
            }
            if (fn) {
                fn();
            }
        };

        var requestTemplate = function(name, options) {
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
        };

        var loadTemplate = function() {
            var templateTags = tagParser.getChildTags('template', document.documentElement);

            templateStatus = 0;
            templateLength = templateTags.length;
            templateReadyTimer = null;

            templateTags.forEach(function(tag) {
                loadTemplateMockData(tag);
            });
            templateReady(callbackFn);
        };

        var loadTemplateMockData = function(tag) {
            var action = pole.url(tag.params.action);
            if (action) {
                ajax.getJSON('GET', action, null, function(response) {
                    if (templateStatus !== -1) {
                        renderTemplate(tag, response);
                        templateStatus++;
                    }
                }, function() {
                    templateStatus = -1;
                    throw '加载模板mock数据失败：' + action;
                });
            } else {
                renderTemplate(tag);
            }
        };

        var renderTemplate = function(tag, data) {
            var parentNode = tag.node.parentNode,
                nextSibling = tag.node.nextSibling,
                fragment,
                div,
                i = 0,
                len,
                childNodes;

            fragment = pole.render(tag.params.name, data || {});
            div = document.createElement('div');
            div.innerHTML = fragment;

            childNodes = div.childNodes;
            len = childNodes.length;

            for (; i < len; i++) {
                if (nextSibling) {
                    parentNode.insertBefore(childNodes[i], nextSibling);
                } else {
                    parentNode.appendChild(childNodes[i]);
                }
            }

            parentNode.removeChild(tag.node);
            tag.node = div = null;
        };

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
                templateReady(loadTemplate);
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