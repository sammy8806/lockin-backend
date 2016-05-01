'use strict';
let assert = require('assert');
let helpers = require('../dist/lib/helpers.js');
let env = helpers.setupEnv();
let db = env.GlobalServiceFactory.getService('DatabaseService');
let dbDriver = db.getDriver();
let objectFactory = env.ObjectFactory;

describe('database', () => {

    before((done) => {
        //timeout to wait for MongoClient to connect
        setTimeout(() => {
            dbDriver.getDb().dropDatabase(() => {
                done();
            });
        }, 500)
    });

    after(() => {
        dbDriver.getDb().close();
    });

    describe('user', () => {
        let User = objectFactory.get('user');
        let userJSON = {
            email: 'test@spamkrake.de', password: 'hallo123', key: {
                "id": "123",
                "owner_id": "456",
                "data": "hallo123"
            }
        };

        let user = new User(userJSON);

        //used to get a user with _id from database
        let dbUser = null;

        it('should create user', (done) => {
            dbDriver.insertUser(user).then(() => {
                dbDriver.getDb().collection('users').count((err, count) => {
                    assert(count === 1, 'count should equal one');
                    done();
                })
            });
        });

        it('should find user', (done) => {
            dbDriver.findUser(userJSON).toArray().then(_user => {
                assert.equal(_user.length, 1);
                dbUser = _user[0];
                done();
            });
        });

        it('should find user by keyId', (done) => {
            dbDriver.findUser({'key.id': '123'}).toArray().then(_user => {
                console.log(_user)
                assert.equal(_user.length, 1);
                dbUser = _user[0];
                done();
            });
        });
    });

    describe('doorLock', () => {
        let DoorLock = objectFactory.get('doorLock');
        let doorLockJSON = {name: 'doorlock1', state: "locked"};
        let doorLock = new DoorLock(doorLockJSON);
        let dbDoorLock = null;

        it('should create doorlock', (done) => {
            dbDriver.insertDoorLock(doorLock).then(res => {
                assert(res.result.ok === 1);
                dbDriver.getDb().collection('doorLocks').count((err, count) => {
                    assert(count === 1);
                    done();
                })
            });
        });

        it('should find doorlock', (done) => {
            dbDriver.findDoorLock(doorLockJSON).toArray().then(_doorLock => {
                assert.equal(_doorLock.length, 1);
                dbDoorLock = _doorLock[0];
                done();
            });
        });

        it('should delete doorlock', (done) => {
            dbDriver.removeDoorLock(doorLockJSON).then(res => {
                assert(res.result.ok === 1);
                dbDriver.getDb().collection('doorLocks').count((err, count) => {
                    assert(count === 0);
                    done();
                })

            });
        })
    });
});
