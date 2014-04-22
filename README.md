pole-mock
=========
Pole Mock是Pole的一个重要组成部分，它主要包含两个模块：```PoleTag（html标签）```和```JavaScript API```。

命令行执行安装```pole-mock```：
```shell
npm install pole-mock --save-dev
```

Mock配置文件
------------
在项目中应用Pole Mock，必须创建```pole-mock-config.json```配置描述文件，配置项如下：

#### templateEngine : String
指定Web应用使用的模版引擎，默认为'mustache'，取值范围：'mustache'、'arttemplate'、'underscore'。

目前支持的模版引擎包括：Mustache、ArtTemplate、Underscore Template。

#### templates : Object
指定模版，键值对形式，值是模版文件的相对路径，模版文件后缀只能为```tpl```或```tmpl```。

配置时可以不写后缀，框架会自动添加，格式如下：
```
"templates": {
    "message": "templates/message",
    "grid": "templates/grid"
}
```

Pole Mock提供两个接口操作模版```pole.tpl()```和```pole.render()```，下面会详细介绍。

#### actions : Object
指定mock url，后缀只能为```json```或```js```，```js```是为满足JSONP的需求。

配置时可以不写后缀，框架会自动添加，格式如下：
```
"actions": {
    // 普通一个mock url
    "message": "mock_datas/message",
    
    // 带参数
    "grid-data-init": "mock_datas/grid-data-{0}",
    
    // mock url与正式环境url的映射
    "grid-data": {
        "mock": "mock_datas/infinite-data-{0}.js",
        "url": "http://www.sencha.com/forum/remote_topics/index.php?page={0}&start={1}&limit=100&sort=threadid&dir=DESC"
    }
}
```

以上参数的url，都可以使用```pole.url()```格式化，使用方法参见下面文档。

只有配置了正式url的action最终才会被收录到```pole-release.js```中，有关```pole-release.js```参见下面文档。

引入```pole-mock.js```
----------------------
在html中引入```pole-mock.js```，如下：
```html
<script type="text/javascript" src="assets/node_modules/pole-mock/pole-mock.js" 
        data-config="pole-mock-config" data-main="assets/scripts/index-main"></script>
```

#### data-config : String
指定Pole Mock配置文件。

#### data-main : String
指定主脚本文件，在Pole Mock完成初始化之后执行。

```pole-mock.js```仅用在静态环境中使用，完成```pole compile```后，```pole-mock.js```将会被```pole-releaser.js```替代。

Pole Tag（html标签）
-------------------
很多业务都需要动态构建首屏，那么在静态环境html中使用Pole Tag，就能实现在静态环境中测试动态构建首屏的需求。

最终静态html（包括页面中的Pole标签）将会被```pole compile```编译成目标语言动态页面文件。

#### 模版标签（PoleTemplateTag）
格式：
```html
<!--PoleTemplateTag name="message" action="message" /EndTag-->
```

##### name : String
指定模版名，模版名在```pole-mock-config.json```的```templates```配置项中查找，如果未找到，则忽略渲染此Tag。

##### action : String
指定模版初始化mock数据，action在```pole-mock-config.json```的```actions```配置项中查找。

##### actionArgs : String
指定格式化action使用到的参数，多个参数使用逗号隔开，例如：```actionArgs="1,2"```。

#### 碎片标签（PoleFragmentTag）
碎片标签在静态环境中会被忽略，但在执行```pole compile```时，碎片标签将会被替换成指定的碎片内容，参见：[Pole Compiler文档](https://github.com/polejs/pole#fragmentdir--string)。

格式：
```html
<!--PoleFragmentTag name="index-script" /-->
<script type="text/javascript" src="assets/node_modules/pole-mock/pole-mock.js" 
        data-config="pole-mock-config" data-main="assets/scripts/index-main"></script>
<!--/EndTag-->
```

#### name : String
指定碎片名称，如果不写后缀，默认为'fr'。

Pole JavaScript API
-------------------
Pole在静态环境中使用```pole-mock.js```，在正式环境中使用打包之后的```pole-release.js```替代。

#### initMock( String mockConfig, Function callbackFn )
如果Web应用依赖```Require.js```或```Sea.js```这样的模块化JS库，就需要使用```initMock()```函数初始化Pole Mock，如下：
```js
require.config({
    paths: {
        pole: 'assets/node_modules/pole-mock/pole-mock',
        mustache: 'assets/node_modules/mustache/mustache'
    }
});
require(['pole', 'mustache'], function(pole, Mustache) {
    window.Mustache = Mustache;
    pole.initMock('pole-mock-config', function() {
        require(['assets/scripts/require-main']);
    });
});
```

#### url( String name, [...args] )
获取url，如果在静态环境中，返回的是mock-url，如果是正式环境依赖```pole-release.js```，则返回正式url。

参数：
* name action名称
* ...args url中格式化参数

调用方法：
```js
$.ajax({
    dataType: 'jsonp',
    url: pole.url('grid-data', page, (page - 1) * pageSize),
    crossDomain: true,
    jsonp: 'callback',
    jsonpCallback: 'jsonpCallback',
    complete: function() {
        loading = false;
    }
});
```

#### tpl( String name )
获取模版对象，pole-mock会将模版默认使用模版引擎接口封装，它的返回值是如下：
* Mustache，返回```Mustache.parse()```的返回值
* ArtTemplate，返回```template.compile()```的返回值
* Underscore Tempalte，返回```_.template()```的返回值

参数：
* name 模版名称

#### render( String name, Object data)
渲染模版，得到模版应用数据构建之后的返回值。

参数：
* name 模版名称
* 渲染数据

调用方法：
```js
$tbody.append(pole.render('grid', data));
```

pole-release.js
---------------
```pole-release.js```是在执行```pole compile```之后生成的一个打包文件，在正式环境中替代```pole-mock.js```。

pole-release包含三部分内容：

* ```pole-core.js```核心库，```pole-mock.js```也会包含这个库；
* 正式环境中映射的```actions```，在mock-config中配置；
* 模版文件；

Usage Examples
--------------
参见：https://github.com/polejs/pole-demo/tree/master/app


