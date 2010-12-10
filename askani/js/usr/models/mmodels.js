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
         Backbone,
         DjangoModelFieldList,
         DjangoModelMetadata,
         DjangoModelMethodList,
         Exceptions,
         window
*/

$(function () {
    window.DjangoModel = AskaniModel.extend({
        // base_class: ''

        initialize: function () {
            this.set({
                base_class: '',
                type: 'DjangoModel'
            });
        }
    });

    window.DjangoModelField = AskaniModel.extend({
    });

    window.DjangoModelMethod = AskaniModel.extend({
    });
});
