'use strict';

const DRIVER_NAME = 'MongoDbDriver';

import MongoClient from 'mongodb';
import assert from 'assert';
import Promise from 'promise';

let __db = false;

let methods = {};

methods.setup = function (_env) {
    let url = 'mongodb://localhost:27017/contentloops';

// Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        _env.debug(DRIVER_NAME, 'Connected correctly to server');

        __db = db;
    });
};

methods.findSessionId = function (_sessionId) {
    return _sessionId;
};

methods.findSession = function (_attr) {
    return __db.collection('sessions').find(_attr).toArray();
};

methods.newSession = function (_session) {
    return __db.collection('sessions').insertOne({sessionId: _session.sessionId, userId: _session.userId});
};

methods.findUser = function (_attr) {
    return __db.collection('users').find(_attr).toArray();
};

methods.userAddSession = function (_user, _session) {
    return __db.collection('users').updateOne(
        {_id: _user._id},
        {$push: {session: _session.sessionId}}
    );
};

methods.setSessionStatus = function (_session, _status) {
    // console.log('----', typeof _session, _session.sessionId);
    return __db.collection('sessions').updateOne(
        {sessionId: _session.sessionId},
        {$set: {connectionState: _status}}
    );
};

methods.findSessionToken = function (_token) {
    return __db.collection('sessions').find({sessionId: _token}).toArray();
};

module.exports = methods;
