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
         AppView,
         Backbone,
         confirm,
         DjangoModelFieldView,
         DjangoModelMethodView,
         DjangoModels,
         DjangoModelView,
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
            $('#' + this.model.id).draggable().css('position', 'absolute').css('left', this.model.get('x')).css('top', this.model.get('y')).css('z-index', this.model.get('z'));
            this.el = $('#' + this.model.id);

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
            "click .model-name": "changeModelName",
            "dblclick .model": "destroyModel",
            "dragstop .model": "saveModelCoords",

            // Fields
            "click .new-field": "newField",
            "dblclick .field": "destroyField",

            // Methods
            "click .new-method": "newMethod",
            "dblclick .method": "destroyMethod"

        },

        initialize: function () {
            _.bindAll(this, 'newModel', 'newField', 'newMethod', 'render');
            // DjangoModels.bind('add', this.addOne);
            // DjangoModels.bind('refresh', this.addAll);
            // DjangoModels.bind('all', this.render);
            // DjangoModels._reset();
            DjangoModels.fetch();
            /*
            var djlength, Fields, Methods, x;
            djlength = DjangoModels.length;
            for (x = 0; x < djlength; x += 1) {
                Fields = DjangoModels.at(x).get('fields');
                // Fields.bind();
                // Fields.fetch();
                Methods = DjangoModels.at(x).get('methods');
                // Methods.bind();
                // Methods.fetch();
            }
            */
            this.render();
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
            $('#code').val(code.trim()).focus();
            $('#output').draggable().css('position', 'absolute').css('z-index', 1001).fadeIn();
            return false;
        },

        toJSON: function(e) {
            $('#code').val(JSON.stringify(DjangoModels, null, 2)).focus();
            $('#output').draggable().css('position', 'absolute').css('z-index', 1001).fadeIn();
            return false;
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
        newModel: function (e) {
            var model, view;
            try {
                model = DjangoModels.create({name: prompt('Model name')});
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

        changeModelName: function (e) {
            // FIXME: Decouple the class name.
            var model = DjangoModels.get($(e.target).closest('.model').attr('id'));
            try {
                model.save({name: prompt('New name')});
            } catch (err) {
                this.report(err);
            }
            this.render();
        },

        destroyModel: function (e) {
            var model = DjangoModels.get(e.target.id);
            if (confirm('Delete model ' + model.get('name') + '?')) {
                model.destroy();
                this.render();
            }
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
        newField: function (e) {
            var field, fields, model, params, view;
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
            view.deploy($(e.target).closest('.model-fields'));
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
        newMethod: function (e) {
            // Repeated code, can be DRY'ed?
            var method, methods, model, view;
            try {
                model = DjangoModels.get($(e.target).closest('.model').attr('id'));
                methods = model.get('methods');
                method = methods.create({name: prompt('Method name')});
            } catch (err) {
                this.report(err);
                return false;
            }
            if (!method) {
                return false;
            }
            view = new DjangoModelMethodView({model: method});
            view.deploy($(e.target).closest('.model-methods'));
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
