/*! pole-mock v0.0.1 ~ (c) 2014 Max Zhang, https://github.com/polejs/pole-mock */
(function(window, undefined) {
    'use strict';

    var document = window.document;
    
    var slice = Array.prototype.slice;
    
    var formatRe = /\{(\d+)\}/g;
    function formatString(str) {
        var args = slice.call(arguments, 1);
        return str.replace(formatRe, function(m, i) {
            return args[i];
        });
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

    

    if (typeof define === 'function') {
        define('pole', [], function() { return pole; });
    }

    if (typeof window === 'object' && typeof document === 'object') {
        window.pole = pole;
    }

}(window));