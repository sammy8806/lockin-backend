/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let parameterValidator = require('./parameter_validator.js');

const servicenames = [
    'chatservice',
    'userservice',
    'sessionservice',
    'fileservice'
];

let services = {};

for (let i = 0; i < servicenames.length; i++) {
    let servicename = servicenames[i];
    services[servicename] = {};
    let methodnames = require(`./services/${servicename}/servicedescription.js`);
    methodnames = methodnames.serviceMethods;
    for (let j = 0; j < methodnames.length; j++) {
        let methodname = methodnames[j];
        services[servicename][methodname] = require(`./services/${servicename}/${methodname}.js`);
    }
}

function validateMethodCall(_servicename, _methodname, _args) {
    let service = services[_servicename];
    if (service === undefined) {
        throw {string: 'unknown service', code: 'client'};
    }

    let method = service[_methodname];
    if (method === undefined) {
        throw {string: 'unknown method', code: 'client'};
    }

    let parameterVariations = method.parameterVariations;

    if (parameterVariations.length === 0) {
        return true;
    }

    for (let i = 0; i < parameterVariations.length; i++) {
        let parameterVariation = parameterVariations[i];
        if (validateMethodCallOption(parameterVariation, _args)) {
            return true;
        }
    }


    throw {string: 'arguments invalid', code: 'client'};
}

function validateMethodCallOption(_parameterVariation, _args) {
    for (let argDefinition in _parameterVariation) {
        if (_parameterVariation.hasOwnProperty(argDefinition)) {
            if (!parameterValidator.validateParameter(
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
