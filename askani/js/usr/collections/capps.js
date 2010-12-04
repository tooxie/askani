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
         AskaniCollection,
         DjangoApp,
         Exceptions,
         window
*/
$(function () {
    window.DjangoAppList = AskaniCollection.extend({
        model: DjangoApp,

        localStorage: new Store('djangoapps'),

        hideAll: function (except) {
            all = $('.app[id!="' + except.attr('id') + '"]').fadeOut('slow');
            except.hide('puff', {}, 2000);
        }
    });
});