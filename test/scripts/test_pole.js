define(['core', 'mustache'], function(pole, Mustache) {
    return function() {
        module('Test Pole Method');

        test('putActions', function() {
            pole.putActions('main', 'xxx.json');
            equal(pole.url('main'), 'xxx.json', '添加一个action');

            pole.putActions({
                'main1': 'xxx1.json',
                'main2': 'xxx2.json'
            });
            equal(pole.url('main1'), 'xxx1.json', '添加多个action');
            equal(pole.url('main2'), 'xxx2.json', '添加多个action');
        });

        test('putTemplates', function() {
            pole.putTemplates('main', '<h1>{{message}}</h1>');
            equal(pole.tpl('main'), '<h1>{{message}}</h1>', '添加一个模板');
            equal(Mustache.render(pole.tpl('main'), { message: 'Hello World!'}), '<h1>Hello World!</h1>', '渲染模板');

            pole.putTemplates({
                'main1': '<h1>{{message1}}</h1>',
                'main2': '<h1>{{message2}}</h1>'
            });
            equal(pole.tpl('main1'), '<h1>{{message1}}</h1>', '添加多个模板');
            equal(pole.tpl('main2'), '<h1>{{message2}}</h1>', '添加多个模板');

            pole.defaultTemplateEngine = 'artTemplate';
            pole.putTemplates('main3', '<h1><%= message %></h1>');
            equal(pole.tpl('main3')({ message: 'Hello World!'}), '<h1>Hello World!</h1>', '自定义默认模板引擎');
        });
    };
});