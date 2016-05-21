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
        const collections = [
            'accesses',
            'buildings',
            'doorLocks',
            'logs',
            'sessions',
            'users'
        ];

        for (let collection of collections) {
            it(`clear ${collection}`, (done) => {
                sendMessage(removeQuery(collection), (actual, req) => {
                    done();
                }, ws);
            });
        }
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

    let sessionToken = null;

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
                console.log('CLOSED!');
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

            it('should get session-token', (done) => {
                let register = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'UserService/getNewSessionToken',
                    args: {},
                    mirror: -1
                };

                sendMessage(register, (actual, req) => {
                    let expected = {
                        type: 'jsonwsp/response',
                        version: '1.0',
                        methodname: 'UserService/getNewSessionToken',
                        result: '',
                        reflection: req.id
                    };

                    let server = JSON.parse(actual);
                    expected.result = server.result;
                    sessionToken = server.result;

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

            const newMail = 'test+updated-' + new Date().getTime() + '@spamkrake.de';

            it('should update userdata', (done) => {

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

            it('should find userkey by mail', (done) => {
                let findUserByMail = {
                    'type': 'jsonwsp/request',
                    'version': '1.0',
                    'methodname': 'UserService/findUser',
                    'args': {email: newMail},
                    'mirror': '-1'
                };

                sendMessage(findUserByMail, (actual, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': '1.0',
                        'methodname': 'UserService/findUser',
                        'result': userKey.id,
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
                        'result': {'success': true},
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

            it('should get doorlocklist from userInfo', (done) => {

                let getUserInfo = {
                    'type': 'jsonwsp/request',
                    'version': '1.0',
                    'methodname': 'UserService/getUserInfo',
                    'args': {},
                    'mirror': '-1'
                };

                sendMessage(getUserInfo, (actual, req) => {
                    let doorLockId = JSON.parse(actual).result.doorLocks[0].id;
                    assert.equal(doorLockId, doorLock.id);
                    done();
                }, wsLogin)
            });

            it('getLockInfo', (done) => {
                let getLockInfo = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'DoorLockService/getLockInfo',
                    args: {id: doorLock.id},
                    mirror: -1
                };

                sendMessage(getLockInfo, (actual, req) => {
                    let expected = {
                        type: 'jsonwsp/response',
                        version: '1.0',
                        methodname: 'DoorLockService/getLockInfo',
                        result: {
                            id: doorLock.id,
                            name: doorLock.name,
                            masterKeys: [userKey.id],
                            state: "OPENED",
                            keyId: userKey.id,
                            openingDuration: 10000
                        },
                        reflection: req.id
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
            let access;

            it('should add access', (done) => {
                access = {
                    doorLockIds: [doorLock.id],
                    requestorId: userKey.id,
                    timeStart: timeStart,
                    timeEnd: timeEnd,
                    type: 'ACCESS'
                };
                let addAccess = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'UserService/addAccessOrRequest',
                    args: access,
                    mirror: '-1'
                };

                sendMessage(addAccess, (actual, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': '1.0',
                        'methodname': 'UserService/addAccessOrRequest',
                        'result': {'success': true},
                        'reflection': req.id
                    };

                    assert.equal(actual, JSON.stringify(expected));
                    done();
                }, wsLogin);
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

            it('should find access by doorlockId', (done) => {
                let findAccess = {
                    args: {
                        doorLockIds: doorLock.id
                    },
                    methodname: 'AccessService/findAccess',
                    mirror: '-1',
                    type: 'jsonwsp/request',
                    version: '1.0'
                };

                sendMessage(findAccess, (actual, req) => {
                    let parsed = JSON.parse(actual);
                    access.id = parsed.result[0].id;
                    assert(parsed.result.length > 0);
                    done();
                }, wsLogin);
            });

            it('should update access', (done) => {
                //change type from ACCESS to REQUEST
                access.type = 'REQUEST';

                let updateAccess = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'AccessService/updateAccess',
                    args: access
                };

                sendMessage(updateAccess, (act, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version':'1.0',
                        'methodname':'AccessService/updateAccess',
                        'result': {'success': true},
                        'reflection': req.id
                    };

                    assert.equal(act, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

            it('should get accessList from userInfo', (done) => {

                let getUserInfo = {
                    'type': 'jsonwsp/request',
                    'version': '1.0',
                    'methodname': 'UserService/getUserInfo',
                    'args': {},
                    'mirror': '-1'
                };

                sendMessage(getUserInfo, (actual, req) => {
                    let accesslist = JSON.parse(actual).result.accesslist;
                    assert.equal(accesslist.length, 1);
                    done();
                }, wsLogin)
            });

            it('should remove access', (done) => {
                //change type from ACCESS to REQUEST
                access.type = 'REQUEST';

                let removeAccess = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'AccessService/deleteAccess',
                    args: {
                        id: access.id
                    }
                };

                sendMessage(removeAccess, (act, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version':'1.0',
                        'methodname':'AccessService/deleteAccess',
                        'result': {'success': true},
                        'reflection': req.id
                    };

                    assert.equal(act, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

        });

        describe('buildings', () => {

            let _building = {
                street: 'Musterweg',
                houseNumber: '1',
                zipCode: '12345',
                town: 'Musterstadt'
            };

            it('add building', (done) => {
                let addBuilding = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'UserService/addBuilding',
                    args: _building
                };

                sendMessage(addBuilding, (act, req) => {
                    let parsed = JSON.parse(act);

                    if (parsed.result.id !== undefined) {
                        _building = {
                            id: parsed.result.id,
                            keyId: userKey.id,
                            street: _building.street,
                            houseNumber: _building.houseNumber,
                            zipCode: _building.zipCode,
                            town: _building.town
                        };
                    }

                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': addBuilding.version,
                        'methodname': addBuilding.methodname,
                        'result': _building,
                        'reflection': req.id
                    };

                    assert.equal(JSON.stringify(parsed), JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

            it('update building', (done) => {
                assert.ok(_building.id !== undefined, 'AddBuilding Failed!');

                let updateBuildung = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'UserService/updateBuilding',
                    args: {}
                };

                updateBuildung.args.id = _building.id;
                updateBuildung.args.houseNumber = '120';
                updateBuildung.args.zipCode = '56789';

                sendMessage(updateBuildung, (act, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': updateBuildung.version,
                        'methodname': updateBuildung.methodname,
                        'result': {'success': true},
                        'reflection': req.id
                    };

                    assert.equal(act, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

            it('should get buildings from userInfo', (done) => {

                let getUserInfo = {
                    'type': 'jsonwsp/request',
                    'version': '1.0',
                    'methodname': 'UserService/getUserInfo',
                    'args': {},
                    'mirror': '-1'
                };

                sendMessage(getUserInfo, (actual, req) => {
                    let buildings = JSON.parse(actual).result.buildings;
                    assert.equal(buildings.length, 1);
                    done();
                }, wsLogin)
            });


            it('remove building', (done) => {
                assert.ok(_building.id !== undefined, 'AddBuilding Failed!');

                let removeBuilding = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'UserService/removeBuilding',
                    args: {
                        id: _building.id
                    }
                };

                sendMessage(removeBuilding, (act, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': removeBuilding.version,
                        'methodname': removeBuilding.methodname,
                        'result': {'success': true},
                        'reflection': req.id
                    };

                    assert.equal(act, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

        });

        describe('logging', () => {
            it('find by ownerId', (done) => {
                let registerDoorlock = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'LogService/findLog',
                    args: {id: 5, requestorId: userKey.id},
                    mirror: -1
                };

                sendMessage(registerDoorlock, (actual, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': '1.0',
                        'methodname': 'LogService/findLog',
                        'result': [{
                            requestorId: userKey.id,
                            lockId: doorLock.id,
                            ownerId: null,
                            date: null,
                            actionState: 'OK'
                        }],
                        reflection: req.id
                    };

                    let serverEntry = JSON.parse(actual);
                    const setIt = ['ownerId', 'date'];
                    for (let it of setIt) {
                        expected.result[0][it] = serverEntry.result[0][it];
                    }

                    assert.equal(actual, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });
        });

        describe('logout', () => {
            it('logout user', (done) => {
                let logout = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'SessionService/logout',
                    args: {}
                };

                sendMessage(logout, (act, req) => {
                    let expected = {
                        'type': 'jsonwsp/response',
                        'version': logout.version,
                        'methodname': logout.methodname,
                        'result': {'success': true},
                        'reflection': req.id
                    };

                    assert.equal(act, JSON.stringify(expected));
                    done();
                }, wsLogin);
            });

            it('failing relogin', (done) => {
                assert.ok(sessionToken !== null, 'Gathering SessionToken failed');

                let register = {
                    type: 'jsonwsp/request',
                    version: '1.0',
                    methodname: 'SessionService/authenticate',
                    args: {
                        sessionToken: sessionToken
                    },
                    mirror: -1
                };

                sendMessage(register, (actual, req) => {
                    let expected = {
                        type: 'jsonwsp/fault',
                        version: '1.0',
                        fault: {
                            code: '3009',
                            string: 'Session already loggedOut',
                            faulty: ''
                        },
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
