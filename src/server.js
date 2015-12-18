'use strict';

const _env = {
    ServiceFactory: require('./lib/servicefactory/servicefactory'),
    ObjectFactory: {
        get(_name) {
            return require('./objectPrototypes/' + lcfirst(_name));
        }
    },
    lcfirst(_str) {
        const f = _str.charAt(0).toLowerCase();
        return f + _str.substr(1);
    }
};

_env.ServiceFactory.setup(_env);

_env.log = function (_type, _tag, _string) {
    console.log('[%s] [%s] %s', _type, _tag, _string);
};

_env.debug = function (_tag, _string) {
    _env.log('DEBUG', _tag, _string);
};

_env.packetParser = require('./lib/packetparser/packet_parser.js');

_env.sessionmanager = require('./lib/sessionmanager/sessionmanager.js');

const SERVER_PORT = 8080;
const SERVER_HOST = '::';

_env.websockethandler = require('./lib/websockethandler/websockethandler.js');
_env.websockethandler.init(_env,SERVER_PORT,SERVER_HOST);


