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
/*global $,
         document,
         window
*/
function initAppdesigner(app) {
    $('#to-appdesigner').hide();
    $('#new-app').show();
    $('#new-model').hide();
    if ($('.app').size()) {
        if (app) {
            if (app.get('models').size()) {
                $('#kill-all').show();
            } else {
                $('#kill-all').hide();
            }
        } else {
            $('#kill-all').show();
        }
        $('#to-python').show();
        $('#to-json').show();
    } else {
        $('#kill-all').hide();
        $('#to-python').hide();
        $('#to-json').hide();
    }
}
function cloneView(object, view_class, params) {
    var clone = object.clone(),
        view;
    view_class = view_class ? view_class : DjangoModelView;
    params = $.extend({}, {
        className: 'model object clone',
        collection: object.collection,
        container: 'workspace',
        model: clone,
        view: null
    }, params);
    clone.id = 'clone_' + clone.id;
    view = new view_class(params)
    return view;
}
$(document).ready(function () {
    var host = window.location.hostname;
    if (host !== 'askani.net' || host !== 'www.askani.net') {
        $('#forkme').remove();
    }
    $('a[href^="http"]').live('click', function () {
        window.open(this.href);
        return false;
    });
    $('#to-appdesigner').click(function () {
        var apps = $('div.app'),
            clones = $('div.clone'),
            doFadeIn;
        window.CurrentDjangoApp = undefined;
        doFadeIn = function () {
            $('#workspace').hide().html('');
            App.render();
            $('#workspace').fadeIn(1000);
        }
        $('#new-model').tipsy('hide');
        if (clones.size()) {
            clones.fadeOut(1000)
                  .queue('fx', function () {
                      $(this).remove();
                      doFadeIn();
                  });
        } else {
            doFadeIn();
        }
        initAppdesigner();
    });
    $('#new-app').click(function (e) {
        $(this).removeAttr('original-title').tipsy('hide');
        App.create(e);
        return false;
    });
    $('#new-model').click(function (e) {
        CurrentDjangoApp.create(e, clone=true);
        return false;
    });
    $('#kill-all').click(function () {
        App.destroyTheWorld();
    });
    if (DjangoApps.size() === 0) {
        $('#new-app').attr('title', 'Start here').tipsy({
            fade: true,
            trigger: null
        }).tipsy('show');
    } else {
        $('#to-python').removeClass('invisible');
        $('#to-json').removeClass('invisible');
        $('#kill-all').removeClass('invisible');
    }
    DjangoApps.bind('add', function () {
        $('#to-python').fadeIn(2000);
        $('#to-json').fadeIn(2000);
        $('#kill-all').fadeIn(2000);
    }).bind('zoom', function (app) {
        $(app.el).queue('fx', function () {
            $('#to-appdesigner').show()
            $('#new-app').hide();
            if (!window.CurrentDjangoApp.model.get('has_models')) {
                $('#new-model').attr('title', 'Create models').tipsy({
                    fade: true,
                    trigger: null
                }).show().tipsy('show')
                  .click(function () {
                      $(this).attr('original-title', '').tipsy('hide');
                  });
            } else {
                $('#new-model').show();
            }
            // The clone wars
            $('#' + app.model.id + ' .models').find('.model').each(function (i, el) {
                var $el, app_id, clone_view, model_id;
                $el = $(el);
                app_id = $el.closest('.app').attr('id');
                model_id = $el.attr('id');
                clone_view = cloneView(DjangoApps.get(app_id).get('models').get(model_id));
                $('#workspace').hide()
                               .append(clone_view.render().el)
                               .fadeIn(1000);
            });
        });
    });  // FIXME: Bind zoom to DjangoAppView, not Collection.
    // I'm binding it to the Collection because the View is instantiated on
    // the fly, I don't have access to it from here, it doesn't exist yet.

    initAppdesigner();
});
