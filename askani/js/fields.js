// Diálogo "modificar campo":
// 1) Ingresar nombre del campo (se autocompleta)
// 2) Si el campo es conocido se muestran dos grupos colapsados:
//    * Opciones genéricas.
//    * Opciones específicas.
//    * Y un link a la documentación del campo y de cada opción.
// 3) Si no es conocido muestro un campo donde ingresa las opciones a mano.
fields = {
    validators: {
        is_number: function (n, min, max) {
            if (typeof val !== 'number') {
                return false;
            }
            if (min && max) {
                if (n < min || n > max) {
                    return false;
                }
            }
            return true;
        },
        is_boolean: function (b) {
            return (typeof b === 'boolean');
        },
    },
    common_options: {
        'null': {
            type: 'boolean',
            default: false,
            except: [],
            one_per_object: false
        },
        'blank': {
            type: 'boolean',
            default: false,
            except: [],
            one_per_object: false
        },
        'choices': {
            type: 'text',
            default: '',
            except: [],
            one_per_object: false
        },
        'db_column': {
            type: 'text',
            default: '',
            except: [],
            one_per_object: false
        },
        'db_index': {
            type: 'boolean',
            default: false,
            except: [],
            one_per_object: false
        },
        'db_tablespace': {
            type: 'text',
            default: '',
            except: [],
            one_per_object: false
        },
        'default': {
            type: 'text',
            default: '',
            except: [],
            one_per_object: false
        },
        'editable': {
            type: 'boolean',
            default: true,
            except: [],
            one_per_object: false
        },
        'error_messages': {
            type: 'text',
            default: '',
            except: [],
            one_per_object: false
        },
        'help_text': {
            type: 'text',
            default: '',
            except: [],
            one_per_object: false
        },
        'primary_key': {
            type: 'boolean',
            default: false,
            except: [],
            one_per_object: true
        },
        'unique': {
            type: 'boolean',
            default: false,
            except: ['ManyToManyField', 'FileField'],
            one_per_object: false
        },
        'unique_for_date': {
            type: 'boolean',
            default: false,
            except: ['ManyToManyField', 'FileField'],
            one_per_object: false
        },
        'unique_for_month': {
            type: 'boolean',
            default: false,
            except: ['ManyToManyField', 'FileField'],
            one_per_object: false
        },
        'unique_for_year': {
            type: 'boolean',
            default: false,
            except: ['ManyToManyField', 'FileField'],
            one_per_object: false
        },
        'verbose_name': {
            type: 'text',
            default: '',
            except: [],
            one_per_object: false
        },
        'validators': {
            type: 'text',
            default: '',
            except: [],
            one_per_object: false
        },
    },
    field_types: {
        'AutoField': {
            type: 'number',
            validator: this.validators.is_number
        },
        'BigIntegerField': {
            type: 'number',
            validator: this.is_number,
            validator_params: [-9223372036854775808, 9223372036854775807]
        },
        'BooleanField': {
            type: 'boolean',
            validator: this.is_boolean
        },
        'CharField': {
            type: 'text',
            validator: null
        },
        'CommaSeparatedIntegerField': {
            type: 'text',
            validator: null
        },
        'DateField': {
            type: 'text',
            validator: null
        },
        'DateTimeField': {
            type: 'text',
            validator: null
        },
        'DecimalField': {
            type: 'number',
            validator: this.is_number
        },
        'EmailField': {
            type: 'email',
            validator: null
        },
        'FileField': {
        },
        'FilePathField': {
        },
        'FloatField': {
        },
        'ForeignKey': {
        },
        'ImageField': {
        },
        'IntegerField': {
        },
        'IPAddressField': {
        },
        'ManyToManyField': {
        },
        'NullBooleanField': {
        },
        'OneToOneField': {
        },
        'PositiveIntegerField': {
        },
        'PositiveSmallIntegerField': {
        },
        'SlugField': {
        },
        'SmallIntegerField': {
        },
        'TextField': {
        },
        'TimeField': {
        },
        'URLField': {
        },
        'XMLField': {
        },
    },
    types: [
        'AutoField',
        'BigIntegerField',
        'BooleanField',
        'CharField',
        'CommaSeparatedIntegerField',
        'DateField',
        'DateTimeField',
        'DecimalField',
        'EmailField',
        'FileField',
        'FilePathField',
        'FloatField',
        'ImageField',
        'IntegerField',
        'IPAddressField',
        'NullBooleanField',
        'PositiveIntegerField',
        'PositiveSmallIntegerField',
        'SlugField',
        'SmallIntegerField',
        'TextField',
        'TimeField',
        'URLField',
        'XMLField',
        'ForeignKey',
        'ManyToManyField',
        'OneToOneField'
    ]
}
