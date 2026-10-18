/* Сторінка Users/UserList: ініціалізує загальний List і додає дії над користувачами. */
define(['jquery', 'knockout', 'app/config', 'app/auth', 'app/api', 'app/format', 'app/list'],
function ($, ko, cfg, auth, api, fmt, List) {
    'use strict';

    // UserDTO -> рядок гріда. koGrid виводить комірки через html-binding, тому все екрануємо.
    function mapRow(dto) {
        var fullName = [dto.firstName, dto.secondName].filter(Boolean).join(' ');
        return {
            userPK: dto.userPK,
            rawName: dto.userName,
            userName: fmt.escapeHtml(dto.userName),
            email: fmt.escapeHtml(dto.email),
            fullName: fmt.escapeHtml(fullName),
            birthDateText: fmt.displayDate(dto.birthDate),
            roleText: fmt.escapeHtml(fmt.roleName(dto.roleTypePK)),
            statusHtml: dto.activeStatus
                ? '<span class="chip chip--on">Active</span>'
                : '<span class="chip chip--off">Inactive</span>'
        };
    }

    var list = new List({
        fetch: api.users.page,
        mapItem: mapRow,
        pageSizes: cfg.paging.pageSizes,
        pageSize: cfg.paging.pageSize,
        searchFields: cfg.searchFields,
        sort: { field: 'userName', direction: 'asc' },
        sortFields: {                    // поле гріда -> колонка для sortExpression
            userName: 'UserName',
            email: 'Email',
            fullName: 'FirstName',
            birthDateText: 'BirthDate',
            roleText: 'RoleTypePK',
            statusHtml: 'ActiveStatus'
        },
        columnDefs: [
            { field: 'userName', displayName: 'User name', width: 170 },
            { field: 'email', displayName: 'Email', width: '*' },
            { field: 'fullName', displayName: 'Name', width: 190 },
            { field: 'birthDateText', displayName: 'Birth date', width: 120 },
            { field: 'roleText', displayName: 'Role', width: 130 },
            { field: 'statusHtml', displayName: 'Status', width: 110 }
        ]
    });

    var isAdmin = auth.isAdmin();

    function details(mode, id) {
        location.href = cfg.urls.userDetails + '#/' + mode + (id ? '/' + id : '');
    }

    var vm = {
        list: list,
        isAdmin: isAdmin,
        hasSelection: ko.pureComputed(function () { return !!list.selected(); }),

        addUser: function () { details('add'); },
        viewSelected: function () { if (list.selected()) { details('view', list.selected().userPK); } },
        editSelected: function () { if (list.selected()) { details('edit', list.selected().userPK); } },

        deleteSelected: function () {
            var row = list.selected();
            if (!row || !window.confirm('Delete user "' + row.rawName + '"? This cannot be undone.')) { return; }
            api.users.remove(row.userPK).then(list.reload, function (err) { list.error(err.message); });
        }
    };

    $(function () {
        ko.applyBindings(vm, document.getElementById('user-list-page'));

        // подвійний клік по рядку = відкрити (перший клік уже виділив рядок)
        $('#userGrid').on('dblclick', '.kgRow', function () { vm.viewSelected(); });
    });

    return vm;
});
