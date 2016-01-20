'use strict';

const METHOD_NAME = 'ChatService/getMessages';

let db;
let User;
let Message;

function markAsRead(_msg, session) {
    _env.debug(METHOD_NAME, `Marking ${_msg.id} as read by ${session.sessionId}`);
    db.setMessageDelivered(_msg.id, session.sessionId)
        .then(() => _env.debug(METHOD_NAME, `Marked (OK) ${_msg.id} as read by ${session.sessionId}`))
}

module.exports = {
    setup: (_env) => {
        User = _env.ObjectFactory.get('User');
        Message = _env.ObjectFactory.get('Message');
        db = _env.GlobalServiceFactory.getService('DatabaseService').getDriver();
    },

    call: (_args, _env, _ws, _type) => new Promise((resolve, reject) => {

        let user = User.getLoggedIn(_ws, db);

        if (user === false) {
            reject({code: 'client', string: 'please login first'});
            return;
        }

        let session = _env.sessionmanager.getSessionOfSocket(_ws);
        _env.debug(METHOD_NAME, `${session.userId} ** Socket found`);

        if (_args.message !== undefined) {
            resolve(
                db.getMessages({id: _args.message}).toArray()
                    .then((_msg) => {
                            _env.debug(METHOD_NAME, `Found ${_msg.length} messages with id: ${_args.message}`);
                            if (_msg.length === 0) {
                                throw {code: 'client', string: 'no such message'};
                            }

                            _msg = _msg[0];
                            const msg = new Message(_msg);

                            markAsRead(_msg, session);

                            return [msg.toJSON()];
                        }
                    )
            );
        } else {
            resolve(
                db.getUndeliveredMessages(session.sessionId).toArray()
                    .then((_msgList) => {
                        _env.debug(METHOD_NAME, `Found ${_msgList.length} unsend messages`);

                        let messages = [];
                        _msgList.forEach((_msg) => {
                            messages.push(new Message(_msg).toJSON());

                            markAsRead(_msg, session);
                        });

                        return messages;
                    })
            )
        }
    })
};
