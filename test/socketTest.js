'use strict';
let assert = require('assert');
let wsUri = 'ws://localhost:8080/';
let WebSocket = require('ws');
let ws;

//JSON-WSP-Testobjekte
let removeUsers = {
    "type": "jsonwsp/request",
    "version": "1.0",
    "methodname": "adminservice/cleanup",
    "args": {"collection": "users"},
    "mirror": "-1"
};

let register = {
    "type": "jsonwsp/request",
    "version": "1.0",
    "methodname": "userservice/register",
    "args": {"mail": "test@spamkrake.de", "password": "hallo"},
    "mirror": "-1"
};

let registerWithInvalidArguments = {
    "type": "jsonwsp/request",
    "version": "1.0",
    "methodname": "userservice/register",
    "args": {"name": "test@spamkrake.de", "password": "hallo"},
    "mirror": "-1"
};

let registerWithInvalidVersionNumber = {
    "type": "jsonwsp/request",
    "version": "1.5",
    "methodname": "userservice/register",
    "args": {"mail": "test@spamkrake.de", "password": "hallo"},
    "mirror": "-1"
};

let login = {
    "type": "jsonwsp/request",
    "version": "1.0",
    "methodname": "sessionservice/login",
    "args": {"mail": "test@spamkrake.de", "password": "hallo"},
    "mirror": "-1"
};

let loginWithInvalidCredentials = {
    "type": "jsonwsp/request",
    "version": "1.0",
    "methodname": "sessionservice/login",
    "args": {"mail": "test@spamkrake.de", "password": "falschesPasswort"},
    "mirror": "-1"
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

beforeEach((done) => {
    ws = new WebSocket(wsUri);
    ws.on('open', () => {
        sendMessage(removeUsers);
        ws.on('message', () => {
            ws = new WebSocket(wsUri);
            ws.on('open', () => {
                done();
            });
        })
    });
});

afterEach((done) => {
    ws.close();
    ws.on('close', () => {
        done();
    });
});

describe('socket', () => {
    it('should register', (done) => {
        let expected = {
            "type": "jsonwsp/response",
            "version": "1.0",
            "methodname": "userservice/register",
            "result": {"mail": "test@spamkrake.de"},
            "reflection": "-1"
        };

        sendMessage(register);

        ws.on('message', (actual) => {
            assert.equal(JSON.stringify(expected), actual);
            done();
        })
    });

    it('should fail to register with invalid arguments', (done) => {
        let expected = {
            "type": "jsonwsp/fault",
            "version": "1.0",
            "fault": {"string": "arguments invalid", "code": "client"},
            "reflection": "-1"
        };

        sendMessage(registerWithInvalidArguments);

        ws.on('message', (actual) => {
            assert.equal(JSON.stringify(expected), actual);
            done();
        })
    });

    it('should throw version mismatch', (done) => {
        let expected = {
            "type": "jsonwsp/fault",
            "version": "1.0",
            "fault": {"string": "version mismatch. Server requires version 1.0", "code": "incompatible"},
            "reflection": "-1"
        };

        sendMessage(registerWithInvalidVersionNumber);

        ws.on('message', (actual) => {
            assert.equal(JSON.stringify(expected), actual);
            done();
        })
    });

    it('should login', (done) => {
        let expected = {
            "type": "jsonwsp/response",
            "version": "1.0",
            "methodname": "sessionservice/login",
            "result": {"success": true},
            "reflection": "-1"
        };

        sendMessage(register);

        ws.on('message', () => {
            sendMessage(login);
            ws.on('message', (actual) => {
                assert.equal(JSON.stringify(expected), actual);
                done();
            });
        });
    });

    it('should fail to login with invalid credentials', (done) => {
        let expected = {
            "type": "jsonwsp/fault",
            "version": "1.0",
            "fault": {"code": "client", "string": "wrong password"},
            "reflection": "-1"
        };

        sendMessage(register);

        ws.on('message', () => {
            sendMessage(loginWithInvalidCredentials);

            ws.on('message', (actual) => {
                assert.equal(JSON.stringify(expected), actual);
                done();
            });
        });
    });
});