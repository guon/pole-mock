define(['hashmap'], function(HashMap) {
    return function() {
        module('Test HashMap', {
            setup: function() {
                this.map = new HashMap();
            }
        });

        test('put value', function() {
            this.map.put(1, 'number 1');
            equal('number 1', this.map.get(1), '添加number类型key 1 可以取到值"value"');
            equal('number 1', this.map.get('1'), '使用string类型key "1" 可以取到值"value"');
            equal(this.map.size(), 1, 'map长度 1');

            this.map.put('1', 'string 1');
            ok(this.map.get('1'), '添加string类型key "1" 覆盖number类型key 1');
            equal('string 1', this.map.get(1), '使用number类型key 1 可以取到值"string 1"');
            equal('string 1', this.map.get('1'), '使用string类型key "1" 可以取到值"string 1"');
            equal(this.map.size(), 1, 'map长度 1');

            var objVal = {
                id: 'obj',
                value: 'object'
            };
            this.map.put(objVal);
            equal(objVal, this.map.get('obj'), '添加对象，使用obj.id做为key');
            equal(this.map.size(), 2, 'map长度 2');

            var objVal1 = {
                id: '1',
                value: 'object 1'
            };
            this.map.put(objVal1);
            ok(this.map.get('1'), '添加object类型值，会覆盖key "1"');
            equal(objVal1, this.map.get('1'), '使用string类型key "1" 可以取到对象');
            equal(this.map.size(), 2, 'map长度 2');
        });

        test('remove value', function() {
            this.map.put('1', 'value');
            this.map.remove('1');
            strictEqual(this.map.get('1'), undefined, '移除key，值为普通string');

            var objVal = {
                id: 'obj',
                value: 'object'
            };
            this.map.put(objVal);
            this.map.remove('obj');
            strictEqual(this.map.get('obj'), undefined, '移除key，值为对象');

            this.map.put('1', 'val1');
            this.map.put('2', 'val2');
            this.map.put('3', 'val3');
            this.map.clear();
            equal(this.map.size(), 0, '清空map，map长度 0');
        });

        test('get value', function() {
            this.map.put('1', 'val1');
            this.map.put('2', 'val2');
            this.map.put('3', 'val3');

            deepEqual(this.map.keys(), ['1', '2', '3'], '获取keys');
            deepEqual(this.map.values(), ['val1', 'val2', 'val3'], '获取values');
        });

        test('clone map', function() {
            this.map.put('1', 'val1');
            this.map.put('2', 'val2');
            this.map.put('3', 'val3');

            var cloneMap = this.map.clone();

            deepEqual(this.map.keys(), cloneMap.keys(), '对比keys');
            deepEqual(this.map.values(), cloneMap.values(), '对比values');
            deepEqual(this.map.size(), cloneMap.size(), '对比map长度');
        });

        test('others', function() {
            this.map.getKey = function(o) {
                return o.sid;
            };

            var objVal = {
                sid: 'obj',
                value: 'object'
            };
            this.map.put(objVal);
            ok(this.map.hasKey('obj'), '验证key是否存在');
            ok(this.map.has(objVal), '验证value是否存在');
        });
    };
});