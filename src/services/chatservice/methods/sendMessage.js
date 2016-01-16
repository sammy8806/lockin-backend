'use strict';

const METHOD_NAME = 'SessionService/sendMessage';

let db;
let Session;
let SimpleResponse;

let Message;

function createMessage(_args, _env, _ws) {
    let message = new Message(_args);
    message.id = Date.now();
    message.date = Date.now();
    message.from = _env.sessionmanager.getSessionOfSocket(_ws).userId;
    return message;
}

function sendMessage(_msg, _socket, _env) {
    _env.debug(METHOD_NAME, `Sending msg(${_msg.id}) to sock`);

    try {
        let msgPack = _env.packetParser.buildRequest(
            'JSONWSP',
            'chatservice',
            'sendMessage',
            _msg,
            'mirrorhere'
        );

        msgPack.then((msgPack) => {
            _env.websockethandler.sendMessage(
                _socket,
                JSON.stringify(msgPack)
            );
        });
    } catch (err) {
        _env.debug(err);
    }
}

function sendGCMMessage(regTokens) {
    let GCM = require('../../../external/gcm/gcm.js');
    let gcm = new GCM();

    //TODO: setup api key only once, not everytime a message is sent
    gcm.setup({apiKey: 'AIzaSyCTnTdd2RoYKVRG4yDnd1vd_tuznxVH1Pw'});

    let message = GCM.getMessage();
    message.data = {messageID: message.id};

    gcm.send(message, regTokens, 3);
}

module.exports = {
    setup: (_env) => {

        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Message = _env.ObjectFactory.get('Message');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let message = createMessage(_args, _env, _ws);
        _env.debug(METHOD_NAME, `Creating Message: ${JSON.stringify(message)}`);

        return db.findRoom({id: _args.to}).toArray()
            .then((_room) => {
                if (_room.length === 0) {
                    reject({
                        code: 'client',
                        string: 'room not found'
                    });
                    return;
                }

                _room = _room[0];
                _env.debug(METHOD_NAME, `Room found: ${_room.id}`);

                let userList = _room.userList;
                _env.debug(METHOD_NAME, `Room has ${userList.length} members (${JSON.stringify(userList)})`);

                // rolecheck
                const activeUser = _env.sessionmanager.getSessionOfSocket(_ws).userId;
                const userrole = userList.filter((_obj) => String(_obj.id) === String(activeUser));

                const neededPermission = 'member';
                let permissionGranted = userrole[0].roles.filter((_obj) => String(_obj) === neededPermission);
                permissionGranted = permissionGranted.length >= 1;

                console.log(permissionGranted);

                if (userrole.length === 0) {
                    reject({
                        code: 'client',
                        string: 'user not in room'
                    });
                    return;
                } else if (!permissionGranted) {
                    reject({
                        code: 'client',
                        string: 'insufficient permissions'
                    });
                    return;
                }

                userList.forEach((_user) => {

                    _env.debug(METHOD_NAME, `-- ${_user.id}`);

                    //filter = {userid: new ObjectID(_user), connectionState: 'online'};
                    //_env.debug(METHOD_NAME, `Find sessions with: ${JSON.stringify(filter)}`);
                    //console.log(filter);

                    db.insertMessage(message.toJSON()).then(() => {
                        _env.debug(METHOD_NAME, `Saved Message ${message.id} to DB`);
                    });

                    db.findActiveSessionsOfUser(_user, 'online').then(
                        (_onlineSession) => {
                            _env.debug(METHOD_NAME, `Sessions found: ${_onlineSession.length}`);

                            if (_onlineSession.length === 0) {
                                db.findActiveSessionsOfUser(_user, 'closed').then((_closedSessions) => {
                                    let regTokens = [_closedSessions.length];
                                    for (let i = 0; i < _closedSessions.length; i++) {
                                        regTokens[i] = _closedSessions[i].getAttribute('gcm-reg-token');
                                    }
                                    sendGCMMessage(regTokens);
                                });
                            } else {
                                _onlineSession.forEach((_session) => {
                                    let socket = _env.sessionmanager.getSocketFromSessionId(_session.sessionId);
                                    _env.debug(METHOD_NAME, `Sockets found: ${typeof socket}`);

                                    if (socket == null) {
                                        _env.debug({
                                            code: 'server',
                                            string: 'did not find a socket to an online session'
                                        });
                                    }

                                    sendMessage(message, socket, _env);
                                });
                            }
                        });
                });

                resolve(message);
                return message;

            });
    })
};
