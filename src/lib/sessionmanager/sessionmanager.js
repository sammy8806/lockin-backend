/**
 * Created by hendrik on 18.12.2015.
 */
'use strict';

let connections = new Map();
let sessions = new Map();

function addSocketSession(_socket, _session) {
    // console.log(_session);

    sessions.set(_session, _socket);
    connections.set(_socket, _session);
}

function removeSocketOfSession(_sessionId) {
    let socket = getSocketOfSession(_sessionId);
    connections.delete(socket);
}

function getSocketOfSession(_session) {
    return sessions.get(_session);
}

function _removeSession(_session) {
    sessions.delete(_session);
}

function _removeSocket(_socket) {
    connections.delete(_socket);
}

function getSessionOfSocket(_socket) {
    return connections.get(_socket);
}

function socketClosed(_socket) {
    let session = getSessionOfSocket(_socket);

    // console.log(session);

    if (typeof session === 'function' && typeof session.onConnectionClosed === 'function') {
        session.onConnectionClosed();
    }

    _removeSession(session);
    _removeSocket(_socket);
}

module.exports = {
    addSocketSession,
    removeSocketOfSession,
    getSocketOfSession,
    socketClosed
};