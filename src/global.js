define(['core'], function(pole) {

    if (typeof define === 'function') {
        define('pole', [], function() { return pole; });
    }

    if (typeof window === 'object' && typeof window.document === 'object') {
        window.pole = pole;
    }

});