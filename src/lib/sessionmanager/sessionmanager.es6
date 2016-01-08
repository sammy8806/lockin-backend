/**
 * Created by hendrik on 18.12.2015.
 */
'use strict';

let connections = new Map();
let sessions = new Map();
let sessionIds = new Map();

function addSocketSession(_socket, _session) {
    global._env.debug('Sessionmanager/addSocketSession', 'Adding Socket and Session to maps');

    sessions.set(_session, _socket);
    connections.set(_socket, _session);
    sessionIds.set(_session.sessionId, _session);
}

function removeSocketOfSession(_session) {
    let socket = getSocketOfSession(_session);
    connections.delete(socket);
}

function getSocketOfSession(_session) {
    return sessions.get(_session);
}

function _removeSession(_session) {
    sessions.delete(_session);
    sessionIds.delete(_session.sessionId);
}

function _removeSocket(_socket) {
    connections.delete(_socket);
}

function getSessionOfSocket(_socket) {
    return connections.get(_socket);
}

function getSocketFromSessionId(_sessionId) {
    let session = sessionIds.get(_sessionId);
    return getSocketOfSession(session);
}

function socketClosed(_socket) {
    let session = getSessionOfSocket(_socket);
    /*
     global._env.debug('-----------------------------', '');
     console.log(typeof session, typeof session === 'object');
     console.log(typeof session.onConnectionClosed, typeof session.onConnectionClosed === 'function');
     console.log(typeof Session.onConnectionClosed, typeof Session.onConnectionClosed === 'function');
     global._env.debug('-----------------------------', '');
     */
    // console.log(typeof _socket, _socket);
    // console.log('-----------------------------');
    // console.log(typeof session, session);
    // console.log('-----------------------------');

    if (typeof session === 'object' && typeof session.onConnectionClosed === 'function') {
        session.onConnectionClosed();
    }

    _removeSession(session);
    _removeSocket(_socket);
}

module.exports = {
    addSocketSession,
    removeSocketOfSession,
    getSocketOfSession,
    getSessionOfSocket,
    getSocketFromSessionId,
    socketClosed
};
