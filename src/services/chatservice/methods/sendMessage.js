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
            console.log(msgPack);

            _env.websockethandler.sendMessage(
                _socket,
                JSON.stringify(msgPack)
            );
        });
    } catch (err) {
        _env.debug(err);
    }
}

module.exports = {
    setup: (_env) => {

        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Message = _env.ObjectFactory.get('Message');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        var message = createMessage(_args, _env, _ws);

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
                let userrole = userList.filter(function (obj){
                    return obj.id == _env.sessionmanager.getSessionOfSocket(_ws).userId;
                });
                if(userrole.length === 0){
                    reject({
                        code: 'client',
                        string: 'user not in room'
                    });
                    return;
                }else if(userrole[0].role !== 'member'){
                    reject({
                        code: 'client',
                        string: 'insufficient permissions'
                    });
                    return;
                }


                userList.forEach((_user) => {

                    _env.debug(METHOD_NAME, `-- ${_user}`);

                    try {
                        _env.debug(METHOD_NAME, `Creating Message: ${JSON.stringify(message)}`);

                        //filter = {userid: new ObjectID(_user), connectionState: 'online'};
                        //_env.debug(METHOD_NAME, `Find sessions with: ${JSON.stringify(filter)}`);
                        //console.log(filter);
                    } catch (_e) {
                        console.trace(_e);
                    }

                    db.insertMessage(message.toJSON()).then(() => {
                        _env.debug(METHOD_NAME, `Saved Message ${message.id} to DB`);
                    });

                    db.findOnlineSessionsOfUser(_user).then(
                        (_sessions) => {
                            _env.debug(METHOD_NAME, `Sessions found: ${_sessions.length}`);

                            _sessions.forEach((_session) => {
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
                        });
                });

                resolve(message);
                return message;

            });
    })
};
