'use strict';

import Promise from 'promise';
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

    call: (_args, _env, _ws, _type) => {

        return new Promise((resolve, reject) => {

            return db.findRoom({to:_args.to})
                .then((_room) => {
                    if (_room == []){
                        reject({
                            code:'client',
                            string:'room not found'
                        });
                    }

                    let timeRecived = Date.now();

                    for(let user in _room.userList){
                        return db.findOnlineSessionsFromUser({userid: user})
                            .then((_sessions) => {
                                for(let session in _sessions) {
                                    let socket = _env.sessionmanager.getSocketOfSession(session);
                                    if (socket == null) {
                                        reject({
                                            code: 'server',
                                            string: 'did not find a socket to an online session'
                                        });
                                    }
                                    let message = new Message(_args);
                                    message.id = Date.now();
                                    message.date = Date.now();
                                        /*{
                                            id: Date.now(),
                                            from: _args.from,
                                            to: _args.to,
                                            date: timeRecived,
                                            type: 'PlainMessage',
                                            data: _args.data
                                        });*/

                                    try {
                                        _env.websockethandler.sendMessage(
                                            socket,
                                            _env.packetParser.buildRequest('JSONWSP', 'chatservice', 'sendMessage', message, "mirrorhere")
                                        );
                                    }catch (err) {
                                        _env.debug();
                                    }

                                }
                            });
                    }

                });
        });
    }
};
