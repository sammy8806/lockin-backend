/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

const METHOD_NAME = 'PacketParser/methodValidator';
const parameterValidator = require('./parameter_validator.js');

const DEBUG = false;

function validateMethodCall(_env, _servicename, _methodname, _args) {

    if(DEBUG) _env.debug(METHOD_NAME, `Searching Service: ${_servicename}`);
    let service = _env.ServiceFactory.getService(_servicename);

    if (service === undefined) {
        global._env.ErrorHandler.throwError(1004);
    }

    if(DEBUG) _env.debug(METHOD_NAME, `Searching Method: ${_servicename}/${_methodname}`);
    let method = service.getFunc(_methodname);
    if (method === undefined) {
        global._env.ErrorHandler.throwError(1005);
    }

    let parameterVariations = method.parameterVariations;

    if (parameterVariations === undefined || parameterVariations.length === 0) {
        return true;
    }

    let extracted = false;
    let extract = false;

    do {
        if(extract) {
            if(DEBUG) _env.debug(METHOD_NAME, 'Trying to extract Parameters');
            _args = _args[Object.keys(_args)[0]];
            extracted = true;
        }

        for (let i = 0; i < parameterVariations.length; i++) {
            let parameterVariation = parameterVariations[i];
            if (validateMethodCallOption(_env, parameterVariation, _args)) {
                return _args;
            }
        }

        extract = true;
    } while(!extracted);

    _env.ErrorHandler.throwError(1006);
}

function validateMethodCallOption(_env, _parameterVariation, _args) {
    for (let argDefinition in _parameterVariation) {
        if (_parameterVariation.hasOwnProperty(argDefinition)) {
            if(DEBUG) _env.debug(METHOD_NAME, `Validating Variation: ${JSON.stringify(argDefinition)}`);
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
