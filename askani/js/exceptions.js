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
         _,
         Backbone,
         Exception,
         window
*/
$(function () {
    window.Exception = Backbone.Model.extend({
        code: 1,
        message: ''
    });

    window.DjangoModelExists = Exception.extend({
        code: 2,
        message: 'Model exists'
    });

    window.EmptyName = Exception.extend({
        code: 3,
        message: 'Name cannot be empty'
    });

    window.DjangoModelFieldExists = Exception.extend({
        code: 4,
        message: 'Model field exists'
    });

    window.DjangoModelMethodExists = Exception.extend({
        code: 4,
        message: 'Model method exists'
    });

    window.NothingToKillError = Exception.extend({
        code: 5,
        message: 'Nothing to kill :('
    });

    window.ExceptionView = Backbone.View.extend({

        tagName: "div",

        template: _.template($('#error-template').html()),

        render: function () {
            return this.template({message: this.model.message, code: this.model.code});
        }
    });

    window.WarningView = Backbone.View.extend({

        tagName: "div",

        template: _.template($('#warning-template').html()),

        render: function () {
            return this.template({message: this.model.message, code: this.model.code});
        }
    });
});
