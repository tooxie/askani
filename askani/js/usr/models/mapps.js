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
         window
*/

$(function () {
    window.DjangoApp = AskaniModel.extend({
        initialize: function () {
            if (!this.get('has_models')) {
                this.set({
                    has_models: false
                });
            }
            if (this.id) {
                this.initModels();
            }
        },

        initModels: function (app) {
            app = app ? app : this;
            app.set({
                models: new DjangoModelList({
                    existsException: Exceptions.DjangoModelExistsError,
                    namespace: app.id,
                    prefix: 'mod_'
                })
            });
            app.get('models').fetch();
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
        }
    });
});
