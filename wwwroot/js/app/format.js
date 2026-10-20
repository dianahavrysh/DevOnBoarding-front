define(['app/config'], function (cfg) {
    'use strict';

    var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

    function escapeHtml(value) {
        return value === null || value === undefined ? '' : String(value).replace(/[&<>"']/g, function (c) { return ESC[c]; });
    }

    function toDateInput(value) {
        return value ? String(value).slice(0, 10) : '';
    }

    function toApiDate(value) {
        return value ? value + 'T00:00:00' : null;
    }

    function displayDate(value) {
        if (!value) { return ''; }
        var p = String(value).slice(0, 10).split('-');
        return p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : '';
    }

    function roleName(id) {
        for (var i = 0; i < cfg.roles.length; i++) {
            if (cfg.roles[i].id === Number(id)) { return cfg.roles[i].name; }
        }
        return id ? 'Role #' + id : '';
    }

    return {
        escapeHtml: escapeHtml,
        toDateInput: toDateInput,
        toApiDate: toApiDate,
        displayDate: displayDate,
        roleName: roleName
    };
});
