/*jslint
         indent: 4,
         nomen: false,
         onevar: true,
         plusplus: true,
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
    var bits, new_val = "", x;

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

(function ($) {
    $.jGetHolder = function (message, extra) {
        var extra_html, extra_id, html, id;
        extra_html = extra ? '' : message;
        id = 'askani-message-holder';
        if (!$('#' + id).size()) {
            html = '<span id="' + id + '" style="display:none;"></span>';
            $('body').append(html);
        }
        if (extra === 'input') {
            extra_id = id + '-input';
            extra_html += '<label for="' + extra_id + '">' + message + '</label>';
            extra_html += '<p><input type="text" id="' + extra_id + '" name="' + extra_id + '"></p>';
            $('#' + id).html('<p>' + extra_html + '</p>');
            $('#' + extra_id).keypress(function (e) {
                if (e.keyCode === 13) {
                    $('#' + id).dialog('close');
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
        hide: 'fade'
    };
    $.jAlert = function (message, options) {
        options = options ? options : {};
        $.jGetHolder(message).dialog($.extend($.jDefaults, options));
    };
    $.jPrompt = function (message, options) {
        options = options ? options : {};
        $.jGetHolder(message, 'input').dialog($.extend($.jDefaults, {
            title: 'Input required',
            close: function (event, ui) {
                console.info(event);
            },
            buttons: {
                'OK': function (dialog) {
                    $(this).dialog('close');
                }
            }
        }, options));
    };
    $.jConfirm = function (message, options) {
        options = options ? options : {};
        $.jGetHolder(message).dialog($.extend($.jDefaults, {
            buttons: {
                'OK': function (dialog) {
                    console.info(dialog);
                    $(this).dialog('close');
                },
                Cancel: function (dialog) {
                    $(this).dialog('close');
                }
            }
        }, options));
    };
})(jQuery);

function modelToPython(model) {
    var code, field, field_count, method, method_count, value, x;
    code = "class " + model.get('name') + "(models.Model):\n";
    field_count = model.get('fields').size();
    for (x = 0; x < field_count; x += 1) {
        field = model.get('fields').at(x);
        value = field.get('value');
        code += "    " + field.get('name') + " = " + (value ? "models." + value + "()" : 'None') + "\n";
    }
    method_count = model.get('methods').size();
    for (x = 0; x < method_count; x += 1) {
        method = model.get('methods').at(x);
        code += "\n    def " + method.get('name') + "(self):" + "\n        pass\n";
    }
    if (field_count === 0 && method_count === 0) {
        code += "    pass\n";
    }
    return code;
}

function slugify(text) {
    return text.replace(/\s+/g, '-').replace(/[^\w\s\-]/g, '').toLowerCase();
}

function destroyTheWorld() {
    var djml, x;
    djml = DjangoModels.length;
    for (x = 0; x < djml; x += 1) {
        DjangoModels.at(0).destroy();
    }
    App.render();
}
