define(function () {
    'use strict';

    var API = 'https://localhost:53537';

    return {
        tokenKey: 'devonboarding.token',

        api: {
            login: API + '/api/auth/login',   
            users: API + '/api/users'         
        },

        urls: {
            login: '/Account/Login',
            userList: '/Users',
            userDetails: '/Users/Details'
        },

        adminRoles: ['Administrator', 'Admin'],

        roles: [
            { id: 3, name: 'Administrator' },
            { id: 2, name: 'Manager' },
            { id: 1, name: 'User' }
        ],

        paging: { pageSizes: [10, 20, 50], pageSize: 10 },

        searchFields: [
            { key: 'UserName',   param: 'searchByUserName',   label: 'User name',   checked: true },
            { key: 'Email',      param: 'searchByEmail',      label: 'Email',       checked: true },
            { key: 'FirstName',  param: 'searchByFirstName',  label: 'First name',  checked: false },
            { key: 'SecondName', param: 'searchBySecondName', label: 'Second name', checked: false }
        ],

        maxLength: 50
    };
});
