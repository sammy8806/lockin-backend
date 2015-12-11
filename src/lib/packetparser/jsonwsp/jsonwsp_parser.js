/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';


let methodValidator = require('./method_validator.js');
let jsonwspFault = require('./protocol/jsonwsp_fault.js');

let parameterExistsValidator = require('./parameter_validators/exists.js');

function parse(_packet,enviroment){
    let data;
    try{
        data = JSON.parse(_packet);
    }catch (err){
        err = {string: 'No valid JSON', code:'client'};
        return buildFault(err,null);

    }
    try{
        checkParameters(data);
    }catch (err){
        return buildFault(err,data.mirror);
    }

    let servicename = data.methodname.split("/")[0];
    let methodname = data.methodname.split("/")[1];

    try{
        methodValidator.validateMethodCall(servicename,methodname,data.args);
        return `calling service: ${servicename}; method: ${methodname}; args: ${data.args}`;
    }catch (err){
        return buildFault(err,data.mirror);
    }
}

function buildFault(_err, _mirror){
    let response = new jsonwspFault(_err,_mirror);
    return response;
}

function checkParameters(_data){
    let requiredArgs = ['type','version','methodname','args','mirror'];

    for (let i=0; i<requiredArgs.length; i++){
        if (!parameterExistsValidator.validateParameter(_data,requiredArgs[i])){
            throw {string: `missing parameter ${requiredArgs[i]}`, code:'client'};
        }
    }

    if(_data.methodname.split('/').length != 2){
        throw {string: 'parameter methodname is invalid', code:'client'};
    }

    if(_data.version != '1.0'){
        throw {string: 'version mismatch. Server requires version 1.0', code:'client'};
    }



}

module.exports = {
  parse
};