pole-mock
=========
Pole Mock是Pole的一个重要组成部分，它包含两个模块：```PoleTag（html标签）```和```JavaScript API```。

命令行执行安装```pole-mock```：
```shell
npm install pole-mock --save-dev
```

配置文件```pole-mock-config.json```
-----------------------------------
```pole-mock-config.json```是Pole Mock的配置描述文件，配置项如下：

#### templateEngine : String
指定Web应用使用的模版引擎，默认为'mustache'。

#### actions : Object

引入```pole-mock.js```
----------------------

在Web应用的html中引入```pole-mock.js```，如下：

```html
<script type="text/javascript" src="assets/node_modules/pole-mock/pole-mock.js" data-config="pole-mock-config" data-main="assets/scripts/index-main"></script>
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


