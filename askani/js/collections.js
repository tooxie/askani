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
/*global
         $,
         Backbone,
         DjangoModel,
         DjangoModelExists,
         DjangoModelField,
         DjangoModelFieldExists,
         DjangoModelList,
         DjangoModelMethod,
         DjangoModelMethodExists,
         EmptyName,
         Store,
         window
*/
$(function () {
    // FIXME: Abstract and inherit
    window.DjangoModelFieldList = Backbone.Collection.extend({
        model: DjangoModelField,

        initialize: function (attributes, options) {
            if (typeof attributes !== "undefined") {
                if (typeof attributes.namespace !== "undefined") {
                    this.localStorage = new Store('fie-' + attributes.namespace);
                }
            }
        },

        create: function (attributes, options) {
            var x;
            if (attributes.name === null) {
                return false;
            }
            attributes.name = attributes.name.trim().toLowerCase().replace(' ', '_');
            if (attributes.name === "") {
                throw new EmptyName(attributes);
            }
            for (x = 0; x < this.size(); x += 1) {
                if (this.at(x).get('name') === attributes.name) {
                    throw new DjangoModelFieldExists(attributes);
                }
            }
            return Backbone.Collection.prototype.create.call(this, new DjangoModelField(attributes), options);
        },

        nextPosition: function() {
          if (!this.length) {
              return 1;
          }
          return this.last().get('position') + 1;
        },

        comparator: function(field) {
          return field.get('position');
        }
    });

    window.DjangoModelMethodList = Backbone.Collection.extend({
        model: DjangoModelMethod,

        initialize: function (attributes, options) {
            if (typeof attributes !== "undefined") {
                if (typeof attributes.namespace !== "undefined") {
                    this.localStorage = new Store('met-' + attributes.namespace);
                }
            }
        },

        create: function (attributes, options) {
            var x;
            if (attributes.name === null) {
                return false;
            }
            attributes.name = attributes.name.trim().toLowerCase().replace(' ', '_');
            if (attributes.name === "") {
                throw new EmptyName(attributes);
            }
            for (x = 0; x < this.size(); x += 1) {
                if (this.at(x).get('name') === attributes.name) {
                    throw new DjangoModelMethodExists(attributes);
                }
            }
            return Backbone.Collection.prototype.create.call(this, new DjangoModelMethod(attributes), options);
        },

        nextPosition: function() {
          if (!this.length) {
              return 1;
          }
          return this.last().get('position') + 1;
        },

        comparator: function(method) {
          return method.get('position');
        }
    });

    window.DjangoModelList = Backbone.Collection.extend({
        model: DjangoModel,

        localStorage: new Store("djangomodels"),

        create: function (attributes, options) {
            var l = this.length, x;
            options = options ? options : {};
            if (attributes.name === null) {
                return false;
            }
            attributes.name = attributes.name.trim().toCamelCase();
            if (attributes.name === "") {
                throw new EmptyName(attributes);
            }
            for (x = 0; x < l; x += 1) {
                if (this.at(x).get('name').toLowerCase() === attributes.name.toLowerCase()) {
                    throw new DjangoModelExists(attributes);
                }
            }
            return Backbone.Collection.prototype.create.call(this, attributes, $.extend({
                success: this.model.prototype.post_save
            }, options));
        },

        nextPosition: function() {
          if (!this.length) {
              return 1;
          }
          return this.last().get('position') + 1;
        },

        comparator: function(model) {
          return model.get('position');
        }
    });
    window.DjangoModels = new DjangoModelList();
});
