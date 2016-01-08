'use strict';

const METHOD_NAME = 'SessionService/sendMessage';

let db;
let Session;
let SimpleResponse;
let Message;

let forEverySessionSocket = (_user, _cb, _env) => db
    .findSession({userid: _user, connectionState: 'online'})
    .then(
        (_sessions) => {
            _sessions.forEach((_session) => {
                let socket = _env.sessionmanager.getSocketOfSession(_session);
                if (socket == null) {
                    _env.debug({
                        code: 'server',
                        string: 'did not find a socket to an online session'
                    });
                }

                _cb(socket);
            });
        });

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
        message.from = _env.sessionmanager.getSessionFromSocket(_ws).userId;

        Object.freeze(message);

        return db.findRoom({to: _args.to})
            .then((_room) => {
                if (_room.length === 0) {
                    reject({
                        code: 'client',
                        string: 'room not found'
                    });
                }

                _room = _room[0];

                _room.userList.forEach((_user) => {

                    let msg = message;
                    msg.to = _user;

                    forEverySessionSocket(_user, (_sock) => {

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

                    }, _env, reject);
                });

            });
    })
};
