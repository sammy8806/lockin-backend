/**
 * Created by steve on 11.12.2015.
 */
'use strict';

const SERVICE_NAME = 'ChatService';
let _functions;

function setup(_env) {
    _functions = _env.ServiceFactory.loadFunctions(SERVICE_NAME);
}

function callFunc(_method, _args, _env) {
    return _functions[_method].call(_args, _env);
}

module.exports = {
    setup,
    callFunc
};
