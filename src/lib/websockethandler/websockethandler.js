/**
 * Created by hendrik on 18.12.2015.
 */
'use strict';

let WebSocketServer = require('ws').Server;
let websocket;

function init(_env, _port, _host) {
    websocket = new WebSocketServer({port: _port, host: _host});

    websocket.on('connection', function (ws) {
        _env.debug('Websockethandler', `New connection from ${ws.upgradeReq.connection.remoteAddress}`);

        ws.on('message', function (_msg) {
            _env.debug(
                'Websockethandler',
                `Recived message from: ${ws.upgradeReq.connection.remoteAddress} message: ${_msg}`
            );

            _env.packetParser.parsePacket('JSONWSP', _msg, _env, ws)
                .then((_response) => {
                    _env.debug(
                        'Websockethandler',
                        `responding to: ${ws.upgradeReq.connection.remoteAddress} with message ${_response}`
                    );

                    ws.send(_response);
                })
                .catch((_err) => {
                    _env.error('Websockethandler', _err);
                });
        });
        
        ws.on('error', function(_error, _code) {
            _env.debug(
                'Websockethandler',
                'Error Occured from:',
                ws.upgradeReq.connection.remoteAddress,
                _code,
                _error
            );
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
