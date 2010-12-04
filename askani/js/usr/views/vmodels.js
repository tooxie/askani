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
         AskaniView,
         window
*/

$(function () {
    window.DjangoModelView = AskaniView.extend({
        model: DjangoModel,

        className: 'model object',

        template: _.template($('#model-template').html()),

        events: $.extend({}, this.events, {
            'click #new-model': 'promptModelName',
            'click .model': 'raiseModel'
        }),

        promptModelName: function () {
            console.log('promptModelName()');
        },

        raiseModel: function () {
            console.log('raiseModel()');
        }
    });
});
