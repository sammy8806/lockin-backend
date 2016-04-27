'use strict';

import crypto from 'crypto';

module.exports = {
    setupEnv: setupEnv
};

function setupEnv() {
    const _env = {
        ServiceFactory: require('./servicefactory/servicefactory'),
        GlobalServiceFactory: require('./servicefactory/servicefactory')
    };

    _env.lcfirst = function (_str) {
        const f = _str.charAt(0).toLowerCase();
        return f + _str.substr(1);
    };

    _env._log = function (_func, _type, _tag, _string) {
        _func('[%s] [%s] %s', _type, _tag, _string);
    };

    _env.debug = function (_tag, _string) {
        _env._log(console.log, 'DEBUG', _tag, _string);
    };

    _env.error = function (_tag, _string) {
        _env._log(console.log, 'ERROR', _tag, _string);
    };

    _env.random = function (howMany, chars) {
        chars = chars || 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
        let rnd = crypto.randomBytes(howMany);
        let value = new Array(howMany);
        let len = chars.length;

        for (let i = 0; i < howMany; i++) {
            value[i] = chars[rnd[i] % len];
        }

        return value.join('');
    };

    _env.ObjectFactory = {
        get(_name) {
            return require('../objectPrototypes/' + _env.lcfirst(_name));
        }
    };

    _env.packetParser = require('./packetparser/packet_parser');
    _env.sessionmanager = require('./sessionmanager/sessionmanager');
    _env.ErrorHandler = require('./errorhandler/errorhandler');

    _env.GlobalServiceFactory.setup(_env, 'globalservice');
    _env.ServiceFactory.setup(_env, 'service');
    _env.ErrorHandler.setup(_env);

    _env.websockethandler = require('./websockethandler/websockethandler.js');

    return _env;
}