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
         Backbone,
         DjangoModelFieldList,
         DjangoModelMetadata,
         DjangoModelMethodList,
         EmptyNameError,
         InvalidParametersError,
         modelToPython,
         window
*/

$(function () {
    window.DjangoModelField = Backbone.Model.extend({
        // name: '',
        type: 'CharField',
        position: 1,

        initialize: function () {
            if (!this.get('type')) {
                this.set({type: this.type});
            }
            if (!this.get('position')) {
                this.set({position: this.position});
            }
        },

        set: function (attributes, options) {
            if (typeof attributes !== 'undefined') {
                if (typeof attributes.name === 'string') {
                    attributes.name = attributes.name.slugify();
                    if (attributes.name === '') {
                        throw new EmptyNameError();
                    }
                }
            }
            return Backbone.Model.prototype.set.call(this, attributes, options);
        },

        isEqual: function (field) {
            if (typeof field === 'string') {
                return (this.get('name') === field.slugify());
            }
            return (this.get('name') === field.get('name'));
        }
    });

    window.DjangoModelMethod = Backbone.Model.extend({
        // name: '',
        params: ['self'],
        position: 1,

        initialize: function () {
            if (!this.get('params')) {
                this.set({params: this.params});
            }
            if (!this.get('position')) {
                this.set({position: this.position});
            }
        },

        set: function (attributes, options) {
            if (typeof attributes !== 'undefined') {
                if (typeof attributes.name === 'string') {
                    attributes.name = attributes.name.slugify();
                    if (attributes.name === '') {
                        throw new EmptyNameError();
                    }
                }
                if (attributes.params) {
                    attributes.params = this.parseParams(attributes.params);
                }
            }
            return Backbone.Model.prototype.set.call(this, attributes, options);
        },

        parseParams: function (params) {
            var fc, ftc,
                k = false,
                kw = false,
                l = params.length,
                names = [],
                x = 0,
                y = 0;
            for (x = 0; x < l; x += 1) {
                params[x] = params[x].trim();
                fc = params[x].substr(0, 1);  // First character
                ftc = params[x].substr(0, 2);  // First two characters
                params[x] = params[x].slugify();
                for (y = 0; y < names.length; y += 1) {
                    if (params[x] === names[y]) {
                        throw new InvalidParametersError();
                    }
                }
                names[names.length] = params[x];
                if (ftc === '**') {
                    if (x + 1 !== l) {
                        throw new InvalidParametersError();
                    }
                    params[x] = '**' + params[x];
                    kw = true;
                } else {
                    if (k || kw) {
                        throw new InvalidParametersError();
                    }
                    if (fc === '*') {
                        params[x] = '*' + params[x];
                        k = true;
                    }
                }
            }
            return params;
        },

        getSignature: function () {
            return this.get('name') + '(' + this.get('params').join(', ') + ')';
        },

        isEqual: function (method) {
            if (typeof method === 'string') {
                return (this.get('name') === method.slugify());
            }
            return (this.get('name') === method.get('name'));
        }
    });

    var meta_options = {
        'abstract': {
            type: 'boolean',
            default: false,
            value: false
        },
        'app_label': {
            type: 'text',
            default: '',
            value: ''
        },
        'db_table': {
            type: 'text',
            default: '',
            value: ''
        },
        'db_tablespace': {
            type: 'text',
            default: '',
            value: ''
        },
        'get_latest_by': {
            type: 'choice',
            default: '',
            value: ''
        },
        'managed': {
            type: 'boolean',
            default: true,
            value: true
        },
        'order_with_respect_to': {
            type: 'text',
            default: '',
            value: ''
        },
        'ordering': {
            type: 'text',
            default: '',
            value: ''
        },
        'permissions': {
            type: 'text',
            default: '',
            value: ''
        },
        'proxy': {
            type: 'text',
            default: '',
            value: ''
        },
        'unique_together': {
            type: 'text',
            default: '',
            value: ''
        },
        'verbose_name': {
            type: 'text',
            default: '',
            value: ''
        },
        'verbose_name_plural': {
            type: 'text',
            default: '',
            value: ''
        }
    };

    window.DjangoModel = Backbone.Model.extend({
        initialize: function () {
            var args, defaults, key;
            defaults = {
                base_class: '',
                has_meta: false,
                meta_options: meta_options,
                name: '',
                x: 0,
                y: 0,
                z: 1
            };
            for (key in defaults) {
                if (!this.get(key)) {
                    args = {};
                    args[key] = defaults[key];
                    this.set(args);
                }
            }
            // This sets _fields_ and _methods_ for stored models.
            // After *hours* of debugging I realized that newly created models
            // get post_saved called in a static way while already stored
            // models need this hack to fetch fields and methods.
            if (this.id) {
                this.initFields();
                this.initMethods();
            }
        },

        initFields: function (model) {
            model = model ? model : this;
            model.set({fields: new DjangoModelFieldList({namespace: model.id})});
            model.get('fields').fetch();
        },

        initMethods: function (model) {
            model = model ? model : this;
            model.set({methods: new DjangoModelMethodList({namespace: model.id})});
            model.get('methods').fetch();
        },

        // Why 'this' doesn't refer to DjangoModel?
        // Why (model === response)?
        post_save: function (model, response) {
            response.initFields(response);
            response.initMethods(response);
        },

        set: function (attributes, options) {
            if (typeof attributes !== 'undefined') {
                if (attributes.name !== null && typeof attributes.name !== 'undefined') {
                    attributes.name = this.sanitizeName(attributes.name);
                }
            }
            return Backbone.Model.prototype.set.call(this, attributes, options);
        },

        sanitizeName: function (name) {
            name = name.toCamelCase();
            if (!name) {
                throw new EmptyNameError();
            }
            return name;
        },

        setPosition: function (x, y) {
            x = (typeof x === "string") ? Number(x.replace(/[px]/g, '')) : x;
            y = (typeof y === "string") ? Number(y.replace(/[px]/g, '')) : y;
            this.set({
                x: (x > 0) ? x : 0,
                y: (y > 0) ? y : 0
            });
        },

        setMeta: function (options) {
            var has_meta = false,
                meta = this.get('meta_options');
            for (opt in options) {
                meta[opt].value = options[opt];
                if (meta[opt].value !== meta[opt].default) {
                    has_meta = true;
                }
            }
            this.save({
                meta_options: meta,
                has_meta: has_meta
            });
        },

        getMeta: function (key) {
            return this.get('meta_options')[key].value;
        },

        isAbstract: function () {
            return this.getMeta('abstract') === true;
        },

        isEqual: function (model) {
            if (typeof model === 'string') {
                return (this.get('name') === model.slugify());
            }
            return (this.get('name') === model.get('name'));
        },

        toPython: function () {
            return modelToPython(this);
        }
    });
});
