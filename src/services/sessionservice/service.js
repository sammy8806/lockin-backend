'use strict';

const SERVICE_NAME = 'SessionService';
let _functions;

function setup(_env) {
    _functions = _env.ServiceFactory.loadFunctions(SERVICE_NAME, _env);
}

function callFunc(_method, _args, _env, _ws, _type) {
    return _functions[_method].call(_args, _env, _ws, _type);
}

module.exports = {
    setup,
    callFunc
//    deps : ['databaseservice']
};
