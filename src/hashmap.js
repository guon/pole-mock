define(function() {
    'use strict';

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

    return HashMap;
});