'use strict';
require('dotenv').config();
let wsUri = process.env.TEST_URI;
let WebSocket = require('ws');
let assert = require('chai').assert;

let requestId = 0;
let requests = new Map();

function setupSocket(_ws) {
    _ws.on('message', (_msg) => {
        let msg = JSON.parse(_msg);
        if (msg.reflection === undefined) {
            console.log({string: 'wrong message', message: msg});
            return;
        }

        let req = requests.get(msg.reflection);
        req.cb(_msg, req);
    });
}

function sendMessage(_msg, _cb, _ws) {
    assert(_ws !== undefined, 'Socket is undefined');

    if (_msg === undefined) {
        console.log('sending not possible');
        return;
    }

    const reqId = requestId++;
    _msg.mirror = reqId;
    requests.set(reqId, {cb: _cb, ws: _ws, id: reqId});
    _ws.send(JSON.stringify(_msg));
    return reqId;
}

let wsLogin;

wsLogin = new WebSocket(wsUri);
wsLogin.on('open', () => {
    setupSocket(wsLogin);
    done();
});

wsLogin.on('close', () => {
    done();
});
wsLogin.close();

let killServer = {
    type: 'jsonwsp/request',
    version: '1.0',
    methodname: 'AdminService/kill',
    args: {},
    mirror: -1
};

sendMessage(killServer, (actual, req) => {}, wsLogin);
