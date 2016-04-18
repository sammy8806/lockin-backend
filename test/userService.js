'use strict';
let assert = require('assert');
let wsUri = 'ws://host2.dark-it.net:8090/';
let WebSocket = require('ws');
let ws;

function sendMessage(msg) {
    waitForSocketConnection(ws, () => {
        ws.send(JSON.stringify(msg));
    });
}

function waitForSocketConnection(socket, callback) {
    setTimeout(
        () => {
            if (socket.readyState === WebSocket.OPEN) {
                if (callback != null) {
                    callback();
                }
                return;

            } else {
                waitForSocketConnection(socket, callback);
            }
        }, 5);
}

describe('socket', () => {
    beforeEach(done => {
        ws = new WebSocket(wsUri);
        ws.on('open', () => {
            sendMessage();
        });

        ws.on('message', () => {
            ws.close();
            ws = new WebSocket(wsUri);
            ws.on('open', () => {
                done();
            });
        });
    });

    afterEach((done) => {
        ws.close();
        ws.on('close', () => {
            done();
        });
    });

    it('should register', (done) => {
        let register = {
            'type': 'jsonwsp/request',
            'version': '1.0',
            'methodname': 'UserService/registerUser',
            'args': {user: {'name': 'admin', 'email': 'test@spamkrake.de', 'password': 'hallo123'}},
            'mirror': '-1'
        };

        let expected = {
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'userservice/registerUser',
            'result': {'email': 'test@spamkrake.de'},
            'reflection': '-1'
        };

        sendMessage(register);

        ws.on('message', (actual) => {
            assert.equal(actual, JSON.stringify(expected));
            done();
        });

    });
});