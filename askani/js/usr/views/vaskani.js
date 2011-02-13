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
            var code = '# -*- coding: utf-8 -*-\n';
            if (settings.get('explicit_imports', false)) {
                return code + 'from django.db.models import (Model';
            }
            return code + 'from django.db import models';
        },

        toPython: function (e) {
            var app = '',
                code = '',
                l,
                model,
                models,
                tabs,
                x, y;
            if (typeof CurrentDjangoApp !== 'undefined') {
                return CurrentDjangoApp.model.getModelsPy();
            } else {
                code = '# -*- coding: utf-8 -*-\n' +
                       'import os\n\n\n' +
                       "if __name__ == '__main__':\n" +
                       '    STRUCTURE = {\n';
                l = DjangoApps.length;
                for (x = 0; x < l; x += 1) {
                    app = DjangoApps.at(x);
                    code += "        '" + app.get('name') + "': {\n";
                    files = app.toPython();
                    for (dotpy in files) {
                        tabs = '            ';
                        code += tabs + "'" + dotpy + '\': """' +
                                files[dotpy].replace(/"""/g, '\\"""') + '""",\n';
                    }
                    code += '},';
                }
                code += '}\n' +
                        '    for app, files in STRUCTURE.items():\n' +
                        '        if not os.path.exists(app):\n' +
                        '            try:\n' +
                        '                os.makedirs(app)\n' +
                        '            except Exception, e:\n' +
                        '                print(\'Fatal error: %s\' % e)\n' +
                        '                sys.exit(1)\n' +
                        '        for dotpy, content in files.items():\n' +
                        '            py = file(os.path.join(app, dotpy), \'w\')\n' +
                        '            py.write(content)\n' +
                        '            py.close()';
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
