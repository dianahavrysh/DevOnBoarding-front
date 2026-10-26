var require = {
    baseUrl: '/js',
    waitSeconds: 20,
    paths: {
        jquery: '../lib/jquery/jquery.min',
        knockout: '../lib/knockout/knockout-latest',
        koGrid: '../lib/kogrid/koGrid-2.1.1',
        sammy: '../lib/sammy/sammy'
    },
    shim: {
        koGrid: { deps: ['app/globals'] }
    }
};
