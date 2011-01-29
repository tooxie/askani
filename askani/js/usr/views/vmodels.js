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
            'focus .new-model-field': 'focusNewInput',
            'focus .new-model-method': 'focusNewInput',
            'keypress .new-model-field': 'createObject',
            'keypress .new-model-method': 'createObject'
        }),

        initialize: function (attr) {
            _.bindAll(this, 'render');
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
            return true;
        }
    });

    window.DjangoModelFieldView = Backbone.View.extend({
        __class__: 'DjangoModelFieldView',

        tagName: 'div',

        className: 'model-field',

        template: _.template($('#model-field-template').html()),

        render: function (e) {
            $(this.el).html(this.template({
                object: this.model
            }));
            return this;
        }
    });

    window.DjangoModelMethodView = Backbone.View.extend({
        __class__: 'DjangoModelMethodView',

        tagName: 'div',

        className: 'model-method',

        template: _.template($('#model-method-template').html()),

        render: function (e) {
            $(this.el).html(this.template({
                object: this.model
            }));
            return this;
        }
    });
});
