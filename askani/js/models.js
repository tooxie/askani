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
/*global $,
         Backbone,
         DjangoModelFieldList,
         DjangoModelMetadata,
         DjangoModelMethodList,
         EmptyName,
         modelToPython,
         window
*/

$(function () {
    window.DjangoModelField = Backbone.Model.extend({
        name: '',

        value: '',

        set: function (attributes, options) {
            return Backbone.Model.prototype.set.call(this, attributes, options);
        }
    });

    window.DjangoModelMethod = Backbone.Model.extend({
        name: '',

        set: function (attributes, options) {
            return Backbone.Model.prototype.set.call(this, attributes, options);
        }
    });

    window.DjangoModelMetadata = Backbone.Model.extend({
        name: '',

        value: ''
    });

    window.DjangoModel = Backbone.Model.extend({
        initialize: function (attributes) {
            var args, defaults, key;
            defaults = {
                name: '',
                metadata: new DjangoModelMetadata(),
                x: 0,
                y: 0,
                z: 0
            };
            for (key in defaults) {
                if (!this.get(key)) {
                    args = {};
                    args[key] = defaults[key];
                    this.set(args);
                }
            }
            // This sets _fields_ and _methods_ for stored models.
            // After *hours* of debugging I realized that newly created models
            // get post_saved called in a static way while already stored
            // models need this hack to fetch fields and methods.
            if (this.id) {
                this.initFields();
                this.initMethods();
            }
        },

        initFields: function (model) {
            model = model ? model : this;
            model.set({fields: new DjangoModelFieldList({namespace: model.id})});
            model.get('fields').fetch();
        },

        initMethods: function (model) {
            model = model ? model : this;
            model.set({methods: new DjangoModelMethodList({namespace: model.id})});
            model.get('methods').fetch();
        },

        // Why 'this' doesn't refer to DjangoModel?
        // Why (model === response)?
        post_save: function (model, response) {
            response.initFields(response);
            response.initMethods(response);
        },

        set: function (attributes, options) {
            if (typeof attributes !== "undefined") {
                if (typeof attributes.name !== "undefined") {
                    attributes.name = this.sanitizeName(attributes.name);
                }
            }
            return Backbone.Model.prototype.set.call(this, attributes, options);
        },

        sanitizeName: function (name) {
            name = name.toCamelCase();
            if (!name) {
                throw new EmptyName();
            }
            return name;
        },

        setPosition: function (x, y) {
            x = Number(x.replace(/[px]/g, ''));
            y = Number(y.replace(/[px]/g, ''));
            this.set({x: (x > 0) ? x : 0, y: (y > 0) ? y : 0});
        },

        isEqual: function (model) {
            return (this.name === model.name);
        },

        toPython: function () {
            return modelToPython(this);
        }
    });
});
