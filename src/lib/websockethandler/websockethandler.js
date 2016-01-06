/**
 * Created by hendrik on 18.12.2015.
 */
'use strict';

const Promise = require('promise');

let WebSocketServer = require('ws').Server;
let websocket;

function init(_env, _port, _host) {
    websocket = new WebSocketServer({port: _port, host: _host});

    websocket.on('connection', function (ws) {
        _env.debug('Websockethandler', `New connection from ${ws.upgradeReq.connection.remoteAddress}`);

        ws.on('message', function (_msg) {
            new Promise((resolve, reject) => {
                _env.debug(
                    'Websockethandler',
                    `Recived message from: ${ws.upgradeReq.connection.remoteAddress} message: ${_msg}`
                );

                let response =_env.packetParser.parsePacket('JSONWSP', _msg, _env, ws);

                return response.then((res) => {
                    _env.debug(
                        'Websockethandler',
                        `responding to: ${ws.upgradeReq.connection.remoteAddress} with message ${res}`
                    );
                    resolve(response);
                });
            }).then((data) => {
                console.log(data);
                ws.send(data);
            });
        });

        ws.on('close', function () {
            _env.sessionmanager.socketClosed(ws);
            _env.debug(
                'Websockethandler',
                `Connection closed from ${ws.upgradeReq.connection.remoteAddress}`
            );
        });
    });
    _env.debug('Websockethandler', 'WebsocketServer running');
}

function sendMessage(_websocket, _message) {
    _websocket.send(_message);
}

module.exports = {
    init,
    sendMessage
};
