define(function() {
    var suffix = function(str, postfix, pfs) {
        var re = new RegExp('.' + pfs || postfix + '$', 'i');
        return !re.test(str) ? str + '.' + postfix : str;
    };
    return suffix;
});