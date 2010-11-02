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
         DjangoModels
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
