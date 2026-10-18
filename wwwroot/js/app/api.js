/*
 * Тонка обгортка над $.ajax: додає Bearer-токен, нормалізує помилки та відповіді.
 * Якщо формат ваших DTO відрізняється - міняти потрібно лише normalizePage / unwrapItem.
 */
define(['jquery', 'app/config', 'app/auth'], function ($, cfg, auth) {
    'use strict';

    function toError(xhr) {
        var body = xhr.responseJSON, details = [], message = '';

        if (body) {
            if (body.errors && typeof body.errors === 'object') {          // ModelState / ProblemDetails
                $.each(body.errors, function (_, v) { details = details.concat(v); });
            }
            message = body.message || body.detail || body.title || '';
        }
        if (!message && xhr.responseText && xhr.responseText.length < 200 && xhr.status) {
            message = xhr.responseText;
        }
        if (!message) {
            message = xhr.status === 0 ? 'Server is unreachable. Check your connection.'
                : xhr.status === 403 ? 'You do not have permission to do this.'
                : xhr.status === 404 ? 'Not found.'
                : 'Request failed (' + xhr.status + ').';
        }
        if (details.length) { message += ' ' + details.join(' '); }
        return { status: xhr.status, message: message };
    }

    function clean(params) {
        var out = {};
        $.each(params || {}, function (k, v) {
            if (v !== undefined && v !== null && v !== '') { out[k] = v; }
        });
        return out;
    }

    function request(method, url, data) {
        var opts = { method: method, url: url, headers: {} };
        var token = auth.getToken();
        if (token) { opts.headers.Authorization = 'Bearer ' + token; }

        if (method === 'GET') {
            opts.data = clean(data);
        } else if (data !== undefined) {
            opts.contentType = 'application/json; charset=utf-8';
            opts.data = JSON.stringify(data);
        }

        return $.ajax(opts).then(null, function (xhr) {
            if (xhr.status === 401 && token) { auth.redirectToLogin(); }
            return $.Deferred().reject(toError(xhr)).promise();
        });
    }

    /** ResultDTO -> { items: [], count: N } */
    function normalizePage(res) {
        res = res || {};
        var items = res.items || res.Items || [];
        var count = [res.count, res.itemsCount, res.totalCount, res.total].filter(function (x) {
            return x !== undefined && x !== null;
        })[0];
        return { items: items, count: count === undefined ? items.length : Number(count) };
    }

    /** ResultDTO з одним Item або «голий» UserDTO -> UserDTO */
    function unwrapItem(res) {
        return (res && (res.item || res.Item)) || res;
    }

    var users = {
        url: cfg.api.users,
        page: function (params) { return request('GET', cfg.api.users, params).then(normalizePage); },
        get: function (id) { return request('GET', cfg.api.users + '/' + id).then(unwrapItem); },
        create: function (dto) { return request('POST', cfg.api.users, dto).then(unwrapItem); },
        update: function (id, dto) { return request('PUT', cfg.api.users + '/' + id, dto).then(unwrapItem); },
        remove: function (id) { return request('DELETE', cfg.api.users + '/' + id); }
    };

    function login(userName, password) {
        return request('POST', cfg.api.login, { userName: userName, password: password }).then(function (res) {
            var token = res && (res.token || res.accessToken || res.access_token || res.jwt);
            if (!token) { return $.Deferred().reject({ status: 0, message: 'Server did not return a token.' }).promise(); }
            return token;
        });
    }

    return { request: request, users: users, login: login };
});
