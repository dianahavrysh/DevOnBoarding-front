define(['jquery', 'knockout', 'app/config', 'app/auth'], function ($, ko, cfg, auth) {
    'use strict';

    var anonymous = document.body.getAttribute('data-anonymous') === 'true';

    if (!anonymous && !auth.isAuthenticated()) {
        auth.redirectToLogin();
        return null;
    }

    var vm = {
        isAuthenticated: auth.isAuthenticated(),
        userName: auth.userName(),
        role: auth.role(),
        logout: function () {
            auth.clear();
            location.href = cfg.urls.login;
        }
    };

    $(function () {
        var el = document.getElementById('app-header');
        if (el && !anonymous) { ko.applyBindings(vm, el); }
    });

    return vm;
});
