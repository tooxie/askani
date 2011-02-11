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
         AskaniModel,
         DjangoModelList,
         settings,
         window
*/

$(function () {
    window.DjangoApp = AskaniModel.extend({
        __class__: 'DjangoApp',

        initialize: function () {
            this.set({
                type: 'DjangoApp'
            });
            if (!this.get('has_models')) {
                this.set({
                    has_models: false
                });
            }
            if (this.id) {
                this.initModels();
            }
        },

        postSave: function () {
            this.initModels();
        },

        initModels: function (app) {
            var models;
            app = app ? app : this;
            models = new DjangoModelList({
                existsException: Exceptions.DjangoModelExistsError,
                namespace: app.id,
                prefix: 'mod_'
            });
            app.set({
                models: models
            });
            models.fetch();
            if (models.size()) {
                app.set({
                    'has_models': true
                });
            }
        },

        sanitizeName: function (name) {
            name = name.toLowerCase().replace(/[\s-]/g, '_').replace(/[^a-z_]/g, '');
            while (name[0] === '_') {
                name = name.substr(1);
            }
            while (name[name.length - 1] === '_') {
                name = name.substr(0, name.length - 1);
            }
            if (!name) {
                throw new Exceptions.EmptyNameError();
            }
            return name;
        },

        modelsCount: function () {
            if (this.get('models')) {
                return this.get('models').size();
            }
        },

        toPython: function () {
            return {
                admin: this.getAdminPy(),
                models: this.getModelsPy(),
                tests: this.getTestsPy(),
                views: this.getViewsPy()
            };
        },

        getAdminPy: function () {
            var admin = '',
                code = '# -*- coding: utf-8 -*-\n',
                len = 0,
                models,
                name = '',
                register = '',
                x,
                xi = settings.get('explicit_imports');
            if (xi) {
                code += 'from django.contrib.admin import ModelAdmin, site\n\n\n';
            } else {
                admin = 'admin.';
                code += 'from django.contrib import admin\n\n\n';
            }
            models = this.get('models');
            len = models.length;
            for (x = 0; x < len; x += 1) {
                name = models.at(x).get('name');
                code += 'class ' + name + 'Admin(' + admin + 'ModelAdmin):\n' +
                        '    pass\n\n\n';
                register += admin + 'site.register(' + name + ', ' + name +
                            'Admin)\n';
            }
            code += register;
            return code.trim();
        },

        getModelsPy: function () {
            var code = '# -*- coding: utf-8 -*-\n',
                db = '',
                fields,
                len = 0,
                model,
                models,
                name = '',
                x = 0,
                xi = settings.get('explicit_imports');
            fields = this.getFields();
            if (xi) {
                code += 'from django.db.models import (Model'
                for (x = 0; x < fields['standard'].length; x += 1) {
                    nl = code.lastIndexOf('\n');
                    if (code.substr(nl).length + fields['standard'][x].length > 76) {
                        code += ',\n    ';
                    } else {
                        code += ', ';
                    }
                    code += fields['standard'][x];
                }
                code += ')\n\n\n';
            } else {
                code += 'from django.db import models\n\n\n';
                db = 'models.';
            }
            models = this.get('models');
            len = models.length;
            for (x = 0; x < len; x += 1) {
                code += models.at(x).toPython() + '\n\n\n';
            }
            return code.trim();
        },

        getFields: function () {
            var fields = {
                    'custom': [],
                    'standard': []},
                in_list,
                i, j, k,
                x, y, z;
            i = this.get('models').length;
            for (x = 0; x < i; x += 1) {
                model = this.get('models').at(x);
                j = model.get('fields').length;
                for (y = 0; y < j; y += 1) {
                    field = model.get('fields').at(y);
                    if (Fields.isKnown(field.get('type'))) {
                        in_list = false;
                        k = fields['standard'].length;
                        for (z = 0; z < k; z += 1) {
                            if (fields['standard'][z] === field.get('type')) {
                                in_list = true;
                            }
                        }
                        if (!in_list) {
                            fields['standard'][k] = field.get('type');
                        }
                    } else {
                        k = fields['custom'].length;
                        fields['custom'][k] = field.get('type');
                    }
                }
            }
            return fields;
        },

        getTestsPy: function () {
            return '# -*- coding: utf-8 -*-\n' +
                   'from django.test import TestCase\n\n\n' +
                   '# Create your tests here.';
        },

        getViewsPy: function () {
            return '# -*- coding: utf-8 -*-\n' +
                   '# Create your views here.';
        }
    });
});
