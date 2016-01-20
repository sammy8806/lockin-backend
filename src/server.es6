'use strict';
require('babel-polyfill');

import crypto from 'crypto';

const _env = {
    ServiceFactory: require('./lib/servicefactory/servicefactory'),
    GlobalServiceFactory: require('./lib/servicefactory/servicefactory')
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
    chars = chars || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    let rnd = crypto.randomBytes(howMany);
    let value = new Array(howMany);
    let len = chars.length;

    for (let i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    }

    return value.join('');
};

_env.ObjectFactory = {
    get(_name) {
        return require('./objectPrototypes/' + _env.lcfirst(_name));
    }
};

_env.packetParser = require('./lib/packetparser/packet_parser');
_env.sessionmanager = require('./lib/sessionmanager/sessionmanager');

_env.GlobalServiceFactory.setup(_env, 'globalservice');
_env.ServiceFactory.setup(_env, 'service');

global._env = _env;

const SERVER_PORT = 8080;
const SERVER_HOST = '::'; // No localhost or something here instead of '::' (IPv6)

_env.websockethandler = require('./lib/websockethandler/websockethandler.js');
_env.websockethandler.init(_env, SERVER_PORT, SERVER_HOST);

// -------------------
