define(function() {
    var suffix = function(str, postfix) {
            var re = new RegExp('.' + postfix + '$', 'i');
            return !re.test(str) ? str + '.' + postfix : str;
        };
    return suffix;
});