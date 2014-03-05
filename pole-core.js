/*! pole-mock v0.0.1 ~ (c) 2014 Max Zhang, https://github.com/polejs/pole-mock */
(function(window, undefined) {
    'use strict';

    var document = window.document;
    
    var slice = Array.prototype.slice;
    
    var formatRe = /\{(\d+)\}/g;
    var formatString = function(str) {
        var args = slice.call(arguments, 1);
        return str.replace(formatRe, function(m, i) {
            return args[i];
        });
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

    

    if (typeof define === 'function') {
        define('pole', ['mustache'], function() { return pole; });
    }

    if (typeof window === 'object' && typeof document === 'object') {
        window.pole = pole;
    }

}(window));