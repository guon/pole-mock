define([
    'core',
    'ajax',
    'tag-parser',
    'var/document',
    'var/suffix',
], function(pole, ajax, tagParser, document, suffix) {
    'use strict';

    pole.mockMode = true;

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
            url = /\.tmpl$/i.test(url) ? url : suffix(url, 'tpl');
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
            var action = pole.url.apply(pole, [tag.params.action].concat(tag.params.actionArgs ? tag.params.actionArgs.split(',') : []));

            var loadTemplateMockDataSuccess = function(response) {
                    if (templateStatus !== -1) {
                        renderTemplate(tag, response);
                        templateStatus++;
                    }
                },
                loadTemplateMockDataFailed = function() {
                    templateStatus = -1;
                    throw '加载模板mock数据失败：' + action;
                };

            if (action) {
                if (/\.jsonp/i.test(action)) {
                    ajax.getScript(action, loadTemplateMockDataSuccess, loadTemplateMockDataFailed);
                } else {
                    ajax.getJSON('GET', action, null, loadTemplateMockDataSuccess, loadTemplateMockDataFailed);
                }
            } else {
                renderTemplate(tag);
            }
        };

        var renderTemplate = function(tag, data) {
            var parentNode = tag.node.parentNode,
                nextSibling = tag.node.nextSibling,
                fragment,
                div,
                childNodes,
                childNode;

            fragment = pole.render(tag.params.name, data || {});
            div = document.createElement('div');
            div.innerHTML = fragment;

            childNodes = div.childNodes;

            while (childNodes.length > 0) {
                childNode = Array.prototype.unshift.call(childNodes);
                if (nextSibling) {
                    parentNode.insertBefore(childNode, nextSibling);
                } else {
                    parentNode.appendChild(childNode);
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
                key,
                url;

            if (engine) {
                pole.defaultTemplateEngine = engine;
            }
            if (actions) {
                for (key in actions) {
                    url = actions[key];
                    if (typeof url === 'object') {
                        url = url.mock;
                    }
                    pole.putActions(key, /\.jsonp$/i.test(url) ? url : suffix(url, 'json'));
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
});