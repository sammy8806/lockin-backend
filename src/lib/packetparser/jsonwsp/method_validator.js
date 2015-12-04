/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let parameterValidator = require('./parameter_validator.js');

const servicenames = [
    "userservice"
];

let services = {};

for (let i = 0; i<servicenames.length ; i++){
    let servicename = servicenames[i];
    services[servicename] = {};
    let methodnames = require(`./services/${servicename}/servicedescription.js`);
    methodnames = methodnames.serviceMethods;
    for (let j = 0; j<methodnames.length ; j++){
        let methodname = methodnames[j]
        services[servicename][methodname] = require(`./services/${servicename}/${methodname}.js`);
    }
}

function validateMethodCall(_servicename, _methodname, _args){
    let service = services[_servicename];
    if (service == undefined){
        throw {string: 'unknown service', code:'Client'};
    }

    let method = service[_methodname];
    if (method == undefined){
        throw {string: 'unknown method', code: 'Client'};
    }

    let parameterVariations = method.parameterVariations;

    for (let i = 0; i<parameterVariations.length; i++){
        let parameterVariation = parameterVariations[i];
        if(validateMethodCallOption(parameterVariation, _args)){
            return true;
        }
    }
    return false;
}

function validateMethodCallOption(_parameterVariation, _args){
    for (let argDefinition in _parameterVariation){
        if (!parameterValidator.validateParameter(_args,argDefinition,_parameterVariation[argDefinition])){
            return false;
        }
    }
    return true;
}

module.exports = {
    validateMethodCall
};

