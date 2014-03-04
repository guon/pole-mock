define(function() {
    'use strict';

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

    return HashMap;
});