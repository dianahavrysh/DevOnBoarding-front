define(['app/config'], function (cfg) {
    'use strict';

    var ROLE_CLAIMS = ['role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    var NAME_CLAIMS = ['unique_name', 'name', 'given_name', 'sub',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

    function base64UrlDecode(s) {
        s = s.replace(/-/g, '+').replace(/_/g, '/');
        while (s.length % 4) { s += '='; }
        var bin = atob(s);
        return decodeURIComponent(bin.split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    function parse(token) {
        try { return JSON.parse(base64UrlDecode(token.split('.')[1])); } catch (e) { return null; }
    }

    function first(payload, keys) {
        if (!payload) { return ''; }
        for (var i = 0; i < keys.length; i++) {
            var v = payload[keys[i]];
            if (v !== undefined && v !== null && v !== '') { return v; }
        }
        return '';
    }

    var auth = {
        getToken: function () {
            try { return localStorage.getItem(cfg.tokenKey); } catch (e) { return null; }
        },
        setToken: function (token) {
            try { localStorage.setItem(cfg.tokenKey, token); } catch (e) { /* storage недоступний */ }
        },
        clear: function () {
            try { localStorage.removeItem(cfg.tokenKey); } catch (e) { /* noop */ }
        },
        claims: function () {
            var t = auth.getToken();
            return t ? parse(t) : null;
        },
        isAuthenticated: function () {
            var c = auth.claims();
            if (!c) { return false; }
            return !c.exp || c.exp * 1000 > Date.now();
        },
        userName: function () { return String(first(auth.claims(), NAME_CLAIMS)); },
        role: function () {
            var r = first(auth.claims(), ROLE_CLAIMS);
            return Array.isArray(r) ? r[0] : String(r);
        },
        isAdmin: function () {
            var r = first(auth.claims(), ROLE_CLAIMS);
            var roles = Array.isArray(r) ? r : [r];
            return roles.some(function (x) { return cfg.adminRoles.indexOf(x) !== -1; });
        },
        redirectToLogin: function () {
            auth.clear();
            var back = location.pathname + location.search + location.hash;
            location.replace(cfg.urls.login + '?returnUrl=' + encodeURIComponent(back));
        }
    };

    return auth;
});
