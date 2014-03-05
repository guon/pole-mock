define(['var/slice'], function(slice) {
    var formatString = function(str) {
        var args = slice.call(arguments, 1);
        return str.replace(/\{(\d+)\}/g, function(m, i) {
            return args[i];
        });
    };
    return formatString;
});