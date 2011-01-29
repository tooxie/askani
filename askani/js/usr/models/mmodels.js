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
        }
    });
});
