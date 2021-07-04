// check 10-character alphanumeric string
const check50Char = {
    type: 'string',
    pattern: '^[a-zA-Z0-9_]*$',
    minLength: 0,
    maxLength: 50
}

// check email
const checkEmail = {
    type: 'string',
    pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]*$',
    minLength: 0,
    maxLength: 50
}

const jsonschema = require('jsonschema');

function isValid(instance, schema) {
    if ((jsonschema.validate(instance, schema).errors.length) == 0) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    check50Char,
    checkEmail,
    isValid,
};