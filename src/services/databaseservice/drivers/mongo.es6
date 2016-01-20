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
    if (_attr.hasOwnProperty('_id'))
        return __db.collection('users').find({_id: ObjectID(_attr._id)});
    else
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
 * @param _attrib
 * @returns {Promise}
 */
methods.setSessionAttribute = function (_session, _attrib) {
    return __db.collection('sessions').updateOne(
        {sessionId: _session.sessionId},
        {$set: _attrib}
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
    return methods.setSessionAttribute(_session, {connectionState: _status});
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
 *
 * @param _findAttr
 * @param _user
 * @returns {Promise}
 */
methods.updateUser = function (_findAttr, _user) {
    return __db.collection('users').updateOne(
        _findAttr,
        {$set: _user}
    );
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
 * @param _roles
 * @returns {Promise}
 */
methods.addUserToRoom = function (_id, _userId, _roles) {
    return __db.collection('rooms').updateOne(
        {id: _id},
        {$push: {userList: {id: _userId, roles: _roles}}}
    );
};

/**
 *
 * @param _id
 * @param _userId
 * @param _roles
 * @returns {Promise}
 */
methods.setUserPermissionsInRoom = function (_id, _userId, _roles) {
    return __db.collection('rooms').updateOne(
        {
            id: _id,
            'userList.id': new ObjectID(_userId)
        },
        {$set: {'userList.$.roles': _roles}}
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
        {$pull: {userList: {id: new ObjectID(_user._id)}}}
    );
};

/**
 *
 * @param _room
 * @returns {Promise}
 */
methods.removeRoom = function (_room) {
    return __db.collection('rooms').deleteOne({id: _room.id});
};

/**
 *
 * @param _user
 * @returns {Promise}
 */
methods.removeUser = function (_user) {
    return __db.collection('users').deleteOne({id: _user._id});
};

/**
 *
 * @param _msg
 * @returns {Promise}
 */
methods.insertMessage = function (_msg) {
    return __db.collection('messages').insertOne(_msg);
};

/**
 *
 * @param {String} _msg Unique MessageID
 * @param {String} _session Unique SessionID
 * @returns {Promise}
 */
methods.setMessageDelivered = function (_msg, _session) {
    return __db.collection('messages').updateOne(
        {id: _msg},
        {$push: {_deliveredTo: _session}}
    );
};

/**
 *
 * @param _find
 * @returns {Cursor}
 */
methods.getMessages = function(_find) {
    return __db.collection('messages').find(_find);
};

/**
 *
 * @param {String} _session Unique SessionID
 * @returns {Cursor}
 */
methods.getUndeliveredMessages = function (_session) {
    return __db.collection('messages').find({
        _deliveredTo: {
            $ne: _session
        }
    });
};

/**
 *
 * @param _user
 * @param _session
 * @returns {Promise}
 */
methods.userDeleteSession = function (_user, _session) {
    return __db.collection('users').updateOne(
        {_id: _user._id},
        {$pull: {session: _session.sessionId}}
    );
};

/**
 *
 * @param _session
 * @returns {Promise.<T>}
 */
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

/**
 *
 * @param _user, _state
 * @returns {Promise}
 */
methods.findActiveSessionsOfUser = function (_user, _state) {
    return __db.collection('sessions').find({userId: new ObjectID(_user.id), connectionState: _state}).toArray();
};

/**
 *
 * @param _session
 * @param _token
 * @returns {Promise}
 */
methods.insertSessionToken = function (_session, _token) {
    return __db.collection('sessions').updateOne(
        {sessionId: _session.sessionId},
        {$push: {sessionTokens: _token}}
    );
};

/**
 *
 * @param {String} _token
 * @returns {Cursor}
 */
methods.findSessionByToken = function (_token) {
    return __db.collection('sessions').find({
        'sessionTokens.sessionToken': _token
    });
};

/**
 *
 * @param _token
 */
methods.invalidateSessionToken = function (_token) {
    throw 'STUB!';
};

module.exports = methods;
