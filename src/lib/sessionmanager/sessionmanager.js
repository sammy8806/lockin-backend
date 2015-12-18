/**
 * Created by hendrik on 18.12.2015.
 */
'use strict';

let connections = {};

function addSocketSession(sessionid, socket){
    connections[sessionid] = socket;
}

function getSocketOfSession(sessionid){
    return connections[sessionid];
}

function socketClosed(socket){
    for(let attr in connections){
        if (connections[attr] == socket){
            delete connections[attr];
        }
    }
}

module.exports = {
    addSocketSession,
    getSocketOfSession,
    socketClosed
};