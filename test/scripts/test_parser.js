define(['tag-parser'], function(tagParser) {
    return function() {
        var body = document.body;
        body.appendChild(document.createComment('PoleTemplateTag name="a" action="1" /EndTag'));
        body.appendChild(document.createComment(' PoleTemplateTag   name="b"   action="1"  /EndTag  '));
        body.appendChild(document.createComment('   PoleTemplateTag    name="c" action="1"  /EndTag'));
        body.appendChild(document.createComment('   PoleTemplateTag    name="d" action=""  /'));
        body.appendChild(document.createComment('   PoleTemplateTag    name="e" action=""'));
        body.appendChild(document.createComment('name="f" action="1" /EndTag'));
        body.appendChild(document.createComment('name="g" action="1" '));
        body.appendChild(document.createComment('PoleTemplateTag name="h" /EndTag'));
        body.appendChild(document.createComment('PoleFragmentTag name="i"  /EndTag'));
        body.appendChild(document.createComment('PoleFragmentTag /EndTag'));

        module('Test TagParser');

        test('parseParams', function() {
            deepEqual(tagParser.parseParams('name="a" action="xxx"'), { name: 'a', action: 'xxx' }, '');
            deepEqual(tagParser.parseParams('  name="a"   action="xxx"'), { name: 'a', action: 'xxx' }, '');
            deepEqual(tagParser.parseParams('  name="a" action '), { name: 'a' }, '');
            deepEqual(tagParser.parseParams('  name="a" action='), { name: 'a' }, '');
            deepEqual(tagParser.parseParams('name="a" action=""   '), { name: 'a', action: '' }, '');
        });

        test('getChildTags', function() {
            equal(tagParser.getChildTags('template', document.documentElement).length, 5, '解析PoleTemplateTag数量');
            equal(tagParser.getChildTags('fragment', document.documentElement).length, 2, '解析PoleFragmentTag数量');
        });
    };
});