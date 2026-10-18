define(['jquery', 'knockout', 'app/config', 'app/auth', 'app/api'], function ($, ko, cfg, auth, api) {
    'use strict';

    function safeReturnUrl() {
        var m = /[?&]returnUrl=([^&]*)/.exec(location.search);
        var url = m ? decodeURIComponent(m[1]) : '';
        return url.charAt(0) === '/' && url.charAt(1) !== '/' ? url : cfg.urls.userList;   // без open redirect
    }

    function LoginViewModel() {
        var self = this;
        self.userName = ko.observable('');
        self.password = ko.observable('');
        self.error = ko.observable('');
        self.busy = ko.observable(false);

        self.signIn = function () {
            self.error('');
            if (!$.trim(self.userName()) || !self.password()) {
                self.error('Enter your user name and password.');
                return;
            }
            self.busy(true);
            api.login($.trim(self.userName()), self.password())
                .then(function (token) {
                    auth.setToken(token);
                    location.href = safeReturnUrl();
                }, function (err) {
                    self.busy(false);
                    self.error(err.status === 401 || err.status === 400 ? 'Wrong user name or password.' : err.message);
                });
        };
    }

    $(function () {
        if (auth.isAuthenticated()) { location.replace(safeReturnUrl()); return; }
        ko.applyBindings(new LoginViewModel(), document.getElementById('login-page'));
    });
});
