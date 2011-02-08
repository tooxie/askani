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
        __class__: 'AppView',

        container: '#workspace',

        events: $.extend({}, AskaniView.prototype.events, {
            'click #to-python': 'toPython',
            'click #to-json': 'toJSON',
            'click #kill-all': 'destroyTheWorld'
        }),

        create: function (e) {
            // pNNAC(View, Collection, {input, template_name, keyword, label})
            this.promptNameAndCreate(DjangoAppView, DjangoApps, '#app-name-template', {
                keyword: 'app',
                label: 'App name'
            }, '#app-name-input');
            return false;
        },

        getHeader: function() {
            return '# -*- coding: utf-8 -*-\n' +
                   'from django.db import models';
        },

        toPython: function (e) {
            var code,
                l,
                model,
                x;
            if (typeof CurrentDjangoApp !== 'undefined') {
                code = this.getHeader();
                for (model in CurrentDjangoApp.model.get('models')) {
                    code += '\n\n' + model.toPython();
                }
            } else {
                l = DjangoApps.length;
                for (x = 0; x < l; x += 1) {
                    code += DjangoApps.at(x).toPython();
                }
            }
            return code;
        },

        toJSON: function (e) {
            return JSON.stringify(DjangoApps, null, 2);
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
            $('#to-python').fadeOut(2000);
            $('#to-json').fadeOut(2000);
            CurrentDjangoApp = undefined;
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
                hide: false,
                model: true,
                show: 'fade',
                title: 'stdout',
                width: 625 + margin
            });
        }
    });

    window.DjangoApps = new DjangoAppList({
        existsException: Exceptions.DjangoAppExistsError
    });

    window.App = new AppView({
        collection: DjangoApps,
        existsException: Exceptions.DjangoAppExistsError,
        view: DjangoAppView
    });

    App.render();
});
