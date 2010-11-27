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
         DjangoModels,
         DjangoModelFieldView,
         DjangoModelMethodView,
         DjangoModelView,
         emSize,
         ExceptionView,
         Fields,
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

        events: {
            'click .model-method-kill': 'destroyMethod',
            'dblclick .signature': 'editMethod',
        },

        initialize: function (attr) {
            _.bindAll(this, 'render');
            $(attr.container).append(this.render());
        },

        render: function () {
            $(this.el).html(this.template({
                method: this.model
            })).attr('id', this.model.id);
            return this;
        },

        editMethod: function (e) {
            $.jPrompt(_.template($('#method-signature-template').html())({
                signature: $(e.target).html()
            }), {
                context: {e: e, view: this},
                submit: function (params) {
                    params.view.parseMethodSignature(params.e);
                }
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

        destroyMethod: function (e) {
            var method, methods;
            methods = DjangoModels.get($(e.target).closest('.model').attr('id')).get('methods');
            method = methods.get($(e.target).closest('.model-method').attr('id'));
            $.jConfirm('Kill method ' + method.get('name') + '?', {submit: function (params) {
                params.view.model.destroy();
                params.methods.remove(params.method);
                $(params.view.el).remove();
            }, context: {method: method, methods: methods, view: this}});
            return false;
        }
    });

    window.DjangoModelFieldView = Backbone.View.extend({
        tagName: 'div',

        className: 'model-field',

        template: _.template($('#model-field-template').html()),

        events: {
            'click .model-field-kill': 'destroyField',
            'dblclick .model-field .type, .model-field .name': 'editField',
        },

        initialize: function (attr) {
            _.bindAll(this, 'render');
            $(attr.container).append(this.render());
        },

        render: function () {
            $(this.el).html(this.template({
                field: this.model
            })).attr('id', this.model.id);
            return this;
        },

        destroyField: function (e) {
            var field,
                fields,
                model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            fields = model.get('fields');
            $.jConfirm('Kill field ' + this.model.get('name') + '?', {
                submit: function (params) {
                    if (model.getMeta('get_latest_by') === params.model.id) {
                        model.setMeta({'get_latest_by': ''});
                    }
                    params.view.model.destroy();
                    params.fields.remove(params.field);
                    $(params.view.el).remove();
            }, context: {field: field, fields: fields, model: model, view: this}});
            return false;
        },

        editField: function (e) {
            $.jPrompt(_.template($('#model-field-edit-template').html())({
                field: this.model
            }), {
                context: {e: e, view: this},
                open: function (event, ui) {
                    $('#field-type').autocomplete({
                        minLength: 2,
                        source: Fields.types
                    });
                    $.jDefaults.open(event, ui);
                },
                resizable: true,
                submit: function (params) {
                    params.view.saveField(params.e);
                },
                width: 340
            });
            return false;
        },

        saveField: function (e) {
            var el = $(e.target),
                field = this.model,
                input = $('#model-field-edit-template-holder'),
                model;
            model = DjangoModels.get(el.closest('.model').attr('id'));
            field.save({
                name: input.find('#field-name').val(),
                type: input.find('#field-type').val()
            });
            // TODO: Repensar la forma de editar las opciones de un campo.
            if (Fields.isKnown(field.get('name'))) {
                $.jPrompt(_.template($('#model-field-options-template').html())({
                    options: Fields.getOptions(field.get('name'))
                }), {
                    context: {e: e, view: this},
                    resizable: true,
                    submit: function (params) {
                        params.view.saveFieldOptions(params.e);
                    },
                    width: 340
                });
            }
            this.render();
            return false;
        },

        saveFieldOptions: function (e) {
            return false;
        }
    });

    window.DjangoModelView = Backbone.View.extend({
        tagName: 'div',

        className: 'model',

        container: '#workspace',

        template: _.template($('#model-template').html()),

        events: {
            'click .model-meta': 'modelMetaOptions',
            'dblclick .model-name .name, .model-name .base-class': 'promptModelNewName',

            // Fields
            'blur .new-model-field': 'blurNewField',
            'focus .new-model-field': 'focusNewField',
            'keypress .new-model-field': 'createField',
            'sortupdate .model-fields': 'saveFieldPosition',

            // Methods
            'blur .new-model-method': 'blurNewMethod',
            'focus .new-model-method': 'focusNewMethod',
            'keypress .new-model-method': 'createMethod',
            'sortupdate .model-methods': 'saveMethodPosition'
        },

        initialize: function () {
            _.bindAll(this, 'render');
            $(this.container).append(this.render().el);
        },

        render: function () {
            var collection,
                container,
                element = $(this.el),
                fields,
                fsize,
                holder,
                methods,
                sortable_args = {
                    placeholder: 'ui-sortable-placeholder',
                    revert: true,
                    change: function (e, ui) {
                        $(ui.placeholder).hide().slideDown();
                    }
                },
                view,
                x;

            element.html(this.template({
                model: this.model
            }));
            element.attr('id', this.model.id);
            element.draggable({handle: '.model-name, .model-footer'});
            element.css('height',   this.model.get('height'))
                   .css('left',     this.model.get('x'))
                   .css('position', 'absolute')
                   .css('top',      this.model.get('y'))
                   .css('width',    this.model.get('width'))
                   .css('z-index',  this.model.get('z'));

            // Fields
            fields = element.find('.model-fields');
            this.model.get('fields').each(function (field) {
                view = new DjangoModelFieldView({
                    model: field,
                    container: fields
                });
                fields.append(view.render().el);
            }, this, fields);
            fields.sortable(sortable_args);
            fields.disableSelection();

            // Methods
            methods = element.find('.model-methods');
            this.model.get('methods').each(function (method) {
                view = new DjangoModelMethodView({
                    model: method,
                    container: methods
                });
                methods.append(view.render().el);
            }, methods);
            methods.sortable(sortable_args);
            methods.disableSelection();

            return this;
        },

        modelMetaOptions: function (e) {
            $.jPrompt(_.template($('#model-meta-template').html())({
                model: DjangoModels.get($(e.target).closest('.model').attr('id'))
            }), {
                context: {e: e, view: this},
                resizable: true,
                submit: function (params) {
                    params.view.setMetaOptions(params.e);
                },
                title: 'Model Meta options',
                width: 340
            });
            return false;
        },

        setMetaOptions: function (e) {
            var meta,
                model,
                options = {},
                option_id,
                val = '';
            model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            for (meta in model.get('meta_options')) {
                if (model.getMeta(meta)) {
                    option_id = meta.replace(/_/g, '-') + '--' + model.id;
                    if (model.get('meta_options')[meta].type !== 'boolean') {
                        val = $('#' + option_id).val();
                        options[meta] = val ? val : '';
                    }
                }
            }
            $('#model-meta-template-holder input:checked').each(function () {
                options[this.id.substr(0, this.id.indexOf('--')).replace(/-/g, '_')] = ($(this).val() === 'true') ? true : false;
            });
            model.setMeta(options);
            this.initialize();
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
                context: {e: e, view: this},
                submit: function (params) {
                    params.view.changeModelName(params.e);
                }
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

        // Field
        createField: function (e) {
            var container,
                field,
                fields,
                model,
                params,
                target = $(e.target),
                view;
            if (e.keyCode !== 13) {
                return true;
            }
            try {
                model = DjangoModels.get(target.parent().attr('id'));
                fields = model.get('fields');
                params = {
                    name: target.val()
                };
                field = fields.create(params);
            } catch (err) {
                App.report(err);
                return false;
            }
            if (!field) {
                return false;
            }
            container = target.parent().children('.model-fields');
            view = new DjangoModelFieldView({
                model: field,
                container: container
            });
            container.append(view.render().el);
            target.val('');
            return false;
        },

        saveFieldPosition: function (e) {
            var field,
                fields,
                target = $(e.target);
            fields = DjangoModels.get(target.closest('.model').attr('id')).get('fields');
            target.closest('.model-fields').children('.model-field').each(function (i, el) {
                field = fields.get($(el).attr('id'));
                field.save({position: i + 1});
            });
            fields.sort();
            return true;
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
            var container,
                method,
                methods,
                model,
                model_id,
                target = $(e.target),
                view;
            if (e.keyCode !== 13) {
                return true;
            }
            model_id = target.attr('id').substr(5);
            // Repeated code, can be DRY'ed?
            try {
                model = DjangoModels.get(model_id);
                methods = model.get('methods');
                method = methods.create({
                    name: target.val()
                });
            } catch (err) {
                App.report(err);
                return false;
            }
            if (!method) {
                return false;
            }
            container = target.parent().children('.model-methods');
            view = new DjangoModelMethodView({
                model: method,
                container: container
            });
            container.append(view.render().el);
            target.val('');
            return false;
        },

        saveMethodPosition: function (e) {
            var method,
                methods,
                target = $(e.target);
            methods = DjangoModels.get(target.closest('.model').attr('id')).get('methods');
            target.closest('.model-methods').children('.model-method').each(function (i, el) {
                method = methods.get($(el).attr('id'));
                method.save({position: i + 1});
            });
            return true;
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

    window.AppView = Backbone.View.extend({
        el: $('body'),

        container: '#workspace',

        events: {
            // Toolbar
            'click #to-python': 'toPython',
            'click #to-json': 'toJSON',
            'click #kill-all': 'destroyTheWorld',

            // Models
            'click #new-model': 'promptModelName',
            'click .model': 'raiseModel',
            'click .model-kill': 'destroyModel',
            'dragstop .model': 'saveModelCoords',
        },

        initialize: function () {
            _.bindAll(this, 'render');
            DjangoModels.fetch();
            this.render();
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
        },

        render: function () {
            $(this.container).html('');
            DjangoModels.each(function (model, i) {
                var view = new DjangoModelView({model: model});
                $('#workspace').append(view.render().el);
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
                context: this,
                submit: function (view) {
                    view.createModel();
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
            $(this.container).append(view.render().el);
            return false;
        },

        raiseModel: function (e) {
            var model, model_dom, model_id;
            if (DjangoModels.length === 1) {
                return true;
            }
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

        saveModelCoords: function (e) {
            var model = DjangoModels.get(e.target.id);
            model.setPosition($(e.target).css('left'), $(e.target).css('top'));
            model.save();
            if (model.get('x') === 0 || model.get('y') === 0) {
                this.initialize();
            }
        },

        renderField: function (field) {
            view = new DjangoModelFieldView({
                field: field
            });
            return view.render().el;
        },

        renderMethod: function (method) {
            view = new DjangoModelMethodView({
                method: method
            });
            return view.render().el;
        }
    });

    window.App = new AppView();
});
