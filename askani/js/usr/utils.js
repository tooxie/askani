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
         App,
         DjangoModels,
         jQuery
 */
String.prototype.toCamelCase = function () {
    var bits, new_val = '', x;

    if (this.indexOf(' ') === -1) {
        return this.substr(0, 1).toUpperCase() + this.substr(1);
    }

    bits = $(this.toLowerCase().split(' ')).map(function (i, el) {
        return el.substr(0, 1).toUpperCase() + el.substr(1);
    });
    for (x = 0; x < bits.size(); x += 1) {
        new_val += bits[x].replace(/[^\w\s\-]/g, '');
    }
    return new_val;
};

// Transforms "CamelCase and Spaces" to "camel_case_and_spaces"
String.prototype.slugify = function () {
    var caps, lower, prev, slug, u;
    lower = this.search(/[a-z]/);
    slug = this.trim().replace(/[\s\-]+/g, '_').replace(/[^\w\s]/g, '');
    if (lower === -1) {
        return slug.toLowerCase();
    }
    caps = slug.search(/[A-Z]/);
    prev = null;
    while (caps !== -1) {
        if (caps === 0) {
            slug = slug[0].toLowerCase() + slug.substr(1);
        } else {
            u = '_';
            if (slug[caps - 1] === '_') {
                u = '';
            }
            slug = slug.substr(0, caps) + u + slug[caps].toLowerCase() + slug.substr(caps + 1);
        }
        caps = slug.search(/[A-Z]/);
    }
    return slug.toLowerCase();
};

(function ($) {
    $.jGetHolder = function (message, extra, prefill) {
        var html, id, residue;
        residue = $('.ui-dialog');
        if (residue.size()) {
            residue.detach();
        }
        html = $(message);
        if (html.size()) {
            return html;
        }
        id = 'askani-message-holder';
        if (!$('#' + id).size()) {
            html = '<span id="' + id + '" style="display:none;"></span>';
            $('body').append(html);
        }
        return $('#' + id).html('<p>' + message + '</p>');
    };
    $.jDefaults = {
        close: function (event, ui) {
            $('input:focus').blur();
        },
        height: 'auto',
        hide: 'fade',
        modal: true,
        open: function (event, ui) {
            $(event.target).find('input').each(function (i, el) {
                $(this).css('width', $(el).parent().innerWidth());
                $(this).keypress(function (e) {
                    if (e.keyCode === 13) {
                        $('.ui-dialog').find('button:first').click();
                    }
                });
            });
        },
        resizable: false,
        show: 'fade',
        submit: function (event, ui) {
            $(this).dialog('close');
        },
        title: 'Attention'
    };
    $.jAlert = function (message, options) {
        options = options ? options : {};
        $.jGetHolder(message).dialog($.extend({}, $.jDefaults, {
            buttons: {
                Close: function () {
                    $(this).dialog('close');
                }
            }
        }, options));
    };
    $.jPrompt = function (message, options) {
        var prefill;
        options = options ? options : {};
        prefill = options.prefill ? options.prefill : '';
        $.jGetHolder(message).dialog($.extend({}, $.jDefaults, {
            title: 'Input required',
            buttons: {
                OK: function () {
                    $(this).dialog('close');
                    if (options.submit) {
                        var context = options.context ? options.context : null;
                        options.submit(context);
                    }
                }
            }
        }, options));
    };
    $.jConfirm = function (message, options) {
        options = options ? options : {};
        $.jGetHolder(message).dialog($.extend({}, $.jDefaults, {
            buttons: {
                Yes: function () {
                    $(this).dialog('close');
                    if (options.submit) {
                        var context = options.context ? options.context : null;
                        options.submit(context);
                    }
                },
                No: function () {
                    $(this).dialog('close');
                }
            }
        }, options));
    };
})(jQuery);

function emSize(size) {
    $('body').append('<div id="emsizehelper" style="width:' + size + 'em;"></div>');
    return $('#emsizehelper').width();
}

function toPython(model) {
    var base_class, code, field, field_count, method, method_count, option, options, type, x;
    base_class = model.get('base_class') ? model.get('base_class') : 'models.Model';
    code = 'class ' + model.get('name') + '(' + base_class + '):\n';
    field_count = model.get('fields').size();
    for (x = 0; x < field_count; x += 1) {
        field = model.get('fields').at(x);
        type = field.get('type');
        code += '    ' + field.get('name') + ' = ' + (type ? 'models.' + type + '()' : 'None') + '\n';
    }
    method_count = model.get('methods').size();
    for (x = 0; x < method_count; x += 1) {
        method = model.get('methods').at(x);
        code += '\n    def ' + method.get('name') + '(' + method.params.join(', ') + '):' + '\n        pass\n';
    }
    if (model.get('has_meta')) {
        code += '\n    class Meta:\n';
        options = model.getMeta();
        $.each(options, function (key, value) {
            code += '        ' + key + ' = "' + value + '"\n';
        });
    }
    if (field_count === 0 && method_count === 0 && !model.get('has_meta')) {
        code += '    pass\n';
    }
    return code;
}
