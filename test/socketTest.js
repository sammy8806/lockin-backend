'use strict';
let assert = require('assert');
let wsUri = 'ws://host2.dark-it.net:8090/';
let WebSocket = require('ws');
let ws;

//JSON-WSP-Testobjekte
let removeUsers = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'adminservice/cleanup',
    'args': {'collection': 'users'},
    'mirror': '-1'
};

let register = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'userservice/register',
    'args': {'mail': 'test@spamkrake.de', 'password': 'hallo'},
    'mirror': '-1'
};

let registerWithInvalidArguments = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'userservice/register',
    'args': {'name': 'test@spamkrake.de', 'password': 'hallo'},
    'mirror': '-1'
};

let registerWithInvalidVersionNumber = {
    'type': 'jsonwsp/request',
    'version': '1.5',
    'methodname': 'userservice/register',
    'args': {'mail': 'test@spamkrake.de', 'password': 'hallo'},
    'mirror': '-1'
};

let login = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'sessionservice/login',
    'args': {'mail': 'test@spamkrake.de', 'password': 'hallo'},
    'mirror': '-1'
};

let loginWithInvalidCredentials = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'sessionservice/login',
    'args': {'mail': 'test@spamkrake.de', 'password': 'falschesPasswort'},
    'mirror': '-1'
};

let createRoom = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'chatservice/createRoom',
    'args': {},
    'mirror': '-1'
};

let joinRoom = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'chatservice/joinRoom',
    'args': {
        'room': '6040fe953490ab8cc2226ef76638e9b63011a1eddb31e580b119028ff3a6ce68'
    },
    'mirror': '-1'
};

let sendChatMessage = {
    'type': 'jsonwsp/request',
    'version': '1.0',
    'methodname': 'chatservice/sendMessage',
    'args': {
        'to': '6040fe953490ab8cc2226ef76638e9b63011a1eddb31e580b119028ff3a6ce68',
        'type': 'PlainMessage',
        'data': 'Hallo Gruppe!'
    },
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
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'userservice/register',
            'result': {'mail': 'test@spamkrake.de'},
            'reflection': '-1'
        };

        sendMessage(register);

        ws.on('message', (actual) => {
            assert.equal(JSON.stringify(expected), actual);
            done();
        });
    });

    it('should fail to register with invalid arguments', (done) => {
        let expected = {
            'type': 'jsonwsp/fault',
            'version': '1.0',
            'fault': {'string': 'arguments invalid', 'code': 'client'},
            'reflection': '-1'
        };

        sendMessage(registerWithInvalidArguments);

        ws.on('message', (actual) => {
            assert.equal(JSON.stringify(expected), actual);
            done();
        })
    });

    it('should throw version mismatch', (done) => {
        let expected = {
            'type': 'jsonwsp/fault',
            'version': '1.0',
            'fault': {'string': 'version mismatch. Server requires version 1.0', 'code': 'incompatible'},
            'reflection': '-1'
        };

        sendMessage(registerWithInvalidVersionNumber);

        ws.on('message', (actual) => {
            assert.equal(JSON.stringify(expected), actual);
            done();
        })
    });

    it('should login', (done) => {
        let expected = {
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'sessionservice/login',
            'result': {'success': true},
            'reflection': '-1'
        };

        sendMessage(register);

        ws.on('message', (response) => {
            let res = JSON.parse(response);
            if (res.methodname === 'userservice/register')
                sendMessage(login);
            else {
                assert.equal(JSON.stringify(expected), response);
                done();
            }
        });
    });

    it('should fail to login with invalid credentials', (done) => {
        let expected = {
            'type': 'jsonwsp/fault',
            'version': '1.0',
            'fault': {'code': 'client', 'string': 'wrong password'},
            'reflection': '-1'
        };

        sendMessage(register);

        ws.on('message', (response) => {
            let res = JSON.parse(response);
            if (res.methodname === 'userservice/register') {
                sendMessage(loginWithInvalidCredentials);

            } else {
                assert.equal(JSON.stringify(expected), response);
                done();
            }
        });
    });

    it('should create a room', (done) => {
        let expected = {
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'chatservice/createRoom',
            'result': {'id': 'unknown'},
            'reflection': '-1'
        };

        sendMessage(createRoom);

        ws.on('message', (actual) => {
            let actualObject = JSON.parse(actual);
            expected.result.id = actualObject.result.id;
            assert.equal(JSON.stringify(expected), actual);
            done();
        });
    });

    it('should let a user join a room', (done) => {
        let expected = {
            'type': 'jsonwsp/response',
            'version': '1.0',
            'methodname': 'chatservice/joinRoom',
            'result': {'ok': 1, 'nModified': 1, 'n': 1},
            'reflection': '-1'
        };

        sendMessage(register);

        ws.on('message', (response) => {
            let res = JSON.parse(response);
            if (res.methodname === 'userservice/register') {
                sendMessage(login);
            } else if (res.methodname === 'sessionservice/login') {
                sendMessage(createRoom);
            } else if (res.methodname === 'chatservice/createRoom') {
                joinRoom.args.room = res.result.id;
                sendMessage(joinRoom);
            } else {
                assert.equal(JSON.stringify(expected), response);
                done();
            }
        });
    });

    it('should let a user send a message to a room', (done) => {
        let messageSent = false;
        let roomID;

        let expected = {
            'type': 'jsonwsp/request',
            'version': '1.0',
            'methodname': 'chatservice/sendMessage',
            'args': {
                'id': 1452794554298,
                'from': '5697e2ba4141294703997aed',
                'to': '9fc7a840aa1e47a305c067580f9fc54e73626b8bf1692bf2cb11bfe045a99b73',
                'date': 1452794554298,
                'type': 'PlainMessage',
                'data': 'Hallo Gruppe!'
            },
            'mirror': 'mirrorhere'
        };

        sendMessage(register);

        ws.on('message', (response) => {
            let res = JSON.parse(response);
            if (res.methodname === 'userservice/register') {
                sendMessage(login);
            } else if (res.methodname === 'sessionservice/login') {
                sendMessage(createRoom);
            } else if (res.methodname === 'chatservice/createRoom') {
                roomID = res.result.id;
                joinRoom.args.room = roomID;
                sendMessage(joinRoom);
            } else if (res.methodname === 'chatservice/joinRoom') {
                sendChatMessage.args.to = roomID;
                sendMessage(sendChatMessage);
            } else {
                if (!messageSent) {
                    messageSent = true;
                    sendChatMessage.args.to = roomID;
                    sendMessage(sendChatMessage);
                } else {
                    //message received
                    expected.args.id = res.args.id;
                    expected.args.from = res.args.from;
                    expected.args.to = roomID;
                    expected.args.date = res.args.date;
                    assert.equal(JSON.stringify(expected), response);
                    done();
                }
            }
        });
    });
});