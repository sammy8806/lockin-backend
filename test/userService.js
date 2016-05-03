'use strict';
let assert = require('assert');
let wsUri = 'ws://localhost:8080/';
let WebSocket = require('ws');
let ws;

// let removeUsers = {
//     'type': 'jsonwsp/request',
//     'version': '1.0',
//     'methodname': 'adminservice/cleanup',
//     'args': {'collection': 'users'},
//     'mirror': '-1'
// };

let requestId = 0;
let requests = new Map();

const masterkey = {
    'id': '123',
    'owner_id': '456',
    'data': 'hallo123'
};

const userdata = {
    'email': 'test2@spamkrake.de', 'password': 'hallo123', 'key': masterkey
};

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
    if (_msg === undefined) {
        console.log('sending not possible', JSON.stringify(_msg));
        return;
    }

    const reqId = requestId++;
    _msg.mirror = reqId;
    requests.set(reqId, {cb: _cb, ws: _ws, id: reqId});
    _ws.send(JSON.stringify(_msg));
    return reqId;
}

describe('socket', () => {
    before(done => {
        ws = new WebSocket(wsUri);
        ws.on('open', () => {
            setupSocket(ws);
            done();
        });
    });

    let users = [];
    for (let i = 0; i <= 3; i++) {
        let suffix = `${i}-${(new Date().getTime())}`;
        const email = `test+${suffix}@spamkrake.de`;
        const pass = `lol_pass_${suffix}`;
        const key = {
            id: i,
            owner_id: '456',
            data: 'hallo123'
        };
        users.push({email: email, pass: pass, key: key});
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

    describe('registration', () => {
        for (let user of users) {
            it('should register', (done) => {
                let register = {
                    'type': 'jsonwsp/request',
                    'version': '1.0',
                    'methodname': 'UserService/registerUser',
                    'args': {user: {'email': user.email, 'password': user.pass, 'key': user.key}},
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
                'args': {'name': 'admin2', 'email': userdata.email, 'password': userdata.password, 'key': userdata.key},
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
        });

        for (let user of users) {
            it('should login', (done) => {
                let register = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'UserService/loginUser',
                    args: {user: {email: user.email, password: user.pass}},
                    mirror: -1
                };

                sendMessage(register, (actual, req) => {
                    let expected = {
                        type: 'jsonwsp/response',
                        version: '1.0',
                        methodname: 'UserService/loginUser',
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
        before(done => {
            ws = new WebSocket(wsUri);
            ws.on('open', () => {
                setupSocket(ws);
                done();
            });
        });

        it('should login', (done) => {
            let login = {
                type: 'jsonwsp/request',
                version: '1.0',
                methodname: 'UserService/loginUser',
                args: {user: {email: userdata.email, password: userdata.password}},
                mirror: -1
            };

            sendMessage(login, (actual, req) => {
                let expected = {
                    type: 'jsonwsp/response',
                    version: '1.0',
                    methodname: 'UserService/loginUser',
                    result: {success: true},
                    reflection: req.id
                };

                assert.equal(actual, JSON.stringify(expected));
                done();
            }, ws);
        });

        // it('should update userdata', (done) => {
        //     const newMail = `test+updated-${new Date().getTime()}@spamkrake.de`;
        //     let register = {
        //         'type': 'jsonwsp/request',
        //         'version': '1.0',
        //         'methodname': 'UserService/updateUser',
        //         'args': {user: {'email': newMail}},
        //         'mirror': '-1'
        //     };
        //
        //     sendMessage(register, (actual, req) => {
        //         let expected = {
        //             'type': 'jsonwsp/response',
        //             'version': '1.0',
        //             'methodname': 'UserService/updateUser',
        //             'result': {'email': newMail},
        //             'reflection': req.id
        //         };
        //
        //         assert.equal(actual, JSON.stringify(expected));
        //         done();
        //     }, ws);
        // });
    });

    describe('doorLock', () => {
        let registerDoorlock = {
            type: 'jsonwsp/request',
            version: '1.0',
            methodname: 'DoorLockService/registerDoorLock',
            args: {id: '1', name: 'doorlock1', 'masterKeys': [masterkey], state: 'OPENED'},
            mirror: -1
        };

        it('should add doorlock', (done) => {

            sendMessage(registerDoorlock, (actual, req) => {
                let expected = {
                    'type': 'jsonwsp/response',
                    'version': '1.0',
                    'methodname': 'DoorLockService/registerDoorLock',
                    'result': {
                        'id': '1',
                        'name': 'doorlock1',
                        'masterKeys': [{'id': '123', 'owner_id': '456', 'data': 'hallo123'}],
                        'state': 'OPENED'
                    },
                    'reflection': 11
                };

                assert.equal(actual, JSON.stringify(expected));
                done();
            }, ws);
        });
    });

    describe('access', () => {
        let timeStart = new Date();
        let timeEnd = new Date();
        timeEnd.setHours(timeEnd.getHours() + 6);

        it('should add access', (done) => {
            let addAccess = {
                type: 'jsonwsp/request',
                version: '1.0',
                methodname: 'UserService/addAccess',
                args: {
                    id: '1',
                    keyId: '123',
                    doorlockIds: ['1', '2'],
                    requestorId: '572616263da487ad193bdead',
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
                    'reflection': 12
                };

                assert.equal(actual, JSON.stringify(expected));
                done();
            }, ws);
        });

        // called from the lock
        it('should be granted access', (done) => {
            let checkAccess = {
                args: {
                    keyId: '123',
                    lockId: '1'
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
            }, ws);
        });
    });
});

