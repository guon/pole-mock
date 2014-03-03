require(['ajax'], function(ajax) {
    module('Test Ajax');

    asyncTest('ajax getJSON', function() {
        ajax.getJSON('data/mock-config.json', function(response) {
            ok(response, '使用AJAX获取json数据');
            start();
        });
    });
});