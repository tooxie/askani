// Diálogo "modificar campo":
// 1) Ingresar nombre del campo (se autocompleta)
// 2) Si el campo es conocido se muestran dos grupos colapsados:
//    * Opciones genéricas.
//    * Opciones específicas.
//    * Y un link a la documentación del campo y de cada opción.
// 3) Si no es conocido muestro un campo donde ingresa las opciones a mano.
var fields = {
    validators: {
        is_number: function (n, params) {
            if (typeof n !== 'number') {
                return false;
            }
            if (params.length === 2) {
                if (n < params[0] || n > params[1]) {
                    return false;
                }
            } else if (params.length === 1) {
                if (n < params[0]) {
                    return false;
                }
            }
            return true;
        },
        is_boolean: function (b) {
            return (typeof b === 'boolean');
        }
    },
    isKnown: function (field) {
        for (f in this.types) {
            if (f === field) {
                return true;
            }
        }
        return false;
    },
    getOptions: function (field) {
        for (f in this.field_options) {
            if (f === field) {
                console.log(f);
                return {
                    field: this.field_options[f],
                    common: this.common_options
                }
            }
        }
    },
    common_options: {
        'null': {
            type: 'boolean',
            default_value: false,
            except: [],
            one_per_object: false
        },
        'blank': {
            type: 'boolean',
            default_value: false,
            except: [],
            one_per_object: false
        },
        'choices': {
            type: 'text',
            default_value: '',
            except: [],
            one_per_object: false
        },
        'db_column': {
            type: 'text',
            default_value: '',
            except: [],
            one_per_object: false
        },
        'db_index': {
            type: 'boolean',
            default_value: false,
            except: [],
            one_per_object: false
        },
        'db_tablespace': {
            type: 'text',
            default_value: '',
            except: [],
            one_per_object: false
        },
        'default_value': {
            type: 'text',
            default_value: '',
            except: [],
            one_per_object: false
        },
        'editable': {
            type: 'boolean',
            default_value: true,
            except: [],
            one_per_object: false
        },
        'error_messages': {
            type: 'text',
            default_value: '',
            except: [],
            one_per_object: false
        },
        'help_text': {
            type: 'text',
            default_value: '',
            except: [],
            one_per_object: false
        },
        'primary_key': {
            type: 'boolean',
            default_value: false,
            except: [],
            one_per_object: true
        },
        'unique': {
            type: 'boolean',
            default_value: false,
            except: ['ManyToManyField', 'FileField'],
            one_per_object: false
        },
        'unique_for_date': {
            type: 'boolean',
            default_value: false,
            except: ['ManyToManyField', 'FileField'],
            one_per_object: false
        },
        'unique_for_month': {
            type: 'boolean',
            default_value: false,
            except: ['ManyToManyField', 'FileField'],
            one_per_object: false
        },
        'unique_for_year': {
            type: 'boolean',
            default_value: false,
            except: ['ManyToManyField', 'FileField'],
            one_per_object: false
        },
        'verbose_name': {
            type: 'text',
            default_value: '',
            except: [],
            one_per_object: false
        },
        'validators': {
            type: 'text',
            default_value: '',
            except: [],
            one_per_object: false
        }
    },
    field_options: {
        AutoField: {
            type: 'number'
        },
        BigIntegerField: {
            type: 'number',
            validator_params: [-9223372036854775808, 9223372036854775807]
        },
        BooleanField: {
            type: 'boolean'
        },
        CharField: {
            type: 'text',
            required: {
                max_length: {
                    type: 'number',
                    validator_params: [1, 255],
                    default_value: 255
                }
            }
        },
        CommaSeparatedIntegerField: {
            type: 'text',
            required: {
                max_length: {
                    type: 'number',
                    validator_params: [1, 255],
                    default_value: 255
                }
            }
        },
        DateField: {
            type: 'text',
            optional: {
                auto_now: {
                    type: 'text'
                },
                auto_now_add: {
                    type: 'text'
                }
            }
        },
        DateTimeField: {
            type: 'text',
            optional: {
                auto_now: {
                    type: 'boolean',
                    default_value: false
                },
                auto_now_add: {
                    type: 'boolean',
                    default_value: false
                }
            }
        },
        DecimalField: {
            type: 'number',
            required: {
                max_digits: {
                    type: 'number'
                },
                decimal_places: {
                    type: 'number'
                }
            }
        },
        EmailField: {
            type: 'email',
            optional: {
                max_length: {
                    type: 'number',
                    default_value: 75
                }
            }
        },
        FileField: {
            type: 'text',
            required: {
                upload_to: {
                    type: 'text'
                }
            },
            optional: {
                storage: {
                    type: 'text'
                }
            },
            except: ['primary_key', 'unique']
        },
        FilePathField: {
            type: 'text',
            required: {
                path: {
                    type: 'text'
                }
            },
            optional: {
                match: {
                    type: 'text'
                },
                recursive: {
                    type: 'boolean',
                    default_value: false
                },
                max_length: {
                    type: 'number',
                    default_value: 100
                }
            }
        },
        FloatField: {
            type: 'number'
        },
        ForeignKey: {
            type: 'text',
            required: {
                othermodel: {
                    type: 'text',
                    positional: true
                }
            },
            optional: {
                limit_choices_to: {
                    type: 'text'
                },
                related_name: {
                    type: 'text'
                },
                to_field: {
                    type: 'text'
                },
                on_delete: {
                    type: 'literal',
                    default_value: 'models.CASCADE'
                }
            }
        },
        ImageField: {
            type: 'text',
            required: {
                upload_to: {
                    type: 'text'
                }
            },
            optional: {
                height_field: {
                    type: 'number'
                },
                width_field: {
                    type: 'number'
                },
                max_length: {
                    type: 'number',
                    default_value: 100
                }
            }
        },
        IntegerField: {
            type: 'number'
        },
        IPAddressField: {
            type: 'text'
        },
        ManyToManyField: {
            type: 'text',
            required: {
                othermodel: {
                    type: 'text',
                    positional: true
                }
            },
            optional: {
                related_name: {
                    type: 'text'
                },
                limit_choices_to: {
                    type: 'text'
                },
                symmetrical: {
                    type: 'boolean',
                    default_value: true
                },
                through: {
                    type: 'text'
                },
                db_table: {
                    type: 'text'
                }
            }
        },
        NullBooleanField: {
            type: 'nullbool'
        },
        OneToOneField: {
            type: 'text',
            required: {
                othermodel: {
                    type: 'text',
                    positional: true
                }
            },
            optional: {
                limit_choices_to: {
                    type: 'text'
                },
                related_name: {
                    type: 'text'
                },
                to_field: {
                    type: 'text'
                },
                on_delete: {
                    type: 'literal',
                    default_value: 'models.CASCADE'
                },
                parent_link: {
                    type: 'boolean',
                    default_value: false
                }
            }
        },
        PositiveIntegerField: {
            type: 'number',
            validator_params: [0]
        },
        PositiveSmallIntegerField: {
            type: 'number',
            validator_params: [0]
        },
        SlugField: {
            type: 'text',
            optional: {
                max_length: {
                    type: 'number',
                    default_value: 50
                }
            },
            implies: {
                db_index: {
                    value: true
                }
            }
        },
        SmallIntegerField: {
            type: 'number'
        },
        TextField: {
            type: 'text'
        },
        TimeField: {
            type: 'text',
            optional: {
                auto_now: {
                    type: 'boolean',
                    default_value: false
                },
                auto_now_add: {
                    type: 'boolean',
                    default_value: false
                }
            }
        },
        URLField: {
            type: 'text',
            optional: {
                verify_exists: {
                    type: 'boolean',
                    default_value: true
                },
                max_length: {
                    type: 'number',
                    default_value: 200
                }
            }
        },
        XMLField: {
            type: 'text',
            required: {
                schema_path: {
                    type: 'text'
                }
            }
        }
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
};
