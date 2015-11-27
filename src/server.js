'use strict';

const SERVER_PORT = 8080;
let WebSocketServer = require('ws').Server;

let websock = new WebSocketServer({port: SERVER_PORT, host: '::'});
websock.on('connection', function (ws) {
    debug('new connection');

    ws.on('message', function (_msg) {
        debug(`-> ${_msg}`);
        ws.send(_msg);
    });
});