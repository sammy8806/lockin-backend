'use strict';
let wsUri = 'ws://localhost:8090/';
let WebSocket = require('ws');
var assert = require('chai').assert;

 let removeUsers = {
     'type': 'jsonwsp/request',
     'version': '1.0',
     'methodname': 'adminservice/cleanup',
     'args': {'collection': 'users'},
     'mirror': '-1'
 };

let requestId = 0;
let requests = new Map();

const userdata = {'email': 'test2@spamkrake.de', 'password': 'hallo123'};

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

describe('socket', () => {
    let ws;

    beforeEach(done => {
        ws = new WebSocket(wsUri);
        ws.on('open', () => {
            setupSocket(ws);
            done();
        });
    });

    after(done => {
        ws.on('close', () => {
            done();
        });
        ws.close();
    });

    let users = [];
    for (let i = 0; i <= 3; i++) {
        let suffix = `${i}-${(new Date().getTime())}`;
        const email = `test+${suffix}@spamkrake.de`;
        const pass = `lol_pass_${suffix}`;
        users.push({email: email, pass: pass});
    }

    describe('stub', () => {

    });

    describe('api', () => {
        it('version check', (done) => {
            let register = {
                'type': 'jsonwsp/request',
                'version': '1.5',
                'methodname': 'UserService/test123',
                'args': {user: {'email': '123', 'password': '123'}},
                'mirror': '-1'
            };

            sendMessage(register, (actual, req) => {
                let expected = {
                    'type': 'jsonwsp/fault',
                    'version': '1.0',
                    'fault': {code: '1001', string: 'API-Version mismatch', faulty: ''},
                    'reflection': req.id
                };

                assert.equal(actual, JSON.stringify(expected));
                done();
            }, ws);
        });
    });

    describe('prequisites', () => {
        it('clear users', (done) => {
            sendMessage(removeUsers, (actual, req) => {
                done();
            }, ws);
        });
    });

    describe('registration', () => {
        for (let user of users) {
            it('should register', (done) => {
                let register = {
                    'type': 'jsonwsp/request',
                    'version': '1.0',
                    'methodname': 'UserService/registerUser',
                    'args': {user: {'email': user.email, 'password': user.pass}},
                    'mirror': '-1'
                };

                sendMessage(register, (actual, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': '1.0',
                        'methodname': 'UserService/registerUser',
                        'result': {'email': user.email},
                        'reflection': req.id
                    };

                    assert.equal(actual, JSON.stringify(expected));
                    done();
                }, ws);
            });
        }

        it('should register with alternate syntax', (done) => {
            let register = {
                'type': 'jsonwsp/request',
                'version': '1.0',
                'methodname': 'UserService/registerUser',
                'args': {'name': 'admin2', 'email': userdata.email, 'password': userdata.password},
                'mirror': '-1'
            };

            sendMessage(register, (actual, req) => {
                let expected = {
                    'type': 'jsonwsp/response',
                    'version': '1.0',
                    'methodname': 'UserService/registerUser',
                    'result': {'email': 'test2@spamkrake.de'},
                    'reflection': req.id
                };

                assert.equal(actual, JSON.stringify(expected));
                done();
            }, ws);
        });
    });

    describe('login', () => {
        beforeEach(done => {
            ws = new WebSocket(wsUri);
            ws.on('open', () => {
                setupSocket(ws);
                done();
            });
        });

        afterEach(done => {
            ws.close();
            ws.on('close', () => {
                done();
            });
            ws.close();
        });

        for (let user of users) {
            it('should login', (done) => {
                let register = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'SessionService/login',
                    args: {user: {email: user.email, password: user.pass}},
                    mirror: -1
                };

                sendMessage(register, (actual, req) => {
                    let expected = {
                        type: 'jsonwsp/response',
                        version: '1.0',
                        methodname: 'SessionService/login',
                        result: {success: true},
                        reflection: req.id
                    };

                    assert.equal(actual, JSON.stringify(expected));
                    done();
                }, ws);
            });
        }
    });

    describe('session', () => {
        let wsLogin;

        before(done => {
            wsLogin = new WebSocket(wsUri);
            wsLogin.on('open', () => {
                setupSocket(wsLogin);
                done();
            });
        });

        after(done => {
            wsLogin.on('close', () => {
                done();
            });
            wsLogin.close();
        });

        it('should login', (done) => {
            let register = {
                type: 'jsonwsp/request',
                version: '1.0',
                methodname: 'SessionService/login',
                args: {user: {email: userdata.email, password: userdata.password}},
                mirror: -1
            };

            sendMessage(register, (actual, req) => {
                let expected = {
                    type: 'jsonwsp/response',
                    version: '1.0',
                    methodname: 'SessionService/login',
                    result: {success: true},
                    reflection: req.id
                };

                assert.equal(actual, JSON.stringify(expected));
                done();
            }, wsLogin);
        });

        it.skip('should update userdata', (done) => {
            const newMail = 'test+updated-' + new Date().getTime() + '@spamkrake.de';

            let register = {
                'type': 'jsonwsp/request',
                'version': '1.0',
                'methodname': 'UserService/updateUser',
                'args': {user: {'email': newMail}},
                'mirror': '-1'
            };

            sendMessage(register, (actual, req) => {
                let expected = {
                    'type': 'jsonwsp/response',
                    'version': '1.0',
                    'methodname': 'UserService/updateUser',
                    'result': {'email': newMail},
                    'reflection': req.id
                };

                assert.equal(actual, JSON.stringify(expected));
                done();
            }, wsLogin);
        });

        it('should get Userinfo', (done) => {
            let register = {
                'type': 'jsonwsp/request',
                'version': '1.0',
                'methodname': 'UserService/getUserInfo',
                'args': {},
                'mirror': '-1'
            };

            sendMessage(register, (actual, req) => {
                let expected = {
                    'type': 'jsonwsp/response',
                    'version': '1.0',
                    'methodname': 'UserService/getUserInfo',
                    'result': {'email': userdata.email},
                    'reflection': req.id
                };

                assert.equal(actual, JSON.stringify(expected));
                done();
            }, wsLogin);
        });
    });

    // Be called from the lock
    it.skip('should be granted access', (done) => {
        let checkAccess = {
            args: {
                key: {
                    data: 'ichbindata',
                    id: '789453789543789',
                    owner_id: '123123123'
                },
                lockId: 65456
            },
            methodname: 'AccessService/checkAccess',
            mirror: '-1',
            type: 'jsonwsp/request',
            version: '1.0'
        };

        sendMessage(checkAccess, (actual, req) => {
            let expected = {
                'type': 'jsonwsp/response',
                'version': '1.0',
                'methodname': 'AccessService/checkAccess',
                'result': true,
                'reflection': req.id
            };

            assert.equal(actual, JSON.stringify(expected));
            done();
        }, ws);
    });
});
