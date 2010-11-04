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
         confirm,
         DjangoModelFieldView,
         DjangoModelMethodView,
         DjangoModels,
         DjangoModelView,
         emSize,
         ExceptionView,
         NothingToKillError,
         prompt,
         window
*/

$(function () {
    window.DjangoModelMethodView = Backbone.View.extend({
        tagName: "div",

        className: "method",

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
        tagName: "div",

        className: "field",

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
        tagName: "div",

        className: "model",

        template: _.template($('#model-template').html()),

        render: function () {
            return this.template(this.model.toJSON());
        },

        deploy: function (element_id) {
            var collection, fsize, holder, view, x;
            $(element_id).append(this.render());
            this.el = $('#' + this.model.id);
            this.el.draggable().css('position', 'absolute').css('left', this.model.get('x')).css('top', this.model.get('y')).css('z-index', this.model.get('z'));
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
            "click #to-python": "toPython",
            "click #to-json": "toJSON",
            "click #kill-all": "destroyTheWorld",
            "click #output-close": "closeOutput",

            // Models
            "click #new-model": "newModel",
            "click .model": "raiseModel",
            "click .model-kill": "destroyModel",
            "dblclick .model": "promptNewModelName",
            "dragstop .model": "saveModelCoords",

            // Fields
            "click .new-field": "newField",
            "click .field-kill": "destroyField",

            // Methods
            // "click .new-method": "newMethod",
            "keypress .new-method": "createMethod",
            "click .method-kill": "destroyMethod"

        },

        initialize: function () {
            var sortable_args;
            _.bindAll(this, 'newModel', 'newField', 'newMethod', 'render');
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
            code = "# -*- coding: utf-8 -*-\nfrom django.db import models\n";
            dj_count = DjangoModels.size();
            if (dj_count === 0) {
                code += "\n# Create your models here.";
            } else {
                for (x = 0; x < dj_count; x += 1) {
                    code += "\n\n" + DjangoModels.at(x).toPython();
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
            if (!confirm('Destroy the world?')) {
                return false;
            } else if (!confirm('Are you really really sure?')) {
                return false;
            }
            for (x = 0; x < models_count; x += 1) {
                DjangoModels.at(0).destroy();
            }
            this.render();
            return false;
        },

        closeOutput: function (e) {
            $(e.target).closest('#output').fadeOut();
            return false;
        },

        // Model
        newModel: function (obj) {
            var model, view;
            if (typeof obj !== "string") {
                $.jPrompt('Model name:', {submit: function (name) {
                    App.newModel(name);
                }});
                return false;
            }
            try {
                model = DjangoModels.create({name: obj});
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
            if (DjangoModels.size() === 1) {
                return true;
            }
            if (e) {
                var model = DjangoModels.get(e.target.id);
                DjangoModels.remove(model, {silent: true});
                DjangoModels.add(model, {silent: true});
            }
            DjangoModels.each(function (el, i) {
                var z = DjangoModels.size() - i;
                $('#' + el.id).css('z-index', z);
                el.set({z: z});
                el.save();
            });
        },

        promptNewModelName: function (e) {
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
            var model = DjangoModels.get($(e.target).parent().parent().attr('id'));
            if (confirm('Delete model ' + model.get('name') + '?')) {
                model.destroy();
                this.render();
            }
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
        newField: function (obj) {
            // TODO: Terminar esto.
            var field, fields, model, params, view;
            $.jPrompt('Method name:', {submit: function (name, context) {
                App.createMethod(name, context);
            }});
            return false;
            try {
                model = DjangoModels.get($(e.target).closest('.model').attr('id'));
                fields = model.get('fields');
                params = {name: prompt('Field name'), value: prompt('Field value')};
                field = fields.create(params);
            } catch (err) {
                this.report(err);
                return false;
            }
            if (!field) {
                return false;
            }
            view = new DjangoModelFieldView({model: field});
            view.deploy($(e.target).parent().parent().children('.model-fields'));
            return false;
        },

        destroyField: function (e) {
            var field = DjangoModels.get($(e.target).closest('.model').attr('id')).get('fields').get($(e.target).closest('.field').attr('id'));
            if (confirm('Delete field ' + field.get('name') + '?')) {
                field.destroy();
                this.render();
            }
        },

        // Method
        requestMethodParams: function(method_name, model_id) {
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
                method = methods.create({name: e.target.value});
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

        destroyMethod: function (e) {
            var method, model;
            model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            method = model.get('methods').get($(e.target).closest('.method').attr('id'));
            if (confirm('Delete method ' + method.get('name') + '()?')) {
                method.destroy();
                this.render();
            }
        }
    });

    window.App = new AppView();
});
