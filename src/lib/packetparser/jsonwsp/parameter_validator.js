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

    _env.debug(
        METHOD_NAME,
        `${_argName} => ${JSON.stringify(_args)}`
    );

    try {
        const valid = (!!paramValidators[_validatorName].validateParameter(_args, _argName));
        const boolExpr = valid && (!negate);

        _env.debug(
            METHOD_NAME,
            `Validating: ${_argName} with ${negate ? 'nagated' : ''} '${_validatorName}' => ${valid}/${boolExpr}`
        );
        return boolExpr;
    } catch (_err) {
        global._env.error(`ParameterValidator`, `[${_validatorName}] ${_err}`);
    }
}

module.exports = {
    validateParameter
};
