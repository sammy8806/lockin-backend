'use strict';
require('dotenv').config();
let wsUri = process.env.TEST_URI;
let WebSocket = require('ws');
let assert = require('chai').assert;

const removeQuery = (_collectionName) => {
    return {
        type: 'jsonwsp/request',
        version: '1.0',
        methodname: 'adminservice/cleanup',
        args: {collection: _collectionName},
        mirror: -1
    };
};

let requestId = 0;
let requests = new Map();

const userdata = {'email': 'test2@spamkrake.de', 'password': 'hallo123'};

//keyId(s) not known yet
const doorLock = {id: '01:23:45:67:89:ab', name: 'doorlock1', 'masterKeys': null, state: 'OPENED'};
//variable to store the key from the actual response of getUserData
let userKey;

function createSocket() {
    let ws;
    let err = null;
    do {
        try {
            ws = new WebSocket(wsUri);
        } catch (e) {
            err = e;
        }
    } while (err != null);
    return ws;
}

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
        ws = createSocket();
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
            sendMessage(removeQuery('users'), (actual, req) => {
                sendMessage(removeQuery('doorLocks'), () => {
                    sendMessage(removeQuery('accesses'), () => {
                        sendMessage(removeQuery('sessions'), () => {
                            done();
                        }, ws);
                    }, ws);
                }, ws);
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
                    'result': {'name': 'admin2', 'email': 'test2@spamkrake.de'},
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
        let userId = -1;

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

        describe('login', () => {

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

                    let data = JSON.parse(actual);
                    let expectedEmail = userdata.email;

                    assert.ok(userId !== undefined);
                    userId = data.result.id;

                    //store userkey
                    userKey = data.result.key;

                    assert.equal(data.result.email, expectedEmail);
                    done();
                }, wsLogin);
            });

            it('should update userdata', (done) => {
                const newMail = 'test+updated-' + new Date().getTime() + '@spamkrake.de';

                let updateUser = {
                    'type': 'jsonwsp/request',
                    'version': '1.0',
                    'methodname': 'UserService/updateUser',
                    'args': {user: {'id': userId, 'email': newMail}},
                    'mirror': '-1'
                };

                sendMessage(updateUser, (actual, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': '1.0',
                        'methodname': 'UserService/updateUser',
                        'result': {'success': true},
                        'reflection': req.id
                    };

                    assert.equal(actual, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

        });

        describe('doorLock', () => {
            let registerDoorlock = {
                type: 'jsonwsp/request',
                version: '1.0',
                methodname: 'DoorLockService/registerDoorLock',
                args: doorLock,
                mirror: -1
            };


            it('should add doorlock', (done) => {
                registerDoorlock.args.masterKeys = [userKey.id];

                sendMessage(registerDoorlock, (actual, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': '1.0',
                        'methodname': 'DoorLockService/registerDoorLock',
                        'result': {
                            'id': '01:23:45:67:89:ab',
                            'name': 'doorlock1',
                            'masterKeys': [userKey.id],
                            'state': 'OPENED'
                        },
                        'reflection': req.id
                    };

                    assert.equal(actual, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

            it('should fail to add doorlock with duplicate id', (done) => {
                sendMessage(registerDoorlock, (actual, req) => {
                    let expected = {
                        'type': 'jsonwsp/fault',
                        'version': '1.0',
                        'fault': {'code': '7005', 'string': 'Doorlock already exists', 'faulty': ''},
                        'reflection': req.id
                    };

                    assert.equal(actual, JSON.stringify(expected));
                    done();

                }, wsLogin);
            });
        });

        describe('access', () => {
            let timeStart = new Date();
            let timeEnd = new Date();
            timeEnd.setHours(timeEnd.getHours() + 6);
            let addAccess;

            it('should add access', (done) => {
                addAccess = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'UserService/addAccess',
                    args: {
                        id: '1',
                        keyId: userKey.id,
                        doorlockIds: [doorLock.id],
                        //will probably be removed
                        requestorId: 'wirdnichtgebraucht',
                        timeStart: timeStart,
                        timeEnd: timeEnd
                    },
                    mirror: '-1'
                };

                sendMessage(addAccess, (actual, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': '1.0',
                        'methodname': 'UserService/addAccess',
                        'result': {'success': true},
                        'reflection': req.id
                    };

                    assert.equal(actual, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

            it('should fail to add access with duplicate id', (done) => {
                sendMessage(addAccess, (actual, req) => {
                        let expected = {
                            'type': 'jsonwsp/fault',
                            'version': '1.0',
                            'fault': {'code': '6005', 'string': 'Access already exists', 'faulty': ''},
                            'reflection': req.id
                        };

                        assert.equal(actual, JSON.stringify(expected));
                        done();
                    },
                    wsLogin
                );
            });


            it('should be granted access', (done) => {
                let checkAccess = {
                    args: {
                        key: userKey,
                        lockId: doorLock.id
                    },
                    methodname: 'AccessService/checkAccess',
                    mirror: '-1',
                    type: 'jsonwsp/request',
                    version: '1.0'
                };

                sendMessage(checkAccess, (actual, req) => {
                    let expected = {
                        type: 'jsonwsp/response',
                        version: '1.0',
                        methodname: 'AccessService/checkAccess',
                        result: true,
                        reflection: req.id
                    };

                    assert.equal(actual, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });
        });
    });

})
;
