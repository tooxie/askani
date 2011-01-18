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
         _,
         Backbone,
         Exceptions,
         Store,
         toPython,
         window
*/

$(function () {
    window.AskaniModel = Backbone.Model.extend({
        __class__: 'AskaniModel',

        initialize: function () {
            var args, defaults, key;
            defaults = {
                name: '',
                x: 0,
                y: 0,
                z: 1
            };
            for (key in defaults) {
                if (!this.get(key) && defaults[key] !== '') {
                    args = {};
                    args[key] = defaults[key];
                    this.set(args);
                }
            }
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
                throw new Exceptions.EmptyNameError();
            }
            return name;
        },

        setPosition: function (x, y) {
            x = (typeof x === 'string') ? Number(x.replace(/[px]/g, '')) : x;
            y = (typeof y === 'string') ? Number(y.replace(/[px]/g, '')) : y;
            x = (x < 0) ? 0 : x;
            y = (y < 0) ? 0 : y;
            this.save({
                x: (x > 0) ? x : 0,
                y: (y > 0) ? y : 0
            });
        },

        isEqual: function (model) {
            if (typeof model === 'string') {
                return (this.get('name') === model.toCamelCase());
            }
            return (this.get('name') === model.get('name'));
        },

        toPython: function () {
            return toPython(this);
        }
    });

    window.AskaniCollection = Backbone.Collection.extend({
        __class__: 'AskaniCollection',

        initialize: function (attributes, options) {
            if (typeof attributes !== 'undefined') {
                if (typeof attributes.namespace !== 'undefined') {
                    attributes.prefix = attributes.prefix ? attributes.prefix : '';
                    this.localStorage = new Store(attributes.prefix + attributes.namespace);
                }
            }
            if (typeof attributes === 'undefined' || typeof attributes.existsException === 'undefined') {
                throw new Exceptions.InitializationError(attributes);
            }
        },

        create: function (attributes, options) {
            options = options ? options : {};
            if (attributes.name === null) {
                return false;
            }
            this.each(function (el) {
                if (el.isEqual(attributes.name)) {
                    throw new Exceptions.ModelExists({
                        model: attributes.name
                    });
                }
            });
            return Backbone.Collection.prototype.create.call(this, $.extend({
                z: this.nextPosition()
            }, attributes), $.extend({
                success: this.model.prototype.post_save
            }, options));
        },

        remove: function (options) {
            Backbone.Collection.prototype.remove.call(this, options);
            this.reZ();
            return this;
        },

        reZ: function () {
            this.each(function (el, i, list) {
                el.set({z: i + 1});
                el.save();
            });
        },

        nextPosition: function () {
            if (!this.length) {
                return 1;
            }
            return this.last().get('z') + 1;
        },

        comparator: function (model) {
            return model.get('z');
        },

        getDeployCoords: function (x, y) {
            var coords;
            x = x ? x : 0;
            y = y ? y : 0;
            this.each(function (m, i) {
                if (m.get('x') === x && m.get('y') === y) {
                    coords = this.getDeployCoords(x + 9, y + 18);
                    x = coords[0];
                    y = coords[1];
                }
            }, this);
            return [x, y];
        }
    });

    window.AskaniView = Backbone.View.extend({
        __class__: 'AskaniView',

        tagName: 'div',

        events: {
            'click .object-kill': 'destroy',
            'click .object-new': 'create',
            'click': 'raise',
            'dragstop': 'saveCoords'
        },

        initialize: function (attr) {
            _.bindAll(this, 'render', 'raise', 'saveCoords');
            this.configure(attr);
            if (this.collection) {
                this.collection.fetch();
            }
            if (this.model) {
                this.id = this.model.id;
            }
        },

        render: function () {
            var $el = $('#' + this.id);
            if (this.view) {
                this.collection.each(function (object, i) {
                    var view = new this.view($.extend({}, this.getConf(), {
                        model: object,
                        view: null
                    }));
                    $(this.container).append(view.render().el);
                    return object;
                }, this);
            } else {
                if ($el.size()) {
                    $el.html('');
                }
                $(this.el).html(this.template({
                    object: this.model
                })).attr('id', this.model.id)
                   .draggable()
                   .css('left', this.model.get('x'))
                   .css('position', 'absolute')
                   .css('top', this.model.get('y'))
                   .css('z-index', this.model.get('z'));
            }
            return this;
        },

        configure: function (attributes) {
            if (typeof attributes.view !== 'undefined') {
                this.view = attributes.view;
            }
            if (typeof this.model !== 'undefined') {
                this.model.bind('change', this.render);
                this.model.view = this;
            }
            if (typeof attributes.template_selector !== 'undefined') {
                this.template_selector = attributes.template_selector;
            }
            if (typeof attributes.container !== 'undefined') {
                this.container = attributes.container;
            }
            if (typeof attributes.className !== 'undefined') {
                if (this.className && this.className !== attributes.className) {
                    this.className = this.className + ' ' + attributes.className;
                } else {
                    this.className = attributes.className;
                }
            }
            if (typeof attributes.existsException !== 'undefined') {
                this.existsException = attributes.existsException;
            }
        },

        setTabIndex: function () {
            var tabindex = 0;
            $('#workspace').find('.model').each(function (i, el) {
                $(el).find('a, input').each(function (_i, _el) {
                    $(_el).attr('tabindex', tabindex);
                    tabindex += 1;
                });
            });
        },

        report: function (exception) {
            var view = new Exceptions.View({model: exception});
            $('#messages').hide().html(view.render()).css('position', 'absolute').css('z-index', 1000).fadeIn();
            window.timeoutID = window.setTimeout(function () {
                $('#messages').fadeOut();
                window.clearTimeout(window.timeoutID);
                window.timeoutID = null;
            }, 6000);
        },

        create: function (e, clone) {
            // pNAC(View, Collection, {input, template_name, keyword, label})
            this.report(new Exceptions.NotImplementedError(this));
            return false;
        },

        promptNameAndCreate: function (View, Collection, template, template_params, input, clone) {
            var params = {};
            params[template_params.keyword] = { get: function () { return ''; } };
            $.jPrompt(_.template($(template).html())($.extend({}, template_params, params)), {
                context: this,
                submit: function (view) {
                    view.createAndRender(View, Collection, template, input, clone);
                }
            });
            return false;
        },

        createAndRender: function (View, Collection, template, input, clone) {
            var base_class = '',
                container,
                coords,
                holder = $(template + '-holder'),
                input_object,
                model,
                model_name,
                view;
            clone = clone ? clone : false;
            input_object = holder.find(input);
            model_name = input_object.val();
            input_object.blur();
            // TODO: Terminar esto. Permitir funcionalidad extra.
            if (holder.find('#model-name-overwrite-inheritance:checked').size()) {
                base_class = holder.find('#model-base-class').val();
            }
            try {
                coords = Collection.getDeployCoords();
                model = Collection.create({
                    base_class: base_class,
                    name: model_name,
                    x: coords[0],
                    y: coords[1]
                });
            } catch (err) {
                this.report(err);
                return false;
            }
            if (!model) {
                return false;
            }
            if (this.id) {
                container = this.id;
            } else {
                container = this.container;
            }
            view = new View($.extend({}, this.getConf(), {
                collection: Collection,
                container: container,
                model: model
            }));
            $(view.container).append(view.render().el);
            if (clone) {
                view = cloneView(model);
                $('#workspace').append(view.render().el);
            }
            return false;
        },

        getConf: function () {
            return {
                className: this.className,
                collection: this.collection,
                container: this.id,
                existsException: this.existsException,
                model: this.model,
                template_selector: this.template_selector
            };
        },

        raise: function (e) {
            var model,
                model_dom,
                model_id;
            if (this.collection.length === 1) {
                return true;
            }
            if ($(e.target).hasClass('object')) {
                model_dom = $(e.target);
                model_id = getID(model_dom.attr('id'));
            } else {
                model_dom = $(e.target).closest('.object');
                model_id = getID(model_dom.attr('id'));
            }
            if (Number(model_dom.css('z-index')) === this.collection.size()) {
                return true;
            }
            model = this.collection.get(model_id);
            _.each(this.collection, function (el, i, list) {
                // For some reason I receive a ghost object sometimes.
                var model = model ? model : this;
                el = el ? el : list.at(i);
                if (el.id) {
                    // I substract one from every z higher than the model I'm
                    // rising, that way I know that when I assign it the highest
                    // value no other model will have it.
                    if (el.get('z') > model.get('z')) {
                        el.save({z: el.get('z') - 1});
                        $('#' + el.id).css('z-index', el.get('z'));
                        $('#clone_' + el.id).css('z-index', el.get('z'));
                    }
                }
            }, model);
            model.save({z: this.collection.length});
            model_dom.css('z-index', model.get('z'));
            return false;
        },

        getObject: function (e) {
            return $(e.target).closest('.object');
        },

        getInstance: function (e) {
            return this.collection.get(this.getObject(e).attr('id'));
        },

        destroy: function (e) {
            var model = this.collection.get(this.getObject(e).attr('id'));
            $.jConfirm('Kill model ' + model.get('name') + '?', {
                context: {
                    model: model,
                    collection: this.collection,
                    view: this
                },
                submit: function (p) {
                    p.model.destroy();
                    p.collection.remove(p.model);
                    // $(p.model.id).remove();
                    // p.view.initialize();
                }
            });
            return false;
        },

        saveCoords: function (e) {
            var object = this.getInstance(e),
                target = $(e.target);
            console.info('dragstop');
            object.setPosition(target.css('left'), target.css('top'));
            target.css('left', object.get('x'))
                  .css('top', object.get('y'));
            return true;
        }
    });
});
