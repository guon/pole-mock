/*! pole-mock v0.0.1 ~ (c) 2014 Max Zhang, https://github.com/polejs/pole-mock */
(function(window, undefined) {
    'use strict';

    var document = window.document;
    
    var slice = Array.prototype.slice;
    
    var noop = function() {};
    
    var formatRe = /\{(\d+)\}/g;
    var formatString = function(str) {
        var args = slice.call(arguments, 1);
        return str.replace(formatRe, function(m, i) {
            return args[i];
        });
    };
    
    var suffix = function(str, postfix) {
        var re = new RegExp('.' + postfix + '$', 'i');
        return !re.test(str) ? str + '.' + postfix : str;
    };
    

    var pole = {
        // the version of pole-mock
        version: '0.0.1',

        // 默认模板引擎
        defaultTemplateEngine: 'mustache'
    };

    var actionMap = new HashMap();
    var templateMap = new HashMap();

    pole.putActions = function(actions, url) {
        var action, name;
        if (typeof actions === 'string') {
            action = {};
            action[actions] = url;
            pole.putActions(action);
            return;
        }
        for (name in actions) {
            actionMap.put(name, actions[name]);
        }
    };

    pole.action = function(name) {
        var url = actionMap.get(name);
        if (url) {
            return formatString.apply(null, [url].concat(slice.call(arguments, 1)));
        }
        return null;
    };

    pole.putTemplates = function(templates, content) {
        var tpl, name;
        if (typeof templates === 'string') {
            tpl = {};
            tpl[templates] = content;
            pole.putTemplates(tpl);
            return;
        }
        for (name in templates) {
            tpl = {};
            if (typeof templates[name] === 'string') {
                tpl.content = templates[name];
                tpl.engine = pole.defaultTemplateEngine;
            } else {
                tpl.content = templates[name].content;
                tpl.engine = templates[name].engine || pole.defaultTemplateEngine;
            }
            templateMap.put(name, tpl);
        }
    };

    pole.template = function(name) {
        var tpl = templateMap.get(name);
        if (tpl) {
            if (!tpl.renderer) {
                tpl.renderer = templateRenderer.create(tpl.engine, tpl.content);
            }
            return tpl.renderer;
        }
        return null;
    };

    pole.render = function(name, data) {
        var tpl = templateMap.get(name);
        if (tpl) {
            if (!tpl.renderer) {
                tpl.renderer = templateRenderer.create(tpl.engine, tpl.content);
            }
            return templateRenderer.render(tpl.engine, tpl.renderer, data);
        }
        return false;
    };

    // pole.action的快捷方法
    pole.url = pole.action;

    // pole.template的快捷方法
    pole.tpl = pole.template;

    

    function HashMap(keyFn) {
        this.map = {};
        this.length = 0;
        if (keyFn) {
            this.getKey = keyFn;
        }
    }

    HashMap.prototype.size = function() {
        return this.length;
    };

    HashMap.prototype.getKey = function(o) {
        return o.id;
    };

    HashMap.prototype.put = function(key, value) {
        if (value === undefined) {
            value = key;
            key = this.getKey(value);
        }

        if (!this.hasKey(key)) {
            ++this.length;
        }
        Object.defineProperty(this.map, key, {
            value: value,
            writable: true,
            enumerable: true,
            configurable: true
        });

        return value;
    };

    HashMap.prototype.get = function(key) {
        return this.map[key];
    };

    HashMap.prototype.remove = function(key) {
        if (this.hasKey(key)) {
            delete this.map[key];
            --this.length;
            return true;
        }
        return false;
    };

    HashMap.prototype.clear = function() {
        this.map = {};
        this.length = 0;
        return this;
    };

    HashMap.prototype.hasKey = function(key) {
        return this.map[key] !== undefined;
    };

    HashMap.prototype.has = function(value) {
        var ret = false;
        this.each(function(key, val) {
            if (value === val) {
                ret = true;
                return false;
            }
        });
        return ret;
    };

    HashMap.prototype.keys = function() {
        return this.getData(true);
    };

    HashMap.prototype.values = function() {
        return this.getData(false);
    };

    HashMap.prototype.getData = function(isKey) {
        var arr = [];
        this.each(function(key, value) {
            arr.push(isKey ? key : value);
        });
        return arr;
    };

    HashMap.prototype.each = function(fn, scope) {
        var items = this.map,
            key,
            length = this.length;

        scope = scope || this;
        for (key in items) {
            if (items.hasOwnProperty(key)) {
                if (fn.call(scope, key, items[key], length) === false) {
                    break;
                }
            }
        }
        return this;
    };

    HashMap.prototype.clone = function() {
        var map = new HashMap();
        this.each(function(key, value) {
            map.put(key,value);
        });
        return map;
    };

    

    function MustacheEngine() {
        this.nextHandler = null;
    }

    MustacheEngine.prototype.engine = 'mustache';

    MustacheEngine.prototype.compile = function(engine, content) {
        if (engine == this.engine) {
            Mustache.parse(content);
            return content;
        } else {
            return this.nextHandler ? this.nextHandler.compile(engine, content) : false;
        }
    };

    MustacheEngine.prototype.render = function(engine, tpl, data) {
        if (engine == this.engine) {
            return Mustache.render(tpl, data);
        } else {
            return this.nextHandler ? this.nextHandler.render(engine, tpl, data) : false;
        }
    };

    

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

    

    var templateRenderer = {
        engines: {
            mustache: new MustacheEngine(),
            doT: new DoTEngine()
        },
        create: function(engine, content) {
            if (engine) {
                return this.engines.mustache.compile(engine.toLowerCase(), content);
            }
            return false;
        },
        render: function(engine, renderer, data) {
            if (engine) {
                return this.engines.mustache.render(engine.toLowerCase(), renderer, data);
            }
            return false;
        }
    };

    templateRenderer.engines.mustache.nextHandler = templateRenderer.engines.doT;

    

    var ajax = (function() {
        var getXhrInstance = (function() {
            var options = [function() {
                    return new XMLHttpRequest();
                }, function() {
                    return new ActiveXObject('MSXML2.XMLHTTP.3.0');
                }, function() {
                    return new ActiveXObject('MSXML2.XMLHTTP');
                }, function() {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }],
                i = 0,
                len = options.length,
                xhr;

            for (; i < len; ++i) {
                try {
                    xhr = options[i];
                    xhr();
                    break;
                } catch(e) {
                }
            }
            return xhr;
        }());

        function send(method, url, data, successFn, failFn, headers) {
            var xhr = getXhrInstance(),
                xhrTimeout,
                key;

            if (arguments.length === 2) {
                successFn = url;
                url = method;
                method = null;
            } else if (arguments.length === 3) {
                successFn = data;
                data = url;
                url = method;
                method = null;
            }

            successFn = successFn || noop;
            failFn = failFn || noop;
            headers = headers || {};
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            }
            if (!headers['X-Requested-With']) {
                headers['X-Requested-With'] = 'XMLHttpRequest';
            }

            xhr.open(method || 'GET', url, true);

            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            }

            xhrTimeout = setTimeout(function() {
                clearTimeout(xhrTimeout);
                xhrTimeout = null;
                abortXhr(xhr);
                failFn('TIMEOUT');
            }, 300000);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    clearTimeout(xhrTimeout);
                    if (xhr.status === 200) {
                        successFn(xhr.responseText);
                    } else {
                        failFn(xhr, 'ERROR');
                    }
                    xhr = null;
                }
            };
            xhr.send(data);
        }

        function getJSON(method, url, data, successFn, failFn, headers) {
            if (arguments.length === 2) {
                successFn = url;
                url = method;
                method = null;
            } else if (arguments.length === 3) {
                successFn = data;
                data = url;
                url = method;
                method = null;
            }

            successFn = successFn || noop;
            var successFnProxy = function(response) {
                successFn(JSON.parse(response));
            };

            headers = headers || {};
            headers['Content-Type'] = 'application/json';
            send(method, url, data, successFnProxy, failFn, headers);
        }

        function abortXhr(xhr) {
            try {
                xhr.onreadystatechange = null;
            } catch (e) {
                xhr = noop;
            }
            xhr.abort();
            xhr = null;
        }

        return {
            send: send,
            getJSON: getJSON
        };
    }());

    

    pole.initMock = function(configUrl, callbackFn) {
        var templateStatus = 0, // 模板文件加载状态
            templateLength = 0,
            templateReadyTimer,
            commentNodeType = document.COMMENT_NODE,
            poleTags = 'Template|Fragment';

        function templateReady(fn) {
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

        function loadTemplate() {
            var templateTags = parseTemplateTag(getAllCommentNodes(document.documentElement));

            templateStatus = 0;
            templateLength = templateTags.length;
            templateReadyTimer = null;

            templateTags.forEach(function(tag) {
                loadTemplateMockData(tag);
            });
            templateReady(callbackFn);
        }

        function loadTemplateMockData(tag) {
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
        }

        function renderTemplate(tag, data) {
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
        }

        function getAllCommentNodes(node) {
            var result = [],
                childNodes = node.childNodes,
                i = 0,
                len;

            if (node.nodeType === commentNodeType) {
                result.push(node);
            } else if (childNodes) {
                len = childNodes.length;
                for (; i < len; i++) {
                    result = result.concat(getAllCommentNodes(childNodes[i]));
                }
            }
            return result;
        }

        function parseTemplateTag(nodes) {
            var tags = [],
                parser = function(node) {
                    var ret;
                    var content = node.data.trim();
                    var matches = content.match(new RegExp('^(Pole(?:' + poleTags + ')Tag)\\s(.*)(?:\\/|\\/EndTag)$'));
                    if (matches) {
                        ret = {
                            node: node,
                            content: content,
                            type: matches[1],
                            params: parseParams(matches[2])
                        };
                    }
                    return ret;
                },
                parseParams = (function() {
                    var re = /(\w+)="([^=]*)"/gi;
                    return function(str) {
                        var result, params = {};
                        while ((result = re.exec(str)) !== null) {
                            params[result[1]] = result[2];
                        }
                        return params;
                    };
                }());
            nodes.forEach(function(node) {
                var tag = parser(node);
                if (tag && tag.type == 'PoleTemplateTag') {
                    tags.push(tag);
                }
            });
            return tags;
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


    if (typeof define === 'function') {
        define('pole', [], function() { return pole; });
    }

    if (typeof window === 'object' && typeof document === 'object') {
        window.pole = pole;
    }

}(window));