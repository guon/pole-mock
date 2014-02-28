define([
        'core',
        'var/document'
], function(pole, document) {
    'use strict';

    if (typeof define === 'function') {
        define('pole', [], function() { return pole; });
    }

    if (typeof window === 'object' && typeof document === 'object') {
        window.pole = pole;
    }

});