/*
 * Загальна логіка сторінки деталей з трьома режимами: add / view / edit.
 * Конкретна сторінка передає модель, мапінг DTO, валідацію та виклики API.
 *
 * options:
 *   titles                       { add, view, edit }
 *   createModel() -> { observable... }
 *   fill(model, dto)             dto -> model    (dto === null: значення за замовчуванням)
 *   toDto(model, mode, id)       model -> dto
 *   validate(model, mode)        -> [{ field, message }]
 *   load(id), create(dto), update(id, dto), remove(id)  -> promises
 *   onSaved(mode, id, result), onCancel(mode, id), onRemoved()
 */
define(['jquery', 'knockout'], function ($, ko) {
    'use strict';

    var MODES = { ADD: 'add', VIEW: 'view', EDIT: 'edit' };

    function Details(o) {
        var self = this;
        var loadedId = null, snapshot = null, ticket = 0;

        self.MODES = MODES;
        self.mode = ko.observable(MODES.VIEW);
        self.id = ko.observable(null);
        self.model = o.createModel();

        self.loading = ko.observable(false);
        self.saving = ko.observable(false);
        self.error = ko.observable('');
        self.errors = ko.observableArray([]);

        self.isAdd = ko.pureComputed(function () { return self.mode() === MODES.ADD; });
        self.isEdit = ko.pureComputed(function () { return self.mode() === MODES.EDIT; });
        self.isView = ko.pureComputed(function () { return self.mode() === MODES.VIEW; });
        self.title = ko.pureComputed(function () { return o.titles[self.mode()]; });

        self.errorFor = function (field) {
            var e = ko.utils.arrayFirst(self.errors(), function (x) { return x.field === field; });
            return e ? e.message : '';
        };

        function resetMessages() { self.error(''); self.errors([]); }

        // ---- відкриття режимів (викликаються роутером) ----
        self.openAdd = function () {
            ++ticket;
            resetMessages();
            self.id(null);
            loadedId = null; snapshot = null;
            o.fill(self.model, null);
            self.loading(false);
            self.mode(MODES.ADD);
        };

        function openExisting(mode, id) {
            resetMessages();
            self.id(id);
            self.mode(mode);

            if (loadedId === id && snapshot) {      // перемикання view <-> edit без зайвого запиту
                o.fill(self.model, snapshot);
                return;
            }
            var t = ++ticket;
            self.loading(true);
            o.load(id).then(function (dto) {
                if (t !== ticket) { return; }
                snapshot = dto; loadedId = id;
                o.fill(self.model, dto);
            }, function (err) {
                if (t !== ticket) { return; }
                self.error(err.message);
            }).always(function () {
                if (t === ticket) { self.loading(false); }
            });
        }

        self.openView = function (id) { openExisting(MODES.VIEW, id); };
        self.openEdit = function (id) { openExisting(MODES.EDIT, id); };

        // ---- дії ----
        self.save = function () {
            resetMessages();
            var errs = o.validate(self.model, self.mode());
            if (errs.length) { self.errors(errs); return; }

            var mode = self.mode(), id = self.id();
            var dto = o.toDto(self.model, mode, id);
            self.saving(true);

            (mode === MODES.ADD ? o.create(dto) : o.update(id, dto)).then(function (result) {
                snapshot = null; loadedId = null;   // після збереження наступний view перечитає дані
                o.onSaved(mode, id, result);
            }, function (err) {
                self.error(err.message);
            }).always(function () { self.saving(false); });
        };

        self.cancel = function () {
            o.fill(self.model, snapshot);
            o.onCancel(self.mode(), self.id());
        };

        self.remove = function () {
            if (!window.confirm('Delete this user? This cannot be undone.')) { return; }
            self.saving(true);
            o.remove(self.id()).then(function () { o.onRemoved(); }, function (err) {
                self.saving(false);
                self.error(err.message);
            });
        };
    }

    Details.MODES = MODES;
    return Details;
});
