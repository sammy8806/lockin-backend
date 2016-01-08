/**
 * Created by steve on 11.12.2015.
 */
'use strict';

const SERVICE_NAME = 'AdminService';
let _functions;

function setup(_env) {
    _functions = _env.ServiceFactory.loadFunctions(SERVICE_NAME, _env);
}

function callFunc(_method, _args, _env, _ws, _type) {
    if (_functions[_method] === undefined) {
        return Promise.reject({code: 'client', string: 'Method doesn\'t exist!'});
    }

    return _functions[_method].call(_args, _env, _ws, _type);
}

module.exports = {
    setup,
    callFunc
};
