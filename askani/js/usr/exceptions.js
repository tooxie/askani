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
         Exceptions,
         window
*/
$(function () {
    window.Exception = Backbone.Model.extend({
        code: 1,
        message: 'Error'
    });

    window.Exceptions = {
        NotImplementedError: Exception.extend({
            code: null,
            message: 'Not implemented =('
        }),

        DjangoModelExistsError: Exception.extend({
            code: 2,
            message: 'Model exists'
        }),

        EmptyNameError: Exception.extend({
            code: 3,
            message: 'Name cannot be empty'
        }),

        DjangoModelFieldExistsError: Exception.extend({
            code: 4,
            message: 'Model field exists'
        }),

        DjangoModelMethodExistsError: Exception.extend({
            code: 4,
            message: 'Model method exists'
        }),

        NothingToKillError: Exception.extend({
            code: 5,
            message: 'Nothing to kill =('
        }),

        InvalidSignatureError: Exception.extend({
            code: 6,
            message: 'Invalid signature'
        }),

        InvalidParametersError: Exception.extend({
            code: 7,
            message: 'Invalid parameters'
        }),

        InitializationError: Exception.extend({
            code: 8,
            message: 'Error configuring object'
        }),

        DjangoAppExistsError: Exception.extend({
            code: 9,
            message: 'App already exists'
        }),

        AssertionError: Exception.extend({
            code: 10,
            message: 'Assertion error'
        }),

        ModelExists: Exception.extend({
            code: 11,
            message: 'Object exists',
            initialize: function (attr) {
                if (attr) {
                    this.message = 'Model "' + attr.model + '" exists';
                }
            }
        }),

        View: Backbone.View.extend({
            tagName: 'div',

            template: _.template($('#error-template').html()),

            render: function () {
                return this.template({message: this.model.message, code: this.model.code});
            }
        })
    };


    window.WarningView = Backbone.View.extend({

        tagName: 'div',

        template: _.template($('#warning-template').html()),

        render: function () {
            return this.template({message: this.model.message, code: this.model.code});
        }
    });
});

function AssertException(message) {
    this.message = message;
}

AssertException.prototype.toString = function () {
    return 'AssertException: ' + this.message;
};

function assert(expression, message) {
    if (!expression) {
        throw new Exceptions.AssertionError({
            message: message
        });
    }
}
