/*
 * Загальна логіка серверного списку (koGrid + paging + sorting + search).
 * Сторінка передає лише параметри: звідки брати дані, колонки, поля пошуку.
 *
 * options:
 *   fetch(params) -> promise<{items, count}>   (обов'язково)
 *   mapItem(dto)  -> рядок для гріда
 *   columnDefs    -> колонки koGrid
 *   sort          -> { field, direction } початкове сортування (field = поле рядка гріда)
 *   sortFields    -> { gridField: 'ServerColumn' } для sortExpression
 *   searchFields  -> [{ key, param, label, checked }]
 */
define(['jquery', 'knockout', 'koGrid'], function ($, ko) {
    'use strict';

    function toInt(value, fallback) {
        var n = parseInt(value, 10);
        return isNaN(n) || n < 1 ? fallback : n;
    }

    function List(options) {
        var self = this;
        var seq = 0, timer = null;
        var o = $.extend({
            pageSizes: [10, 20, 50],
            pageSize: 10,
            sort: { field: 'id', direction: 'asc' },
            sortFields: {},
            searchFields: [],
            rowHeight: 40,
            mapItem: function (x) { return x; }
        }, options);

        // ----- state -----
        self.items = ko.observableArray([]);
        self.loading = ko.observable(false);
        self.error = ko.observable('');
        self.selectedItems = ko.observableArray([]);
        self.selected = ko.pureComputed(function () { return self.selectedItems()[0] || null; });

        self.searchValue = ko.observable('');
        self.strictMatch = ko.observable(false);
        self.includeInactive = ko.observable(false);
        self.searchFields = $.map(o.searchFields, function (f) {
            return { key: f.key, param: f.param, label: f.label, checked: ko.observable(f.checked !== false) };
        });

        self.pagingOptions = {
            pageSizes: ko.observableArray(o.pageSizes),
            pageSize: ko.observable(o.pageSize),
            totalServerItems: ko.observable(0),
            currentPage: ko.observable(1)
        };
        self.sortInfo = ko.observable({ column: { field: o.sort.field }, direction: o.sort.direction });

        self.sortExpression = ko.pureComputed(function () {
            var s = self.sortInfo() || {};
            var field = s.column && s.column.field;
            return (o.sortFields[field] || field) + ' ' + (s.direction || 'asc');
        });

        self.rangeText = ko.pureComputed(function () {
            var total = self.pagingOptions.totalServerItems();
            if (!total) { return self.loading() ? '' : 'No users found'; }
            var size = toInt(self.pagingOptions.pageSize(), 10), page = toInt(self.pagingOptions.currentPage(), 1);
            var from = (page - 1) * size + 1;
            return 'Showing ' + from + '-' + Math.min(from + size - 1, total) + ' of ' + total;
        });

        // ----- koGrid options (server-side paging + sorting) -----
        self.gridOptions = {
            data: self.items,
            columnDefs: o.columnDefs,
            selectedItems: self.selectedItems,
            multiSelect: false,
            displaySelectionCheckbox: false,
            enablePaging: true,
            pagingOptions: self.pagingOptions,
            useExternalSorting: true,
            sortInfo: self.sortInfo,
            rowHeight: o.rowHeight,
            footerVisible: true
        };

        // ----- loading -----
        function buildParams(page, size) {
            var p = {
                currentPage: page,
                pageSize: size,
                sortExpression: self.sortExpression(),
                searchValue: $.trim(self.searchValue()),
                strictMatch: self.strictMatch(),
                includeInactive: self.includeInactive()
            };
            $.each(self.searchFields, function (_, f) { p[f.param] = f.checked(); });
            return p;
        }

        self.reload = function () {
            var page = toInt(self.pagingOptions.currentPage(), 1);
            var size = toInt(self.pagingOptions.pageSize(), o.pageSize);
            var params = buildParams(page, size);

            if (params.searchValue && !$.grep(self.searchFields, function (f) { return f.checked(); }).length) {
                self.error('Select at least one field to search in.');
                return;
            }

            var ticket = ++seq;                       // відкидаємо застарілі відповіді
            self.loading(true);
            self.error('');

            o.fetch(params).then(function (res) {
                if (ticket !== seq) { return; }
                var pages = Math.max(1, Math.ceil(res.count / size));
                if (page > pages && res.count > 0) {  // напр. видалили останній запис на останній сторінці
                    self.pagingOptions.currentPage(pages);
                    return;
                }
                self.selectedItems([]);
                self.pagingOptions.totalServerItems(res.count);
                self.items($.map(res.items, o.mapItem));
            }, function (err) {
                if (ticket !== seq) { return; }
                self.items([]);
                self.pagingOptions.totalServerItems(0);
                self.error(err.message);
            }).always(function () {
                if (ticket === seq) { self.loading(false); }
            });
        };

        // кілька змін підряд (сторінка + розмір + сортування) = один запит
        function scheduleReload() {
            clearTimeout(timer);
            timer = setTimeout(self.reload, 0);
        }

        function goFirstPage() {
            if (toInt(self.pagingOptions.currentPage(), 1) !== 1) { self.pagingOptions.currentPage(1); }
            scheduleReload();
        }

        self.pagingOptions.currentPage.subscribe(scheduleReload);
        self.pagingOptions.pageSize.subscribe(goFirstPage);
        self.sortInfo.subscribe(goFirstPage);

        self.search = function () { goFirstPage(); };

        self.reset = function () {
            self.searchValue('');
            self.strictMatch(false);
            self.includeInactive(false);
            $.each(self.searchFields, function (i, f) { f.checked(o.searchFields[i].checked !== false); });
            goFirstPage();
        };

        self.reload();
    }

    return List;
});
