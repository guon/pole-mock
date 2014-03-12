define(['var/document'], function(document) {
    'use strict';

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
            var matches = content.match(/^(Pole(?:Template|Fragment)Tag)\s([^\-<>]*)(?:\/|\/EndTag)$/);
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
            type = 'pole' + (type || 'template').toLowerCase() + 'tag';
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

    return tagParser;
});