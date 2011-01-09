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

        events: $.extend({}, AskaniView.prototype.events, {
            'click #new-model': 'promptModelName',
            'click .model': 'raiseModel'
        }),

        initialize: function (attr) {
            AskaniView.prototype.initialize.call(this, attr);
            this.container = '#' + attr.container + ' .models';
        },

        promptModelName: function () {
            console.log('promptModelName()');
        },

        raiseModel: function () {
            console.log('raiseModel()');
        },

        saveCoords: function(e) {
            var object,
                target = $(e.target),
                target_id;
            if (target.hasClass('clone')) {
                target_id = target.attr('id').substr(6);
                object = CurrentDjangoApp.model.get('models').get(target_id);
                object.setPosition(target.css('left'), target.css('top'));
            }
            target = $('#' + target_id);
            target.css('left', object.get('x'))
                  .css('top', object.get('y'));
            return true;
        }
    });
});
