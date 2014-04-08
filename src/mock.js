define([
    'core',
    'ajax',
    'tag-parser',
    'var/document',
    'var/suffix',
    'var/slice'
], function(pole, ajax, tagParser, document, suffix, slice) {
    'use strict';

    pole.mockMode = true;

    pole.initMock = function(configUrl, callbackFn) {
        var templateStatus = 0, // 模板文件加载状态
            templateLength = 0,
            templateReadyTimer,
            jsonpRe = /\.js$/i;

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
            url = suffix(url, 'tpl', '(tpl|tmpl)');
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
                if (jsonpRe.test(action)) {
                    ajax.getScript(action, loadTemplateMockDataSuccess, loadTemplateMockDataFailed);
                } else {
                    ajax.getJSON('GET', action, null, loadTemplateMockDataSuccess, loadTemplateMockDataFailed);
                }
            } else {
                renderTemplate(tag);
            }
        };

        var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            rtagName = /<([\w:]+)/,
            wrapMap = {
                // Support: IE 9
                option: [1, '<select multiple="multiple">', '</select>'],
                thead: [1, '<table>', '</table>' ],
                col: [2, '<table><colgroup>', '</colgroup></table>'],
                tr: [2, '<table><tbody>', '</tbody></table>'],
                td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
                _default: [0, '', '']
            };

        // Support: IE 9
        wrapMap.optgroup = wrapMap.option;
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;

        var renderTemplate = function(tag, data) {
            var parentNode = tag.node.parentNode,
                nextSibling = tag.node.nextSibling,
                html,
                fragment,
                tagName,
                wrap,
                tmp,
                i,
                nodes;

            html = pole.render(tag.params.name, data || {});

            fragment = document.createDocumentFragment();
            tmp = fragment.appendChild(document.createElement("div"));
            tagName = (rtagName.exec(html) || ['', ''])[1].toLowerCase();
            wrap = wrapMap[tagName] || wrapMap._default;
            tmp.innerHTML = wrap[1] + html.replace(rxhtmlTag, '<$1></$2>') + wrap[2];

            // Descend through wrappers to the right content
            i = wrap[0];
            while (i--) {
                tmp = tmp.lastChild;
            }
            nodes = slice.call(tmp.childNodes, 0);

            while (nodes.length > 0) {
                if (nextSibling) {
                    parentNode.insertBefore(nodes.shift(), nextSibling);
                } else {
                    parentNode.appendChild(nodes.shift());
                }
            }

            parentNode.removeChild(tag.node);
            tag.node = fragment = null;
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
                    pole.putActions(key, suffix(url, 'json', '(json|js)'));
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