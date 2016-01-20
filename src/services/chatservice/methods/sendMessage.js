'use strict';

const METHOD_NAME = 'SessionService/sendMessage';

let db;
let Session;
let SimpleResponse;

let Message;

function createMessage(_args, _env, _ws) {
    let message = new Message(_args);
    message.id = `${_env.random(25)}_${Date.now()}`;
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

                if (userrole.length === 0) {
                    reject({
                        code: 'client',
                        string: 'user not in room'
                    });
                    return;
                }

                const neededPermission = 'member';
                let permissionGranted = userrole[0].roles.filter((_obj) => String(_obj) === neededPermission);
                permissionGranted = permissionGranted.length >= 1;

                if (!permissionGranted) {
                    reject({
                        code: 'client',
                        string: 'insufficient permissions'
                    });
                    return;
                }

                db.insertMessage(message.toJSON()).then(() => {
                    _env.debug(METHOD_NAME, `Saved Message ${message.id} to DB`);
                });

                userList.forEach((_user) => {

                    _env.debug(METHOD_NAME, `-- ${_user.id}`);

                    //filter = {userid: new ObjectID(_user), connectionState: 'online'};
                    //_env.debug(METHOD_NAME, `Find sessions with: ${JSON.stringify(filter)}`);
                    //console.log(filter);

                    db.findActiveSessionsOfUser(_user, 'online').then(
                        (_onlineSessions) => {
                            _env.debug(METHOD_NAME, `${_user.id} ** ${_onlineSessions.length} Online-Sessions found`);

                            if (_onlineSessions.length === 0) {
                                _env.debug(METHOD_NAME, `${_user.id} ** No Online-Session found`);

                                db.findActiveSessionsOfUser(_user, 'closed')
                                    .then((_closedSessions) => {
                                        if (_closedSessions.length === 0) {
                                            _env.debug(METHOD_NAME, `${_user.id} ** No Closed-Session found`);
                                            return;
                                        }

                                        _env.debug(
                                            METHOD_NAME,
                                            `${_user.id} ** ${_closedSessions.length} Closed-Sessions found`
                                        );

                                        let regTokens = [];
                                        for (let i = 0; i < _closedSessions.length; i++) {
                                            regTokens[i] = new Session(_closedSessions[i]).gcm_reg_token;

                                            if (regTokens[i] === undefined) {
                                                _env.debug(
                                                    METHOD_NAME,
                                                    `${_user.id} ** No GCM-Token found`
                                                );
                                            } else {
                                                _env.debug(
                                                    METHOD_NAME,
                                                    `${_user.id} ** Found Reg-Token: ${regTokens[i].gcm_reg_token}`
                                                );
                                            }
                                        }

                                        sendGCMMessage(regTokens);
                                    });
                            } else {
                                _onlineSessions.forEach((_session) => {
                                    _env.debug(
                                        METHOD_NAME,
                                        `${_user.id} ** ${_onlineSessions.length} Online-Sessions!`
                                    );

                                    let socket = _env.sessionmanager.getSocketFromSessionId(_session.sessionId);
                                    _env.debug(METHOD_NAME, `${_user.id} ** Socket found`);

                                    if (socket == null || socket === undefined) {
                                        _env.debug(METHOD_NAME, {
                                            code: 'server',
                                            string: 'did not find a socket to an online session'
                                        });

                                        _env.error(METHOD_NAME, `${_user.id} ** !! Inconsistant Database !!`);
                                    } else {
                                        sendMessage(message, socket, _env);

                                        db.setMessageDelivered(message.id, _session.sessionId);
                                    }
                                });
                            }
                        });
                });

                resolve(message);
                return message;

            });
    })
};
