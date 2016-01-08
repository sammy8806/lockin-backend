'use strict';

const DRIVER_NAME = 'MongoDbDriver';

import MongoClient from 'mongodb';
import assert from 'assert';

let __db = false;

let methods = {};

/**
 *
 * @param _env
 */
methods.setup = function (_env) {
    let url = 'mongodb://localhost:27017/contentloops';

// Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        _env.debug(DRIVER_NAME, 'Connected correctly to server');

        __db = db;
    });
};

/**
 *
 * @param _sessionId
 * @returns {*}
 */
methods.findSessionId = function (_sessionId) {
    return _sessionId;
};

/**
 *
 * @param _attr
 * @returns {Promise}
 */
methods.findSession = function (_attr) {
    return __db.collection('sessions').find(_attr).toArray();
};

/**
 *
 * @param _session
 * @returns {Promise}
 */
methods.newSession = function (_session) {
    return __db.collection('sessions').insertOne({sessionId: _session.sessionId, userId: _session.userId});
};

/**
 * Attention: This returns an MongoCursor! (Use something like toArray to get a promise)
 *
 * @param _attr
 * @returns {Cursor}
 */
methods.findUser = function (_attr) {
    return __db.collection('users').find(_attr);
};

/**
 *
 * @param _user
 * @param _session
 * @returns {Promise}
 */
methods.userAddSession = function (_user, _session) {
    return __db.collection('users').updateOne(
        {_id: _user._id},
        {$push: {session: _session.sessionId}}
    );
};

/**
 *
 * @param _session
 * @param _status
 * @returns {Promise}
 */
methods.setSessionStatus = function (_session, _status) {
    // console.log('----', typeof _session, _session.sessionId);
    return __db.collection('sessions').updateOne(
        {sessionId: _session.sessionId},
        {$set: {connectionState: _status}}
    );
};

/**
 *
 * @param _token
 * @returns {Promise}
 */
methods.findSessionToken = function (_token) {
    return __db.collection('sessions').find({sessionId: _token}).toArray();
};

/**
 *
 * @param _user
 * @returns {Promise}
 */
methods.insertUser = function (_user) {
    return __db.collection('users').insertOne(_user.toJSON());
};

module.exports = methods;
