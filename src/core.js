define([
    'hashmap',
    'template-renderer',
    'var/document',
    'var/slice',
    'var/format-string'
], function(HashMap, templateRenderer, document, slice, formatString) {
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

    return pole;
});