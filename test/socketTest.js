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

let createRoom = {
    "type": "jsonwsp/request",
    "version": "1.0",
    "methodname": "chatservice/createRoom",
    "args": {},
    "mirror": "-1"
};

let sendChatMessage = {
    "type": "jsonwsp/request",
    "version": "1.0",
    "methodname": "chatservice/sendMessage",
    "args": {
        "to": "6040fe953490ab8cc2226ef76638e9b63011a1eddb31e580b119028ff3a6ce68",
        "type": "PlainMessage",
        "data": "Hallo Gruppe!"
    },
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

describe('socket', () => {
    beforeEach(done => {
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

    afterEach((done) => {
        ws.close();
        ws.on('close', () => {
            done();
        });
    });

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

        ws.on('message', (response) => {
            let res = JSON.parse(response);
            if (res.methodname === "userservice/register")
                sendMessage(login);
            else {
                assert.equal(JSON.stringify(expected), response);
                done();
            }
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

        ws.on('message', (response) => {
            let res = JSON.parse(response);
            if (res.methodname === "userservice/register") {
                sendMessage(loginWithInvalidCredentials);

            } else {
                assert.equal(JSON.stringify(expected), response);
                done();
            }
        });
    });

    it('should create a room', (done) => {
        let expected = {
            "type": "jsonwsp/response",
            "version": "1.0",
            "methodname": "chatservice/createRoom",
            "result": {"id": "unknown"},
            "reflection": "-1"
        };

        sendMessage(createRoom);

        ws.on('message', (actual) => {
            let actualObject = JSON.parse(actual);
            expected.result.id = actualObject.result.id;
            assert.equal(JSON.stringify(expected), actual);
            done();
        });
    });
});