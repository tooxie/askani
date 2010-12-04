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
    window.DjangoModel = Backbone.Model.extend({
        // base_class: ''

        initialize: function () {
            this.set({
                base_class: ''
            });
        },
    });

    window.DjangoModelField = Backbone.Model.extend({
    });

    window.DjangoModelMethod = Backbone.Model.extend({
    });
});
