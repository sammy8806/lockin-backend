'use strict';
let assert = require('assert');
let wsUri = 'ws://cl2.dark-it.net/';
let WebSocket = require('ws');
let ws;

let removeUsers = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'adminservice/cleanup',
    'args': {'collection': 'users'},
    'mirror': '-1'
};

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
    before(done => {
        ws = new WebSocket(wsUri);
        ws.on('open', () => {
            sendMessage(removeUsers);
        });

        ws.on('message', () => {
            ws.close();
            ws = new WebSocket(wsUri);
            ws.on('open', () => {
                done();
            });
        });
    });

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
            'args': {user: {'email': 'test@spamkrake.de', 'password': 'hallo123'}},
            'mirror': '-1'
        };

        let expected = {
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'UserService/registerUser',
            'result': {'email': 'test@spamkrake.de'},
            'reflection': '-1'
        };

        sendMessage(register);

        ws.on('message', (actual) => {
            assert.equal(actual, JSON.stringify(expected));
            done();
        });

    });

    it('should register with alternate syntax', (done) => {
        let register = {
            'type': 'jsonwsp/request',
            'version': '1.0',
            'methodname': 'UserService/registerUser',
            'args': {'name': 'admin2', 'email': 'test2@spamkrake.de', 'password': 'hallo123'},
            'mirror': '-1'
        };

        let expected = {
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'UserService/registerUser',
            'result': {'email': 'test2@spamkrake.de'},
            'reflection': '-1'
        };

        sendMessage(register);

        ws.on('message', (actual) => {
            assert.equal(actual, JSON.stringify(expected));
            done();
        });

    });

    it('should register with alternate syntax', (done) => {
        let checkAccess = {
            args: {
                key: {
                    data: 'ichbindata',
                    id: 789453789543789,
                    owner_id: 123123123
                },
                lockId: 65456
            },
            methodname: 'AccessService/checkAccess',
            mirror: '-1',
            type: 'jsonwsp/request',
            version: '1.0'
        };

        let expected = {
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'AccessService/checkAccess',
            'result': true,
            'reflection': '-1'
        };

        sendMessage(checkAccess);

        ws.on('message', (actual) => {
            assert.equal(actual, JSON.stringify(expected));
            done();
        });

    });

    it('should login', (done) => {
        let register = {
            type: 'jsonwsp/request',
            version: '1.0',
            methodname: 'UserService/loginUser',
            args: {user: {email: 'test@spamkrake.de', password: 'hallo123'}},
            mirror: -1
        };

        let expected = {
            type: 'jsonwsp/response',
            version: '1.0',
            methodname: 'UserService/loginUser',
            result: {success: true},
            reflection: register.mirror
        };

        sendMessage(register);

        ws.on('message', (actual) => {
            assert.equal(actual, JSON.stringify(expected));
            done();
        });

    });

    it('should update userdata', (done) => {
        let register = {
            'type': 'jsonwsp/request',
            'version': '1.0',
            'methodname': 'UserService/updateUser',
            'args': {user: {'email': 'test+updated@spamkrake.de'}},
            'mirror': '-1'
        };

        let expected = {
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'UserService/updateUser',
            'result': {'email': 'test+updated@spamkrake.de'},
            'reflection': '-1'
        };

        sendMessage(register);

        ws.on('message', (actual) => {
            assert.equal(actual, JSON.stringify(expected));
            done();
        });

    });
});
