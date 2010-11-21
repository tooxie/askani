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

    window.NotImplementedError = Backbone.Model.extend({
        code: null,
        message: 'Not implemented :('
    });

    window.DjangoModelExistsError = Exception.extend({
        code: 2,
        message: 'Model exists'
    });

    window.EmptyNameError = Exception.extend({
        code: 3,
        message: 'Name cannot be empty'
    });

    window.DjangoModelFieldExistsError = Exception.extend({
        code: 4,
        message: 'Model field exists'
    });

    window.DjangoModelMethodExistsError = Exception.extend({
        code: 4,
        message: 'Model method exists'
    });

    window.NothingToKillError = Exception.extend({
        code: 5,
        message: 'Nothing to kill :('
    });

    window.InvalidSignatureError = Exception.extend({
        code: 6,
        message: 'Invalid signature'
    });

    window.InvalidParametersError = Exception.extend({
        code: 7,
        message: 'Invalid parameters'
    });

    window.ExceptionView = Backbone.View.extend({

        tagName: 'div',

        template: _.template($('#error-template').html()),

        render: function () {
            return this.template({message: this.model.message, code: this.model.code});
        }
    });

    window.WarningView = Backbone.View.extend({

        tagName: 'div',

        template: _.template($('#warning-template').html()),

        render: function () {
            return this.template({message: this.model.message, code: this.model.code});
        }
    });
});
