/*jslint
         bitwise: true,
         eqeqeq: true,
         immed: true,
         indent: 4,
         newcap: true,
         nomen: false,
         onevar: true,
         plusplus: true,
         regexp: true,
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
            return this.template(this.model.toJSON());
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
            return this.template(this.model.toJSON());
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
            return this.template(this.model.toJSON());
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
            this.el.find('.new-attribute').keypress(function (e) {
                if (e.keyCode === 13) {
                    App.requestAttributeDetails(e.target.id.substr(5));
                }
            });

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
            'click #new-model': 'createModel',
            'click .model': 'raiseModel',
            'click .model-kill': 'destroyModel',
            'click .model-metadata': 'modelMetadata',
            'dblclick .model-name': 'promptModelNewName',
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
            'dblclick .model-method .name': 'editMethod',
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
            $('#code').val(code.trim()).focus();
            $('#output').removeClass('hidden').dialog({
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
            }).fadeIn();
        },

        destroyTheWorld: function (e) {
            var models_count = DjangoModels.length, x;
            if (models_count === 0) {
                this.report(new NothingToKillError());
                return false;
            }
            $.jConfirm('Kill them all?', {submit: function () {
                models_count = DjangoModels.length;
                for (x = 0; x < models_count; x += 1) {
                    DjangoModels.at(0).destroy();
                }
                App.render();
            }});
            return false;
        },

        // Model
        createModel: function (obj) {
            var coords, model, view;
            if (typeof obj !== 'string') {
                $.jPrompt('Model name:', {submit: function (name) {
                    App.createModel(name);
                }});
                return false;
            }
            try {
                coords = getDeployCoords();
                model = DjangoModels.create({
                    name: obj,
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
            return false;
        },

        raiseModel: function (e) {
            var model, model_dom, model_id, z;
            if (DjangoModels.length === 1) {
                return true;
            }
            /* This doesn't work and I don't know why.
            if ($(e.target).hasClass('model')) {
                model_dom = $(e.target);
            } else {
                // TODO: When clicking a input field very fast model doesn't rise.
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
                // App.render();
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
                        el.set({z: el.get('z') - 1});
                        el.save();
                        $('#' + el.id).css('z-index', el.get('z'));
                    }
                }
            });
            model.set({z: DjangoModels.length});
            model.save();
            model_dom.css('z-index', model.get('z'));
            // this.render();
        },

        promptModelNewName: function (e) {
            $.jPrompt('New name:', {submit: function (name, context) {
                App.changeModelName(name, context);
            }, context: e});
            return false;
        },

        changeModelName: function (name, e) {
            var model;
            // FIXME: Decouple the class name.
            model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            try {
                model.save({name: name});
            } catch (err) {
                this.report(err);
            }
            this.render();
        },

        destroyModel: function (e) {
            var model;
            model = DjangoModels.get($(e.target).parent().parent().attr('id'));
            $.jConfirm('Delete model ' + model.get('name') + '?', {submit: function (model) {
                model.destroy();
                DjangoModels.remove(model);
                App.render();
            }, context: model});
            return false;
        },

        modelMetadata: function (e) {
            this.report(new NotImplementedError());
            return false;
        },

        saveModelCoords: function (e) {
            var model = DjangoModels.get(e.target.id);
            model.setPosition($(e.target).css('left'), $(e.target).css('top'));
            model.save();
            if (model.get('x') === 0 || model.get('y') === 0) {
                this.render();
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
            this.report(new NotImplementedError());
            return false;
        },

        saveFieldPosition: function (e) {
            var field, fields;
            fields = DjangoModels.get($(e.target).closest('.model').attr('id')).get('fields');
            $(e.target).closest('.model-fields').children('.model-field').each(function (i, el) {
                field = fields.get($(el).attr('id'));
                field.set({position: i + 1});
                field.save();
            });
            return true;
        },

        destroyField: function (e) {
            var field, fields;
            fields = DjangoModels.get($(e.target).closest('.model').attr('id')).get('fields');
            field = fields.get($(e.target).closest('.model-field').attr('id'));
            $.jConfirm('Delete field ' + field.get('name') + '?', {submit: function (params) {
                params.field.destroy();
                params.fields.remove(params.field);
                App.render();
            }, context: {field: field, fields: fields}});
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
        requestMethodParams: function (method_name, model_id) {
            $.jPrompt("Method parameters (don't include self)", {submit: function (name, context) {
                App.createMethod(name, context);
            }, context: {method_name: method_name, model_id: model_id}});
            return false;
        },

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
            $.jPrompt('Method signature:', {prefill: $(e.target).html(), submit: function (signature, e) {
                App.parseMethodSignature(signature, e)
            }, context: e});
            return false;
        },

        parseMethodSignature: function (signature, e) {
            var match, method, model, name, params;
            match = signature.match(/^[\w_]+\([\w,\s\*]+\)$/g);
            if (match === null || (match.length !== 1 && match[0] !== signature)) {
                this.report(new InvalidSignatureError());
                return false;
            }
            model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            method = model.get('methods').get($(e.target).parent().attr('id'));
            i = signature.indexOf('(');
            try {
                method.set({
                    name: signature.substr(0, i),
                    params: signature.substring(i + 1, signature.length - 1).split(',')
                });
            } catch (err) {
                this.report(err);
            }
            method.save();
            el = $(e.target).parent();
            el.children('.name').html(method.getSignature());
        },

        saveMethodPosition: function (e) {
            var method, methods;
            methods = DjangoModels.get($(e.target).closest('.model').attr('id')).get('methods');
            $(e.target).closest('.model-methods').children('.model-method').each(function (i, el) {
                method = methods.get($(el).attr('id'));
                method.set({position: i + 1});
                method.save();
            });
            return true;
        },

        destroyMethod: function (e) {
            var method, methods;
            methods = DjangoModels.get($(e.target).closest('.model').attr('id')).get('methods');
            method = methods.get($(e.target).closest('.model-method').attr('id'));
            $.jConfirm('Delete method ' + method.get('name') + '()?', {submit: function (params) {
                params.method.destroy();
                params.methods.remove(params.method);
                App.render();
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
