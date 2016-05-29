/**
 * Created by hendrik on 04.12.2015.
 */
'use strict';

const METHOD_NAME = 'PacketParser';

const JsonwspFault = require('./protocol/jsonwsp_fault.js');
const JsonwspResponse = require('./protocol/jsonwsp_response.js');
const JsonwspRequest = require('./protocol/jsonwsp_request.js');

const methodValidator = require('./method_validator.js');
const parameterExistsValidator = require('./parameter_validators/exists.js');

function parse(_packet, _env, _ws) {
    return new Promise((resolve, reject) => {
        let data;

        try {
            data = JSON.parse(_packet);
        } catch (err) {
            err.string = 'No valid JSON';
            err.code = 'client';

            reject(buildFault(err, null));
        }

        try {
            checkParameters(_env, data);
        } catch (err) {
            reject(buildFault(err, data.mirror));
        }

        let funcArgs = data.args;

        let servicename = data.methodname.split('/')[0];
        let methodname = data.methodname.split('/')[1];
        
        try {
            if (servicename !== 'adminservice') {
                funcArgs = methodValidator.validateMethodCall(_env, servicename, methodname, funcArgs);
            }
        } catch (_err) {
            _env.debug(
                METHOD_NAME + '/methodValidator',
                `reject: ${typeof _err === 'object' ? JSON.stringify(_err) : _err}`
            );
            reject(buildFault(_err, data.mirror));
            return;
        }

        _env.debug(
            METHOD_NAME,
            `Calling Service: ${servicename} Method: ${methodname} with args: ${JSON.stringify(funcArgs)}`
        );

        resolve(_env.ServiceFactory
            .getService(servicename)
            .callFunc(methodname, funcArgs, _env, _ws, data.type)
            .then(
                (result) => {
                    _env.debug(METHOD_NAME, 'result: ' + JSON.stringify(result));
                    return buildResponse(servicename, methodname, result, data.mirror);
                },
                (err) => {
                    console.error(err);
                    _env.debug(METHOD_NAME, `reject: ${JSON.stringify(err)}`);
                    return buildFault(err, data.mirror);
                }
            )).catch((_err) => {
            _env.error(METHOD_NAME, _err);
        });
    });
}

function buildResponse(_servicename, _methodname, _result, _mirror) {
    return new JsonwspResponse(_servicename, _methodname, _result, _mirror);
}

function buildFault(_err, _mirror) {
    return new JsonwspFault(_err, _mirror);
}

function buildRequest(_servicename, _methodname, _args, _mirror) {
    return new JsonwspRequest(_servicename, _methodname, _args, _mirror);
}

function checkParameters(_env, _data) {
    let requiredArgs = ['type', 'version', 'methodname', 'args', 'mirror'];

    for (let i = 0; i < requiredArgs.length; i++) {
        if (!parameterExistsValidator.validateParameter(_data, requiredArgs[i])) {
            _env.ErrorHandler.throwError(1002, `parameter ${requiredArgs[i]}`);
        }
    }

    if (_data.methodname.split('/').length !== 2) {
        _env.ErrorHandler.throwError(1003);
    }

    _env.debug(METHOD_NAME, 'version',  _data.version);

    if (_data.version !== '1.0') {
        _env.ErrorHandler.throwError(1001);
    }

}

module.exports = {
    parse,
    buildRequest
};
