/*! pole-mock v0.0.1 ~ (c) 2014 Max Zhang, https://github.com/polejs/pole-mock */
(function(window, undefined) {
    'use strict';

    var document = window.document;
    
    var slice = Array.prototype.slice;
    
    function noop() {}
    
    var formatRe = /\{(\d+)\}/g;
    function formatString(str) {
        var args = slice.call(arguments, 1);
        return str.replace(formatRe, function(m, i) {
            return args[i];
        });
    }
    
    function suffix(str, postfix) {
        var re = new RegExp('.' + postfix + '$', 'i');
        return !re.test(str) ? str + '.' + postfix : str;
    }
    

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
            } else {
                tpl.content = templates[name].content;
                tpl.engine = templates[name].engine;
            }
            templateMap.put(name, tpl);
        }
    };

    pole.template = function(name) {
        var tpl = templateMap.get(name);
        if (!tpl.renderer) {
            tpl.renderer = createTemplateRenderer(tpl.engine || pole.defaultTemplateEngine, tpl.content);
        }
        return tpl.renderer;
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

    HashMap.prototype = {
        constructor: HashMap,

        size: function() {
            return this.length;
        },

        getKey: function(o) {
            return o.id;
        },

        put: function(key, value) {
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
        },

        get: function(key) {
            return this.map[key];
        },

        remove: function(key) {
            if (this.hasKey(key)) {
                delete this.map[key];
                --this.length;
                return true;
            }
            return false;
        },

        clear: function() {
            this.map = {};
            this.length = 0;
            return this;
        },

        hasKey: function(key) {
            return this.map[key] !== undefined;
        },

        has: function(value) {
            var ret = false;
            this.each(function(key, val) {
                if (value === val) {
                    ret = true;
                    return false;
                }
            });
            return ret;
        },

        keys: function() {
            return this.getData(true);
        },

        values: function() {
            return this.getData(false);
        },

        getData: function(isKey) {
            var arr = [];
            this.each(function(key, value) {
                arr.push(isKey ? key : value);
            });
            return arr;
        },

        each: function(fn, scope) {
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
        },

        clone: function() {
            var map = new HashMap();
            this.each(function(key, value) {
                map.put(key,value);
            });
            return map;
        }
    };

    

    function MustacheEngine() {
        this.nextHandler = null;
    }

    MustacheEngine.prototype = {
        constructor: MustacheEngine,

        compile: function(engine, content) {
            if (engine == 'mustache') {
                Mustache.parse(content);
                return content;
            } else {
                return this.nextHandler ? this.nextHandler.compile(engine, content) : false;
            }
        }
    };

    

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

    

    var templateEngines = {
        mustache: new MustacheEngine(),
        doT: new DoTEngine()
    };

    templateEngines.mustache.nextHandler = templateEngines.doT;

    function createTemplateRenderer(engine, content) {
        if (engine) {
            return templateEngines.mustache.compile(engine.toLowerCase(), content);
        }
        return false;
    }

    

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



    pole.parser = '';



    if (typeof define === 'function') {
        define('pole', [], function() { return pole; });
    }

    if (typeof window === 'object' && typeof document === 'object') {
        window.pole = pole;
    }

}(window));