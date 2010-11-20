/*jslint
         bitwise: true,
         eqeqeq: true,
         immed: true,
         indent: 4,
         newcap: true,
         nomen: false,
         onevar: true,
         plusplus: true,
         regexp: false,
         undef: true,
         white: true
*/
/*global
         $,
         _,
         App,
         AppView,
         Backbone,
         DjangoModelFieldView,
         DjangoModelMethodView,
         DjangoModels,
         DjangoModelView,
         emSize,
         ExceptionView,
         getDeployCoords,
         InvalidSignatureError,
         NothingToKillError,
         NotImplementedError,
         window
*/

$(function () {
    window.DjangoModelMethodView = Backbone.View.extend({
        tagName: 'div',

        className: 'model-method',

        template: _.template($('#model-method-template').html()),

        render: function () {
            return this.template({method: this.model});
        },

        deploy: function (element_id) {
            $(element_id).append(this.render());
            this.el = $('#' + this.model.id);
        }
    });

    window.DjangoModelFieldView = Backbone.View.extend({
        tagName: 'div',

        className: 'model-field',

        template: _.template($('#model-field-template').html()),

        render: function () {
            return this.template({field: this.model});
        },

        deploy: function (element_id) {
            $(element_id).append(this.render());
            this.el = $('#' + this.model.id);
        }
    });

    window.DjangoModelView = Backbone.View.extend({
        tagName: 'div',

        className: 'model',

        template: _.template($('#model-template').html()),

        render: function () {
            return this.template({model: this.model});
        },

        deploy: function (element_id, pos) {
            var collection, fsize, holder, view, x;
            $(element_id).append(this.render());
            this.el = $('#' + this.model.id);
            pos = pos ? pos : [this.model.get('x'), this.model.get('y')];
            this.el.draggable({handle: '.model-name'});
            // Why doesn't the template get this data directly from the object?
            this.el.css('height',   this.model.get('height'))
                   .css('left',     pos[0])
                   .css('position', 'absolute')
                   .css('top',      pos[1])
                   .css('width',    this.model.get('width'))
                   .css('z-index',  this.model.get('z'));

            // Fields
            fsize = this.model.get('fields').size();
            holder = $('#' + this.model.id + ' .model-fields');
            for (x = 0; x < fsize; x += 1) {
                collection = this.model.get('fields').at(x);
                view = new DjangoModelFieldView({model: collection});
                view.deploy(holder.closest('.model-fields'));
            }

            // Methods
            fsize = this.model.get('methods').size();
            holder = $('#' + this.model.id + ' .model-methods');
            for (x = 0; x < fsize; x += 1) {
                collection = this.model.get('methods').at(x);
                view = new DjangoModelMethodView({model: collection});
                view.deploy(holder.closest('.model-methods'));
            }
        }
    });

    window.AppView = Backbone.View.extend({
        el: $('body'),

        holder: '#workspace',

        events: {
            // Toolbar
            'click #to-python': 'toPython',
            'click #to-json': 'toJSON',
            'click #kill-all': 'destroyTheWorld',

            // Models
            'click #new-model': 'promptModelName',
            'click .model': 'raiseModel',
            'click .model-kill': 'destroyModel',
            'click .model-meta': 'modelMetaOptions',
            'dblclick .model-name .name, .model-name .base-class': 'promptModelNewName',
            'dragstop .model': 'saveModelCoords',

            // Fields
            'blur .new-model-field': 'blurNewField',
            'click .model-field-kill': 'destroyField',
            'dblclick .model-field .type, .model-field .name': 'editField',
            'focus .new-model-field': 'focusNewField',
            'keypress .new-model-field': 'createField',
            'sortupdate .model-fields': 'saveFieldPosition',

            // Methods
            'blur .new-model-method': 'blurNewMethod',
            'click .model-method-kill': 'destroyMethod',
            'dblclick .signature': 'editMethod',
            'focus .new-model-method': 'focusNewMethod',
            'keypress .new-model-method': 'createMethod',
            'sortupdate .model-methods': 'saveMethodPosition'

        },

        initialize: function () {
            var sortable_args;
            _.bindAll(this, 'createModel', 'createField', 'createMethod', 'destroyMethod', 'render');
            // DjangoModels.bind('add', this.addOne);
            // DjangoModels.bind('refresh', this.addAll);
            // DjangoModels.bind('all', this.render);
            // DjangoModels._reset();
            DjangoModels.fetch();
            this.render();
            sortable_args = {
                placeholder: 'ui-sortable-placeholder',
                revert: true,
                change: function (e, ui) {
                    $(ui.placeholder).hide().slideDown();
                }
            };
            if ($('.model-fields').size()) {
                $('.model-fields').sortable(sortable_args);
                $('.model-fields').disableSelection();
            }
            if ($('.model-methods').size()) {
                $('.model-methods').sortable(sortable_args);
                $('.model-methods').disableSelection();
            }
            $('input.checkbox').live('change', function () {
                var check, check_toggle;
                check = $('#' + this.id + ':checked');
                if (check.size()) {
                    check_toggle = check.closest('.model-name-template').find('.base-class');
                    check_toggle.fadeIn('slow');
                    check_toggle.find('input').css('width', $('#model-name-input').css('width'));
                } else {
                    $('#' + this.id).closest('.model-name-template').find('.base-class').hide();
                }
            });
            $('a[href^="http"]').live('click', function(){
                window.open(this.href);
                return false;
            });
        },

        render: function () {
            $(this.holder).html('');
            DjangoModels.each(function (model, i) {
                var view = new DjangoModelView({model: model});
                view.deploy('#workspace');
            });
            this.setTabIndex();
        },

        setTabIndex: function () {
            var tabindex = 0;
            $('#workspace').find('.model').each(function (i, el) {
                $(el).find('a, input').each(function (_i, _el) {
                    $(_el).attr('tabindex', tabindex);
                    tabindex += 1;
                });
            });
        },

        report: function (exception) {
            // console.info(exception);
            var view = new ExceptionView({model: exception});
            $('#messages').hide().html(view.render()).css('position', 'absolute').css('z-index', 1000).fadeIn();
            window.timeoutID = window.setTimeout(function () {
                $('#messages').fadeOut();
                window.clearTimeout(window.timeoutID);
                window.timeoutID = null;
            }, 6000);
        },

        toPython: function (e) {
            var code, dj_count, x;
            code = '# -*- coding: utf-8 -*-\nfrom django.db import models\n';
            dj_count = DjangoModels.size();
            if (dj_count === 0) {
                code += '\n# Create your models here.';
            } else {
                for (x = 0; x < dj_count; x += 1) {
                    code += '\n\n' + DjangoModels.at(x).toPython();
                }
            }
            this.output(code);
            return false;
        },

        toJSON: function (e) {
            this.output(JSON.stringify(DjangoModels, null, 2));
            return false;
        },

        output: function (code) {
            var margin = emSize(2.7);
            $.jAlert(_.template($('#output-template').html())({
                code: code.trim()
            }), {
                buttons: {
                    Close: function (e, ui) {
                        $(this).dialog('close');
                    }
                },
                height: 450,
                hide: 'fade',
                modal: true,
                show: 'fade',
                width: 625 + margin
            });
        },

        destroyTheWorld: function (e) {
            var model,
                models_count = DjangoModels.length,
                x;
            if (models_count === 0) {
                this.report(new NothingToKillError());
                return false;
            }
            $.jConfirm('Kill them all?', {submit: function () {
                models_count = DjangoModels.length;
                for (x = 0; x < models_count; x += 1) {
                    model = DjangoModels.at(0);
                    $('#' + model.get('id')).detach();
                    model.destroy();
                }
            }});
            return false;
        },

        // Model
        promptModelName: function (e) {
            $.jPrompt(_.template($('#model-name-template').html())({
                label: 'Model name',
                name: '',
                base_class: ''
            }), {
                submit: function () {
                    App.createModel();
                }
            });
            return false;
        },

        createModel: function () {
            var base_class = '', coords, holder, model, model_name, view;
            holder = $('#model-name-template-holder');
            model_name = holder.find('#model-name-input').val();
            if (holder.find('#model-name-overwrite-inheritance:checked').size()) {
                base_class = holder.find('#model-base-class').val();
            }
            try {
                coords = getDeployCoords();
                model = DjangoModels.create({
                    base_class: base_class,
                    name: model_name,
                    x: coords[0],
                    y: coords[1]
                });
            } catch (err) {
                this.report(err);
                return false;
            }
            if (!model) {
                return false;
            }
            view = new DjangoModelView({model: model});
            view.deploy(this.holder);
            this.initialize();
            return false;
        },

        raiseModel: function (e) {
            var model, model_dom, model_id;
            if (DjangoModels.length === 1) {
                return true;
            }
            /* This doesn't work and I don't know why.
            if ($(e.target).hasClass('model')) {
                model_dom = $(e.target);
            } else {
                model_dom = $(e.target).closest('.model');
            }
            // $('#workspace').append(model_dom.remove());
            model_dom.remove();
            $('#workspace').children('.model').each(function (i, el) {
                model = DjangoModels.get($(el).attr('id'));
                model.set({position: i + 1, z: i + 1});
                model.save();
                view = DjangoModelView({model: model});
                view.deploy(this.holder);
                // $('#' + el.id).css('z-index', i + 1);
                // App.initialize();
            });
            $(e.target).focus();
            */
            if ($(e.target).hasClass('model')) {
                model_dom = $(e.target);
                model_id = model_dom.attr('id');
            } else {
                model_dom = $(e.target).closest('.model');
                model_id = model_dom.attr('id');
            }
            if (Number(model_dom.css('z-index')) === DjangoModels.size()) {
                return true;
            }
            model = DjangoModels.get(model_id);
            // DjangoModels.remove(model, {silent: true});
            // DjangoModels.add(model, {silent: true});
            DjangoModels.each(function (el, i, list) {
                // For some reason I receive a ghost object sometimes.
                if (el.id) {
                    // I substract one from every z higher than the model I'm
                    // rising, that way I know that when I assign it the highest
                    // value no other model will have it.
                    if (el.get('z') > model.get('z')) {
                        el.save({z: el.get('z') - 1});
                        $('#' + el.id).css('z-index', el.get('z'));
                    }
                }
            });
            model.save({z: DjangoModels.length});
            model_dom.css('z-index', model.get('z'));
            // this.initialize();
        },

        promptModelNewName: function (e) {
            var base_class,
                el = $(e.target).parent();
            base_class = el.find('.base-class').html();
            $.jPrompt(_.template($('#model-name-template').html())({
                label: 'Model name',
                name: el.find('.name').html(),
                base_class: base_class ? base_class.substring(1, base_class.length - 1) : ''
            }), {
                submit: function (context) {
                    App.changeModelName(context);
                },
                context: e
            });
            return false;
        },

        changeModelName: function (e) {
            var base_class,
                dialog = $('#model-name-template-holder'),
                model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            base_class = dialog.find('input:checked').size() ? dialog.find('#model-base-class').val() : '';
            try {
                model.save({
                    name: dialog.find('#model-name-input').val(),
                    base_class: base_class
                });
            } catch (err) {
                this.report(err);
            }
            this.initialize();
        },

        destroyModel: function (e) {
            var model;
            model = DjangoModels.get($(e.target).parent().parent().attr('id'));
            $.jConfirm('Kill model ' + model.get('name') + '?', {submit: function (model) {
                model.destroy();
                DjangoModels.remove(model);
                App.initialize();
            }, context: model});
            return false;
        },

        modelMetaOptions: function (e) {
            $.jPrompt(_.template($('#model-meta-template').html())({
                model: DjangoModels.get($(e.target).closest('.model').attr('id')),
            }), {
                context: e,
                resizable: true,
                submit: function (e) {
                    App.setMetaOptions(e);
                },
                title: 'Model Meta options',
                width: 340
            });
            return false;
        },

        setMetaOptions: function (e) {
            var model,
                options = {},
                val = '';
            model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            for (meta in model.get('meta_options')) {
                option_id = meta.replace(/_/g, '-') + '--' + model.id;
                if (model.get('meta_options')[meta].type !== 'boolean') {
                    val = $('#' + option_id).val();
                    options[meta] = val ? val : '';
                }
            }
            $('.model-meta-template-holder input:checked').each(function () {
                options[this.id.substr(0, this.id.indexOf('--')).replace(/-/g, '_')] = ($(this).val() === 'true') ? true : false;
            });
            model.setMeta(options);
            this.initialize();
        },

        saveModelCoords: function (e) {
            var model = DjangoModels.get(e.target.id);
            model.setPosition($(e.target).css('left'), $(e.target).css('top'));
            model.save();
            if (model.get('x') === 0 || model.get('y') === 0) {
                this.initialize();
            }
        },

        // Field
        createField: function (e) {
            var field, fields, model, params, view;
            if (e.keyCode !== 13) {
                return true;
            }
            try {
                model = DjangoModels.get($(e.target).parent().attr('id'));
                fields = model.get('fields');
                params = {
                    name: e.target.value
                };
                field = fields.create(params);
            } catch (err) {
                this.report(err);
                return false;
            }
            if (!field) {
                return false;
            }
            view = new DjangoModelFieldView({model: field});
            view.deploy($(e.target).parent().children('.model-fields'));
            e.target.value = '';
            return false;
        },

        editField: function (e) {
            var field,
                model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            field = model.get('fields').get($(e.target).closest('.model-field').attr('id'));
            $.jPrompt(_.template($('#model-field-edit-template').html())({
                field: field
            }), {
                context: e,
                open: function (e) {
                    $('#field-type').autocomplete({
                        minLength: 2,
                        source: fields.types
                    });
                },
                resizable: true,
                submit: function (e) {
                    App.saveField(e);
                },
                width: 340
            });
            return false;
        },

        saveField: function (e) {
            var el, field, input, model;
            el = $(e.target);
            model = DjangoModels.get(el.closest('.model').attr('id'));
            field = model.get('fields').get(el.closest('.model-field').attr('id'));
            input = $('#model-field-edit-template-holder');
            field.save({
                name: input.find('#field-name').val(),
                type: input.find('#field-type').val()
            });
            if (fields.isKnown(field.get('name'))) {
                $.jPrompt(_.template($('#model-field-options-template').html())({
                    options: fields.getOptions(field.get('name'))
                }), {
                    context: e,
                    resizable: true,
                    submit: function (e) {
                        App.saveFieldOptions(e);
                    },
                    width: 340
                });
            }
            return false;
        },

        saveFieldOptions: function (e) {
            return false;
        },

        saveFieldPosition: function (e) {
            var field, fields;
            fields = DjangoModels.get($(e.target).closest('.model').attr('id')).get('fields');
            $(e.target).closest('.model-fields').children('.model-field').each(function (i, el) {
                field = fields.get($(el).attr('id'));
                field.save({position: i + 1});
            });
            fields.sort();
            return true;
        },

        destroyField: function (e) {
            var field, fields, model;
            model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            fields = model.get('fields');
            field = fields.get($(e.target).closest('.model-field').attr('id'));
            $.jConfirm('Kill field ' + field.get('name') + '?', {submit: function (params) {
                params.field.destroy();
                params.fields.remove(params.field);
                if (params.model.getMeta('get_latest_by') === params.model.id) {
                    params.model.setMeta({'get_latest_by': ''});
                }
                App.initialize();
            }, context: {field: field, fields: fields, model: model}});
            return false;
        },

        focusNewField: function (e) {
            if (e.target.value === 'New field') {
                e.target.value = '';
                $(e.target).removeClass('blur');
                $(e.target).addClass('focus');
            }
        },

        blurNewField: function (e) {
            if (e.target.value === '') {
                e.target.value = 'New field';
                $(e.target).addClass('blur');
                $(e.target).removeClass('focus');
            }
        },

        // Method
        createMethod: function (e) {
            var method, methods, model, model_id, view;
            if (e.keyCode !== 13) {
                return true;
            }
            model_id = e.target.id.substr(5);
            // Repeated code, can be DRY'ed?
            try {
                model = DjangoModels.get(model_id);
                methods = model.get('methods');
                method = methods.create({
                    name: e.target.value
                });
            } catch (err) {
                this.report(err);
                return false;
            }
            if (!method) {
                return false;
            }
            view = new DjangoModelMethodView({model: method});
            view.deploy($('#' + model_id).children('.model-methods'));
            e.target.value = '';
            return false;
        },

        editMethod: function (e) {
            $.jPrompt(_.template($('#method-signature-template').html())({
                signature: $(e.target).html()
            }), {
                submit: function (e) {
                    App.parseMethodSignature(e);
                },
                context: e
            });
            return false;
        },

        parseMethodSignature: function (e) {
            var el, i, match, method, model, signature;
            signature = $('#method-signature-template-holder').find('#method-signature-input').val();
            match = signature.match(/^[\w_]+\([\w,\s\*]+\)$/g);
            if (match === null || (match.length !== 1 && match[0] !== signature)) {
                this.report(new InvalidSignatureError());
                return false;
            }
            model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            method = model.get('methods').get($(e.target).parent().attr('id'));
            i = signature.indexOf('(');
            try {
                method.save({
                    name: signature.substr(0, i),
                    params: signature.substring(i + 1, signature.length - 1).split(',')
                });
            } catch (err) {
                this.report(err);
            }
            el = $(e.target).parent();
            el.children('.signature').html(method.getSignature());
        },

        saveMethodPosition: function (e) {
            var method, methods;
            methods = DjangoModels.get($(e.target).closest('.model').attr('id')).get('methods');
            $(e.target).closest('.model-methods').children('.model-method').each(function (i, el) {
                method = methods.get($(el).attr('id'));
                method.save({position: i + 1});
            });
            return true;
        },

        destroyMethod: function (e) {
            var method, methods;
            methods = DjangoModels.get($(e.target).closest('.model').attr('id')).get('methods');
            method = methods.get($(e.target).closest('.model-method').attr('id'));
            $.jConfirm('Kill method ' + method.get('name') + '?', {submit: function (params) {
                params.method.destroy();
                params.methods.remove(params.method);
                App.initialize();
            }, context: {method: method, methods: methods}});
            return false;
        },

        focusNewMethod: function (e) {
            if (e.target.value === 'New method') {
                e.target.value = '';
                $(e.target).removeClass('blur');
                $(e.target).addClass('focus');
            }
        },

        blurNewMethod: function (e) {
            if (e.target.value === '') {
                e.target.value = 'New method';
                $(e.target).addClass('blur');
                $(e.target).removeClass('focus');
            }
        }
    });

    window.App = new AppView();
});
