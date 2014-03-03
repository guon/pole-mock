define(['var/slice'], function(slice) {
    var formatRe = /\{(\d+)\}/g,
        formatString = function(str) {
            var args = slice.call(arguments, 1);
            return str.replace(formatRe, function(m, i) {
                return args[i];
            });
        };
    return formatString;
});