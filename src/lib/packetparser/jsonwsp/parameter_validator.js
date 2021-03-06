/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

const METHOD_NAME = 'PacketParser/validateParameter';
let existsValidator = require('./parameter_validators/exists.js');
let hintValidator = require('./parameter_validators/hint.js');

const DEBUG = true;

let paramValidators = {
    exists: existsValidator,
    hint: hintValidator
};

function validateParameter(_env, _args, _argName, _validatorName) {

    const negated = _validatorName.substr(0, 1) === '!';
    if (negated) {
        _validatorName = _validatorName.substr(1);
    }

    if (DEBUG) _env.debug(
        METHOD_NAME,
        `${_argName} => ${JSON.stringify(_args)}`
    );

    try {
        const valid = (!!paramValidators[_validatorName].validateParameter(_args, _argName));
        const boolExpr = !negated ? valid : !valid;

        if (DEBUG) _env.debug(
            METHOD_NAME,
            `Validated: ${_argName} with${negated ? ' nagated' : ''} '${_validatorName}' => ${valid}/${boolExpr}`
        );

        return boolExpr;
    } catch (_err) {
        global._env.error(`ParameterValidator`, `[${_validatorName}] ${_err}`);
    }
}

module.exports = {
    validateParameter
};
