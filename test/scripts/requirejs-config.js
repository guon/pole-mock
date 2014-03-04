requirejs.config({
    baseUrl: '../src',
    paths: {
        mustache: '../bower_components/mustache/mustache',
        dot: '../bower_components/doT/doT'
    },
    shim: {
        Mustache: {
            exprots: 'Mustache'
        },
        doT: {
            exprots: 'doT'
        }
    }
});