/* Єдине місце з налаштуваннями фронтенду. Підлаштуйте під свій бекенд. */
define(function () {
    'use strict';

    return {
        tokenKey: 'devonboarding.token',

        api: {
            login: '/api/auth/login',   // POST { userName, password } -> { token }
            users: '/api/users'         // GET (page) / GET {id} / POST / PUT {id} / DELETE {id}
        },

        urls: {
            login: '/Account/Login',
            userList: '/Users',
            userDetails: '/Users/Details'
        },

        // значення claim-а ролі в JWT, які вважаються адміністратором
        adminRoles: ['Administrator', 'Admin'],

        // RoleTypes (RoleTypePK -> назва). Змініть відповідно до даних у таблиці RoleTypes.
        roles: [
            { id: 1, name: 'Administrator' },
            { id: 2, name: 'User' }
        ],

        paging: { pageSizes: [10, 20, 50], pageSize: 10 },

        // searchBy<Field> параметри Users_SEL_ByPage
        searchFields: [
            { key: 'UserName',   param: 'searchByUserName',   label: 'User name',   checked: true },
            { key: 'Email',      param: 'searchByEmail',      label: 'Email',       checked: true },
            { key: 'FirstName',  param: 'searchByFirstName',  label: 'First name',  checked: false },
            { key: 'SecondName', param: 'searchBySecondName', label: 'Second name', checked: false }
        ],

        maxLength: 50
    };
});
