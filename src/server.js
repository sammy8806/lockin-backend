'use strict';

const _env = {
    ServiceFactory: require('./lib/servicefactory/servicefactory')
};
_env.lcfirst = function (_str) {
    const f = _str.charAt(0).toLowerCase();
    return f + _str.substr(1);
};

_env.log = function (_type, _tag, _string) {
    console.log('[%s] [%s] %s', _type, _tag, _string);
};

_env.debug = function (_tag, _string) {
    _env.log('DEBUG', _tag, _string);
};

_env.ObjectFactory = {
    get(_name) {
        return require('./objectPrototypes/' + _env.lcfirst(_name));
    }
};

_env.packetParser = require('./lib/packetparser/packet_parser.js');
_env.sessionmanager = require('./lib/sessionmanager/sessionmanager.js');

_env.ServiceFactory.setup(_env);

const SERVER_PORT = 8080;
const SERVER_HOST = '::'; // No localhost or something here instead of '::' (IPv6)

_env.websockethandler = require('./lib/websockethandler/websockethandler.js');
_env.websockethandler.init(_env, SERVER_PORT, SERVER_HOST);
