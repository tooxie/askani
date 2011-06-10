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
         DjangoApp,
         window
*/

$(function () {
    window.DjangoAppView = AskaniView.extend({
        __class__: 'DjangoAppView',

        model: DjangoApp,

        className: 'app object',

        container: '#workspace',

        template: _.template($('#app-template').html()),

        events: $.extend({}, AskaniView.prototype.events, {
            'click .app-edit': 'edit',
            'click .app-menu-trigger': 'triggerMenu',
            'click .app-models': 'zoomIn',
            'click .to-python': 'toPython'
        }),

        render: function () {
            var models = this.model.get('models');
            AskaniView.prototype.render.call(this);
            $(this.el).draggable({
                cancel: '.cancel-draggable'
            });
            if (models) {
                models.each(function (el, i) {
                    view = new DjangoModelView({
                        container: this.id,
                        model: el,
                        view: null
                    });
                    $(this.el).find('.models').append(view.render().el);
                }, this);
            }
            return this;
        },

        create: function (e, clone) {
            // pNNAC(View, Collection, {input, template_name, keyword, label})
            clone = clone ? clone : false;
            appModels = CurrentDjangoApp.model.get('models');
            this.promptNameAndCreate(DjangoModelView, appModels, '#model-name-template', {
                keyword: 'model',
                label: 'Model name'
            }, '#model-name-input', clone);
            return false;
        },

        edit: function (e) {
            var app,
                target = $(e.target);
            app = App.collection.get(target.closest('.app').attr('id'));
            $.jPrompt(_.template($('#app-name-template').html())({
                app: app,
                label: 'Model name',
                object: this.model
            }), {
                context: {
                    target: target,
                    view: this
                },
                resizable: true,
                submit: function (context) {
                    context.view.save(context.target);
                }
            });
            return false;
        },

        save: function (target) {
            var app,
                app_id = target.closest('.app').attr('id'),
                input = $('#app-name-input');
            app = App.collection.get(app_id);
            app.save({name: input.val()});
            App.render();  // Warum nicht this.render()?
            return false;
        },

        triggerMenu: function (e) {
            var menu,
                target = $(e.target),
                width;
            menu = target.closest('.app').find('.app-menu');
            width = menu.width();  // Hack
            menu.css('left', target.position().left);
            if (!menu.is(':visible')) {
                menu.css('width', width + 1);  // Ugly hack =(
            }
            menu.toggle('fade');
            return false;
        },

        zoomIn: function (e) {
            var app,
                menu,
                target = $(e.target);
            app = target.closest('.app');
            menu = app.find('.app-menu');
            menu.hide('fade');
            window.CurrentDjangoApp = this;
            this.hideAll(app);
            this.collection.trigger('zoom', this);
            window.location.href = '#' + this.model.get('name') + '/models.py';
        },

        toPython: function (e) {
            App.output(AskaniView.prototype.toPython(e));
        },

        hideAll: function (except) {
            all = $('.app[id!="' + except.attr('id') + '"]').fadeOut(1000);
            except.hide('puff', {}, 2000);
        }
    });
});
