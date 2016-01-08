/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let existsValidator = require('./parameter_validators/exists.js');

let paramValidators = {
    'exists': existsValidator
};

function validateParameter(_args, _argName, _validatorName) {
    try {
        if (paramValidators[_validatorName].validateParameter(_args, _argName)) {
            return true;
        }
        return false;

    } catch (_err) {
        global._env.error(`ParameterValidator`, `[${_validatorName}] ${_err}`);
    }
}

module.exports = {
    validateParameter
};
