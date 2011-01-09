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
            'dblclick .app, .app-name': 'zoomIn'
        }),

        render: function () {
            var models = this.model.get('models');
            AskaniView.prototype.render.call(this);
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

        zoomIn: function (e) {
            var app = $(e.target).closest('.app');
            window.CurrentDjangoApp = this;
            this.hideAll(app);
            this.collection.trigger('zoom', this);
            window.location.href = '#' + this.model.get('name') + '/models.py';
        },


        hideAll: function (except) {
            all = $('.app[id!="' + except.attr('id') + '"]').fadeOut(1000);
            except.hide('puff', {}, 2000);
        }
    });
});
