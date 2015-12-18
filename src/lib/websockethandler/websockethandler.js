/**
 * Created by hendrik on 18.12.2015.
 */
'use strict';

let WebSocketServer = require('ws').Server;
let websocket;
function init(_env,_port,_host){
    websocket =  new WebSocketServer({port: _port, host: _host});

    websocket.on('connection', function (ws) {
        _env.debug('Websockethandler',`New connection from ${ws.upgradeReq.connection.remoteAddress}`);

        ws.on('message', function (_msg) {
            _env.debug('Websockethandler',`Recived message from: ${ws.upgradeReq.connection.remoteAddress} message: ${_msg}`);
            let response = _env.packetParser.parsePacket('JSONWSP',_msg,_env,ws);
            console.log(response);
            _env.debug('Websockethandler',`responding to: ${ws.upgradeReq.connection.remoteAddress} message: ${response}`);
            ws.send(response);
        });
    });
    _env.debug('Websockethandler','WebsocketServer running');
}

function sendMessage(_websocket, _message){
    _websocket.send(_message);
}

module.exports = {
    init,
    sendMessage
};
