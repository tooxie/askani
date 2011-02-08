settings = {
    max_length: 255,
    use_i18n: true,
    explicit_imports: true,

    get: function (key, default_value) {
        if (typeof default_value === 'undefined') {
            default_value = null;
        }
        if (key === 'get') {
            return this.get('_get');
        }
        if (key === 'set') {
            return this.get('_set');
        }
        if (typeof this[key] !== 'undefined') {
            return this[key];
        }
        return default_value;
    },

    set: function (key, value, update) {
        if (key === 'get') {
            this.set('_get', value);
        }
        if (key === 'set') {
            this.set('_set', value);
        }
        if (update === true) {
            if (typeof this[key] !== 'undefined') {
                this[key] = value;
            }
        } else {
            this[key] = value;
        }
        return null;
    }
};
