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


    let User = objectFactory.get('user');
    let userJson = {email: 'test@spamkrake.de', password: 'hallo123'};
    let user = new User(userJson);

    //used to get a user with _id
    let dbUser = null;

    it('should create user', (done) => {
        mongo.insertUser(user).then((res) => {
            assert(res.result.ok = 1);
            done();
        });
    });

    it('should find user', (done) => {
        mongo.findUser(userJson).toArray().then((_user) => {
            assert.equal(_user.length, 1);
            dbUser = _user[0];
            done();
        });
    });

    let Access = objectFactory.get('access');

    let access = new Access({key: '123', requestor_id: '1', time_start: new Date(2016), time_end: new Date(2017), state:'granted'});
    console.log(access)

    it('should add access to user', (done) => {
        mongo.userAddAccess(dbUser, access).then((res) => {
            assert(res.result.ok = 1);
            done();
        });
    });
});
