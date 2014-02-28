/*! pole-mock v0.0.1 ~ (c) 2014 Pole, https://github.com/polejs/pole-mock */
(function(window, undefined) {
    'use strict';

    var pole = {};






    pole.mustache = '';





    pole.mock = '';





    pole.parser = '';





    if (typeof define === 'function') {
        define('pole', [], function() { return pole; });
    }

    if (typeof window === 'object' && typeof window.document === 'object') {
        window.pole = pole;
    }

}(window));