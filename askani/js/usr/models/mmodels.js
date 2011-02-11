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
         settings,
         window
*/

$(function () {
    meta_options = {
        'abstract': {
            'type': 'boolean',
            'default': false,
            'value': false
        },
        'app_label': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'db_table': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'db_tablespace': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'get_latest_by': {
            'type': 'choice',
            'default': '',
            'value': ''
        },
        'managed': {
            'type': 'boolean',
            'default': true,
            'value': true
        },
        'order_with_respect_to': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'ordering': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'permissions': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'proxy': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'unique_together': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'verbose_name': {
            'type': 'text',
            'default': '',
            'value': ''
        },
        'verbose_name_plural': {
            'type': 'text',
            'default': '',
            'value': ''
        }
    };
    window.DjangoModel = AskaniModel.extend({
        initialize: function () {
            var args,
                defaults,
                key;
            defaults = {
                base_class: '',
                has_meta: false,
                meta_options: meta_options
            };
            for (key in defaults) {
                if (!this.get(key)) {
                    args = {};
                    args[key] = defaults[key];
                    this.set(args);
                }
            }
            if (this.id) {
                this.initFields();
                this.initMethods();
            }
        },

        postSave: function () {
            this.initFields();
            this.initMethods();
        },

        initFields: function (model) {
            model = model ? model : this;
            model.set({
                fields: new DjangoModelFieldList({
                    namespace: 'fields-' + model.id,
                    existsException: Exceptions.DjangoModelFieldExistsError
                })
            });
            model.get('fields').fetch();
            if (model.get('fields').size()) {
                model.set({
                    'has_fields': true
                });
            }
        },

        initMethods: function (model) {
            model = model ? model : this;
            model.set({
                methods: new DjangoModelMethodList({
                    namespace: 'methods-' + model.id,
                    existsException: Exceptions.DjangoModelMethodExistsError
                })
            });
            model.get('methods').fetch();
            if (model.get('methods').size()) {
                model.set({
                    'has_methods': true
                });
            }
        },

        setMeta: function (options) {
            var has_meta = false,
                meta = this.get('meta_options');
            $.each(options, function (key, value) {
                meta[key].value = options[key];
                if (meta[key].value !== meta[key]['default']) {
                    has_meta = true;
                }
            });
            this.save({
                meta_options: meta,
                has_meta: has_meta
            });
        },

        getMeta: function (key) {
            var items = {},
                o,
                options = this.get('meta_options');
            if (key) {
                return options[key].value;
            }
            for (o in options) {
                if (options[o].value !== options[o]['default']) {
                    if (options[o].type === 'choice') {
                        items[o] = this.get('fields').get(options[o].value).get('name');
                    } else {
                        items[o] = options[o].value;
                    }
                }
            }
            return items;
        },

        isAbstract: function () {
            return this.getMeta('abstract') === true;
        },

        toPython: function () {
            var code = '',
                fields,
                flen,
                m = settings.get('explicit_imports', false) ? '' : 'models.',
                methods,
                mlen,
                x;
            code = 'class ' + this.get('name') + '(' + m + 'Model):\n\n';
            fields = this.get('fields');
            flen = fields.length;
            methods = this.get('methods');
            mlen = methods.length;
            if (flen === 0 && mlen ===0) {
                code += '    pass';
            } else {
                for (x = 0; x < flen; x += 1) {
                    code += '    ' + fields.at(x).toPython() + '\n';
                }
                for (x = 0; x < mlen; x += 1) {
                    code += '\n    ' + methods.at(x).toPython().replace('\n', '\n    ') + '\n';
                }
            }
            return code.trim();
        }
    });

    window.DjangoModelField = AskaniModel.extend({
        __class__: 'DjangoModelField',

        position: 1,

        type: 'CharField',

        initialize: function () {
            if (!this.get('position')) {
                this.set({position: this.position});
            }
            if (!this.get('type')) {
                this.set({type: this.type});
            }
        },

        sanitizeName: function (name) {
            name = name.slugify();
            if (!name) {
                throw new Exceptions.EmptyNameError();
            }
            return name;
        },

        isRelation: function () {
            if (this.get('type') === 'ForeignKey') {
                return true;
            }
            if (this.get('type') === 'ManyToManyField') {
                return true;
            }
            if (this.get('type') === 'OneToOneField') {
                return true;
            }
            return false;
        },

        getParams: function () {
            var ai = "')",
                bi = "_(u'",
                i = settings.get('use_i18n', false),
                params;
            if (!i) {
                ai = "'";
                bi = "'";
            }
            if (this.isRelation()) {
                params = this.get('name');
            } else {
                params = bi + this.get('name').replace('_', ' ') + ai;
            }
            return params;
        },

        toPython: function () {
            var m = settings.get('explicit_imports', false) ? '' : 'models.';
            return this.get('name') + ' = ' + m + this.get('type') +
                   '(' + this.getParams() + ')';
        }
    });

    window.DjangoModelMethod = AskaniModel.extend({
        __class__: 'DjangoModelMethod',

        position: 1,

        params: ['self'],

        initialize: function () {
            if (!this.get('position')) {
                this.set({position: this.position});
            }
            if (!this.get('params')) {
                this.set({params: this.params});
            }
        },

        set: function (attributes, options) {
            if (typeof attributes !== 'undefined') {
                if (attributes.params) {
                    attributes.params = this.parseParams(attributes.params);
                }
                if (attributes.name && attributes.params) {
                    this.parseSignature(
                        attributes.name + '(' + attributes.params.join(', ') + ')'
                    );
                }
            }
            return AskaniModel.prototype.set.call(this, attributes, options);
        },

        sanitizeName: function (name) {
            name = name.slugify();
            if (!name) {
                throw new Exceptions.EmptyNameError();
            }
            return name;
        },

        getSignature: function () {
            return this.get('name') + '(' + this.get('params').join(', ') + ')';
        },

        parseSignature: function (signature) {
            var match;
            match = signature.match(/^[a-zA-Z_]+[\d_]*\([\w,\s\*]+\)$/g);
            if (match === null || (match.length !== 1 && match[0] !== signature)) {
                throw new Exceptions.InvalidSignatureError();
            }
            return signature;
        },

        parseParams: function (params) {
            var fc, ftc,
                k = false,
                kw = false,
                l = params.length,
                names = [],
                x = 0,
                y = 0;
            for (x = 0; x < params.length; x += 1) {
                params[x] = params[x].trim();
                fc = params[x].substr(0, 1);  // First character
                ftc = params[x].substr(0, 2);  // First two characters
                params[x] = params[x].slugify();
                for (y = 0; y < names.length; y += 1) {
                    if (params[x] === names[y]) {
                        throw new Exceptions.InvalidParametersError();
                    }
                }
                names[names.length] = params[x];
                if (ftc === '**') {
                    if (x + 1 !== l) {
                        throw new Exceptions.InvalidParametersError();
                    }
                    params[x] = '**' + params[x];
                    kw = true;
                } else {
                    if (k || kw) {
                        throw new Exceptions.InvalidParametersError();
                    }
                    if (fc === '*') {
                        params[x] = '*' + params[x];
                        k = true;
                    } else if (fc.match(/\d/g)) {
                        throw new Exceptions.InvalidParametersError();
                    }
                }
            }
            return params;
        },

        toPython: function () {
            return 'def ' + this.getSignature() + ':\n' +
                   '    pass';
        }
    });
});
