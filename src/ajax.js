define(['var/noop'], function(noop) {
    'use strict';

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
                failFn();
            }, 300000);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    clearTimeout(xhrTimeout);
                    if (xhr.status === 200) {
                        successFn(xhr.responseText);
                    } else {
                        failFn(xhr);
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

    return ajax;
});