/* koGrid очікує window.ko та window.jQuery; під RequireJS вони є лише як модулі. */
define(['jquery', 'knockout'], function ($, ko) {
    'use strict';
    window.jQuery = window.$ = $;
    window.ko = ko;
    return true;
});
