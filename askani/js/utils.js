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

String.prototype.slugify = function () {
    return this.replace(/\s+/g, '_').replace(/[^\w\s\-]/g, '').toLowerCase();
};

(function ($) {
    $.jGetHolder = function (message, extra, prefill) {
        var extra_html, extra_id, html, id;
        extra_html = extra ? '' : message;
        id = 'askani-message-holder';
        if (!$('#' + id).size()) {
            html = '<span id="' + id + '" style="display:none;"></span>';
            $('body').append(html);
        }
        if (extra === 'input') {
            extra_id = id + '-input';
            prefill = prefill ? prefill : '';
            extra_html += '<label for="' + extra_id + '">' + message + '</label>';
            extra_html += '<p><input type="text" id="' + extra_id + '" name="' + extra_id + '" value="' + prefill + '"></p>';
            $('#' + id).html('<p>' + extra_html + '</p>');
            $('#' + extra_id).keypress(function (e) {
                if (e.keyCode === 13) {
                    $('div.ui-dialog').find('button:first').focus().trigger('click');
                }
            });
            return $('#' + id);
        } else {
            return $('#' + id).html('<p>' + message + '</p>');
        }
    };
    $.jDefaults = {
        title: 'Attention',
        modal: true,
        show: 'fade',
        hide: 'fade',
        resizable: false,
        open: function (event, ui) {
            $(event.target).find('input').each(function (i, el) {
                $(this).css('width', $(el).parent().innerWidth());
            });
        }
    };
    $.jAlert = function (message, options) {
        options = options ? options : {};
        $.jGetHolder(message).dialog($.extend($.jDefaults, {
            buttons: {
                Close: function () {
                    $(this).dialog('close');
                }
            }
        }, options));
    };
    $.jPrompt = function (message, options) {
        options = options ? options : {};
        prefill = options.prefill ? options.prefill : '';
        $.jGetHolder(message, 'input', prefill).dialog($.extend($.jDefaults, {
            title: 'Input required',
            buttons: {
                OK: function () {
                    $(this).dialog('close');
                    if (options.submit) {
                        var context = options.context ? options.context : null;
                        options.submit($(this).find('input:first').val(), context);
                    }
                }
            }
        }, options));
    };
    $.jConfirm = function (message, options) {
        options = options ? options : {};
        $.jGetHolder(message).dialog($.extend($.jDefaults, {
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

function modelToPython(model) {
    var code, field, field_count, method, method_count, type, x;
    code = 'class ' + model.get('name') + '(models.Model):\n';
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
    if (field_count === 0 && method_count === 0) {
        code += '    pass\n';
    }
    return code;
}

function destroyTheWorld() {
    var djml, x;
    djml = DjangoModels.length;
    for (x = 0; x < djml; x += 1) {
        DjangoModels.at(0).destroy();
    }
    App.render();
}

function getDeployCoords(x, y) {
    var coords, i, l, m;
    x = x ? x : 0;
    y = y ? y : 0;
    l = DjangoModels.length;
    for (i = 0; i < l; i += 1) {
        m = DjangoModels.at(i);
        if (m.get('x') === x && m.get('y') === y) {
            coords = getDeployCoords(x + 9, y + 18);
            x = coords[0];
            y = coords[1];
        }
    }
    return [x, y];
}
