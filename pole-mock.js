/*! pole-mock v0.0.10 ~ (c) 2014 Pole Team, https://github.com/polejs/pole-mock */
(function(window, undefined) {
    'use strict';

    var document = window.document;
    
    var slice = Array.prototype.slice;
    
    var noop = function() {};
    
    var formatString = function(str) {
        var args = slice.call(arguments, 1);
        return str.replace(/\{(\d+)\}/g, function(m, i) {
            return args[i];
        });
    };
    
    var suffix = function(str, postfix) {
        var re = new RegExp('.' + postfix + '$', 'i');
        return !re.test(str) ? str + '.' + postfix : str;
    };
    

    var pole = {
        // the version of pole-mock
        version: '0.0.10',

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

    MustacheEngine.prototype.handleRequest = function(method, args, fn) {
        if (args[0] === this.engine) {
            return fn.apply(this, args);
        } else {
            return this.nextHandler ? this.nextHandler[method].apply(this.nextHandler, args) : false;
        }
    };

    MustacheEngine.prototype.compile = function() {
        return this.handleRequest('compile', slice.call(arguments, 0), function(engine, content) {
            Mustache.parse(content);
            return content;
        });
    };

    MustacheEngine.prototype.render = function() {
        return this.handleRequest('render', slice.call(arguments, 0), function(engine, tpl, data) {
            return Mustache.render(tpl, data);
        });
    };

    

    function ArtTemplateEngine() {
        this.nextHandler = null;
    }

    ArtTemplateEngine.prototype.engine = 'arttemplate';

    ArtTemplateEngine.prototype.handleRequest = MustacheEngine.prototype.handleRequest;

    ArtTemplateEngine.prototype.compile = function() {
        return this.handleRequest('compile', slice.call(arguments, 0), function(engine, content) {
            return artTemplate.compile(content);
        });
    };

    ArtTemplateEngine.prototype.render = function() {
        return this.handleRequest('render', slice.call(arguments, 0), function(engine, tpl, data) {
            return tpl(data);
        });
    };

    

    function UnderscoreEngine() {
        this.nextHandler = null;
    }

    UnderscoreEngine.prototype.engine = 'underscore';

    UnderscoreEngine.prototype.handleRequest = MustacheEngine.prototype.handleRequest;

    UnderscoreEngine.prototype.compile = function() {
        return this.handleRequest('compile', slice.call(arguments, 0), function(engine, content) {
            return _.template(content);
        });
    };

    UnderscoreEngine.prototype.render = function() {
        return this.handleRequest('render', slice.call(arguments, 0), function(engine, tpl, data) {
            return tpl(data);
        });
    };

    

    var templateRenderer = {
        engines: {
            mustache: new MustacheEngine(),
            artTemplate: new ArtTemplateEngine(),
            underscore: new UnderscoreEngine()
        },

        handle: function(method, args) {
            var handler = this.engines.mustache;
            if (args && args[0]) {
                args[0] = args[0].toLowerCase();
                return handler[method].apply(handler, args);
            }
            return false;
        },

        create: function(engine, content) {
            return this.handle('compile', slice.call(arguments, 0));
        },

        render: function(engine, renderer, data) {
            return this.handle('render', slice.call(arguments, 0));
        }
    };

    templateRenderer.engines.mustache.nextHandler = templateRenderer.engines.artTemplate;
    templateRenderer.engines.artTemplate.nextHandler = templateRenderer.engines.underscore;

    

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

        function getScript(url, successFn, failFn) {
            var script = document.createElement('script'),
                cb = function() {
                    document.head.removeChild(script);
                    script = null;
                };

            successFn = successFn || noop;
            failFn = failFn || noop;

            script.type = 'text/javascript';
            script.src = url;
            script.addEventListener('load', function() {
                cb();
                successFn();
            });
            script.addEventListener('error', function() {
                cb();
                failFn();
            });
            document.head.appendChild(script);
        }

        return {
            send: send,
            getJSON: getJSON,
            getScript: getScript
        };
    }());

    

    var tagParser = (function() {
        var commentNodeType = document.COMMENT_NODE,
            paramsRe = /(\w+)="([^=]*)"/gi;

        var filterCommentNodes = function(node) {
            var result = [],
                childNodes = node.childNodes,
                i = 0,
                len;

            if (node.nodeType === commentNodeType) {
                result.push(node);
            } else if (childNodes) {
                len = childNodes.length;
                for (; i < len; i++) {
                    result = result.concat(filterCommentNodes(childNodes[i]));
                }
            }
            return result;
        };

        var parseTag = function(node) {
            var ret;
            var content = node.data.trim();
            var matches = content.match(/^Pole(Template|Fragment)Tag\s(.*)\/(?:EndTag)?$/);
            if (matches) {
                ret = {
                    node: node,
                    content: content,
                    type: matches[1],
                    params: parseParams(matches[2])
                };
            }
            return ret;
        };

        var parseParams = function(str) {
            var result, params = {};
            while ((result = paramsRe.exec(str)) !== null) {
                params[result[1]] = result[2];
            }
            return params;
        };

        var getTags = function(type, nodes) {
            var tags = [];
            if (!nodes) {
                nodes = type;
                type = null;
            }
            type = (type || 'template').toLowerCase();
            nodes.forEach(function(node) {
                var tag = parseTag(node);
                if (tag && tag.type.toLowerCase() === type) {
                    tags.push(tag);
                }
            });
            return tags;
        };

        var getChildTags = function(type, parentNode) {
            return getTags(type, filterCommentNodes(parentNode));
        };

        return {
            parseParams: parseParams,
            parseTag: parseTag,
            getTags: getTags,
            getChildTags: getChildTags
        };
    }());

    

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
                childNodes;

            fragment = pole.render(tag.params.name, data || {});
            div = document.createElement('div');
            div.innerHTML = fragment;

            childNodes = div.childNodes;

            while (childNodes && childNodes.length > 0) {
                if (nextSibling) {
                    parentNode.insertBefore(childNodes[0], nextSibling);
                } else {
                    parentNode.appendChild(childNodes[0]);
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


    if (typeof define === 'function') {
        define('pole', [], function() { return pole; });
    }

    if (typeof window === 'object' && typeof document === 'object') {
        window.pole = pole;
    }

}(window));