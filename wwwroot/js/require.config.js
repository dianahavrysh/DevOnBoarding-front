/*
 * RequireJS configuration.
 * Підключається ДО require.js: глобальний об'єкт `require` вважається конфігом.
 * Усі сторонні бібліотеки мають бути прописані тут (bindings for required js files).
 */
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
        // koGrid - не AMD-модуль, йому потрібні глобальні ko / jQuery -> app/globals їх виставляє
        koGrid: { deps: ['app/globals'] }
    }
};
