/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

const METHOD_NAME = 'PacketParser/validateParameter';
let existsValidator = require('./parameter_validators/exists.js');

let paramValidators = {
    'exists': existsValidator
};

function validateParameter(_env, _args, _argName, _validatorName) {

    const negate = _validatorName.substr(0, 1) === '!';
    if (negate) {
        _validatorName = _validatorName.substr(0, 1);
    }

    _env.debug(METHOD_NAME, `Validating: ${_argName} with ${_validatorName} negate: ${negate ? 'true' : 'false'}`);

    try {
        return (!!paramValidators[_validatorName].validateParameter(_args, _argName)) && (!negate);
    } catch (_err) {
        global._env.error(`ParameterValidator`, `[${_validatorName}] ${_err}`);
    }
}

module.exports = {
    validateParameter
};
