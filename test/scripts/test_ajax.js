define(['ajax'], function(ajax) {
    return function() {
        module('Test Ajax');

        asyncTest('ajax getJSON', function() {
            ajax.getJSON('data/mock-config.json', function(response) {
                ok(response, '使用AJAX获取json数据');
                start();
            });
        });

        asyncTest('ajax getScript', function() {
            ajax.getScript('data/getscript.jsonp');
        });
    };
});

function callback1(response) {
    ok(response, 'test JSONP');
    start();
};