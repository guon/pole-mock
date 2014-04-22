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

```json
"templates": {
    "message": "templates/message",
    "grid": "templates/grid"
}
```

Pole Mock提供两个接口操作模版```pole.tpl()```和```pole.render()```，下面会详细介绍。

#### actions : Object
指定mock url，格式如下：

```json
"actions": {
    "message": "mock_datas/message", // 
    "infinite-data-init": "mock_datas/infinite-data-{0}",
    "grid-data-init": "mock_datas/grid-data-{0}",
    "grid-data": {
        "mock": "mock_datas/infinite-data-{0}.js",
        "url": "http://www.sencha.com/forum/remote_topics/index.php?page={0}&start={1}&limit=100&sort=threadid&dir=DESC"
    }
}
```


引入```pole-mock.js```
----------------------

在Web应用的html中引入```pole-mock.js```，如下：

```html
<script type="text/javascript" src="assets/node_modules/pole-mock/pole-mock.js" 
        data-config="pole-mock-config" data-main="assets/scripts/index-main"></script>
```

在完成Pole Compiler之后，```pole-mock.js```将会被```pole-releaser.js```取代。




Pole Tag
--------

### 模版标签（PoleTemplateTag）


### 碎片标签（PoleFragmentTag）


Pole JavaScript API
-------------------

### url()


### tpl()


### render()

Usage Examples
--------------
参见：https://github.com/polejs/pole-demo/tree/master/app


