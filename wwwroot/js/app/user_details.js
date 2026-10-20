define(['jquery', 'knockout', 'sammy', 'app/config', 'app/auth', 'app/api', 'app/format', 'app/details'],
function ($, ko, Sammy, cfg, auth, api, fmt, Details) {
    'use strict';

    var isAdmin = auth.isAdmin();
    var MAX = cfg.maxLength;

    function goList() { location.href = cfg.urls.userList; }
    function go(hash) { location.hash = hash; }

    function createModel() {
        return {
            userName: ko.observable(''),
            email: ko.observable(''),
            password: ko.observable(''),
            activeStatus: ko.observable(true),
            roleName: ko.observable(''),
            roleTypePK: ko.observable(undefined),
            firstName: ko.observable(''),
            secondName: ko.observable(''),
            birthDate: ko.observable('')            
        };
    }

    function fill(m, dto) {
        dto = dto || {};
        m.userName(dto.userName || '');
        m.email(dto.email || '');
        m.password('');                              
        m.activeStatus(dto.activeStatus === undefined ? true : !!dto.activeStatus);
        var rolePK = dto.rolePK !== undefined ? dto.rolePK : dto.roleTypePK;
        m.roleTypePK(rolePK === undefined || rolePK === null ? undefined : Number(rolePK));
        m.roleName(dto.roleName || '');
        m.firstName(dto.firstName || '');
        m.secondName(dto.secondName || '');
        m.birthDate(fmt.toDateInput(dto.birthDate));
    }

    function toDto(m, mode, id) {
        var dto = {
            userName: $.trim(m.userName()),
            email: $.trim(m.email()),
            activeStatus: !!m.activeStatus(),
            roleTypePK: Number(m.roleTypePK()),
            firstName: $.trim(m.firstName()),
            secondName: $.trim(m.secondName()) || null,
            rolePK: Number(m.roleTypePK()),
            roleTypePK: Number(m.roleTypePK()),
            birthDate: fmt.toApiDate(m.birthDate())
        };
        if (m.password()) { dto.password = m.password(); } 
        if (mode === 'edit') { dto.userPK = id; }
        return dto;
    }

    function validate(m, mode) {
        var e = [];
        function bad(field, message) { e.push({ field: field, message: message }); }

        var name = $.trim(m.userName()), email = $.trim(m.email());
        var first = $.trim(m.firstName()), second = $.trim(m.secondName()), pwd = m.password();

        if (!name) { bad('userName', 'Enter a user name.'); }
        else if (name.length > MAX) { bad('userName', 'Use at most ' + MAX + ' characters.'); }

        if (!email) { bad('email', 'Enter an email address.'); }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { bad('email', 'Enter a valid email address.'); }
        else if (email.length > MAX) { bad('email', 'Use at most ' + MAX + ' characters.'); }

        if (mode === 'add' && !pwd) { bad('password', 'Enter a password.'); }
        else if (pwd && pwd.length > MAX) { bad('password', 'Use at most ' + MAX + ' characters.'); }

        if (!m.roleTypePK()) { bad('roleTypePK', 'Choose a role.'); }

        if (!first) { bad('firstName', 'Enter a first name.'); }
        else if (first.length > MAX) { bad('firstName', 'Use at most ' + MAX + ' characters.'); }

        if (second.length > MAX) { bad('secondName', 'Use at most ' + MAX + ' characters.'); }

        if (m.birthDate() && m.birthDate() > new Date().toISOString().slice(0, 10)) {
            bad('birthDate', 'Birth date cannot be in the future.');
        }
        return e;
    }

    var details = new Details({
        titles: { add: 'New user', view: 'User details', edit: 'Edit user' },
        createModel: createModel,
        fill: fill,
        toDto: toDto,
        validate: validate,
        load: api.users.get,
        create: api.users.create,
        update: api.users.update,
        remove: api.users.remove,
        onSaved: function (mode, id, result) {
            var newId = mode === 'add' ? (result && (result.userPK || result.id)) : id;
            if (newId) { go('#/view/' + newId); } else { goList(); }
        },
        onCancel: function (mode, id) {
            if (mode === 'edit' && id) { go('#/view/' + id); } else { goList(); }
        },
        onRemoved: goList
    });

    details.isAdmin = isAdmin;
    details.roles = cfg.roles;
    details.roleName = ko.pureComputed(function () {
        return details.model.roleName() || fmt.roleName(details.model.roleTypePK());
    });
    details.birthDateText = ko.pureComputed(function () { return fmt.displayDate(details.model.birthDate()); });
    details.goEdit = function () { go('#/edit/' + details.id()); };

    function validId(id) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null;
    }

    var router = Sammy(function () {
        this.get('#/add', function () {
            if (!isAdmin) { return goList(); }
            details.openAdd();
        });
        this.get('#/view/:id', function () {
            var id = validId(this.params.id);
            return id ? details.openView(id) : goList();
        });
        this.get('#/edit/:id', function () {
            var id = validId(this.params.id);
            if (!id) { return goList(); }
            if (!isAdmin) { return go('#/view/' + id); }
            details.openEdit(id);
        });
        this.get('#/', goList);
    });

    $(function () {
        ko.applyBindings(details, document.getElementById('user-details-page'));
        router.run('#/');
    });

    return details;
});
