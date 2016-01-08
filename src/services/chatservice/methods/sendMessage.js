'use strict';

const METHOD_NAME = 'SessionService/sendMessage';

let db;
let Session;
let SimpleResponse;

let Message;

module.exports = {
    setup: (_env) => {

        SimpleResponse = _env.ObjectFactory.get('SimpleResponse');
        Message = _env.ObjectFactory.get('Message');
        Session = _env.ObjectFactory.get('Session');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let message = new Message(_args);
        message.id = Date.now();
        message.date = Date.now();
        message.from = _env.sessionmanager.getSessionOfSocket(_ws).userId;

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

                userList.forEach((_user) => {

                    _env.debug(METHOD_NAME, `-- ${_user}`);

                    let msg;

                    try {
                        msg = message;
                        msg.to = _user;

                        _env.debug(METHOD_NAME, `Creating Message: ${JSON.stringify(msg)}`);

                        //filter = {userid: new ObjectID(_user), connectionState: 'online'};
                        //_env.debug(METHOD_NAME, `Find sessions with: ${JSON.stringify(filter)}`);
                        //console.log(filter);
                    } catch (_e) {
                        console.trace(_e);
                    }

                    //db.insertMessage(msg).then(() => {
                    //    _env.debug(METHOD_NAME, `Saved Message ${msg.id} to DB`);
                    //});

                    db.findOnlineSessionsOfUser(_user).then(
                        (_sessions) => {
                            _env.debug(METHOD_NAME, `Sessions found: ${_sessions.length}`);

                            _sessions.forEach((_session) => {
                                let socket = _env.sessionmanager.getSocketOfSession(_session);
                                _env.debug(METHOD_NAME, `Sockets found: ${typeof socket}`);

                                if (socket == null) {
                                    _env.debug({
                                        code: 'server',
                                        string: 'did not find a socket to an online session'
                                    });
                                }

                                _env.debug(METHOD_NAME, `Sending msg(${msg.id}) to sock`);

                                try {
                                    _env.websockethandler.sendMessage(
                                        _sock,
                                        _env.packetParser.buildRequest(
                                            'JSONWSP',
                                            'chatservice',
                                            'sendMessage',
                                            msg,
                                            'mirrorhere'
                                        )
                                    );
                                } catch (err) {
                                    _env.debug(err);
                                }
                            });
                        });
                });

                resolve(message);
                return message;

            });
    })
};
