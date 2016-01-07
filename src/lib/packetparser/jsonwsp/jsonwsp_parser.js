/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

let JsonwspFault = require('./protocol/jsonwsp_fault.js');
let JsonwspResponse = require('./protocol/jsonwsp_response.js');
let JsonwspRequest = require('./protocol/jsonwsp_request.js');

let methodValidator = require('./method_validator.js');
let parameterExistsValidator = require('./parameter_validators/exists.js');

const Promise = require('promise');

function parse(_packet, _env, _ws) {
    let data;
    try {
        data = JSON.parse(_packet);
    } catch (err) {
        err.string = 'No valid JSON';
        err.code = 'client';

        return buildFault(err, null);
    }

    try {
        checkParameters(data);
    } catch (err) {
        return buildFault(err, data.mirror);
    }

    let servicename = data.methodname.split('/')[0];
    let methodname = data.methodname.split('/')[1];

    return new Promise((resolve, reject) => {
        methodValidator.validateMethodCall(servicename, methodname, data.args);
        _env.debug(
            'PacketParser',
            `Calling Service: ${servicename} Method: ${methodname} with args: ${JSON.stringify(data.args)}`
        );

        return _env.ServiceFactory
            .getService(servicename)
            .callFunc(methodname, data.args, _env, _ws, data.type)
            .then(
                (result) => {
                    _env.debug('PacketParser', `result: ${JSON.stringify(result)}`);
                    resolve(result);
                },
                (err) => {
                    _env.debug('PacketParser', `reject: ${JSON.stringify(err)}`);
                    reject(buildFault(err, data.mirror));
                }
            );
    });
}

function buildReponse(_servicename, _methodname, _result, _mirror) {
    let response = new JsonwspResponse(servicename, methodname, result, _mirror);
    return
}

function buildFault(_err, _mirror) {
    let response = new JsonwspFault(_err, _mirror);
    return response;
}

function buildRequest(_servicename, _methodname, _args, _mirror) {
    let response = new JsonwspRequest(_servicename, _methodname, _args, _mirror);
    return response;
}

function checkParameters(_data) {
    let requiredArgs = ['type', 'version', 'methodname', 'args', 'mirror'];

    for (let i = 0; i < requiredArgs.length; i++) {
        if (!parameterExistsValidator.validateParameter(_data, requiredArgs[i])) {
            throw {string: `missing parameter ${requiredArgs[i]}`, code: 'client'};
        }
    }

    if (_data.methodname.split('/').length !== 2) {
        throw {string: 'parameter methodname is invalid', code: 'client'};
    }

    if (_data.version !== '1.0') {
        throw {string: 'version mismatch. Server requires version 1.0', code: 'incompatible'};
    }
}

module.exports = {
    parse,
    buildRequest
};
