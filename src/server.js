'use strict';

const _env = {
    ServiceFactory: require('./lib/servicefactory/servicefactory')
};

_env.ServiceFactory.setup(_env);

_env.log = function (_type, _tag, _string) {
    console.log('[%s] [%s] %s', _type, _tag, _string);
};

_env.debug = function (_tag, _string) {
    _env.log('DEBUG', _tag, _string);
};

_env.packetParser = require('./lib/packetparser/packet_parser.js');

const SERVER_PORT = 8080;
const SERVER_HOST = '::';

let websockethandler = require('./lib/websockethandler/websockethandler.js');
websockethandler.init(_env,SERVER_PORT,SERVER_HOST);


