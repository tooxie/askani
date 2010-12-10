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
         DjangoAppList,
         DjangoApps,
         DjangoAppView,
         Exceptions,
         window
*/

$(function () {
    window.AppView = AskaniView.extend({
        id: 'workspace',

        container: 'body',

        events: $.extend({}, AskaniView.prototype.events, {
            'click #to-python': 'toPython',
            'click #to-json': 'toJSON',
            'click #kill-all': 'destroyTheWorld'
        }),

        initialize: function (attr) {
            DjangoApps.bind('zoom', function (appView) {
                window.CurrentDjangoApp = appView;
                $('#new-model').click(function (e) {
                    CurrentDjangoApp.create(e);
                    return false;
                });
            });
            AskaniView.prototype.initialize.call(this, attr);
        },

        create: function (e) {
            // pNNAC(View, Collection, {input, template_name, keyword, label})
            this.promptNameAndCreate(DjangoAppView, DjangoApps, '#app-name-template', {
                keyword: 'app',
                label: 'App name'
            }, '#app-name-input');
            return false;
        },

        destroyTheWorld: function (e) {
            var l = this.collection.size(),
                object,
                x;
            for (x = 0; x < l; x += 1) {
                object = this.collection.at(0);
                $('#' + object.id).hide('explode', {}, 1000).remove();
                object.destroy();
            }
            $('#kill-all').fadeOut(2000);
            return false;
        }
    });

    window.DjangoApps = new DjangoAppList({
        existsException: Exceptions.DjangoAppExistsError
    });

    // window.DjangoModels = new DjangoModelList({
    //     existsException: Exceptions.DjangoModelExistsError
    // });

    window.App = new AppView({
        collection: DjangoApps,
        existsException: Exceptions.DjangoAppExistsError,
        view: DjangoAppView
    });

    if (DjangoApps.size() === 0) {
        $('#new-app').attr('title', 'Start here').tipsy({
            fade: true,
            trigger: null
        }).tipsy('show');
    } else {
        $('#to-python').removeClass('invisible');
        $('#to-json').removeClass('invisible');
        $('#kill-all').removeClass('invisible');
    }
    DjangoApps.bind('add', function () {
        $('#to-python').fadeIn(2000);
        $('#to-json').fadeIn(2000);
        $('#kill-all').fadeIn(2000);
    }).bind('zoom', function (app) {
        window.CurrentDjangoApp = app;
        $('#to-appdesigner').show();
        $('#new-app').hide();
        $('#new-model').attr('title', 'Create models').tipsy({
            fade: true,
            trigger: null
        }).show().tipsy('show');
    });

    $('body').append(App.render().el);
});
