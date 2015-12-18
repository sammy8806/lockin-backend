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

const SERVER_PORT = 8080;
let WebSocketServer = require('ws').Server;

let websock = new WebSocketServer({port: SERVER_PORT, host: '::'});
websock.on('connection', function (ws) {
    console.info('new connection');

    ws.on('message', function (_msg) {
        console.info(`-> ${_msg}`);
        ws.send(_msg);
    });
});

console.log('Server Running');