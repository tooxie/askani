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
         AskaniView,
         window
*/

// substr(6) == 'clone_'
$(function () {
    window.DjangoModelView = AskaniView.extend({
        __class__: 'DjangoModelView',

        model: DjangoModel,

        className: 'model object',

        template: _.template($('#model-template').html()),

        events: $.extend({}, AskaniView.prototype.events, {
            'blur .new-model-field': 'blurNewInput',
            'blur .new-model-method': 'blurNewInput',
            'click .model-meta': 'modelMetaOptions',
            'focus .new-model-field': 'focusNewInput',
            'focus .new-model-method': 'focusNewInput',
            'keypress .new-model-field': 'createObject',
            'keypress .new-model-method': 'createObject'
        }),

        initialize: function (attr) {
            AskaniView.prototype.initialize.call(this, attr);
            this.container = '#' + attr.container + ' .models';
        },

        render: function () {
            var el = $(this.el),
                fields,
                methods,
                sortable_args = {
                    placeholder: 'ui-sortable-placeholder',
                    revert: true
                },
                view;

            AskaniView.prototype.render.call(this);

            fields = el.children('.model-fields');
            methods = el.children('.model-methods');

            fields.sortable(sortable_args);
            methods.sortable(sortable_args);

            if (typeof this.model.get('fields') !== 'undefined') {
                this.appendChildren('fields', DjangoModelFieldView, fields);
            }
            if (typeof this.model.get('methods') !== 'undefined') {
                this.appendChildren('methods', DjangoModelMethodView, methods);
            }

            return this;
        },

        appendChildren: function (attribute, View, container) {
            this.model.get(attribute).each(function(element, i) {
                view = new View({
                    model: element
                });
                container.append(view.render().el);
            }, container)
        },

        saveCoords: function(e) {
            var object,
                target = $(e.target),
                target_id;
            if (target.hasClass('clone')) {
                target_id = target.attr('id').substr(6);
                object = CurrentDjangoApp.model.get('models').get(target_id);
                object.setPosition(target.css('left'), target.css('top'));
                target.css('left', object.get('x'))
                      .css('top', object.get('y'));  // The clone
            }
            target = $('#' + target_id);
            target.css('left', object.get('x'))
                  .css('top', object.get('y'));  // The original
            return true;
        },

        isField: function (target) {
            if (target.hasClass('new-model-field')) {
                return true;
            }
            return false;
        },

        getInputText: function (target) {
            if (this.isField(target)) {
                return 'New field';
            } else {
                return 'New method';
            }
            return '';
        },

        focusNewInput: function (e) {
            var input_text,
                target = $(e.target);
            input_text = this.getInputText(target);
            if (target.val() === input_text) {
                target.val('');
                target.removeClass('blur');
                target.addClass('focus');
            }
        },

        blurNewInput: function (e) {
            var input_text,
                target = $(e.target);
            input_text = this.getInputText(target);
            if (target.val() === '') {
                target.val(input_text);
                target.addClass('blur');
                target.removeClass('focus');
            }
        },

        createObject: function (e) {
            var created,
                target = $(e.target);
            if (e.keyCode !== 13) {
                return true;
            }
            if (this.isField(target)) {
                created = this.createField(target);
            } else {
                created = this.createMethod(target);
            }
            if (created) {
                target.val('');
            }
            return false;
        },

        createField: function (target) {
            var container,
                field,
                fields,
                model,
                model_el = target.closest('.model'),
                params,
                view;
            try {
                model = this.collection.get(model_el.attr('id').substr(6));
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
            container = model_el.children('.model-fields');
            view = new DjangoModelFieldView({
                model: field
            });
            container.append(view.render().el);
            this.model = model;
            return true;
        },

        createMethod: function (target) {
            var container,
                method,
                methods,
                model,
                model_el = target.closest('.model'),
                params,
                view;
            try {
                model = this.collection.get(model_el.attr('id').substr(6));
                methods = model.get('methods');
                params = {
                    name: target.val()
                };
                method = methods.create(params);
            } catch (err) {
                App.report(err);
                return false;
            }
            if (!method) {
                return false;
            }
            container = model_el.children('.model-methods');
            view = new DjangoModelMethodView({
                model: method
            });
            container.append(view.render().el);
            this.model = model;
            return true;
        },

        modelMetaOptions: function (e) {
            var model,
                target = $(e.target),
                target_id;
            target_id = target.closest('.model').attr('id').substr(6);
            model = CurrentDjangoApp.model.get('models').get(target_id);
            $.jPrompt(_.template($('#model-meta-template').html())({
                model: model
            }), {
                context: {
                    model: model,
                    view: this
                },
                submit: function (params) {
                    params.view.setMetaOptions(params.model);
                },
                title: 'Model Meta options',
                width: 340
            });
            return false;
        },

        setMetaOptions: function (model) {
            var meta,
                options = {},
                option_id,
                val = '';
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
            model.setMeta(options);  // Original
            this.model = model;  // Clone
            this.model.id = this.id;  // Hack. Sorry =(
            this.render();
        }
    });

    window.DjangoModelFieldView = Backbone.View.extend({
        __class__: 'DjangoModelFieldView',

        tagName: 'div',

        className: 'model-field',

        template: _.template($('#model-field-template').html()),

        events: {
            'click .model-field-kill': 'destroy',
            'dblclick .model-field .type, .model-field .name': 'edit'
        },

        initialize: function () {
            if (this.model) {
                this.id = this.model.id;
            }
        },

        render: function (e) {
            $(this.el).html(this.template({
                object: this.model
            })).attr('id', this.model.id);
            return this;
        },

        destroy: function (e) {
            var field,
                fields,
                model,
                model_id,
                target = $(e.target);
            model_id = target.closest('.model').attr('id').substr(6);
            model = CurrentDjangoApp.model.get('models').get(model_id);
            fields = model.get('fields');
            field = fields.get(target.closest('.model-field').attr('id'));
            $.jConfirm('Kill field ' + field.get('name') + '?', {
                submit: function (params) {
                    params.view.model.destroy();
                    params.field.destroy();
                    params.fields.remove(params.field);
                    $(params.view.el).remove();
                }, context: {
                    field: field,
                    fields: fields,
                    view: this
                }
            });
            return false;
        },

        edit: function (e) {
            var target = $(e.target);
            $.jPrompt(_.template($('#model-field-edit-template').html())({
                object: this.model
            }), {
                context: {
                    target: target,
                    view: this
                },
                open: function (event, ui) {
                    $('#field-type').autocomplete({
                        minLength: 2,
                        source: Fields.types
                    });
                    $.jDefaults.open(event, ui);
                },
                resizable: true,
                submit: function (params) {
                    params.view.saveField(params.target);
                },
                width: 340
            });
            return false;
        },

        saveField: function (target) {
            var field = this.model,
                input = $('#model-field-edit-template-holder'),
                model;
            model = DjangoModels.get(target.closest('.model').attr('id'));
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

    window.DjangoModelMethodView = Backbone.View.extend({
        __class__: 'DjangoModelMethodView',

        tagName: 'div',

        className: 'model-method',

        template: _.template($('#model-method-template').html()),

        events: {
            'click .model-method-kill': 'destroy',
            'dblclick .signature': 'edit'
        },

        render: function (e) {
            $(this.el).html(this.template({
                object: this.model
            })).attr('id', this.model.id);
            return this;
        },

        destroy: function (e) {
            var method,
                methods,
                model,
                model_id,
                target = $(e.target);
            model_id = target.closest('.model').attr('id').substr(6);
            model = CurrentDjangoApp.model.get('models').get(model_id);
            methods = model.get('methods');
            method = methods.get(target.closest('.model-method').attr('id'));
            $.jConfirm('Kill method ' + method.get('name') + '?', {
                submit: function (params) {
                    params.view.model.destroy();
                    params.method.destroy();
                    params.methods.remove(params.method);
                    $(params.view.el).remove();
                }, context: {
                    method: method,
                    methods: methods,
                    view: this
                }
            });
            return false;
        },

        edit: function (e) {
            var target = $(e.target);
            $.jPrompt(_.template($('#method-signature-template').html())({
                signature: target.html()
            }), {
                context: {
                    target: target,
                    view: this
                },
                submit: function (params) {
                    params.view.setSignature(params.target);
                }
            });
            return false;
        },

        setSignature: function (target) {
            var i,
                method,
                method_el = target.closest('.model-method'),
                model,
                model_id,
                signature;
            signature = $('#method-signature-template-holder').find('#method-signature-input').val();
            model_id = target.closest('.model').attr('id').substr(6);
            model = CurrentDjangoApp.model.get('models').get(model_id);
            method = model.get('methods').get(method_el.attr('id'));
            i = signature.indexOf('(');
            try {
                method.save({
                    name: signature.substr(0, i),
                    params: signature.substring(i + 1, signature.length - 1)
                                     .split(',')
                });
            } catch (err) {
                App.report(err);
                return false;
            }
            method_el.children('.signature').html(method.getSignature());
        }
    });
});
