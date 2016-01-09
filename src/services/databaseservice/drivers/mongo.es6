'use strict';

const DRIVER_NAME = 'MongoDbDriver';

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

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
 * _Attention_: This returns an MongoCursor! (Use something like toArray to get a promise)
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

/**
 * _Attention_: This returns an MongoCursor! (Use something like toArray to get a promise)
 *
 * @param _roomAttr
 * @returns {Cursor}
 */
methods.findRoom = function (_roomAttr) {
    return __db.collection('rooms').find(_roomAttr);
};

/**
 *
 * @param _room
 * @returns {Promise}
 */
methods.createRoom = function (_room) {
    return __db.collection('rooms').insertOne(_room);
};

/**
 *
 * @param _room
 * @param _attribs
 * @returns {Promise}
 */
methods.setRoomAttibutes = function (_room, _attribs) {
    return __db.collection('rooms').updateOne(
        {id: _room.id},
        {$set: _attribs}
    );
};

/**
 *
 * @param _id
 * @param _userId
 * @returns {Promise}
 */
methods.addUserToRoom = function (_id, _userId, _roles) {
    return __db.collection('rooms').updateOne(
        { id: _id },
        {$push: {userList: {id: _userId, roles: _roles}}}
    );
};

methods.setUserPermissionsInRoom = function (_id, _userId, _roles) {
    // nicht sicher ob das so funktioniert
    return __db.collection('rooms').updateOne(
        {
            id: _id,
            "userList.id": _userId
        },
        {$set: {"userList.$.roles" : _roles}}
    );
};

/**
 *
 * @param _room
 * @param _user
 * @returns {Promise}
 */
methods.removeUserFromRoom = function (_room, _user) {
    return __db.collection('rooms').updateOne(
        {id: _room.id},
        {$pull: {userList: _user._id}}
    );
};

/**
 *
 * @param _room
 * @returns {Promise}
 */
methods.removeRoom = function (_room) {
    return __db.collection('rooms').deleteOne({id: _room._id});
};

/**
 *
 * @param _msg
 * @returns {Promise}
 */
methods.insertMessage = function (_msg) {
    return __db.collection('messages').insertOne(_msg);
};

methods.userDeleteSession = function (_user, _session) {
    return __db.collection('users').updateOne(
        {_id: _user._id},
        {$pull: {session: _session.sessionId}}
    );
};

methods.endSession = function (_session) {
    // connectionState: 'loggedOut'
    return methods.setSessionStatus(_session)
        .then(() =>
            __db.collection('sessions').updateOne(
                {sessionId: _session.sessionId},
                {$set: {logout: Date.now().toString()}}
            ));
};

/**
 * ONLY FOR DEBUG USE!
 * @returns {boolean}
 * @private
 */
methods._getDb = function () {
    return __db;
};

methods.findOnlineSessionsOfUser = function (_user) {
    return __db.collection('sessions').find({userId: new ObjectID(_user), connectionState: 'online'}).toArray();
};

module.exports = methods;
