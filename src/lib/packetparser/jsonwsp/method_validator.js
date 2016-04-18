/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

const METHOD_NAME = 'PacketParser/methodValidator';
const parameterValidator = require('./parameter_validator.js');

function validateMethodCall(_env, _servicename, _methodname, _args) {

    _env.debug(METHOD_NAME, `Searching Service: ${_servicename}`);
    let service = _env.ServiceFactory.getService(_servicename);

    if (service === undefined) {
        throw {string: 'unknown service', code: 'client'};
    }

    _env.debug(METHOD_NAME, `Searching Method: ${_servicename}/${_methodname}`);
    let method = service.getFunc(_methodname);
    if (method === undefined) {
        throw {string: 'unknown method', code: 'client'};
    }

    let parameterVariations = method.parameterVariations;

    if (parameterVariations === undefined || parameterVariations.length === 0) {
        return true;
    }

    for (let i = 0; i < parameterVariations.length; i++) {
        let parameterVariation = parameterVariations[i];
        if (validateMethodCallOption(_env, parameterVariation, _args)) {
            return true;
        }
    }


    throw {string: 'arguments invalid', code: 'client'};
}

function validateMethodCallOption(_env, _parameterVariation, _args) {
    for (let argDefinition in _parameterVariation) {
        if (_parameterVariation.hasOwnProperty(argDefinition)) {
            _env.debug(METHOD_NAME, `Validating Variation: ${JSON.stringify(argDefinition)}`);
            if (!parameterValidator.validateParameter(
                    _env,
                    _args,
                    argDefinition,
                    _parameterVariation[argDefinition]
                )
            ) {
                return false;
            }
        }
    }

    return true;
}

module.exports = {
    validateMethodCall
};
