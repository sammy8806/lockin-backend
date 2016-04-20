'use strict'

let mongo = require('../src/services/databaseservice/drivers/mongo.es6');
let assert = require('assert');
let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

let objectFactory = {
    get(_name) {
        return require('../src/objectPrototypes/' + _name);
    }
};


describe('database', () => {
    before(function (done) {
        let url = 'mongodb://localhost/contentloops';

        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            mongo.setDb(db);

            db.dropDatabase(() => {
                done();
            });
        });
    });

    describe('user', () => {
        let User = objectFactory.get('user');
        let userJSON = {email: 'test@spamkrake.de', password: 'hallo123'};
        let user = new User(userJSON);

        //used to get a user with _id from database
        let dbUser = null;

        it('should create user', (done) => {
            mongo.insertUser(user).then(res => {
                assert(res.result.ok === 1);
                done();
            });
        });

        it('should find user', (done) => {
            mongo.findUser(userJSON).toArray().then(_user => {
                assert.equal(_user.length, 1);
                dbUser = _user[0];
                done();
            });
        });

        let Access = objectFactory.get('access');

        let startDate = new Date();
        startDate.setFullYear(2016);
        let endDate = new Date();
        endDate.setFullYear(2017);

        let access = new Access({
            id: ObjectID(),
            key: '123',
            requestor_id: '1',
            time_start: startDate,
            time_end: endDate,
            state: 'granted'
        });

        it('should add access to user', (done) => {
            mongo.userAddAccess(dbUser, access).then(res => {
                assert(res.result.ok === 1);
                done();
            });
        });
    });

    describe('doorLock', () => {
        let DoorLock = objectFactory.get('doorLock');
        let doorLockJSON = {name: 'doorlock1', state:"locked"}
        let doorLock = new DoorLock(doorLockJSON);
        let dbDoorLock = null;

        it('should create doorlock', (done) => {
            mongo.insertDoorLock(doorLock).then(res => {
                assert(res.result.ok === 1);
                done();
            });
        });

        it('should find doorlock', (done) => {
            mongo.findDoorLock(doorLockJSON).toArray().then(_doorLock => {
                assert.equal(_doorLock.length, 1);
                dbDoorLock = _doorLock[0];
                done();
            });
        });

        it('should delete doorlock', (done) => {
            mongo.removeDoorLock(doorLockJSON).then(res => {
                assert(res.result.ok === 1);
                mongo.getDb().collection('doorLocks').count((err, count) => {
                    assert(count === 0);
                    done();
                })

            }); 
        })
    });
});
