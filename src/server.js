'use strict';
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