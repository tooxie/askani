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
        message: 'Error'
    });

    window.Exceptions = {
        NotImplementedError: Exception.extend({
            message: 'Not implemented =('
        }),

        DjangoModelExistsError: Exception.extend({
            message: 'Model exists',
            initialize: function (attr) {
                if (attr) {
                    this.message = 'Model "' + attr.model + '" exists';
                }
            }
        }),

        EmptyNameError: Exception.extend({
            message: 'Name cannot be empty'
        }),

        DjangoModelFieldExistsError: Exception.extend({
            message: 'Model field exists',
            initialize: function (attr) {
                if (attr) {
                    this.message = 'Model field "' + attr.model + '" exists';
                }
            }
        }),

        DjangoModelMethodExistsError: Exception.extend({
            message: 'Model method exists',
            initialize: function (attr) {
                if (attr) {
                    this.message = 'Model method "' + attr.model + '" exists';
                }
            }
        }),

        NothingToKillError: Exception.extend({
            message: 'Nothing to kill =('
        }),

        InvalidSignatureError: Exception.extend({
            message: 'Invalid signature'
        }),

        InvalidParametersError: Exception.extend({
            message: 'Invalid parameters'
        }),

        InitializationError: Exception.extend({
            message: 'Error configuring object'
        }),

        DjangoAppExistsError: Exception.extend({
            message: 'App already exists',
            initialize: function (attr) {
                if (attr) {
                    this.message = 'App "' + attr.model + '" exists';
                }
            }
        }),

        AssertionError: Exception.extend({
            message: 'Assertion error'
        }),

        ModelExists: Exception.extend({
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
                return this.template({
                    message: this.model.message
                });
            }
        })
    };

    window.WarningView = Backbone.View.extend({

        tagName: 'div',

        template: _.template($('#warning-template').html()),

        render: function () {
            return this.template({
                message: this.model.message
            });
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
