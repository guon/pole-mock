define([
        'hashmap',
        'template-renderer',
        'var/document',
        'var/slice',
        'var/format-string'
], function(HashMap, createTemplateRenderer, document, slice, formatString) {
    'use strict';

    var pole = {
        // the version of pole-mock
        version: '@VERSION',

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

    return pole;
});