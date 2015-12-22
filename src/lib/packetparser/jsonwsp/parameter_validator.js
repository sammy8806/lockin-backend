/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let existsValidator = require('./parameter_validators/exists.js');

let paramValidators = {
    'exists': existsValidator
};

function validateParameter(_args, _argName, _validatorName) {
    if (paramValidators[_validatorName].validateParameter(_args, _argName)) {
        return true;
    }
    return false;
}

module.exports = {
    validateParameter
};
