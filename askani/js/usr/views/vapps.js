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
        model: DjangoApp,

        className: 'app object',

        template: _.template($('#app-template').html()),

        events: $.extend({}, this.events, {
            'dblclick .app, .app-name': 'zoomIn'
        }),

        create: function () {
            // pNNAC(View, Collection, {input, template_name, keyword, label})
            this.promptNameAndCreate(DjangoModelView, DjangoModels, '#model-name-template', {
                keyword: 'model',
                label: 'Model name'
            }, '#model-name-input');
            return false;
        },

        zoomIn: function (e) {
            var app = $(e.target).closest('.app');
            this.collection.hideAll(app);
            window.location.href = '#' + this.model.get('name') + '/models.py';
            this.collection.trigger('zoom', this);
            // App.zoomIn(app);
        }
    });
});
