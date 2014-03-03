define(function() {
    function suffix(str, postfix) {
        var re = new RegExp('.' + postfix + '$', 'i');
        return !re.test(str) ? str + '.' + postfix : str;
    }
    return suffix;
});