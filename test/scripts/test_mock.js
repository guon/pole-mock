define(['core', 'mock'], function(pole) {
    return function() {
        module('Test Init Mock');

        asyncTest('普通mock配置项', function() {
            pole.initMock('data/mock-config', function() {
                ok(pole.url('main'), 'mock data url');
                ok(pole.tpl('templateMustache'), 'mustache模板');
                start();
            });
        });

        asyncTest('设置自定义模板', function() {
            pole.initMock('data/mock-config-custom', function() {
                equal(pole.defaultTemplateEngine, 'artTemplate', '自定义模板引擎');
                ok(pole.tpl('templateMustache'), 'mustache模板');
                ok(pole.tpl('templateArtTmpl'), 'artTemplate模板');
                start();
            });
        });
    };
});